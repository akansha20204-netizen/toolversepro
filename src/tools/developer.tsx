import { useMemo, useRef, useState } from "react";
import { Copy, RotateCcw, RefreshCw, Upload, Download, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, TButton, TInput, TSelect, TTextarea, copyText } from "@/components/site/tool-ui";

const cp = async (t: string) => (await copyText(t)) ? toast.success("Copied") : toast.error("Copy failed");

function TextIO({
  action, actionLabel, placeholder = "Paste input...",
}: { action: (s: string) => string; actionLabel: string; placeholder?: string }) {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const run = () => {
    try { setErr(""); setOut(action(inp)); } catch (e: any) { setErr(e.message || "Error"); setOut(""); }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <TTextarea rows={14} value={inp} onChange={(e) => setInp(e.target.value)} placeholder={placeholder} />
        <div className="flex gap-2">
          <TButton onClick={run}>{actionLabel}</TButton>
          <TButton variant="outline" onClick={() => { setInp(""); setOut(""); setErr(""); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </div>
      </div>
      <div className="space-y-3">
        <TTextarea rows={14} value={out} readOnly placeholder="Output..." />
        {err && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
        <TButton variant="outline" onClick={() => cp(out)}><Copy className="h-4 w-4" />Copy output</TButton>
      </div>
    </div>
  );
}

export function JSONFormatter() {
  return <TextIO actionLabel="Format" action={(s) => JSON.stringify(JSON.parse(s), null, 2)} placeholder='{"hello":"world"}' />;
}
export function JSONMinifier() {
  return <TextIO actionLabel="Minify" action={(s) => JSON.stringify(JSON.parse(s))} />;
}
export function JSONValidator() {
  const [t, setT] = useState("");
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null);
  const run = () => { try { JSON.parse(t); setRes({ ok: true, msg: "Valid JSON ✓" }); } catch (e: any) { setRes({ ok: false, msg: e.message }); } };
  return (
    <div className="grid gap-4">
      <TTextarea rows={12} value={t} onChange={(e) => setT(e.target.value)} placeholder='Paste JSON to validate...' />
      <div className="flex gap-2"><TButton onClick={run}>Validate</TButton></div>
      {res && <div className={`rounded-xl border p-4 text-sm ${res.ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>{res.msg}</div>}
    </div>
  );
}

// Simple HTML/CSS/JS beautifier & minifier
function beautifyHTML(s: string) {
  let indent = 0;
  const lines: string[] = [];
  s.replace(/></g, ">\n<").split("\n").forEach((line) => {
    line = line.trim();
    if (!line) return;
    if (line.match(/^<\/\w/)) indent = Math.max(indent - 1, 0);
    lines.push("  ".repeat(indent) + line);
    if (line.match(/^<\w[^>]*[^/]?>$/) && !line.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) indent++;
  });
  return lines.join("\n");
}
function minifyHTML(s: string) { return s.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim(); }
function beautifyCSS(s: string) {
  return s.replace(/\s*\{\s*/g, " {\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*}\s*/g, "\n}\n").replace(/,\s*/g, ",\n").replace(/\n\s*\n/g, "\n").trim();
}
function minifyCSS(s: string) { return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim(); }
function beautifyJS(s: string) {
  let out = ""; let indent = 0; let inStr: string | false = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) { out += c; if (c === inStr && s[i - 1] !== "\\") inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; continue; }
    if (c === "{") { out += "{\n" + "  ".repeat(++indent); continue; }
    if (c === "}") { indent = Math.max(0, indent - 1); out += "\n" + "  ".repeat(indent) + "}"; continue; }
    if (c === ";") { out += ";\n" + "  ".repeat(indent); continue; }
    out += c;
  }
  return out.replace(/\n\s*\n/g, "\n").trim();
}

export function HTMLBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyHTML} placeholder="<div><p>Hello</p></div>" />; }
export function HTMLMinifier() { return <TextIO actionLabel="Minify" action={minifyHTML} />; }
export function CSSBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyCSS} placeholder="body{color:red;}" />; }
export function CSSMinifier() { return <TextIO actionLabel="Minify" action={minifyCSS} />; }
export function JSBeautifier() { return <TextIO actionLabel="Beautify" action={beautifyJS} placeholder="function x(){return 1;}" />; }

export function PasswordGenerator() {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [num, setNum] = useState(true);
  const [sym, setSym] = useState(true);
  const [out, setOut] = useState("");
  const gen = () => {
    const parts: string[] = [];
    if (upper) parts.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (lower) parts.push("abcdefghijklmnopqrstuvwxyz");
    if (num) parts.push("0123456789");
    if (sym) parts.push("!@#$%^&*()-_=+[]{};:,.<>?");
    const src = parts.join("");
    if (!src) return toast.error("Pick at least one option");
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let s = "";
    for (let i = 0; i < len; i++) s += src[arr[i] % src.length];
    setOut(s);
  };
  const strength = useMemo(() => {
    const pool = (upper ? 26 : 0) + (lower ? 26 : 0) + (num ? 10 : 0) + (sym ? 25 : 0);
    const entropy = len * Math.log2(pool || 2);
    if (entropy < 40) return { label: "Weak", color: "bg-destructive" };
    if (entropy < 60) return { label: "Fair", color: "bg-warning" };
    if (entropy < 80) return { label: "Strong", color: "bg-success" };
    return { label: "Very strong", color: "bg-success" };
  }, [len, upper, lower, num, sym]);
  return (
    <div className="grid gap-4">
      <ResultBox>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-background p-3 font-mono text-sm break-all min-h-[3rem]">{out || <span className="text-muted-foreground">Click generate</span>}</div>
          <TButton onClick={() => cp(out)} variant="outline"><Copy className="h-4 w-4" /></TButton>
          <TButton onClick={gen}><RefreshCw className="h-4 w-4" /></TButton>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className={`h-2 flex-1 overflow-hidden rounded-full bg-muted`}><div className={`h-full ${strength.color}`} style={{ width: `${Math.min(100, (len / 32) * 100)}%` }} /></div>
          <span className="font-medium">{strength.label}</span>
        </div>
      </ResultBox>
      <Field label={`Length: ${len}`}>
        <input type="range" min={4} max={64} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full accent-primary" />
      </Field>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Uppercase", upper, setUpper], ["Lowercase", lower, setLower], ["Numbers", num, setNum], ["Symbols", sym, setSym]].map(([l, v, s]: any) => (
          <label key={l} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm cursor-pointer">
            <input type="checkbox" checked={v} onChange={(e) => s(e.target.checked)} />{l}
          </label>
        ))}
      </div>
    </div>
  );
}

function uuidv4() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}
export function UUIDGenerator() {
  const [n, setN] = useState("10");
  const [out, setOut] = useState("");
  const gen = () => setOut(Array.from({ length: Math.min(+n, 1000) }, uuidv4).join("\n"));
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Count"><TInput type="number" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <TButton onClick={gen}>Generate</TButton>
        <TButton variant="outline" onClick={() => cp(out)}><Copy className="h-4 w-4" />Copy all</TButton>
      </div>
      <TTextarea rows={12} value={out} readOnly />
    </div>
  );
}

// -------- JSON to CSV Converter --------
const MAX_JSON_BYTES = 15 * 1024 * 1024;

function flattenObject(obj: any, prefix = "", out: Record<string, any> = {}) {
  if (obj === null || obj === undefined) {
    out[prefix || "value"] = obj === null ? "" : "";
    return out;
  }
  if (typeof obj !== "object") {
    out[prefix || "value"] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      out[prefix || "value"] = "";
    } else if (obj.every((v) => v === null || typeof v !== "object")) {
      out[prefix || "value"] = obj.join("; ");
    } else {
      obj.forEach((v, i) => flattenObject(v, prefix ? `${prefix}.${i}` : String(i), out));
    }
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    out[prefix || "value"] = "";
    return out;
  }
  for (const k of keys) {
    const nk = prefix ? `${prefix}.${k}` : k;
    flattenObject(obj[k], nk, out);
  }
  return out;
}

function jsonToRows(data: any): Record<string, any>[] {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    return data.map((row) => flattenObject(row));
  }
  if (data && typeof data === "object") return [flattenObject(data)];
  return [{ value: data }];
}

function escapeCsvCell(v: any): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: Record<string, any>[]): { csv: string; headers: string[] } {
  const headerSet: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); headerSet.push(k); }
  const lines = [headerSet.map(escapeCsvCell).join(",")];
  for (const r of rows) lines.push(headerSet.map((h) => escapeCsvCell(r[h])).join(","));
  return { csv: lines.join("\n"), headers: headerSet };
}

export function JsonToCsvConverter() {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const convert = (raw: string) => {
    setErr(""); setCsv(""); setRows([]); setHeaders([]);
    const s = raw.trim();
    if (!s) { setErr("Input is empty. Paste JSON or upload a file."); return; }
    let data: any;
    try { data = JSON.parse(s); } catch (e: any) { setErr(`Invalid JSON: ${e.message}`); return; }
    const r = jsonToRows(data);
    if (r.length === 0) { setErr("JSON parsed but contains no data to convert."); return; }
    const { csv: out, headers: h } = rowsToCsv(r);
    setCsv(out); setRows(r); setHeaders(h);
    toast.success(`Converted ${r.length} row${r.length === 1 ? "" : "s"}`);
  };

  const onFile = (f: File | null | undefined) => {
    if (!f) return;
    if (f.size === 0) { setErr("File is empty."); return; }
    if (f.size > MAX_JSON_BYTES) { setErr(`File too large: ${(f.size / 1024 / 1024).toFixed(2)} MB (max 15 MB).`); return; }
    const reader = new FileReader();
    reader.onerror = () => setErr("Failed to read file.");
    reader.onload = () => { const t = String(reader.result || ""); setText(t); convert(t); };
    reader.readAsText(f);
  };

  const download = () => {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "converted.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const reset = () => { setText(""); setCsv(""); setRows([]); setHeaders([]); setErr(""); };

  const previewRows = rows.slice(0, 50);

  return (
    <div className="grid gap-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center"
      >
        <FileJson className="h-8 w-8 text-primary" />
        <div className="text-sm">
          <span className="font-medium">Drag & drop a JSON file</span>
          <span className="text-muted-foreground"> or click to browse (max 15 MB)</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json,text/plain"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <TButton variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Choose file
        </TButton>
      </div>

      <Field label="Or paste JSON here">
        <TTextarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='[{"user":{"name":"Ada","age":36},"role":"admin"},{"user":{"name":"Linus","age":54},"role":"user"}]'
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <TButton onClick={() => convert(text)}>Convert to CSV</TButton>
        <TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset</TButton>
        <TButton variant="outline" disabled={!csv} onClick={() => cp(csv)}><Copy className="h-4 w-4" /> Copy CSV</TButton>
        <TButton disabled={!csv} onClick={download}><Download className="h-4 w-4" /> Download CSV</TButton>
      </div>

      {err && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Preview <span className="text-muted-foreground font-normal">({rows.length} row{rows.length === 1 ? "" : "s"}, {headers.length} column{headers.length === 1 ? "" : "s"}{rows.length > previewRows.length ? `, showing first ${previewRows.length}` : ""})</span></h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/60">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    {headers.map((h) => (
                      <td key={h} className="whitespace-nowrap px-3 py-2 text-muted-foreground max-w-[240px] truncate">
                        {r[h] === undefined || r[h] === null || r[h] === "" ? <span className="opacity-40">—</span> : String(r[h])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Video Downloader (MP4 direct + HLS .m3u8) --------
type DlStatus = "idle" | "fetching" | "downloading" | "concatenating" | "done" | "error";

const proxied = (u: string) => `/api/public/video-proxy?url=${encodeURIComponent(u)}`;

function resolveUrl(base: string, ref: string): string {
  try { return new URL(ref, base).toString(); } catch { return ref; }
}


function parseM3U8(text: string, baseUrl: string): { segments: string[]; variants: { url: string; bandwidth: number }[] } {
  const lines = text.split(/\r?\n/);
  const segments: string[] = [];
  const variants: { url: string; bandwidth: number }[] = [];
  let pendingBw = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      const m = /BANDWIDTH=(\d+)/i.exec(line);
      pendingBw = m ? +m[1] : 0;
      continue;
    }
    if (line.startsWith("#")) continue;
    if (pendingBw > 0) {
      variants.push({ url: resolveUrl(baseUrl, line), bandwidth: pendingBw });
      pendingBw = 0;
    } else {
      segments.push(resolveUrl(baseUrl, line));
    }
  }
  return { segments, variants };
}

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<DlStatus>("idle");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle"); setMsg(""); setErr(""); setProgress({ done: 0, total: 0 });
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const fileNameFromUrl = (u: string, ext: string) => {
    try {
      const path = new URL(u).pathname;
      const base = path.split("/").pop() || `video.${ext}`;
      const clean = base.replace(/\.(m3u8|mp4|mov|mkv|webm|ts)(\?.*)?$/i, "");
      return `${clean || "video"}.${ext}`;
    } catch { return `video.${ext}`; }
  };

  const start = async () => {
    setErr(""); setMsg(""); setProgress({ done: 0, total: 0 });
    const trimmed = url.trim();
    if (!trimmed) { setErr("Paste a direct .mp4 or .m3u8 URL first."); return; }
    let parsed: URL;
    try { parsed = new URL(trimmed); } catch { setErr("That does not look like a valid URL."); return; }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") { setErr("Only http:// and https:// URLs are supported."); return; }

    const ctl = new AbortController();
    abortRef.current = ctl;
    const isM3U8 = /\.m3u8(\?|$)/i.test(parsed.pathname + parsed.search);

    try {
      if (!isM3U8) {
        // Direct file (mp4/mov/webm/...)
        setStatus("downloading");
        setMsg("Downloading video…");
        const res = await fetch(proxied(trimmed), { signal: ctl.signal });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        const total = +(res.headers.get("content-length") || 0);
        const reader = res.body?.getReader();
        if (!reader) {
          const blob = await res.blob();
          triggerDownload(blob, fileNameFromUrl(trimmed, "mp4"));
        } else {
          const chunks: Uint8Array[] = [];
          let received = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) { chunks.push(value); received += value.length; setProgress({ done: received, total }); }
          }
          const blob = new Blob(chunks as BlobPart[], { type: res.headers.get("content-type") || "video/mp4" });
          triggerDownload(blob, fileNameFromUrl(trimmed, "mp4"));
        }
        setStatus("done");
        setMsg("Download complete.");
        return;
      }

      // HLS .m3u8 flow
      setStatus("fetching");
      setMsg("Fetching playlist…");
      const playlistRes = await fetch(proxied(trimmed), { signal: ctl.signal });
      if (!playlistRes.ok) throw new Error(`Playlist fetch failed: HTTP ${playlistRes.status}`);
      const playlistText = await playlistRes.text();

      let baseUrl = trimmed;
      let { segments, variants } = parseM3U8(playlistText, baseUrl);

      if (segments.length === 0 && variants.length > 0) {
        // Master playlist — pick the highest bandwidth variant
        variants.sort((a, b) => b.bandwidth - a.bandwidth);
        const chosen = variants[0].url;
        setMsg("Master playlist detected. Loading highest-quality variant…");
        const varRes = await fetch(chosen, { signal: ctl.signal, mode: "cors" });
        if (!varRes.ok) throw new Error(`Variant playlist fetch failed: HTTP ${varRes.status}`);
        const varText = await varRes.text();
        baseUrl = chosen;
        segments = parseM3U8(varText, baseUrl).segments;
      }

      if (/#EXT-X-KEY/i.test(playlistText) && /METHOD=(?!NONE)/i.test(playlistText)) {
        throw new Error("This stream is encrypted (DRM). Encrypted HLS is not supported.");
      }
      if (segments.length === 0) throw new Error("No playable segments found in the playlist.");

      setStatus("downloading");
      setProgress({ done: 0, total: segments.length });
      const parts: Uint8Array[] = new Array(segments.length);

      // Parallel downloads with limited concurrency
      const CONCURRENCY = 6;
      let idx = 0; let completed = 0;
      const workers = Array.from({ length: Math.min(CONCURRENCY, segments.length) }, async () => {
        while (true) {
          const i = idx++;
          if (i >= segments.length) return;
          const segRes = await fetch(segments[i], { signal: ctl.signal, mode: "cors" });
          if (!segRes.ok) throw new Error(`Segment ${i + 1} failed: HTTP ${segRes.status}`);
          parts[i] = new Uint8Array(await segRes.arrayBuffer());
          completed++;
          setProgress({ done: completed, total: segments.length });
          setMsg(`Downloading segment ${completed} of ${segments.length}…`);
        }
      });
      await Promise.all(workers);

      setStatus("concatenating");
      setMsg("Joining segments…");
      const totalBytes = parts.reduce((s, p) => s + p.length, 0);
      const merged = new Uint8Array(totalBytes);
      let off = 0;
      for (const p of parts) { merged.set(p, off); off += p.length; }
      const blob = new Blob([merged as BlobPart], { type: "video/mp2t" });
      triggerDownload(blob, fileNameFromUrl(trimmed, "ts"));
      setStatus("done");
      setMsg(`Downloaded ${segments.length} segments (${(totalBytes / 1024 / 1024).toFixed(1)} MB). Saved as .ts — playable in VLC / MPV.`);
    } catch (e: any) {
      if (e?.name === "AbortError") { setMsg("Cancelled."); setStatus("idle"); return; }
      setStatus("error");
      const raw = e?.message || String(e);
      const isNetwork = /Failed to fetch|NetworkError|CORS|Load failed/i.test(raw);
      setErr(isNetwork
        ? "The browser blocked the download — most likely a CORS restriction on the video host. Browser-based downloads only work when the server sends Access-Control-Allow-Origin."
        : raw);
    } finally {
      abortRef.current = null;
    }
  };

  const pct = progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;
  const busy = status === "fetching" || status === "downloading" || status === "concatenating";

  return (
    <div className="grid gap-5">
      <Field label="Direct video URL (.mp4 or .m3u8)">
        <TInput
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/video.mp4  or  https://example.com/stream.m3u8"
          spellCheck={false}
          autoComplete="off"
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <TButton onClick={start} disabled={busy}>
          <Download className="h-4 w-4" /> {busy ? "Working…" : "Download"}
        </TButton>
        {busy && (
          <TButton variant="outline" onClick={() => abortRef.current?.abort()}>
            Cancel
          </TButton>
        )}
        <TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset</TButton>
      </div>

      {(busy || status === "done") && (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-muted-foreground">
            {msg} {progress.total > 0 && `(${progress.done}/${progress.total}${status === "downloading" && !url.match(/\.m3u8/i) && progress.total ? " bytes" : ""})`}
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>
      )}

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">What works:</strong> direct MP4/WebM/MOV file URLs and unencrypted HLS .m3u8 playlists that allow cross-origin requests (CORS).</p>
        <p><strong className="text-foreground">What does not work:</strong> DRM-protected streams (Widevine / FairPlay), YouTube / Instagram / TikTok (no direct URLs), and hosts without CORS headers.</p>
        <p><strong className="text-foreground">HLS output:</strong> streams are saved as a single .ts file — plays directly in VLC, MPV or IINA.</p>
        <p><strong className="text-foreground">Only download videos you own or have rights to.</strong> Respect each platform's terms of service.</p>
      </div>
    </div>
  );
}
