import { useMemo, useState } from "react";
import { Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, TButton, TInput, TSelect, TTextarea, copyText, download } from "@/components/site/tool-ui";

const cp = async (t: string) => (await copyText(t)) ? toast.success("Copied") : toast.error("Copy failed");

export function WordCounter() {
  const [t, setT] = useState("");
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const chars = t.length;
  const charsNoSpace = t.replace(/\s/g, "").length;
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim()).length;
  const paragraphs = t.split(/\n\s*\n/).filter((s) => s.trim()).length;
  const readingTime = Math.max(1, Math.round(words / 200));
  return (
    <div className="grid gap-4">
      <TTextarea rows={10} placeholder="Paste or type your text here..." value={t} onChange={(e) => setT(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[["Words", words], ["Characters", chars], ["No spaces", charsNoSpace], ["Sentences", sentences], ["Paragraphs", paragraphs], ["Reading min", readingTime]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
            <div className="text-xl font-bold gradient-text">{v}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <TButton variant="outline" onClick={() => setT("")}><RotateCcw className="h-4 w-4" />Reset</TButton>
        <TButton onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy text</TButton>
      </div>
    </div>
  );
}

export function CharacterCounter() { return <WordCounter />; }

export function CaseConverter() {
  const [t, setT] = useState("");
  const transform = (fn: (s: string) => string) => setT(fn(t));
  const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const sentence = (s: string) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  const alt = (s: string) => s.split("").map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("");
  const inverse = (s: string) => s.split("").map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
  return (
    <div className="grid gap-4">
      <TTextarea rows={8} value={t} onChange={(e) => setT(e.target.value)} placeholder="Type or paste text..." />
      <div className="flex flex-wrap gap-2">
        <TButton variant="outline" onClick={() => transform((s) => s.toUpperCase())}>UPPERCASE</TButton>
        <TButton variant="outline" onClick={() => transform((s) => s.toLowerCase())}>lowercase</TButton>
        <TButton variant="outline" onClick={() => transform(title)}>Title Case</TButton>
        <TButton variant="outline" onClick={() => transform(sentence)}>Sentence case</TButton>
        <TButton variant="outline" onClick={() => transform(alt)}>aLtErNaTiNg</TButton>
        <TButton variant="outline" onClick={() => transform(inverse)}>iNVERSE</TButton>
        <TButton onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy</TButton>
        <TButton variant="outline" onClick={() => setT("")}><RotateCcw className="h-4 w-4" />Reset</TButton>
      </div>
    </div>
  );
}

export function RemoveExtraSpaces() {
  const [t, setT] = useState("");
  const clean = () => setT(t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").split("\n").map((l) => l.trim()).join("\n").trim());
  return (
    <div className="grid gap-4">
      <TTextarea rows={10} value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste messy text..." />
      <div className="flex gap-2">
        <TButton onClick={clean}>Clean whitespace</TButton>
        <TButton variant="outline" onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy</TButton>
        <TButton variant="outline" onClick={() => setT("")}><RotateCcw className="h-4 w-4" />Reset</TButton>
      </div>
    </div>
  );
}

export function RemoveDuplicateLines() {
  const [t, setT] = useState("");
  const [cs, setCs] = useState(true);
  const run = () => {
    const seen = new Set<string>();
    const out: string[] = [];
    t.split("\n").forEach((l) => {
      const k = cs ? l : l.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(l); }
    });
    setT(out.join("\n"));
  };
  return (
    <div className="grid gap-4">
      <TTextarea rows={10} value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste lines..." />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cs} onChange={(e) => setCs(e.target.checked)} /> Case sensitive</label>
      <div className="flex gap-2">
        <TButton onClick={run}>Remove duplicates</TButton>
        <TButton variant="outline" onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy</TButton>
      </div>
    </div>
  );
}

export function TextSorter() {
  const [t, setT] = useState("");
  const [order, setOrder] = useState("asc");
  const sort = () => {
    const lines = t.split("\n");
    lines.sort((a, b) => {
      if (order === "asc") return a.localeCompare(b);
      if (order === "desc") return b.localeCompare(a);
      if (order === "len-asc") return a.length - b.length;
      return b.length - a.length;
    });
    setT(lines.join("\n"));
  };
  return (
    <div className="grid gap-4">
      <TTextarea rows={10} value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste lines..." />
      <Field label="Sort order"><TSelect value={order} onChange={(e) => setOrder(e.target.value)}>
        <option value="asc">A → Z</option><option value="desc">Z → A</option>
        <option value="len-asc">Shortest first</option><option value="len-desc">Longest first</option>
      </TSelect></Field>
      <div className="flex gap-2"><TButton onClick={sort}>Sort</TButton><TButton variant="outline" onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy</TButton></div>
    </div>
  );
}

export function TextReverser() {
  const [t, setT] = useState("");
  return (
    <div className="grid gap-4">
      <TTextarea rows={8} value={t} onChange={(e) => setT(e.target.value)} placeholder="Text to reverse..." />
      <div className="flex flex-wrap gap-2">
        <TButton onClick={() => setT(t.split("").reverse().join(""))}>Reverse characters</TButton>
        <TButton variant="outline" onClick={() => setT(t.split(" ").reverse().join(" "))}>Reverse words</TButton>
        <TButton variant="outline" onClick={() => setT(t.split("\n").reverse().join("\n"))}>Reverse lines</TButton>
        <TButton variant="outline" onClick={() => cp(t)}><Copy className="h-4 w-4" />Copy</TButton>
      </div>
    </div>
  );
}

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit in voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function LoremIpsum() {
  const [n, setN] = useState("3");
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const gen = () => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const word = () => LOREM_WORDS[rand(0, LOREM_WORDS.length - 1)];
    const sentence = () => { const len = rand(6, 14); const w = Array.from({ length: len }, word); w[0] = w[0][0].toUpperCase() + w[0].slice(1); return w.join(" ") + "."; };
    if (type === "words") return Array.from({ length: +n }, word).join(" ");
    if (type === "sentences") return Array.from({ length: +n }, sentence).join(" ");
    return Array.from({ length: +n }, () => Array.from({ length: rand(3, 6) }, sentence).join(" ")).join("\n\n");
  };
  const [out, setOut] = useState("");
  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <Field label="Count"><TInput type="number" value={n} onChange={(e) => setN(e.target.value)} /></Field>
        <Field label="Type"><TSelect value={type} onChange={(e) => setType(e.target.value as any)}><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></TSelect></Field>
        <TButton onClick={() => setOut(gen())}>Generate</TButton>
      </div>
      <TTextarea rows={14} value={out} onChange={(e) => setOut(e.target.value)} placeholder="Click generate..." />
    </div>
  );
}

