import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, Stat, TButton, TInput, TSelect, download } from "@/components/site/tool-ui";

function PDFDrop({ onFiles, multiple = false }: { onFiles: (fs: File[]) => void; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const fs = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf"); if (fs.length) onFiles(fs); }}
      className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center hover:border-primary"
      onClick={() => ref.current?.click()}
    >
      <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
      <div className="text-sm font-medium">Click to upload PDF{multiple ? "s" : ""}</div>
      <input ref={ref} type="file" accept="application/pdf" multiple={multiple} className="hidden"
        onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) onFiles(fs); }} />
    </div>
  );
}

async function loadPDF(f: File) {
  const { PDFDocument } = await import("pdf-lib");
  return PDFDocument.load(await f.arrayBuffer());
}

// -------- MERGE --------
export function PDFMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (files.length < 2) return toast.error("Add at least 2 PDFs");
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const f of files) {
        const src = await loadPDF(f);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      download(bytes, "merged.pdf", "application/pdf");
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <div className="grid gap-4">
      <PDFDrop multiple onFiles={(fs) => setFiles([...files, ...fs])} />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{i + 1}</span>
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <div className="flex gap-1">
                <TButton variant="ghost" onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</TButton>
                {i > 0 && <TButton variant="ghost" onClick={() => { const c = [...files]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; setFiles(c); }}>↑</TButton>}
                {i < files.length - 1 && <TButton variant="ghost" onClick={() => { const c = [...files]; [c[i], c[i + 1]] = [c[i + 1], c[i]]; setFiles(c); }}>↓</TButton>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <TButton onClick={run} disabled={busy || files.length < 2}><Download className="h-4 w-4" />{busy ? "Merging..." : "Merge PDFs"}</TButton>
        <TButton variant="outline" onClick={() => setFiles([])}><RotateCcw className="h-4 w-4" />Reset</TButton>
      </div>
    </div>
  );
}

