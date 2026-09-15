/**
 * YouTube Video Downloader — front end only.
 *
 * This tool talks to YOUR OWN yt-dlp REST API (FastAPI + yt-dlp + FFmpeg),
 * which lives in the `backend/` folder of this repository and is meant to be
 * deployed to Render as a Docker Web Service.
 *
 * SETUP AFTER DEPLOYING THE BACKEND:
 *   1. Deploy `backend/` to Render (see backend/README.md).
 *   2. Copy the Render service URL, e.g. https://my-ytdlp-api.onrender.com
 *   3. Set the frontend environment variable:
 *        VITE_YTDLP_API_URL=https://my-ytdlp-api.onrender.com
 *      (no trailing slash)
 *   4. Redeploy / publish the frontend.
 *
 * The tool then calls:
 *   GET  ${VITE_YTDLP_API_URL}/health
 *   POST ${VITE_YTDLP_API_URL}/info
 *   POST ${VITE_YTDLP_API_URL}/download
 *
 * No yt-dlp ever runs in the browser.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { Download, Loader2, Search, Youtube, AlertTriangle, ShieldAlert, X } from "lucide-react";
import { Field, TButton, TInput, TSelect, Stat, ResultBox } from "@/components/site/tool-ui";

const API_BASE = (import.meta.env["VITE_YTDLP_API_URL"] as string | undefined)?.replace(/\/+$/, "") ?? "";

/* ------------------------------- types ---------------------------------- */

type ApiFormat = {
  format_id: string;
  ext: string;
  height: number | null;
  quality: string;
  filesize: number | null;
  has_audio: boolean;
  vcodec?: string | null;
  acodec?: string | null;
  fps?: number | null;
};

type ApiInfo = {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  formats: ApiFormat[];
};

type Phase = "idle" | "fetching" | "ready" | "preparing" | "downloading" | "processing" | "done" | "error";

/* ------------------------------ helpers --------------------------------- */

const YT_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
];

