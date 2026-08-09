import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  X,
  Download,
  RotateCcw,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
} from "lucide-react";
import { Field, TButton, TInput, TSelect, Stat } from "@/components/site/tool-ui";
import {
  clockTime,
  extOf,
  formatBytes,
  formatTime,
  getFFmpeg,
  probeDuration,
  readAsUint8,
  safeName,
  terminateFFmpeg,
} from "@/lib/ffmpeg-client";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared plumbing                                                             */
/* -------------------------------------------------------------------------- */

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

type JobOut = { name: string; data: Uint8Array; type: string };
type Phase = "idle" | "loading" | "working" | "done" | "error";

type Ctx = {
  ff: any;
  setStatus: (s: string) => void;
  setPct: (p: number) => void;
  cancelled: () => boolean;
};

async function exec(ff: any, args: string[], duration: number, onPct: (p: number) => void) {
  const handler = (e: any) => {
    const t = typeof e?.time === "number" ? e.time / 1_000_000 : 0;
    const p = duration > 0 && t > 0 ? t / duration : typeof e?.progress === "number" ? e.progress : 0;
    onPct(Math.max(0.01, Math.min(0.99, p)));
  };
  try {
    ff.on("progress", handler);
  } catch {
    /* ignore */
  }
  try {
    const code = await ff.exec(args);
    if (code !== 0) throw new Error("Processing failed — the file or the selected options may not be supported.");
  } finally {
    try {
      ff.off("progress", handler);
    } catch {
      /* ignore */
    }
  }
}

function useMediaJob() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPctRaw] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [eta, setEta] = useState("");
  const [outputs, setOutputs] = useState<{ name: string; url: string; size: number }[]>([]);
  const cancelRef = useRef(false);
  const startRef = useRef(0);
  const jobRef = useRef<((c: Ctx) => Promise<JobOut[]>) | null>(null);

  const setPct = useCallback((p: number) => {
    setPctRaw(p);
    const elapsed = (Date.now() - startRef.current) / 1000;
    if (p > 0.02 && elapsed > 1) {
      const remain = elapsed / p - elapsed;
      setEta(remain > 1 ? `~${formatTime(remain)} remaining` : "almost done");
    }
  }, []);

  const clearOutputs = useCallback(() => {
    setOutputs((prev) => {
      prev.forEach((o) => URL.revokeObjectURL(o.url));
      return [];
    });
  }, []);

  const run = useCallback(
    async (job: (c: Ctx) => Promise<JobOut[]>) => {
      jobRef.current = job;
      cancelRef.current = false;
      startRef.current = Date.now();
      clearOutputs();
      setError("");
      setEta("");
      setPctRaw(0);
      setPhase("loading");
      setStatus("Preparing the media engine…");
      try {
        const ff = await getFFmpeg(setStatus);
        if (cancelRef.current) return;
        setPhase("working");
        setStatus("Processing…");
        const res = await job({ ff, setStatus, setPct, cancelled: () => cancelRef.current });
        if (cancelRef.current) return;
        setOutputs(
          res.map((r) => ({
            name: r.name,
            size: r.data.byteLength,
            url: URL.createObjectURL(new Blob([r.data.slice().buffer as ArrayBuffer], { type: r.type })),
          })),
        );
        setPctRaw(1);
        setStatus("Done");
        setPhase("done");
      } catch (e: any) {
        if (cancelRef.current) return;
        setError(e?.message || "Something went wrong while processing this file.");
        setPhase("error");
      }
    },
    [clearOutputs, setPct],
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    terminateFFmpeg();
    setPhase("idle");
    setStatus("");
    setPctRaw(0);
    setEta("");
  }, []);

  const retry = useCallback(() => {
    if (jobRef.current) void run(jobRef.current);
  }, [run]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    clearOutputs();
    setPhase("idle");
    setStatus("");
    setError("");
    setEta("");
    setPctRaw(0);
    jobRef.current = null;
  }, [clearOutputs]);

  useEffect(() => () => clearOutputs(), [clearOutputs]);

  const busy = phase === "loading" || phase === "working";
  return { phase, busy, pct, status, error, eta, outputs, run, cancel, retry, reset };
}

