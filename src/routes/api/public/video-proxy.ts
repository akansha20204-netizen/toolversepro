import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Type, Content-Range, Accept-Ranges",
} as const;

function isHttpUrl(u: string) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/video-proxy")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const u = new URL(request.url).searchParams.get("url");
        if (!u || !isHttpUrl(u)) {
          return new Response("Missing or invalid ?url= parameter", { status: 400, headers: CORS });
        }
        try {
          const range = request.headers.get("range");
          const upstream = await fetch(u, {
            headers: {
              ...(range ? { Range: range } : {}),
              "User-Agent": "Mozilla/5.0 (compatible; ToolHubProxy/1.0)",
              Accept: "*/*",
            },
            redirect: "follow",
          });
          const headers = new Headers(CORS);
          const passthrough = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];
          for (const h of passthrough) {
            const v = upstream.headers.get(h);
            if (v) headers.set(h, v);
          }
          if (!headers.get("content-type")) headers.set("content-type", "application/octet-stream");
          return new Response(upstream.body, { status: upstream.status, headers });
        } catch (e: any) {
          return new Response(`Upstream fetch failed: ${e?.message || e}`, { status: 502, headers: CORS });
        }
      },
    },
  },
});
