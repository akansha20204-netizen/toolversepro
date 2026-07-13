import { useEffect, useRef, useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Field, ResultBox, TButton, TInput, TSelect, download } from "@/components/site/tool-ui";

function useImage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = u;
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return { file, setFile, url, img, reset: () => { setFile(null); setUrl(""); setImg(null); } };
}

function DropZone({ onFile, multiple = false, accept = "image/*" }: { onFile: (f: File | File[]) => void; multiple?: boolean; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (!files.length) return;
        onFile(multiple ? files : files[0]);
      }}
      className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition-colors hover:border-primary hover:bg-muted/60"
      onClick={() => ref.current?.click()}
    >
      <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
      <div className="text-sm font-medium">Click to upload or drag & drop</div>
      <div className="mt-1 text-xs text-muted-foreground">{multiple ? "Multiple files supported" : "Single file"}</div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          if (fs.length) onFile(multiple ? fs : fs[0]);
        }}
      />
    </div>
  );
}

// -------- IMAGE COMPRESSOR --------
export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(70);
  const [maxW, setMaxW] = useState(1920);
  const [result, setResult] = useState<{ url: string; size: number; blob: Blob; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const blob = await imageCompression(file, { maxSizeMB: 10, maxWidthOrHeight: maxW, initialQuality: quality / 100, useWebWorker: true });
      setResult({ url: URL.createObjectURL(blob), size: blob.size, blob, name: file.name.replace(/\.[^.]+$/, "") + "-compressed." + (file.type.split("/")[1] || "jpg") });
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <img src={URL.createObjectURL(file)} className="w-full rounded-xl border border-border" alt="original" />
            <div className="mt-2 text-xs text-muted-foreground">Original: {(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className="space-y-4">
            <Field label={`Quality: ${quality}%`}><input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full accent-primary" /></Field>
            <Field label="Max width/height (px)"><TInput type="number" value={maxW} onChange={(e) => setMaxW(+e.target.value || 1920)} /></Field>
            <div className="flex gap-2"><TButton onClick={run} disabled={busy}>{busy ? "Compressing..." : "Compress"}</TButton><TButton variant="outline" onClick={() => { setFile(null); setResult(null); }}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
            {result && (
              <ResultBox>
                <img src={result.url} className="w-full rounded-lg" alt="compressed" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>Compressed: {(result.size / 1024).toFixed(1)} KB ({((1 - result.size / file.size) * 100).toFixed(0)}% smaller)</span>
                </div>
                <TButton className="mt-3 w-full" onClick={() => download(result.blob, result.name)}><Download className="h-4 w-4" />Download</TButton>
              </ResultBox>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------- IMAGE RESIZER --------
export function ImageResizer() {
  const { file, setFile, img, reset } = useImage();
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [keep, setKeep] = useState(true);
  useEffect(() => { if (img) { setW(img.width); setH(img.height); } }, [img]);
  const run = async () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    canvas.toBlob((b) => { if (b) download(b, `resized-${w}x${h}.png`, "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" alt="preview" />}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Original: {img?.width} × {img?.height}</div>
            <Field label="Width (px)"><TInput type="number" value={w} onChange={(e) => { const n = +e.target.value; setW(n); if (keep && img) setH(Math.round(n * img.height / img.width)); }} /></Field>
            <Field label="Height (px)"><TInput type="number" value={h} onChange={(e) => { const n = +e.target.value; setH(n); if (keep && img) setW(Math.round(n * img.width / img.height)); }} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep aspect ratio</label>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Resize & download</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- IMAGE CROPPER (simple) --------
export function ImageCropper() {
  const { file, setFile, img, reset } = useImage();
  const [c, setC] = useState({ x: 0, y: 0, w: 200, h: 200 });
  useEffect(() => { if (img) setC({ x: 0, y: 0, w: Math.min(400, img.width), h: Math.min(400, img.height) }); }, [img]);
  const run = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = c.w; canvas.height = c.h;
    canvas.getContext("2d")!.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
    canvas.toBlob((b) => { if (b) download(b, "cropped.png", "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <div className="relative"><img src={img.src} className="w-full rounded-xl border border-border" alt="preview" /></div>}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Original: {img?.width} × {img?.height}</div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="X"><TInput type="number" value={c.x} onChange={(e) => setC({ ...c, x: +e.target.value })} /></Field>
              <Field label="Y"><TInput type="number" value={c.y} onChange={(e) => setC({ ...c, y: +e.target.value })} /></Field>
              <Field label="Width"><TInput type="number" value={c.w} onChange={(e) => setC({ ...c, w: +e.target.value })} /></Field>
              <Field label="Height"><TInput type="number" value={c.h} onChange={(e) => setC({ ...c, h: +e.target.value })} /></Field>
            </div>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Crop & download</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- IMAGE ROTATOR --------
export function ImageRotator() {
  const { file, setFile, img, reset } = useImage();
  const [angle, setAngle] = useState(90);
  const run = () => {
    if (!img) return;
    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad)); const cos = Math.abs(Math.cos(rad));
    const w = img.width * cos + img.height * sin;
    const h = img.width * sin + img.height * cos;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(w / 2, h / 2); ctx.rotate(rad); ctx.drawImage(img, -img.width / 2, -img.height / 2);
    canvas.toBlob((b) => { if (b) download(b, "rotated.png", "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" style={{ transform: `rotate(${angle}deg)` }} alt="preview" />}
          <div className="space-y-3">
            <Field label={`Angle: ${angle}°`}><input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-primary" /></Field>
            <div className="flex flex-wrap gap-2">
              {[90, 180, 270].map((a) => <TButton key={a} variant="outline" onClick={() => setAngle(a)}>{a}°</TButton>)}
            </div>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Rotate & download</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- IMAGE FLIPPER --------
export function ImageFlipper() {
  const { file, setFile, img, reset } = useImage();
  const [flipH, setFlipH] = useState(true);
  const [flipV, setFlipV] = useState(false);
  const run = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(flipH ? img.width : 0, flipV ? img.height : 0);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((b) => { if (b) download(b, "flipped.png", "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" style={{ transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` }} alt="preview" />}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} /> Horizontal</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} /> Vertical</label>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Flip & download</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- IMAGE TO PDF --------
export function ImageToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const run = async () => {
    if (!file) return;
    const { jsPDF } = await import("jspdf");
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const pdf = new jsPDF({ orientation: im.width > im.height ? "l" : "p", unit: "pt", format: [im.width, im.height] });
      pdf.addImage(im, "JPEG", 0, 0, im.width, im.height);
      pdf.save(file.name.replace(/\.[^.]+$/, "") + ".pdf");
      URL.revokeObjectURL(url);
    };
    im.src = url;
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <>
          <img src={URL.createObjectURL(file)} className="mx-auto max-h-96 rounded-xl border border-border" alt="preview" />
          <div className="flex gap-2 justify-center"><TButton onClick={run}><Download className="h-4 w-4" />Convert to PDF</TButton><TButton variant="outline" onClick={() => setFile(null)}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

export function ImagesToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const run = async () => {
    if (!files.length) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      const im: HTMLImageElement = await new Promise((r) => { const x = new Image(); x.onload = () => r(x); x.src = url; });
      if (i > 0) pdf.addPage();
      const pw = pdf.internal.pageSize.getWidth(); const ph = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pw / im.width, ph / im.height);
      pdf.addImage(im, "JPEG", (pw - im.width * ratio) / 2, (ph - im.height * ratio) / 2, im.width * ratio, im.height * ratio);
      URL.revokeObjectURL(url);
    }
    pdf.save("images.pdf");
  };
  return (
    <div className="grid gap-4">
      <DropZone multiple onFile={(f) => setFiles([...(files || []), ...(f as File[])])} />
      {files.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} className="aspect-square rounded-lg border border-border object-cover" alt="" />)}
          </div>
          <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Create PDF ({files.length})</TButton><TButton variant="outline" onClick={() => setFiles([])}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </>
      )}
    </div>
  );
}

// -------- BASE64 --------
export function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setOut(r.result as string);
    r.readAsDataURL(file);
  }, [file]);
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <>
          <img src={out} className="mx-auto max-h-64 rounded-xl border border-border" alt="preview" />
          <textarea className="min-h-40 w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" value={out} readOnly />
          <div className="flex gap-2"><TButton onClick={() => navigator.clipboard.writeText(out).then(() => toast.success("Copied"))}>Copy Base64</TButton><TButton variant="outline" onClick={() => { setFile(null); setOut(""); }}>Reset</TButton></div>
        </>
      )}
    </div>
  );
}

export function Base64ToImage() {
  const [s, setS] = useState("");
  return (
    <div className="grid gap-4">
      <textarea className="min-h-40 w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" value={s} onChange={(e) => setS(e.target.value)} placeholder="Paste data:image/...;base64,..." />
      {s.startsWith("data:image") && (
        <>
          <img src={s} className="mx-auto max-h-96 rounded-xl border border-border" alt="decoded" />
          <TButton onClick={() => { const a = document.createElement("a"); a.href = s; a.download = "image.png"; a.click(); }}><Download className="h-4 w-4" />Download</TButton>
        </>
      )}
    </div>
  );
}

// -------- FORMAT CONVERTER --------
export function ImageFormatConverter() {
  const { file, setFile, img, reset } = useImage();
  const [fmt, setFmt] = useState("image/webp");
  const run = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    canvas.toBlob((b) => { if (b) download(b, "converted." + fmt.split("/")[1], fmt); }, fmt, 0.92);
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" alt="preview" />}
          <div className="space-y-3">
            <Field label="Convert to"><TSelect value={fmt} onChange={(e) => setFmt(e.target.value)}>
              <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option>
            </TSelect></Field>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Convert</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- COLOR PICKER --------
export function ImageColorPicker() {
  const { file, setFile, img, reset } = useImage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const c = canvasRef.current;
    const scale = Math.min(1, 600 / img.width);
    c.width = img.width * scale; c.height = img.height * scale;
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  }, [img]);
  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const [r, g, b] = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
    setColor({ hex: "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join(""), rgb: `rgb(${r}, ${g}, ${b})` });
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <>
          <canvas ref={canvasRef} onClick={pick} className="w-full cursor-crosshair rounded-xl border border-border" />
          {color && (
            <ResultBox>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl border border-border" style={{ background: color.hex }} />
                <div className="space-y-1 font-mono text-sm"><div>{color.hex}</div><div>{color.rgb}</div></div>
                <TButton variant="outline" className="ml-auto" onClick={() => navigator.clipboard.writeText(color.hex).then(() => toast.success("Copied"))}>Copy hex</TButton>
              </div>
            </ResultBox>
          )}
          <TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </>
      )}
    </div>
  );
}

// -------- FAVICON GENERATOR --------
export function FaviconGenerator() {
  const { file, setFile, img, reset } = useImage();
  const sizes = [16, 32, 48, 64, 128, 192, 256];
  const gen = (size: number) => {
    if (!img) return;
    const c = document.createElement("canvas"); c.width = size; c.height = size;
    c.getContext("2d")!.drawImage(img, 0, 0, size, size);
    c.toBlob((b) => { if (b) download(b, `favicon-${size}.png`, "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <>
          <img src={img?.src} className="mx-auto max-h-48 rounded-xl border border-border" alt="preview" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {sizes.map((s) => <TButton key={s} variant="outline" onClick={() => gen(s)}>{s}×{s}</TButton>)}
          </div>
          <TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </>
      )}
    </div>
  );
}

// -------- GRAYSCALE --------
export function ImageGrayscale() {
  const { file, setFile, img, reset } = useImage();
  const run = () => {
    if (!img) return;
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const g = d.data[i] * 0.299 + d.data[i + 1] * 0.587 + d.data[i + 2] * 0.114;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = g;
    }
    ctx.putImageData(d, 0, 0);
    c.toBlob((b) => { if (b) download(b, "grayscale.png", "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" style={{ filter: "grayscale(1)" }} alt="preview" />}
          <div className="space-y-3"><TButton onClick={run}><Download className="h-4 w-4" />Download grayscale</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
        </div>
      )}
    </div>
  );
}

// -------- BRIGHTNESS / CONTRAST --------
export function ImageBrightnessContrast() {
  const { file, setFile, img, reset } = useImage();
  const [b, setB] = useState(100);
  const [c, setC] = useState(100);
  const run = () => {
    if (!img) return;
    const cn = document.createElement("canvas"); cn.width = img.width; cn.height = img.height;
    const ctx = cn.getContext("2d")!;
    ctx.filter = `brightness(${b}%) contrast(${c}%)`;
    ctx.drawImage(img, 0, 0);
    cn.toBlob((x) => { if (x) download(x, "adjusted.png", "image/png"); }, "image/png");
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => setFile(f as File)} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {img && <img src={img.src} className="w-full rounded-xl border border-border" style={{ filter: `brightness(${b}%) contrast(${c}%)` }} alt="preview" />}
          <div className="space-y-3">
            <Field label={`Brightness: ${b}%`}><input type="range" min={0} max={200} value={b} onChange={(e) => setB(+e.target.value)} className="w-full accent-primary" /></Field>
            <Field label={`Contrast: ${c}%`}><input type="range" min={0} max={200} value={c} onChange={(e) => setC(+e.target.value)} className="w-full accent-primary" /></Field>
            <div className="flex gap-2"><TButton onClick={run}><Download className="h-4 w-4" />Download</TButton><TButton variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</TButton></div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- EXIF VIEWER --------
export function ExifViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const load = async (f: File) => {
    setFile(f);
    const exifr = (await import("exifr")).default;
    const d = await exifr.parse(f).catch(() => null);
    setData(d || { info: "No EXIF metadata found" });
  };
  return (
    <div className="grid gap-4">
      {!file ? <DropZone onFile={(f) => load(f as File)} /> : (
        <>
          <img src={URL.createObjectURL(file)} className="mx-auto max-h-64 rounded-xl border border-border" alt="preview" />
          <ResultBox className="max-h-96 overflow-auto">
            <pre className="text-xs font-mono">{JSON.stringify(data, null, 2)}</pre>
          </ResultBox>
          <TButton variant="outline" onClick={() => { setFile(null); setData(null); }}><RotateCcw className="h-4 w-4" />Reset</TButton>
        </>
      )}
    </div>
  );
}
