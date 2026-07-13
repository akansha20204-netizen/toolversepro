import { useMemo, useState } from "react";
import { Copy, RotateCcw, RefreshCw } from "lucide-react";
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