export function SlugGenerator() {
  const [t, setT] = useState("");
  const slug = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <div className="grid gap-4">
      <Field label="Text"><TInput value={t} onChange={(e) => setT(e.target.value)} placeholder="Enter your title" /></Field>
      <ResultBox><div className="font-mono text-sm break-all">{slug || <span className="text-muted-foreground">Your slug appears here</span>}</div></ResultBox>
      <div className="flex gap-2"><TButton onClick={() => cp(slug)}><Copy className="h-4 w-4" />Copy</TButton></div>
    </div>
  );
}

export function RandomText() {
  const [len, setLen] = useState("32");
  const [charset, setCharset] = useState("alnum");
  const [out, setOut] = useState("");
  const gen = () => {
    const sets: Record<string, string> = {
      alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      num: "0123456789",
      hex: "0123456789abcdef",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };
    const s = sets[charset];
    let r = "";
    for (let i = 0; i < +len; i++) r += s[Math.floor(Math.random() * s.length)];
    setOut(r);
  };
  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="space-y-3">
        <Field label="Length"><TInput type="number" value={len} onChange={(e) => setLen(e.target.value)} /></Field>
        <Field label="Character set"><TSelect value={charset} onChange={(e) => setCharset(e.target.value)}>
          <option value="alnum">Alphanumeric</option><option value="alpha">Alphabetic</option>
          <option value="num">Numeric</option><option value="hex">Hex</option><option value="symbols">Symbols</option>
        </TSelect></Field>
        <TButton onClick={gen}>Generate</TButton>
      </div>
      <TTextarea rows={10} value={out} readOnly />
    </div>
  );
}
