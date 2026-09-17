"""ToolHub Pro — yt-dlp REST API.

Stateless FastAPI service. No database, no Redis, no persistent storage:
every download lands in a per-request temporary directory that is deleted as
soon as the response has been streamed.

Endpoints
    GET  /health    -> {"status": "ok"}
    POST /info      -> video metadata + available formats
    POST /download  -> streams the generated MP4 / MP3 back to the caller

Environment variables (all optional, with sane defaults):
    FRONTEND_URL              comma-separated allowed browser origins
    MAX_FILESIZE_MB           hard ceiling for a generated file (default 600)
    DOWNLOAD_TIMEOUT          seconds a single yt-dlp job may run (default 600)
    MAX_CONCURRENT_DOWNLOADS  simultaneous downloads (default 2)
    RATE_LIMIT_PER_MINUTE     requests per client IP per minute (default 12)
    PORT                      provided by Render; the app listens on 0.0.0.0
"""

from __future__ import annotations

import asyncio
import logging
import os
import shutil
import tempfile
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError as YtdlpDownloadError

from .youtube import (
    DownloadError,
    build_format_selector,
    classify_ytdlp_error,
    parse_youtube_url,
    summarise_formats,
    validate_format_id,
    validate_quality,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ytdlp-api")


def _int_env(name: str, default: int) -> int:
    try:
        return max(1, int(os.environ.get(name, "") or default))
    except ValueError:
        return default


MAX_FILESIZE_MB = _int_env("MAX_FILESIZE_MB", 600)
MAX_FILESIZE_BYTES = MAX_FILESIZE_MB * 1024 * 1024
DOWNLOAD_TIMEOUT = _int_env("DOWNLOAD_TIMEOUT", 600)
INFO_TIMEOUT = 60
MAX_CONCURRENT_DOWNLOADS = _int_env("MAX_CONCURRENT_DOWNLOADS", 2)
RATE_LIMIT_PER_MINUTE = _int_env("RATE_LIMIT_PER_MINUTE", 12)

_raw_origins = os.environ.get("FRONTEND_URL", "").strip()
ALLOWED_ORIGINS = [o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()] or [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
]
# Always allow local development origins alongside the configured ones.
for dev in ("http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"):
    if dev not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(dev)

app = FastAPI(title="ToolHub Pro yt-dlp API", version="1.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://([a-z0-9-]+\.)*lovable\.app$",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    expose_headers=["Content-Disposition", "Content-Length"],
    max_age=600,
)

_download_slots = asyncio.Semaphore(MAX_CONCURRENT_DOWNLOADS)
_hits: dict[str, deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for") or ""
    return (fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown"))[:64]


def _rate_limit(request: Request) -> None:
    now = time.monotonic()
    bucket = _hits[_client_ip(request)]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_PER_MINUTE:
        raise DownloadError("rate_limited", status=429)
    bucket.append(now)
    if len(_hits) > 5000:  # keep the map from growing unbounded
        for key in [k for k, v in list(_hits.items()) if not v or now - v[-1] > 300]:
            _hits.pop(key, None)


def _error(code: str, status: int) -> JSONResponse:
    return JSONResponse({"code": code, "error": code}, status_code=status)


class InfoRequest(BaseModel):
    url: str = Field(min_length=5, max_length=512)


class DownloadRequest(BaseModel):
    url: str = Field(min_length=5, max_length=512)
    quality: str = Field(default="best", max_length=16)
    format_id: str | None = Field(default=None, max_length=40)
    type: Literal["video", "audio"] = "video"


def _cookie_file() -> str | None:
    """Optional YouTube cookies (Netscape cookies.txt format).

    Datacenter IPs — including Render's — are frequently challenged by
    YouTube's "confirm you're not a bot" check. Supplying cookies exported
    from a signed-in browser session is the supported way around that.
    Provide them either as file contents in YTDLP_COOKIES, or as a path in
    YTDLP_COOKIEFILE.
    """
    path = os.environ.get("YTDLP_COOKIEFILE", "").strip()
    if path and Path(path).is_file():
        return path
    contents = os.environ.get("YTDLP_COOKIES", "")
    if "\t" not in contents:
        return None
    target = Path(tempfile.gettempdir()) / "yt-cookies.txt"
    try:
        target.write_text(contents if contents.endswith("\n") else contents + "\n", encoding="utf-8")
        return str(target)
    except OSError:
        log.warning("could not write cookie file")
        return None


COOKIE_FILE = _cookie_file()
PROXY_URL = os.environ.get("YTDLP_PROXY", "").strip() or None
PLAYER_CLIENTS = [
    c.strip()
    for c in (os.environ.get("YTDLP_PLAYER_CLIENTS", "default,web_safari,mweb,tv").split(","))
    if c.strip()
]

BASE_OPTS: dict[str, Any] = {
    "quiet": True,
    "no_warnings": True,
    "noprogress": True,
    "noplaylist": True,          # never expand playlists
    "playlist_items": "1",
    "extract_flat": False,
    "geo_bypass": False,
    "socket_timeout": 30,
    "retries": 3,
    "fragment_retries": 3,
    "cachedir": False,
    "restrictfilenames": True,
    "consoletitle": False,
    "call_home": False,
    "extractor_args": {"youtube": {"player_client": PLAYER_CLIENTS}},
}
if COOKIE_FILE:
    BASE_OPTS["cookiefile"] = COOKIE_FILE
if PROXY_URL:
    BASE_OPTS["proxy"] = PROXY_URL


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/info")
async def info(request: Request, body: InfoRequest) -> JSONResponse:
    try:
        _rate_limit(request)
        parsed = parse_youtube_url(body.url)
    except DownloadError as exc:
        return _error(exc.code, exc.status)

    def extract() -> dict[str, Any]:
        opts = {**BASE_OPTS, "skip_download": True, "ignore_no_formats_error": True}
        with YoutubeDL(opts) as ydl:
            return ydl.extract_info(parsed.canonical, download=False) or {}

    try:
        data = await asyncio.wait_for(asyncio.to_thread(extract), timeout=INFO_TIMEOUT)
    except asyncio.TimeoutError:
        return _error("timeout", 504)
    except YtdlpDownloadError as exc:
        code = classify_ytdlp_error(str(exc))
        log.warning("info failed id=%s code=%s", parsed.video_id, code)
        return _error(code, 422)
    except Exception:  # noqa: BLE001 - never leak internals
        log.exception("unexpected info failure id=%s", parsed.video_id)
        return _error("download_failed", 502)

    if data.get("is_live"):
        return _error("unavailable", 422)

    formats = summarise_formats(data)
    if not formats:
        # Metadata came through but no real streams: YouTube is challenging
        # this server's IP. Cookies (YTDLP_COOKIES) or a proxy fix this.
        log.warning("no playable formats id=%s (likely bot check)", parsed.video_id)
        return _error("bot_check", 422)

    thumb = data.get("thumbnail")
    if not thumb:
        thumbs = data.get("thumbnails") or []
        thumb = thumbs[-1].get("url") if thumbs else None

    return JSONResponse(
        {
            "id": parsed.video_id,
            "title": data.get("title") or "Untitled video",
            "thumbnail": thumb,
            "duration": int(data["duration"]) if isinstance(data.get("duration"), (int, float)) else None,
            "uploader": data.get("uploader") or data.get("channel"),
            "formats": summarise_formats(data),
        }
    )


@app.post("/download")
async def download(request: Request, body: DownloadRequest) -> Any:
    try:
        _rate_limit(request)
        parsed = parse_youtube_url(body.url)
        quality = validate_quality(body.quality)
        format_id = validate_format_id(body.format_id)
    except DownloadError as exc:
        return _error(exc.code, exc.status)

    kind = "audio" if body.type == "audio" or quality == "audio" else "video"
    selector = build_format_selector(kind, quality, None if kind == "audio" else format_id)

    if _download_slots.locked() and _download_slots._value == 0:  # noqa: SLF001 - cheap fast-fail
        return _error("busy", 503)

    tmpdir = tempfile.mkdtemp(prefix="ytdl-")

    def cleanup() -> None:
        shutil.rmtree(tmpdir, ignore_errors=True)

    opts: dict[str, Any] = {
        **BASE_OPTS,
        "format": selector,
        "outtmpl": str(Path(tmpdir) / "%(title).80B.%(ext)s"),
        "max_filesize": MAX_FILESIZE_BYTES,
        "paths": {"home": tmpdir, "temp": tmpdir},
    }
    if kind == "audio":
        opts["postprocessors"] = [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ]
    else:
        opts["merge_output_format"] = "mp4"
        opts["postprocessors"] = [{"key": "FFmpegVideoRemuxer", "preferedformat": "mp4"}]

    def run() -> Path:
        with YoutubeDL(opts) as ydl:
            ydl.download([parsed.canonical])
        files = sorted(
            (p for p in Path(tmpdir).iterdir() if p.is_file() and not p.name.endswith((".part", ".ytdl"))),
            key=lambda p: p.stat().st_size,
            reverse=True,
        )
        if not files:
            raise DownloadError("download_failed", 502)
        return files[0]

    try:
        async with _download_slots:
            path = await asyncio.wait_for(asyncio.to_thread(run), timeout=DOWNLOAD_TIMEOUT)
    except asyncio.TimeoutError:
        cleanup()
        return _error("timeout", 504)
    except DownloadError as exc:
        cleanup()
        return _error(exc.code, exc.status)
    except YtdlpDownloadError as exc:
        cleanup()
        code = classify_ytdlp_error(str(exc))
        log.warning("download failed id=%s code=%s", parsed.video_id, code)
        return _error(code, 422)
    except Exception:  # noqa: BLE001
        cleanup()
        log.exception("unexpected download failure id=%s", parsed.video_id)
        return _error("download_failed", 502)

    size = path.stat().st_size
    if size <= 0:
        cleanup()
        return _error("download_failed", 502)
    if size > MAX_FILESIZE_BYTES:
        cleanup()
        return _error("too_large", 413)

    media_type = "audio/mpeg" if kind == "audio" else "video/mp4"
    # Temporary files are removed as soon as the response finishes streaming.
    return FileResponse(
        path,
        media_type=media_type,
        filename=path.name,
        background=BackgroundTask(cleanup),
        headers={"Cache-Control": "no-store", "Content-Length": str(size)},
    )
