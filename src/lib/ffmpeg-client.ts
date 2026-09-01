/**
 * Shared FFmpeg (WebAssembly) client for the Audio/Video Tools category.
 *
 * Architecture notes (important):
 * - The FFmpeg *class worker* is served from OUR OWN origin (`/ffmpeg/worker.js`,
 *   copied from the npm package into `public/ffmpeg/`). Browsers refuse to
 *   construct a Worker from a cross-origin script, which is exactly what the
 *   previous unpkg-based UMD loader tried to do
 *   ("Failed to construct 'Worker': Script at https://unpkg.com/... cannot be
 *   accessed from origin ..."). Same-origin worker => no cross-origin error.
 * - The ~32 MB ffmpeg core (js + wasm) is fetched over CORS and turned into
 *   blob URLs, which is allowed and cached by the browser. It cannot be shipped
 *   as a static asset because it exceeds the hosting per-file asset limit.
 * - The instance is a singleton so the core is only fetched once per session.
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_VER = "0.12.10";
const CORE_CDNS = [
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VER}/dist/esm`,
  `https://unpkg.com/@ffmpeg/core@${CORE_VER}/dist/esm`,
];

let instance: any = null;
let loading: Promise<any> | null = null;
let cached: { coreURL: string; wasmURL: string } | null = null;

async function toBlobURL(url: string, type: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  return URL.createObjectURL(new Blob([buf], { type }));
}

async function fetchCore(onStatus?: (m: string) => void) {
  if (cached) return cached;
  let lastErr: unknown = null;
  for (const base of CORE_CDNS) {
    try {
      onStatus?.("Loading the media engine (first run only, ~32 MB)…");
      const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
      const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm");
      cached = { coreURL, wasmURL };
      return cached;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `Could not download the media engine. Check your connection or any content blocker. (${String(lastErr)})`,
  );
}

export async function getFFmpeg(onStatus?: (m: string) => void): Promise<any> {
  if (instance) return instance;
  if (loading) return loading;

  loading = (async () => {
    const { coreURL, wasmURL } = await fetchCore(onStatus);
    onStatus?.("Starting the media engine…");
    const ff: any = new FFmpeg();
    await ff.load({
      // Same-origin worker script — never a CDN URL.
      classWorkerURL: new URL("/ffmpeg/worker.js", window.location.origin).href,
      coreURL,
      wasmURL,
    });
    instance = ff;
    return ff;
  })();

  try {
    return await loading;
  } catch (e) {
    instance = null;
    throw e;
  } finally {
    loading = null;
  }
}


/** Hard-stops any running job and drops the instance (used by Cancel). */
export function terminateFFmpeg() {
  try {
    instance?.terminate?.();
  } catch {
    /* ignore */
  }
  instance = null;
  loading = null;
}

export const isFFmpegReady = () => !!instance;

export async function readAsUint8(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function safeName(name: string, fallback = "input") {
  const clean = name.replace(/[^\w.-]+/g, "_");
  return clean || fallback;
}

export function extOf(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

/** Reads media duration (seconds) with a plain media element — cheap and fast. */
export function probeDuration(file: File, kind: "audio" | "video"): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement(kind);
    const url = URL.createObjectURL(file);
    const done = (v: number) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    el.preload = "metadata";
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : 0);
    el.onerror = () => done(0);
    el.src = url;
  });
}

export function formatBytes(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return `${(b / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

export function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const base = h ? `${h}:${String(m).padStart(2, "0")}` : `${m}`;
  return `${base}:${String(sec).padStart(2, "0")}${ms && !h ? "." + String(ms).padStart(3, "0").slice(0, 2) : ""}`;
}

export function clockTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toFixed(3);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.padStart(6, "0")}`;
}
