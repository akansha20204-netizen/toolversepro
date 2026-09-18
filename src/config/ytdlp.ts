/**
 * Central configuration for the self-hosted yt-dlp download API.
 *
 * The deployed Render service:
 *   https://yt-dlp-li0a.onrender.com
 *
 * Override it (e.g. for local development) with the env var:
 *   VITE_YTDLP_API_URL=http://localhost:8000
 *
 * The API is expected to expose:
 *   GET  /health            -> 200 with a small JSON status body
 *   POST /info              -> video metadata (+ formats when available)
 *   POST /download          -> the media file, OR a JSON job envelope
 *   GET  /status/{job_id}   -> job status (only for async backends)
 *
 * No secret keys are used here; the API is public and takes no credentials,
 * so nothing sensitive is shipped to the browser.
 */

const ENV_BASE = (import.meta.env["VITE_YTDLP_API_URL"] as string | undefined)?.trim();

export const YT_DLP_API_BASE_URL = (ENV_BASE || "https://yt-dlp-li0a.onrender.com").replace(/\/+$/, "");

export const apiUrl = (path: string) => `${YT_DLP_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const DEV = import.meta.env.DEV;

/** Development-only logging. Never logs user data or credentials. */
export function devLog(...args: unknown[]) {
  if (DEV) console.info("[yt-dlp api]", ...args);
}

/**
 * Render free/starter instances sleep. Ping /health a few times before giving
 * up so a cold start looks like "starting", not "broken". Bounded retries —
 * never an infinite loop.
 */
export async function waitForApi(
  attempts = 4,
  onWaking?: () => void,
  signal?: AbortSignal,
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(apiUrl("/health"), { signal, cache: "no-store" });
      devLog("GET /health", res.status);
      if (res.ok) return true;
    } catch (err) {
      devLog("GET /health failed", (err as Error).name);
    }
    if (i === 0) onWaking?.();
    if (signal?.aborted) return false;
    await new Promise((r) => setTimeout(r, 4000));
  }
  return false;
}