/** Accepts watch, shorts, embed, live and youtu.be links. Rejects everything else. */
export function parseYouTubeUrl(raw: string): { ok: boolean; url?: string; id?: string } {
  const value = raw.trim();
  if (!value) return { ok: false };
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return { ok: false };
  }
  if (!YT_HOSTS.includes(u.hostname.toLowerCase())) return { ok: false };

  let id = "";
  if (u.hostname.toLowerCase().includes("youtu.be")) {
    id = u.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (u.pathname === "/watch") {
    id = u.searchParams.get("v") ?? "";
  } else {
    const parts = u.pathname.split("/").filter(Boolean);
    if (["shorts", "embed", "live", "v"].includes(parts[0] ?? "")) id = parts[1] ?? "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return { ok: false };
  return { ok: true, id, url: `https://www.youtube.com/watch?v=${id}` };
}

const fmtBytes = (n: number | null | undefined) => {
  if (!n || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const fmtDuration = (s: number | null | undefined) => {
  if (!s || s <= 0) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtSpeed = (bytesPerSec: number) => (bytesPerSec > 0 ? `${fmtBytes(bytesPerSec)}/s` : "");

/** Map a backend error code to a message a normal person understands. */
function friendlyError(code: string | undefined, status?: number): string {
  switch (code) {
    case "invalid_url":
      return "That does not look like a YouTube video link. Paste a normal watch, Shorts or youtu.be link.";
    case "unsupported_url":
      return "Only single YouTube videos and Shorts are supported — playlists and other sites are not.";
    case "unavailable":
      return "This video is unavailable. It may have been removed or made private by the owner.";
    case "private":
      return "This is a private video, so it cannot be downloaded.";
    case "age_restricted":
      return "This video is age-restricted and cannot be downloaded.";
    case "geo_restricted":
      return "This video is blocked in the region where the download server is located.";
    case "removed":
      return "This video has been deleted from YouTube.";
    case "too_large":
      return "This video is larger than the download limit. Try a lower quality.";
    case "timeout":
      return "The download took too long and was stopped. Try a lower quality or a shorter video.";
    case "processing_failed":
      return "The video could not be processed into a playable file. Try a different quality.";
    case "rate_limited":
      return "Too many requests right now. Please wait a minute and try again.";
    case "busy":
      return "The download service is busy with other requests. Please try again in a moment.";
    case "download_failed":
      return "The download could not be completed. Please try again, or pick another quality.";
    default:
      if (status === 429) return "Too many requests right now. Please wait a minute and try again.";
      if (status && status >= 500) return "The download service is temporarily unavailable. Please try again shortly.";
      return "Something went wrong. Please try again.";
  }
}

/* ------------------------------ component ------------------------------- */

type Choice = {
  key: string;
  label: string;
  type: "video" | "audio";
  quality: string;
  format_id?: string;
  note?: string;
};

function buildChoices(info: ApiInfo): Choice[] {
  const out: Choice[] = [{ key: "best", label: "Best Quality (MP4)", type: "video", quality: "best" }];

  const heights = Array.from(
    new Set(
      info.formats
        .filter((f) => f.height && f.vcodec !== "none")
        .map((f) => f.height as number),
    ),
  ).sort((a, b) => b - a);

  const LADDER = [2160, 1440, 1080, 720, 480, 360, 240, 144];
  for (const h of LADDER) {
    if (!heights.some((available) => available === h)) continue;
    const best = info.formats
      .filter((f) => f.height === h && f.vcodec !== "none")
      .sort((a, b) => (b.filesize ?? 0) - (a.filesize ?? 0))[0];
    out.push({
      key: `v${h}`,
      label: `${h}p${h === 2160 ? " / 4K" : ""} MP4`,
      type: "video",
      quality: `${h}p`,
      note: fmtBytes(best?.filesize),
    });
  }

  if (info.formats.some((f) => f.has_audio)) {
    out.push({ key: "audio", label: "Audio Only (MP3)", type: "audio", quality: "audio" });
  }
  return out;
}

export function YouTubeVideoDownloader() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [info, setInfo] = useState<ApiInfo | null>(null);
  const [choiceKey, setChoiceKey] = useState("best");
  const [received, setReceived] = useState(0);
  const [total, setTotal] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const choices = useMemo(() => (info ? buildChoices(info) : []), [info]);
  const choice = choices.find((c) => c.key === choiceKey) ?? choices[0];
  const configured = Boolean(API_BASE);
  const busy = phase === "fetching" || phase === "preparing" || phase === "downloading" || phase === "processing";

  const reset = () => {
    setInfo(null);
    setError("");
    setPhase("idle");
    setReceived(0);
    setTotal(0);
    setSpeed(0);
    setEta(0);
  };

  const fetchInfo = useCallback(async () => {
    const parsed = parseYouTubeUrl(url);
    if (!parsed.ok) {
      setInfo(null);
      setPhase("error");
      setError(friendlyError("invalid_url"));
      return;
    }
    if (!configured) {
      setPhase("error");
      setError("The download service is not configured yet. Add your API address to VITE_YTDLP_API_URL.");
      return;
    }
    setError("");
    setInfo(null);
    setPhase("fetching");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    try {
      const res = await fetch(`${API_BASE}/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsed.url }),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => ({}))) as Partial<ApiInfo> & { detail?: { code?: string }; code?: string };
      if (!res.ok) {
        setPhase("error");
        setError(friendlyError(data.code ?? data.detail?.code, res.status));
        return;
      }
      const normalised: ApiInfo = {
        title: data.title ?? "Untitled video",
        thumbnail: data.thumbnail ?? null,
        duration: data.duration ?? null,
        uploader: data.uploader ?? null,
        formats: Array.isArray(data.formats) ? data.formats : [],
      };
      setInfo(normalised);
      setChoiceKey("best");
      setPhase("ready");
    } catch (e) {
      setPhase("error");
      setError(
        (e as Error).name === "AbortError"
          ? friendlyError("timeout")
          : "Could not reach the download service. Please check your connection and try again.",
      );
    } finally {
      clearTimeout(timer);
      abortRef.current = null;
    }
  }, [url, configured]);

  const startDownload = useCallback(async () => {
    const parsed = parseYouTubeUrl(url);
    if (!parsed.ok || !choice || !info) return;
    setError("");
    setReceived(0);
    setTotal(0);
    setSpeed(0);
    setEta(0);
    setPhase("preparing");

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), 20 * 60_000);

    try {
      const res = await fetch(`${API_BASE}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: parsed.url,
          quality: choice.quality,
          format_id: choice.format_id ?? null,
          type: choice.type,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { code?: string; detail?: { code?: string } };
        setPhase("error");
        setError(friendlyError(data.code ?? data.detail?.code, res.status));
        return;
      }

      const len = Number(res.headers.get("Content-Length") ?? 0);
      setTotal(Number.isFinite(len) ? len : 0);
      setPhase("downloading");

      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let got = 0;
      const started = Date.now();

      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            got += value.byteLength;
            setReceived(got);
            const elapsed = (Date.now() - started) / 1000;
            if (elapsed > 0.4) {
              const sp = got / elapsed;
              setSpeed(sp);
              if (len > got && sp > 0) setEta((len - got) / sp);
            }
          }
        }
      } else {
        const buf = new Uint8Array(await res.arrayBuffer());
        chunks.push(buf);
        got = buf.byteLength;
        setReceived(got);
      }

      setPhase("processing");
      const type = choice.type === "audio" ? "audio/mpeg" : "video/mp4";
      const blob = new Blob(chunks as BlobPart[], { type });
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition);
      const fallbackName = `${info.title.replace(/[^\w\s.-]+/g, "").trim().slice(0, 80) || "youtube-video"}.${
        choice.type === "audio" ? "mp3" : "mp4"
      }`;
      const name = match?.[1] ? decodeURIComponent(match[1]) : fallbackName;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setPhase("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setPhase("error");
        setError(friendlyError("timeout"));
      } else {
        setPhase("error");
        setError("The download stopped unexpectedly. Please try again.");
      }
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }, [url, choice, info]);

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase(info ? "ready" : "idle");
  };

  const pct = total > 0 ? Math.min(100, (received / total) * 100) : 0;

  const statusText =
    phase === "fetching"
      ? "Fetching video…"
      : phase === "preparing"
        ? "Preparing download…"
        : phase === "downloading"
          ? "Downloading…"
          : phase === "processing"
            ? "Processing…"
            : phase === "done"
              ? "Completed"
              : "";

  return (
    <div className="space-y-6">
      {!configured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Download service not connected yet</p>
            <p className="mt-1 text-muted-foreground">
              Deploy the yt-dlp API from the <code>backend/</code> folder to Render, then set{" "}
              <code>VITE_YTDLP_API_URL</code> to its address.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="YouTube video or Shorts link" hint="Works with watch, Shorts, embed, live and youtu.be links.">
            <TInput
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (phase === "error") setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) void fetchInfo();
              }}
              placeholder="https://www.youtube.com/watch?v=…"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
        </div>
        <TButton onClick={() => void fetchInfo()} disabled={busy || !url.trim()} className="sm:mb-[2px]">
          {phase === "fetching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Get Video
        </TButton>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {phase === "fetching" && (
        <ResultBox className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching video details from YouTube…
        </ResultBox>
      )}

      {info && (
        <ResultBox className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            {info.thumbnail && (
              <img
                src={info.thumbnail}
                alt={`Thumbnail for ${info.title}`}
                loading="lazy"
                className="w-full rounded-xl border border-border object-cover sm:w-56"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-3 text-base font-semibold sm:text-lg">{info.title}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Youtube className="h-4 w-4" />
                {info.uploader ?? "Unknown channel"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Stat label="Duration" value={fmtDuration(info.duration)} />
                <Stat label="Qualities" value={choices.length} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Quality">
              <TSelect value={choiceKey} onChange={(e) => setChoiceKey(e.target.value)} disabled={busy}>
                {choices.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                    {c.note ? ` — ~${c.note}` : ""}
                  </option>
                ))}
              </TSelect>
            </Field>
            {busy && phase !== "fetching" ? (
              <TButton variant="outline" onClick={cancel} className="sm:mb-[2px]">
                <X className="h-4 w-4" /> Cancel
              </TButton>
            ) : (
              <TButton onClick={() => void startDownload()} disabled={busy} className="sm:mb-[2px]">
                <Download className="h-4 w-4" /> Download
              </TButton>
            )}
          </div>

          {(busy || phase === "done") && phase !== "fetching" && (
            <div className="space-y-2">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full gradient-primary transition-all ${
                    total > 0 ? "" : "w-1/3 animate-pulse"
                  }`}
                  style={total > 0 ? { width: `${phase === "done" ? 100 : pct}%` } : undefined}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{statusText}</span>
                {total > 0 && phase !== "done" && <span>{pct.toFixed(1)}%</span>}
                {received > 0 && (
                  <span>
                    {fmtBytes(received)}
                    {total > 0 ? ` of ${fmtBytes(total)}` : ""}
                  </span>
                )}
                {speed > 0 && phase === "downloading" && <span>{fmtSpeed(speed)}</span>}
                {eta > 1 && phase === "downloading" && <span>~{fmtDuration(Math.round(eta))} left</span>}
              </div>
              {phase === "preparing" && (
                <p className="text-xs text-muted-foreground">
                  The server is fetching and merging the video with FFmpeg. Large files can take a minute.
                </p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 text-sm">
              <span className="font-medium">Download completed — check your downloads folder.</span>
              <TButton variant="outline" onClick={reset}>
                New video
              </TButton>
            </div>
          )}
        </ResultBox>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Please download only content you have permission to download and use. Respect YouTube's Terms of Service and
          applicable copyright laws.
        </p>
      </div>
    </div>
  );
}