// -------- SPLIT --------
export function PDFSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => { if (!file) { setCount(null); return; } loadPDF(file).then((p) => setCount(p.getPageCount())); }, [file]);
  const run = async () => {
    if (!file) return;
    const { PDFDocument } = await import("pdf-lib");
    const src = await loadPDF(file);
    for (let i = 0; i < src.getPageCount(); i++) {
      const out = await PDFDocument.create();
      const [p] = await out.copyPages(src, [i]);
      out.addPage(p);
      const bytes = await out.save();
      download(bytes, `page-${i + 1}.pdf`, "application/pdf");
    }
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox><div className="text-sm">{file.name} — {count ?? "..."} pages</div></ResultBox>
          <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Split into pages</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- ROTATE --------
export function PDFRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const run = async () => {
    if (!file) return;
    const { degrees } = await import("pdf-lib");
    const src = await loadPDF(file);
    src.getPages().forEach((p) => p.setRotation(degrees(p.getRotation().angle + angle)));
    const bytes = await src.save();
    download(bytes, "rotated.pdf", "application/pdf");
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox className="text-sm">{file.name}</ResultBox>
          <Field label="Rotate every page by"><TSelect value={angle} onChange={(e) => setAngle(+e.target.value)}>
            <option value={90}>90° right</option><option value={180}>180°</option><option value={270}>270° (90° left)</option>
          </TSelect></Field>
          <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Rotate & download</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- COMPRESS (basic: re-save) --------
export function PDFCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await loadPDF(file);
      const bytes = await src.save({ useObjectStreams: true });
      download(bytes, "compressed.pdf", "application/pdf");
      toast.success(`Saved (${((1 - bytes.length / file.size) * 100).toFixed(1)}% smaller)`);
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox className="text-sm">{file.name} — {(file.size / 1024).toFixed(1)} KB</ResultBox>
          <p className="text-xs text-muted-foreground">Note: browser-based compression re-serialises the PDF; results vary by original.</p>
          <div className="flex gap-2"><TButton onClick={run} disabled={busy}><Download className="h-4 w-4" />{busy ? "Compressing..." : "Compress"}</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- PDF to Images (render via canvas: uses browser <embed>? PDF-lib can't render) --------
// Simpler: use PDF-lib to extract page count, then use pdf.js if available. To avoid extra dep, we'll extract page count only and export "each page as PNG" using a lightweight approach: skip real rasterization if pdfjs missing.
// We'll use pdf.js from CDN via dynamic import fallback.
export function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pdfjs: any = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = (worker as any).default;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const c = document.createElement("canvas");
        c.width = viewport.width; c.height = viewport.height;
        await page.render({ canvasContext: c.getContext("2d"), viewport }).promise;
        await new Promise<void>((r) => c.toBlob((b) => { if (b) download(b, `page-${i}.png`, "image/png"); r(); }, "image/png"));
      }
      toast.success(`Exported ${doc.numPages} pages`);
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox className="text-sm">{file.name}</ResultBox>
          <div className="flex gap-2"><TButton onClick={run} disabled={busy}><Download className="h-4 w-4" />{busy ? "Rendering..." : "Export pages as PNG"}</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- EXTRACT PAGES --------
function PageRangeTool({ mode }: { mode: "extract" | "delete" }) {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [range, setRange] = useState("1-3");
  useEffect(() => { if (!file) { setCount(null); return; } loadPDF(file).then((p) => setCount(p.getPageCount())); }, [file]);
  const parseRange = (s: string, total: number) => {
    const set = new Set<number>();
    s.split(",").forEach((part) => {
      const [a, b] = part.trim().split("-").map(Number);
      if (!isNaN(a)) {
        const end = !isNaN(b) ? b : a;
        for (let i = Math.max(1, a); i <= Math.min(total, end); i++) set.add(i - 1);
      }
    });
    return set;
  };
  const run = async () => {
    if (!file || !count) return;
    const { PDFDocument } = await import("pdf-lib");
    const src = await loadPDF(file);
    const target = parseRange(range, count);
    const indices = src.getPageIndices().filter((i) => (mode === "extract" ? target.has(i) : !target.has(i)));
    if (!indices.length) return toast.error("No pages selected");
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    const bytes = await out.save();
    download(bytes, `${mode}.pdf`, "application/pdf");
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox className="text-sm">{file.name} — {count ?? "..."} pages</ResultBox>
          <Field label={`Pages to ${mode} (e.g. 1-3, 5, 7-9)`}><TInput value={range} onChange={(e) => setRange(e.target.value)} /></Field>
          <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />{mode === "extract" ? "Extract" : "Delete"}</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}
export function PDFExtractPages() { return <PageRangeTool mode="extract" />; }
export function PDFDeletePages() { return <PageRangeTool mode="delete" />; }

// -------- REORDER --------
export function PDFReorder() {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState("");
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!file) return;
    loadPDF(file).then((p) => {
      const n = p.getPageCount();
      setCount(n);
      setOrder(Array.from({ length: n }, (_, i) => i + 1).join(","));
    });
  }, [file]);
  const run = async () => {
    if (!file || !count) return;
    const { PDFDocument } = await import("pdf-lib");
    const src = await loadPDF(file);
    const indices = order.split(",").map((x) => +x.trim() - 1).filter((i) => i >= 0 && i < count);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    download(await out.save(), "reordered.pdf", "application/pdf");
  };
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox className="text-sm">{file.name} — {count} pages</ResultBox>
          <Field label="New order (comma separated page numbers)"><TInput value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
          <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Save reordered</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- PREVIEW --------
export function PDFPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  useEffect(() => { if (!file) { setUrl(""); return; } const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <iframe src={url} className="h-[70vh] w-full rounded-xl border border-border" title="PDF Preview" />
          <TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </>
      )}
    </div>
  );
}

// -------- PAGE COUNTER --------
export function PDFPageCounter() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => { if (!file) return; loadPDF(file).then((p) => setCount(p.getPageCount())); }, [file]);
  return (
    <div className="grid gap-4">
      {!file ? <PDFDrop onFiles={(fs) => setFile(fs[0])} /> : (
        <>
          <ResultBox>
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text">{count ?? "..."}</div>
              <div className="mt-2 text-sm text-muted-foreground">{file.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </ResultBox>
          <TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </>
      )}
    </div>
  );
}