function Dropzone({
  accept,
  multiple,
  onFiles,
  label,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (f: File[]) => void;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handle = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => f.size <= MAX_BYTES);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-muted/60",
        over && "border-primary bg-primary/5",
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white shadow-md">
        <Upload className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <span className="mt-4 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium">
        Browse files
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function FileChip({ file, duration, onRemove }: { file: File; duration?: number; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{file.name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatBytes(file.size)}
          {duration ? ` · ${formatTime(duration)}` : ""}
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove file" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function JobPanel({
  job,
  onStart,
  startLabel,
  canStart,
  onClear,
}: {
  job: ReturnType<typeof useMediaJob>;
  onStart: () => void;
  startLabel: string;
  canStart: boolean;
  onClear: () => void;
}) {
  const { phase, busy, pct, status, error, eta, outputs } = job;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TButton onClick={onStart} disabled={!canStart || busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {startLabel}
        </TButton>
        {busy && (
          <TButton variant="danger" onClick={job.cancel}>
            <X className="h-4 w-4" /> Cancel
          </TButton>
        )}
        {phase === "error" && (
          <TButton variant="outline" onClick={job.retry}>
            <RotateCcw className="h-4 w-4" /> Retry
          </TButton>
        )}
        <TButton variant="ghost" onClick={onClear} disabled={busy}>
          <Trash2 className="h-4 w-4" /> Clear
        </TButton>
      </div>

      {busy && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{status}</span>
            <span className="font-semibold text-foreground">{Math.round(pct * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${Math.max(3, pct * 100)}%` }} />
          </div>
          {eta && <div className="mt-2 text-xs text-muted-foreground">{eta}</div>}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {outputs.length > 0 && (
        <div className="space-y-2">
          {outputs.map((o) => (
            <div key={o.name} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{o.name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(o.size)}</div>
              </div>
              <a
                href={o.url}
                download={o.name}
                className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-md"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const AUDIO_ACCEPT = "audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg,.wma";
const VIDEO_ACCEPT = "video/*,.mp4,.mov,.mkv,.avi,.webm,.m4v,.flv,.3gp";

const AUDIO_CODEC: Record<string, string[]> = {
  mp3: ["-c:a", "libmp3lame"],
  wav: ["-c:a", "pcm_s16le"],
  aac: ["-c:a", "aac"],
  m4a: ["-c:a", "aac"],
  flac: ["-c:a", "flac"],
  ogg: ["-c:a", "libvorbis"],
  wma: ["-c:a", "wmav2"],
};

function useFiles(kind: "audio" | "video") {
  const [files, setFiles] = useState<File[]>([]);
  const [durations, setDurations] = useState<Record<string, number>>({});

  const add = useCallback(
    async (incoming: File[], multiple: boolean) => {
      setFiles((prev) => (multiple ? [...prev, ...incoming] : incoming));
      for (const f of incoming) {
        const d = await probeDuration(f, kind);
        setDurations((prev) => ({ ...prev, [f.name + f.size]: d }));
      }
    },
    [kind],
  );

  const durationOf = (f: File) => durations[f.name + f.size] ?? 0;
  return { files, setFiles, add, durationOf };
}

/* -------------------------------------------------------------------------- */
/* 1. Video to MP3 Converter                                                   */
/* -------------------------------------------------------------------------- */

export function VideoToMp3() {
  const { files, setFiles, add, durationOf } = useFiles("video");
  const [bitrate, setBitrate] = useState("192k");
  const job = useMediaJob();
  const file = files[0];

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus("Extracting audio…");
      const inName = "in." + (extOf(file.name) || "mp4");
      await ff.writeFile(inName, await readAsUint8(file));
      await exec(
        ff,
        ["-i", inName, "-vn", "-c:a", "libmp3lame", "-b:a", bitrate, "-ar", "44100", "out.mp3"],
        durationOf(file),
        setPct,
      );
      const data = (await ff.readFile("out.mp3")) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile("out.mp3");
      } catch {
        /* ignore */
      }
      return [{ name: safeName(file.name.replace(/\.[^.]+$/, "")) + ".mp3", data, type: "audio/mpeg" }];
    });

  return (
    <div className="space-y-5">
      {!file ? (
        <Dropzone
          accept={VIDEO_ACCEPT}
          onFiles={(f) => add(f, false)}
          label="Drop a video here to extract its audio"
          hint="MP4, MOV, MKV, AVI, WebM, M4V, FLV, 3GP · up to 2 GB"
        />
      ) : (
        <>
          <FileChip file={file} duration={durationOf(file)} onRemove={() => setFiles([])} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="MP3 quality">
              <TSelect value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
                <option value="128k">128 kbps — small file</option>
                <option value="192k">192 kbps — recommended</option>
                <option value="256k">256 kbps — high</option>
                <option value="320k">320 kbps — maximum</option>
              </TSelect>
            </Field>
            <Stat label="File size" value={formatBytes(file.size)} />
            <Stat label="Duration" value={durationOf(file) ? formatTime(durationOf(file)) : "—"} />
          </div>
        </>
      )}
      <JobPanel job={job} onStart={start} startLabel="Extract MP3" canStart={!!file} onClear={() => { setFiles([]); job.reset(); }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Audio Converter                                                          */
/* -------------------------------------------------------------------------- */

export function AudioConverter() {
  const { files, setFiles, add, durationOf } = useFiles("audio");
  const [format, setFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192k");
  const [sampleRate, setSampleRate] = useState("44100");
  const [channels, setChannels] = useState("2");
  const job = useMediaJob();

  const lossless = format === "wav" || format === "flac";

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      const outs: JobOut[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setStatus(`Converting ${i + 1} of ${files.length}: ${f.name}`);
        const inName = `in${i}.` + (extOf(f.name) || "mp3");
        const outName = `out${i}.${format}`;
        await ff.writeFile(inName, await readAsUint8(f));
        const args = ["-i", inName, "-vn", "-map_metadata", "0", ...AUDIO_CODEC[format]];
        if (!lossless) args.push("-b:a", bitrate);
        args.push("-ar", sampleRate, "-ac", channels, outName);
        await exec(ff, args, durationOf(f), (p) => setPct((i + p) / files.length));
        const data = (await ff.readFile(outName)) as Uint8Array;
        try {
          await ff.deleteFile(inName);
          await ff.deleteFile(outName);
        } catch {
          /* ignore */
        }
        outs.push({
          name: safeName(f.name.replace(/\.[^.]+$/, "")) + "." + format,
          data,
          type: format === "mp3" ? "audio/mpeg" : `audio/${format}`,
        });
      }
      return outs;
    });

  return (
    <div className="space-y-5">
      <Dropzone
        accept={AUDIO_ACCEPT}
        multiple
        onFiles={(f) => add(f, true)}
        label="Drop audio files here"
        hint="MP3, WAV, AAC, M4A, FLAC, OGG, WMA · batch conversion supported"
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <FileChip
              key={f.name + i}
              file={f}
              duration={durationOf(f)}
              onRemove={() => setFiles(files.filter((_, x) => x !== i))}
            />
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Output format">
          <TSelect value={format} onChange={(e) => setFormat(e.target.value)}>
            {Object.keys(AUDIO_CODEC).map((f) => (
              <option key={f} value={f}>
                {f.toUpperCase()}
              </option>
            ))}
          </TSelect>
        </Field>
        <Field label="Bitrate" hint={lossless ? "Not used for lossless output" : undefined}>
          <TSelect value={bitrate} onChange={(e) => setBitrate(e.target.value)} disabled={lossless}>
            <option value="96k">96 kbps</option>
            <option value="128k">128 kbps</option>
            <option value="192k">192 kbps</option>
            <option value="256k">256 kbps</option>
            <option value="320k">320 kbps</option>
          </TSelect>
        </Field>
        <Field label="Sample rate">
          <TSelect value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}>
            <option value="22050">22.05 kHz</option>
            <option value="32000">32 kHz</option>
            <option value="44100">44.1 kHz (CD)</option>
            <option value="48000">48 kHz (studio)</option>
          </TSelect>
        </Field>
        <Field label="Channels">
          <TSelect value={channels} onChange={(e) => setChannels(e.target.value)}>
            <option value="2">Stereo</option>
            <option value="1">Mono</option>
          </TSelect>
        </Field>
      </div>
      <JobPanel
        job={job}
        onStart={start}
        startLabel={files.length > 1 ? `Convert ${files.length} files` : "Convert audio"}
        canStart={files.length > 0}
        onClear={() => { setFiles([]); job.reset(); }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. MP3 Cutter                                                               */
/* -------------------------------------------------------------------------- */

function Waveform({
  file,
  duration,
  start,
  end,
  onChange,
}: {
  file: File;
  duration: number;
  start: number;
  end: number;
  onChange: (s: number, e: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"start" | "end" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const buf = await ctx.decodeAudioData(await file.arrayBuffer());
        const raw = buf.getChannelData(0);
        const N = 320;
        const block = Math.floor(raw.length / N) || 1;
        const out: number[] = [];
        for (let i = 0; i < N; i++) {
          let peak = 0;
          for (let j = 0; j < block; j += 16) peak = Math.max(peak, Math.abs(raw[i * block + j] || 0));
          out.push(peak);
        }
        void ctx.close();
        if (!cancelled) setPeaks(out);
      } catch {
        if (!cancelled) setPeaks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const w = (c.width = c.offsetWidth * 2);
    const h = (c.height = 160);
    const g = c.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, w, h);
    const bars = peaks.length || 1;
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const t = (i / bars) * duration;
      const inRange = t >= start && t <= end;
      const p = (peaks[i] || 0) * 0.9;
      const bh = Math.max(2, p * h);
      g.fillStyle = inRange ? "rgba(99,102,241,0.95)" : "rgba(148,163,184,0.35)";
      g.fillRect(i * bw, (h - bh) / 2, Math.max(1, bw - 2), bh);
    }
  }, [peaks, start, end, duration]);

  const posToTime = (clientX: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(duration, ((clientX - r.left) / r.width) * duration));
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const t = posToTime(x);
    dragRef.current = Math.abs(t - start) <= Math.abs(t - end) ? "start" : "end";
    move(x);
  };
  const move = (x: number) => {
    if (!dragRef.current) return;
    const t = posToTime(x);
    if (dragRef.current === "start") onChange(Math.min(t, end - 0.1), end);
    else onChange(start, Math.max(t, start + 0.1));
  };

  useEffect(() => {
    const up = () => (dragRef.current = null);
    const mm = (e: MouseEvent) => move(e.clientX);
    const tm = (e: TouchEvent) => e.touches[0] && move(e.touches[0].clientX);
    window.addEventListener("mousemove", mm);
    window.addEventListener("touchmove", tm);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  });

  const pctL = duration ? (start / duration) * 100 : 0;
  const pctR = duration ? (end / duration) * 100 : 100;

  return (
    <div
      ref={wrapRef}
      onMouseDown={onDown}
      onTouchStart={onDown}
      className="relative cursor-ew-resize select-none overflow-hidden rounded-2xl border border-border bg-card p-2"
    >
      <canvas ref={canvasRef} className="block h-[80px] w-full" />
      <div className="pointer-events-none absolute inset-y-0 left-0 bg-background/70" style={{ width: `${pctL}%` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 bg-background/70" style={{ width: `${100 - pctR}%` }} />
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${pctL}%` }} />
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${pctR}%` }} />
    </div>
  );
}

export function Mp3Cutter() {
  const { files, setFiles, add, durationOf } = useFiles("audio");
  const file = files[0];
  const duration = file ? durationOf(file) : 0;
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const job = useMediaJob();
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (duration) setRange([0, duration]);
  }, [duration]);

  const preview = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    a.currentTime = range[0];
    void a.play();
    setPlaying(true);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (a.currentTime >= range[1]) {
        a.pause();
        setPlaying(false);
      }
    };
    a.addEventListener("timeupdate", onTime);
    return () => a.removeEventListener("timeupdate", onTime);
  }, [range]);

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus("Trimming audio…");
      const ext = extOf(file.name) || "mp3";
      const inName = "in." + ext;
      const outName = "out." + ext;
      await ff.writeFile(inName, await readAsUint8(file));
      const len = Math.max(0.05, range[1] - range[0]);
      const filters: string[] = [];
      if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn}`);
      if (fadeOut > 0) filters.push(`afade=t=out:st=${Math.max(0, len - fadeOut).toFixed(3)}:d=${fadeOut}`);
      const args = ["-i", inName, "-ss", clockTime(range[0]), "-t", len.toFixed(3)];
      if (filters.length) args.push("-af", filters.join(","), ...(AUDIO_CODEC[ext] ?? AUDIO_CODEC.mp3));
      else args.push("-c", "copy");
      args.push(outName);
      await exec(ff, args, len, setPct);
      const data = (await ff.readFile(outName)) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile(outName);
      } catch {
        /* ignore */
      }
      return [{ name: safeName(file.name.replace(/\.[^.]+$/, "")) + `-clip.${ext}`, data, type: "audio/" + ext }];
    });

  return (
    <div className="space-y-5">
      {!file ? (
        <Dropzone
          accept={AUDIO_ACCEPT}
          onFiles={(f) => add(f, false)}
          label="Drop an audio file to cut"
          hint="MP3, WAV, AAC, M4A, FLAC · perfect for ringtones and clips"
        />
      ) : (
        <>
          <FileChip file={file} duration={duration} onRemove={() => setFiles([])} />
          <Waveform file={file} duration={duration || 1} start={range[0]} end={range[1]} onChange={(s, e) => setRange([s, e])} />
          <audio ref={audioRef} src={url} className="hidden" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Start (seconds)">
              <TInput
                type="number"
                step="0.1"
                min={0}
                max={Math.max(0, range[1] - 0.1)}
                value={range[0].toFixed(2)}
                onChange={(e) => setRange([Math.min(+e.target.value, range[1] - 0.1), range[1]])}
              />
            </Field>
            <Field label="End (seconds)">
              <TInput
                type="number"
                step="0.1"
                min={range[0] + 0.1}
                max={duration}
                value={range[1].toFixed(2)}
                onChange={(e) => setRange([range[0], Math.max(+e.target.value, range[0] + 0.1)])}
              />
            </Field>
            <Field label="Fade in (s)">
              <TInput type="number" step="0.1" min={0} value={fadeIn} onChange={(e) => setFadeIn(Math.max(0, +e.target.value))} />
            </Field>
            <Field label="Fade out (s)">
              <TInput type="number" step="0.1" min={0} value={fadeOut} onChange={(e) => setFadeOut(Math.max(0, +e.target.value))} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TButton variant="outline" onClick={preview}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause preview" : "Play selection"}
            </TButton>
            <span className="text-xs text-muted-foreground">
              Selection: {formatTime(range[0])} → {formatTime(range[1])} ({formatTime(Math.max(0, range[1] - range[0]))})
            </span>
          </div>
        </>
      )}
      <JobPanel job={job} onStart={start} startLabel="Cut audio" canStart={!!file && range[1] > range[0]} onClear={() => { setFiles([]); job.reset(); }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Audio Merger                                                             */
/* -------------------------------------------------------------------------- */

export function AudioMerger() {
  const { files, setFiles, add, durationOf } = useFiles("audio");
  const [gap, setGap] = useState(0);
  const [crossfade, setCrossfade] = useState(0);
  const [normalize, setNormalize] = useState(false);
  const [format, setFormat] = useState("mp3");
  const job = useMediaJob();
  const dragIndex = useRef<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = files.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setFiles(next);
  };

  const total = files.reduce((s, f) => s + durationOf(f), 0);

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus("Merging tracks…");
      const inputs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const n = `m${i}.` + (extOf(files[i].name) || "mp3");
        await ff.writeFile(n, await readAsUint8(files[i]));
        inputs.push(n);
      }

      const args: string[] = [];
      inputs.forEach((n) => args.push("-i", n));

      const labels: string[] = [];
      let filter = "";
      // Normalise every input to a common format so concat/crossfade is safe.
      inputs.forEach((_, i) => {
        filter += `[${i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${i}];`;
        labels.push(`[a${i}]`);
      });

      let last: string;
      if (crossfade > 0 && labels.length > 1) {
        let cur = labels[0];
        for (let i = 1; i < labels.length; i++) {
          const out = `[x${i}]`;
          filter += `${cur}${labels[i]}acrossfade=d=${crossfade}:c1=tri:c2=tri${out};`;
          cur = out;
        }
        last = cur;
      } else if (gap > 0 && labels.length > 1) {
        // Insert generated silence between tracks.
        const silIdx: string[] = [];
        for (let i = 0; i < labels.length - 1; i++) {
          filter += `aevalsrc=0:d=${gap}:s=44100:c=stereo[s${i}];`;
          silIdx.push(`[s${i}]`);
        }
        let chain = "";
        labels.forEach((l, i) => {
          chain += l;
          if (i < labels.length - 1) chain += silIdx[i];
        });
        const n = labels.length * 2 - 1;
        filter += `${chain}concat=n=${n}:v=0:a=1[cc];`;
        last = "[cc]";
      } else {
        filter += `${labels.join("")}concat=n=${labels.length}:v=0:a=1[cc];`;
        last = "[cc]";
      }

      if (normalize) {
        filter += `${last}dynaudnorm=f=250:g=15[outa]`;
        last = "[outa]";
      } else {
        filter = filter.replace(/;$/, "");
      }

      const outName = `merged.${format}`;
      args.push("-filter_complex", filter.replace(/;$/, ""), "-map", last, ...AUDIO_CODEC[format]);
      if (format === "mp3") args.push("-b:a", "256k");
      args.push(outName);

      await exec(ff, args, total, setPct);
      const data = (await ff.readFile(outName)) as Uint8Array;
      try {
        for (const n of inputs) await ff.deleteFile(n);
        await ff.deleteFile(outName);
      } catch {
        /* ignore */
      }
      return [{ name: outName, data, type: format === "mp3" ? "audio/mpeg" : "audio/wav" }];
    });

  return (
    <div className="space-y-5">
      <Dropzone
        accept={AUDIO_ACCEPT}
        multiple
        onFiles={(f) => add(f, true)}
        label="Drop audio files to merge"
        hint="MP3, WAV, AAC, M4A · drag rows to set the play order"
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={f.name + i}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) move(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(f.size)}
                  {durationOf(f) ? ` · ${formatTime(durationOf(f))}` : ""}
                </div>
              </div>
              <button onClick={() => move(i, i - 1)} aria-label="Move up" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => move(i, i + 1)} aria-label="Move down" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setFiles(files.filter((_, x) => x !== i))} aria-label="Remove" className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Silence between tracks (s)" hint={crossfade > 0 ? "Ignored while crossfade is on" : undefined}>
          <TInput type="number" min={0} step="0.5" value={gap} onChange={(e) => setGap(Math.max(0, +e.target.value))} />
        </Field>
        <Field label="Crossfade (s)">
          <TInput type="number" min={0} step="0.5" value={crossfade} onChange={(e) => setCrossfade(Math.max(0, +e.target.value))} />
        </Field>
        <Field label="Normalize levels">
          <TSelect value={normalize ? "y" : "n"} onChange={(e) => setNormalize(e.target.value === "y")}>
            <option value="n">Off — keep original levels</option>
            <option value="y">On — even out loudness</option>
          </TSelect>
        </Field>
        <Field label="Output format">
          <TSelect value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="mp3">MP3 (256 kbps)</option>
            <option value="wav">WAV (lossless)</option>
          </TSelect>
        </Field>
      </div>
      <JobPanel
        job={job}
        onStart={start}
        startLabel={`Merge ${files.length || ""} files`.trim()}
        canStart={files.length >= 2}
        onClear={() => { setFiles([]); job.reset(); }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Volume Booster                                                           */
/* -------------------------------------------------------------------------- */

export function VolumeBooster() {
  const { files, setFiles, add, durationOf } = useFiles("audio");
  const file = files[0];
  const [gain, setGain] = useState(100); // percent change: +100 = double
  const [normalize, setNormalize] = useState(true);
  const job = useMediaJob();

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus("Adjusting volume…");
      const ext = extOf(file.name) || "mp3";
      const inName = "in." + ext;
      const outName = "out." + ext;
      await ff.writeFile(inName, await readAsUint8(file));
      const factor = Math.max(0.05, 1 + gain / 100);
      const filters = [`volume=${factor.toFixed(3)}`];
      if (normalize) filters.push("alimiter=limit=0.97", "dynaudnorm=f=200:g=11");
      await exec(
        ff,
        ["-i", inName, "-af", filters.join(","), ...(AUDIO_CODEC[ext] ?? AUDIO_CODEC.mp3), ...(ext === "wav" || ext === "flac" ? [] : ["-b:a", "256k"]), outName],
        durationOf(file),
        setPct,
      );
      const data = (await ff.readFile(outName)) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile(outName);
      } catch {
        /* ignore */
      }
      return [{ name: safeName(file.name.replace(/\.[^.]+$/, "")) + `-volume.${ext}`, data, type: "audio/" + ext }];
    });

  const presets = [10, 25, 50, 100, 200];

  return (
    <div className="space-y-5">
      {!file ? (
        <Dropzone accept={AUDIO_ACCEPT} onFiles={(f) => add(f, false)} label="Drop an audio file to boost" hint="MP3, WAV, AAC, M4A, FLAC, OGG" />
      ) : (
        <>
          <FileChip file={file} duration={durationOf(file)} onRemove={() => setFiles([])} />
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Volume change</span>
              <span className="text-lg font-bold text-primary">{gain > 0 ? "+" : ""}{gain}%</span>
            </div>
            <input
              type="range"
              min={-90}
              max={300}
              step={5}
              value={gain}
              onChange={(e) => setGain(+e.target.value)}
              className="mt-4 w-full accent-[var(--primary)]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setGain(p)}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                    gain === p && "gradient-primary border-transparent text-white",
                  )}
                >
                  +{p}%
                </button>
              ))}
              <button onClick={() => setGain(-50)} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                −50%
              </button>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
              Normalize loudness and prevent clipping
            </label>
          </div>
        </>
      )}
      <JobPanel job={job} onStart={start} startLabel="Apply volume" canStart={!!file} onClear={() => { setFiles([]); job.reset(); }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Video Compressor                                                         */
/* -------------------------------------------------------------------------- */

const CRF: Record<string, string> = { high: "22", balanced: "27", max: "32" };

export function VideoCompressor() {
  const { files, setFiles, add, durationOf } = useFiles("video");
  const file = files[0];
  const duration = file ? durationOf(file) : 0;
  const [preset, setPreset] = useState("balanced");
  const [resolution, setResolution] = useState("original");
  const [targetMb, setTargetMb] = useState("0");
  const [customMb, setCustomMb] = useState(20);
  const job = useMediaJob();

  const target = targetMb === "custom" ? customMb : +targetMb;
  const estimate = useMemo(() => {
    if (!file) return 0;
    if (target > 0) return target * 1024 * 1024;
    const ratio = preset === "high" ? 0.55 : preset === "balanced" ? 0.32 : 0.18;
    const scale = resolution === "original" ? 1 : resolution === "1080" ? 0.85 : resolution === "720" ? 0.55 : 0.35;
    return file.size * ratio * scale;
  }, [file, preset, resolution, target]);

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus("Compressing video…");
      const inName = "in." + (extOf(file.name) || "mp4");
      await ff.writeFile(inName, await readAsUint8(file));
      const args = ["-i", inName];
      if (resolution !== "original") args.push("-vf", `scale=-2:${resolution}`);
      if (target > 0 && duration > 0) {
        const audioK = 128;
        const totalK = (target * 8 * 1024) / duration;
        const videoK = Math.max(150, Math.round(totalK - audioK));
        args.push("-c:v", "libx264", "-b:v", `${videoK}k`, "-maxrate", `${Math.round(videoK * 1.4)}k`, "-bufsize", `${videoK * 2}k`, "-c:a", "aac", "-b:a", `${audioK}k`);
      } else {
        args.push("-c:v", "libx264", "-crf", CRF[preset], "-c:a", "aac", "-b:a", "128k");
      }
      args.push("-preset", "veryfast", "-movflags", "+faststart", "out.mp4");
      await exec(ff, args, duration, setPct);
      const data = (await ff.readFile("out.mp4")) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile("out.mp4");
      } catch {
        /* ignore */
      }
      return [{ name: safeName(file.name.replace(/\.[^.]+$/, "")) + "-compressed.mp4", data, type: "video/mp4" }];
    });

  return (
    <div className="space-y-5">
      {!file ? (
        <Dropzone accept={VIDEO_ACCEPT} onFiles={(f) => add(f, false)} label="Drop a video to compress" hint="MP4, MOV, MKV, AVI, WebM · up to 2 GB" />
      ) : (
        <>
          <FileChip file={file} duration={duration} onRemove={() => setFiles([])} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Compression preset">
              <TSelect value={preset} onChange={(e) => setPreset(e.target.value)} disabled={target > 0}>
                <option value="high">High quality</option>
                <option value="balanced">Balanced</option>
                <option value="max">Maximum compression</option>
              </TSelect>
            </Field>
            <Field label="Resolution">
              <TSelect value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="original">Original</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
              </TSelect>
            </Field>
            <Field label="Target size">
              <TSelect value={targetMb} onChange={(e) => setTargetMb(e.target.value)}>
                <option value="0">No target — use preset</option>
                <option value="10">Under 10 MB</option>
                <option value="25">Under 25 MB</option>
                <option value="50">Under 50 MB</option>
                <option value="100">Under 100 MB</option>
                <option value="custom">Custom…</option>
              </TSelect>
            </Field>
            {targetMb === "custom" ? (
              <Field label="Custom size (MB)">
                <TInput type="number" min={1} value={customMb} onChange={(e) => setCustomMb(Math.max(1, +e.target.value))} />
              </Field>
            ) : (
              <Stat label="Estimated output" value={formatBytes(estimate)} />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Original size" value={formatBytes(file.size)} />
            <Stat label="Duration" value={duration ? formatTime(duration) : "—"} />
            <Stat label="Estimated saving" value={estimate ? `${Math.max(0, Math.round((1 - estimate / file.size) * 100))}%` : "—"} />
          </div>
        </>
      )}
      <JobPanel job={job} onStart={start} startLabel="Compress video" canStart={!!file} onClear={() => { setFiles([]); job.reset(); }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Video Converter                                                          */
/* -------------------------------------------------------------------------- */

const VIDEO_FORMATS = ["mp4", "mov", "mkv", "avi", "webm", "m4v", "flv", "3gp"];

export function VideoConverter() {
  const { files, setFiles, add, durationOf } = useFiles("video");
  const file = files[0];
  const duration = file ? durationOf(file) : 0;
  const [format, setFormat] = useState("mp4");
  const [resolution, setResolution] = useState("original");
  const [fps, setFps] = useState("original");
  const [vBitrate, setVBitrate] = useState("auto");
  const [aBitrate, setABitrate] = useState("128k");
  const [keepQuality, setKeepQuality] = useState(true);
  const job = useMediaJob();

  const start = () =>
    job.run(async ({ ff, setPct, setStatus }) => {
      setStatus(`Converting to ${format.toUpperCase()}…`);
      const srcExt = extOf(file.name) || "mp4";
      const inName = "in." + srcExt;
      const outName = "out." + format;
      await ff.writeFile(inName, await readAsUint8(file));

      const untouched =
        keepQuality &&
        resolution === "original" &&
        fps === "original" &&
        vBitrate === "auto" &&
        ["mp4", "mov", "mkv", "m4v"].includes(format);

      const args = ["-i", inName];
      if (resolution !== "original") args.push("-vf", `scale=-2:${resolution}`);
      if (fps !== "original") args.push("-r", fps);

      if (untouched) {
        // Container change only — zero quality loss, near-instant.
        args.push("-c", "copy");
      } else if (format === "webm") {
        args.push("-c:v", "libvpx-vp9", "-b:v", vBitrate === "auto" ? "0" : vBitrate, ...(vBitrate === "auto" ? ["-crf", "32"] : []), "-c:a", "libopus", "-b:a", aBitrate);
      } else if (format === "avi") {
        args.push("-c:v", "mpeg4", "-qscale:v", "4", "-c:a", "libmp3lame", "-b:a", aBitrate);
      } else {
        args.push("-c:v", "libx264", ...(vBitrate === "auto" ? ["-crf", keepQuality ? "20" : "24"] : ["-b:v", vBitrate]), "-preset", "veryfast", "-c:a", "aac", "-b:a", aBitrate);
      }
      if (format === "mp4" || format === "m4v" || format === "mov") args.push("-movflags", "+faststart");
      args.push(outName);

      let failed = false;
      try {
        await exec(ff, args, duration, setPct);
      } catch {
        failed = untouched;
        if (!failed) throw new Error("Conversion failed — try a different output format or disable “keep original quality”.");
      }
      if (failed) {
        setStatus("Stream copy not possible — re-encoding…");
        await exec(
          ff,
          ["-i", inName, "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-c:a", "aac", "-b:a", aBitrate, outName],
          duration,
          setPct,
        );
      }

      const data = (await ff.readFile(outName)) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile(outName);
      } catch {
        /* ignore */
      }
      return [{ name: safeName(file.name.replace(/\.[^.]+$/, "")) + "." + format, data, type: `video/${format === "mkv" ? "x-matroska" : format}` }];
    });

  return (
    <div className="space-y-5">
      {!file ? (
        <Dropzone accept={VIDEO_ACCEPT} onFiles={(f) => add(f, false)} label="Drop a video to convert" hint="MP4, MOV, MKV, AVI, WebM, M4V, FLV, 3GP · up to 2 GB" />
      ) : (
        <>
          <FileChip file={file} duration={duration} onRemove={() => setFiles([])} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Output format">
              <TSelect value={format} onChange={(e) => setFormat(e.target.value)}>
                {VIDEO_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </TSelect>
            </Field>
            <Field label="Resolution" hint="Aspect ratio is always preserved">
              <TSelect value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="original">Original</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </TSelect>
            </Field>
            <Field label="Frame rate">
              <TSelect value={fps} onChange={(e) => setFps(e.target.value)}>
                <option value="original">Original</option>
                <option value="60">60 fps</option>
                <option value="30">30 fps</option>
                <option value="24">24 fps</option>
              </TSelect>
            </Field>
            <Field label="Video bitrate">
              <TSelect value={vBitrate} onChange={(e) => setVBitrate(e.target.value)}>
                <option value="auto">Auto (quality based)</option>
                <option value="8000k">8 Mbps</option>
                <option value="4000k">4 Mbps</option>
                <option value="2000k">2 Mbps</option>
                <option value="1000k">1 Mbps</option>
              </TSelect>
            </Field>
            <Field label="Audio bitrate">
              <TSelect value={aBitrate} onChange={(e) => setABitrate(e.target.value)}>
                <option value="96k">96 kbps</option>
                <option value="128k">128 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="256k">256 kbps</option>
              </TSelect>
            </Field>
            <Field label="Quality mode">
              <TSelect value={keepQuality ? "keep" : "reencode"} onChange={(e) => setKeepQuality(e.target.value === "keep")}>
                <option value="keep">Keep original quality</option>
                <option value="reencode">Smaller file (re-encode)</option>
              </TSelect>
            </Field>
          </div>
        </>
      )}
      <JobPanel job={job} onStart={start} startLabel={`Convert to ${format.toUpperCase()}`} canStart={!!file} onClear={() => { setFiles([]); job.reset(); }} />
    </div>
  );
}
