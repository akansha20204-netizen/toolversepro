/**
 * Shared FFmpeg (WebAssembly) client for the Audio/Video Tools category.
 *
 * The UMD builds are loaded from a CDN because they bundle their own worker
 * inline, which is by far the most reliable path in a browser. The instance is
 * a singleton so the ~30 MB core is only fetched once per session.
 */

const CORE_VER = "0.12.6";
const FF_VER = "0.12.10";
const UTIL_VER = "0.12.1";

let instance: any = null;
let loading: Promise<any> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.dataset.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function getFFmpeg(onStatus?: (m: string) => void): Promise<any> {
  if (instance) return instance;
  if (loading) return loading;

  loading = (async () => {
    onStatus?.("Loading the media engine (first run only, ~30 MB)…");
    await loadScript(`https://unpkg.com/@ffmpeg/util@${UTIL_VER}/dist/umd/index.js`);
    await loadScript(`https://unpkg.com/@ffmpeg/ffmpeg@${FF_VER}/dist/umd/ffmpeg.js`);

    const w = window as any;
    const FFmpegCtor = w.FFmpegWASM?.FFmpeg;
    const toBlobURL = w.FFmpegUtil?.toBlobURL;
    if (!FFmpegCtor || !toBlobURL) throw new Error("Could not initialise the media engine (CDN blocked?).");

    const baseURL = `https://unpkg.com/@ffmpeg/core@${CORE_VER}/dist/umd`;
    const ff = new FFmpegCtor();
    await ff.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    instance = ff;
    return ff;
  })();

  try {
    return await loading;
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
