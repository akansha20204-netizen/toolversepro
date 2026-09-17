"""URL validation, yt-dlp helpers and error mapping.

Nothing in here ever builds a shell command from user input: yt-dlp is used as
a Python library and every value that reaches it is either a validated,
re-serialised YouTube watch URL or a value from a fixed allow-list.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qs, urlparse

ALLOWED_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
    "www.youtu.be",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
}

VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

# Quality allow-list. "best" and "audio" are special-cased.
ALLOWED_QUALITIES = {"best", "audio", "2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"}

FORMAT_ID_RE = re.compile(r"^[A-Za-z0-9_\-+.]{1,40}$")


class DownloadError(Exception):
    """Carries a stable machine code; the message is never shown to users."""

    def __init__(self, code: str, status: int = 400) -> None:
        super().__init__(code)
        self.code = code
        self.status = status


@dataclass(frozen=True)
class ParsedUrl:
    video_id: str
    canonical: str


def parse_youtube_url(raw: str) -> ParsedUrl:
    """Validate a single-video YouTube URL and rebuild it from scratch.

    Rebuilding means query strings such as `?list=` (playlists) or anything
    else a caller appends can never reach yt-dlp.
    """
    if not isinstance(raw, str):
        raise DownloadError("invalid_url")
    value = raw.strip()
    if not value or len(value) > 512:
        raise DownloadError("invalid_url")
    if not value.lower().startswith(("http://", "https://")):
        value = "https://" + value

    try:
        parsed = urlparse(value)
    except ValueError:
        raise DownloadError("invalid_url") from None

    if parsed.scheme not in ("http", "https"):
        raise DownloadError("invalid_url")

    host = (parsed.hostname or "").lower()
    if host not in ALLOWED_HOSTS:
        raise DownloadError("unsupported_url")

    path_parts = [p for p in (parsed.path or "").split("/") if p]
    video_id = ""

    if "youtu.be" in host:
        video_id = path_parts[0] if path_parts else ""
    elif parsed.path == "/watch":
        video_id = (parse_qs(parsed.query or "").get("v") or [""])[0]
    elif path_parts and path_parts[0] in ("shorts", "embed", "live", "v"):
        video_id = path_parts[1] if len(path_parts) > 1 else ""

    if not VIDEO_ID_RE.match(video_id):
        raise DownloadError("unsupported_url")

    return ParsedUrl(video_id=video_id, canonical=f"https://www.youtube.com/watch?v={video_id}")


def validate_quality(quality: Any) -> str:
    if not isinstance(quality, str) or quality not in ALLOWED_QUALITIES:
        raise DownloadError("invalid_quality")
    return quality


def validate_format_id(format_id: Any) -> str | None:
    if format_id in (None, ""):
        return None
    if not isinstance(format_id, str) or not FORMAT_ID_RE.match(format_id):
        raise DownloadError("invalid_quality")
    return format_id


def build_format_selector(kind: str, quality: str, format_id: str | None) -> str:
    """Return a yt-dlp format string.

    For video we prefer MP4-compatible streams and let yt-dlp merge the chosen
    video stream with the best audio stream using FFmpeg.
    """
    if kind == "audio":
        return "bestaudio[ext=m4a]/bestaudio/best"

    if format_id:
        # An explicit video stream, merged with the best available audio.
        return f"{format_id}+bestaudio/{format_id}"

    if quality == "best":
        return (
            "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/"
            "bestvideo[ext=mp4]+bestaudio/bestvideo+bestaudio/best"
        )

    height = int(quality.rstrip("p"))
    return (
        f"bestvideo[height<={height}][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/"
        f"bestvideo[height<={height}][ext=mp4]+bestaudio/"
        f"bestvideo[height<={height}]+bestaudio/"
        f"best[height<={height}]/best"
    )


def summarise_formats(info: dict[str, Any]) -> list[dict[str, Any]]:
    """Reduce yt-dlp's format list to the fields the frontend needs."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for f in info.get("formats") or []:
        fid = str(f.get("format_id") or "")
        if not fid or fid in seen:
            continue
        vcodec = f.get("vcodec") or "none"
        acodec = f.get("acodec") or "none"
        if vcodec == "none" and acodec == "none":
            continue
        if f.get("protocol") in ("mhtml",):  # storyboards
            continue
        height = f.get("height")
        seen.add(fid)
        out.append(
            {
                "format_id": fid,
                "ext": f.get("ext") or "",
                "height": int(height) if isinstance(height, (int, float)) and height else None,
                "quality": f"{int(height)}p" if isinstance(height, (int, float)) and height else "audio",
                "filesize": f.get("filesize") or f.get("filesize_approx"),
                "has_audio": acodec != "none",
                "vcodec": vcodec,
                "acodec": acodec,
                "fps": f.get("fps"),
            }
        )
    out.sort(key=lambda f: (f["height"] or 0, f["filesize"] or 0), reverse=True)
    return out


_ERROR_PATTERNS: tuple[tuple[str, str], ...] = (
    ("private video", "private"),
    ("sign in to confirm your age", "age_restricted"),
    ("age-restricted", "age_restricted"),
    ("not a bot", "bot_check"),
    ("page needs to be reloaded", "bot_check"),
    ("failed to extract any player response", "bot_check"),
    ("requested format is not available", "bot_check"),
    ("not available in your country", "geo_restricted"),
    ("blocked it in your country", "geo_restricted"),
    ("who has blocked it", "geo_restricted"),
    ("removed by the uploader", "removed"),
    ("terminated", "removed"),
    ("has been removed", "removed"),
    ("video unavailable", "unavailable"),
    ("this video is unavailable", "unavailable"),
    ("members-only", "unavailable"),
    ("premieres in", "unavailable"),
    ("is not a valid url", "unsupported_url"),
    ("unsupported url", "unsupported_url"),
    ("postprocessing", "processing_failed"),
    ("ffmpeg", "processing_failed"),
    ("file is larger than max-filesize", "too_large"),
)


def classify_ytdlp_error(message: str) -> str:
    low = (message or "").lower()
    for needle, code in _ERROR_PATTERNS:
        if needle in low:
            return code
    return "download_failed"
