import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { Field, TInput, TSelect, TButton, ResultBox, copyText } from "@/components/site/tool-ui";

// ---------------------------------------------------------------------------
// Shared helpers — every generator runs fully in the browser and reshuffles its
// template pools on each run, so repeated clicks never return identical output.
// ---------------------------------------------------------------------------
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sample = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, Math.min(n, arr.length));

const titleCase = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);

const slugWord = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");


function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <TButton
      variant="outline"
      className="shrink-0 px-3 py-1.5 text-xs"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : label}
    </TButton>
  );
}

function OutputRow({ text, meta }: { text: string; meta?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-sm">{text}</p>
        {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
      </div>
      <CopyBtn text={text} />
    </div>
  );
}

function GenShell({
  topic,
  setTopic,
  label,
  placeholder,
  onRun,
  extra,
  children,
  hasResult,
}: {
  topic: string;
  setTopic: (v: string) => void;
  label: string;
  placeholder: string;
  onRun: () => void;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  hasResult: boolean;
}) {
  return (
    <div className="grid gap-5">
      <Field label={label} hint="Everything is generated on your device — nothing is uploaded.">
        <TInput
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRun();
          }}
        />
      </Field>
      {extra}
      <div className="flex flex-wrap gap-2">
        <TButton onClick={onRun}>
          <Sparkles className="h-4 w-4" /> Generate
        </TButton>
        {hasResult && (
          <TButton variant="outline" onClick={onRun}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </TButton>
        )}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Instagram Caption Generator
// ---------------------------------------------------------------------------
const HOOKS = [
  "Let's talk about {t}.",
  "{T} — but make it effortless.",
  "Nobody warned me about {t}.",
  "Consider this your sign to try {t}.",
  "The {t} era starts now.",
  "Everything I know about {t} in one post.",
  "Saving this for the next time {t} comes up.",
  "Proof that {t} is worth the hype.",
  "{T}, unfiltered.",
  "A small update on my {t} journey.",
];

const MIDS = [
  "It started as a small experiment and turned into a habit I actually look forward to.",
  "No shortcuts, no secret trick — just showing up and paying attention to the details.",
  "The best part is how much simpler everything felt once I stopped overthinking it.",
  "I kept it slow, kept it honest, and the results speak louder than any plan I wrote down.",
  "Turns out consistency beats intensity every single time.",
  "Every step taught me something I could not have read in a guide.",
  "I nearly gave up twice, and I'm glad I sat with it a little longer.",
];

const CLOSERS = [
  "Tell me your take in the comments.",
  "Save this for later — you'll want it.",
  "Which one would you pick?",
  "Drop a comment if this sounds familiar.",
  "Share this with someone who needs it today.",
  "Follow along for more like this.",
  "What would you add to the list?",
];

const EMOJI_SETS = [
  ["✨", "💫", "🌿"],
  ["🔥", "💯", "🚀"],
  ["🌸", "☀️", "🤍"],
  ["📌", "💡", "👇"],
  ["🎯", "⚡", "🙌"],
];

type Caption = { text: string; length: "Short" | "Medium" | "Long"; emoji: boolean };

function fill(tpl: string, topic: string) {
  return tpl.replace(/\{t\}/g, topic.toLowerCase()).replace(/\{T\}/g, titleCase(topic));
}

function buildCaptions(topic: string): Caption[] {
  const out: Caption[] = [];
  const em = pick(EMOJI_SETS);
  const hooks = shuffle(HOOKS);
  const mids = shuffle(MIDS);
  const closers = shuffle(CLOSERS);

  for (let i = 0; i < 3; i++) {
    const short = fill(hooks[i], topic);
    out.push({ text: short, length: "Short", emoji: false });
    out.push({ text: `${em[i % em.length]} ${short} ${em[(i + 1) % em.length]}`, length: "Short", emoji: true });
  }
  for (let i = 0; i < 2; i++) {
    const medium = `${fill(hooks[i + 3], topic)} ${mids[i]}`;
    out.push({ text: medium, length: "Medium", emoji: false });
    out.push({ text: `${em[0]} ${medium}\n${closers[i]} ${em[1]}`, length: "Medium", emoji: true });
  }
  const longBase = `${fill(hooks[5], topic)}\n\n${mids[2]} ${mids[3]}\n\n${closers[2]}`;
  out.push({ text: longBase, length: "Long", emoji: false });
  out.push({
    text: `${em[0]} ${fill(hooks[6], topic)}\n\n${mids[4]} ${em[1]}\n${mids[5]}\n\n${closers[3]} ${em[2]}`,
    length: "Long",
    emoji: true,
  });
  return out;
}

export function InstagramCaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [filter, setFilter] = useState<"all" | "Short" | "Medium" | "Long">("all");
  const [emoji, setEmoji] = useState<"all" | "yes" | "no">("all");
  const [caps, setCaps] = useState<Caption[]>([]);
  const [err, setErr] = useState("");

  const run = () => {
    if (!topic.trim()) {
      setErr("Enter a topic, keyword or short description first.");
      setCaps([]);
      return;
    }
    setErr("");
    setCaps(buildCaptions(topic.trim()));
  };

  const visible = caps.filter(
    (c) => (filter === "all" || c.length === filter) && (emoji === "all" || (emoji === "yes") === c.emoji),
  );

  return (
    <GenShell
      topic={topic}
      setTopic={setTopic}
      label="Topic, keyword or short description"
      placeholder="e.g. morning coffee routine, beach sunset, new sneakers"
      onRun={run}
      hasResult={caps.length > 0}
      extra={
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Caption length">
            <TSelect value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">All lengths</option>
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </TSelect>
          </Field>
          <Field label="Emoji style">
            <TSelect value={emoji} onChange={(e) => setEmoji(e.target.value as any)}>
              <option value="all">Both versions</option>
              <option value="yes">With emojis</option>
              <option value="no">Without emojis</option>
            </TSelect>
          </Field>
        </div>
      }
    >
      {err && <p className="text-sm text-destructive">{err}</p>}
      {visible.length > 0 && (
        <ResultBox className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{visible.length} captions</p>
            <CopyBtn text={visible.map((c) => c.text).join("\n\n")} label="Copy all" />
          </div>
          {visible.map((c, i) => (
            <OutputRow
              key={i}
              text={c.text}
              meta={`${c.length} · ${c.emoji ? "with emojis" : "no emojis"} · ${c.text.length} characters`}
            />
          ))}
        </ResultBox>
      )}
    </GenShell>
  );
}

// ---------------------------------------------------------------------------
// 2 & 3. Hashtag generators
// ---------------------------------------------------------------------------
const HIGH_VOLUME = [
  "explore", "explorepage", "instagood", "trending", "viral", "reels", "instadaily", "photooftheday",
  "love", "follow", "like4like", "picoftheday", "bestoftheday", "instamood", "fyp", "trendingreels",
];
const MEDIUM_VOLUME = [
  "dailyinspiration", "contentcreator", "smallbusiness", "lifestyleblogger", "behindthescenes",
  "creativelife", "goodvibesonly", "everydaymoments", "growthmindset", "makersgonnamake",
  "communityovercompetition", "instainspo", "realtalk", "worklifebalance",
];
const NICHE_SUFFIX = ["tips", "ideas", "inspo", "lover", "daily", "community", "life", "guide", "hacks", "goals", "addict", "diary"];
const NICHE_PREFIX = ["best", "diy", "my", "real", "simple", "everyday", "beginner"];
const YT_GENERIC = [
  "youtube", "youtuber", "shorts", "youtubeshorts", "subscribe", "newvideo", "videooftheday",
  "tutorial", "howto", "review", "vlog", "explained", "tipsandtricks", "trending", "viralvideo",
];

function buildHashtags(topic: string, count: number, generic: string[]) {
  const ws = words(topic).map(slugWord).filter(Boolean);
  const core = new Set<string>();
  if (ws.length) {
    core.add(ws.join(""));
    ws.forEach((w) => core.add(w));
    if (ws.length > 1) core.add(ws.slice(0, 2).join(""));
  }
  const base = ws.join("") || "content";
  const niche = shuffle([
    ...NICHE_SUFFIX.map((s) => `${base}${s}`),
    ...NICHE_PREFIX.map((p) => `${p}${base}`),
    ...ws.flatMap((w) => sample(NICHE_SUFFIX, 3).map((s) => `${w}${s}`)),
  ]);

  const out: string[] = [];
  const push = (t: string) => {
    const clean = slugWord(t);
    if (clean && clean.length > 2 && !out.includes(clean)) out.push(clean);
  };

  [...core].forEach(push);
  const high = shuffle(generic);
  const mid = shuffle(MEDIUM_VOLUME);
  let hi = 0, mi = 0, ni = 0;
  // Rotate high / medium / niche buckets so every run mixes reach levels.
  while (out.length < count && (hi < high.length || mi < mid.length || ni < niche.length)) {
    if (hi < high.length) push(high[hi++]);
    if (out.length < count && ni < niche.length) push(niche[ni++]);
    if (out.length < count && mi < mid.length) push(mid[mi++]);
    if (out.length < count && ni < niche.length) push(niche[ni++]);
  }
  return out.slice(0, count).map((t) => `#${t}`);
}

function HashtagTool({
  label,
  placeholder,
  defaultCount,
  generic,
}: {
  label: string;
  placeholder: string;
  defaultCount: number;
  generic: string[];
}) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(defaultCount);
  const [tags, setTags] = useState<string[]>([]);
  const [err, setErr] = useState("");

  const run = () => {
    if (!topic.trim()) {
      setErr("Enter a keyword or topic first.");
      setTags([]);
      return;
    }
    setErr("");
    setTags(buildHashtags(topic.trim(), count, generic));
  };

  const commaOut = tags.join(", ");
  const lineOut = tags.join("\n");
  const spaceOut = tags.join(" ");

  return (
    <GenShell
      topic={topic}
      setTopic={setTopic}
      label={label}
      placeholder={placeholder}
      onRun={run}
      hasResult={tags.length > 0}
      extra={
        <Field label="How many hashtags">
          <TSelect value={String(count)} onChange={(e) => setCount(+e.target.value)}>
            {[10, 15, 20, 30, 40, 50].map((n) => (
              <option key={n} value={n}>
                {n} hashtags
              </option>
            ))}
          </TSelect>
        </Field>
      }
    >
      {err && <p className="text-sm text-destructive">{err}</p>}
      {tags.length > 0 && (
        <ResultBox className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {t}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            <OutputRow text={spaceOut} meta="Space separated — paste straight into a post" />
            <OutputRow text={commaOut} meta="Comma separated" />
            <OutputRow text={lineOut} meta="Line by line" />
          </div>
          <p className="text-xs text-muted-foreground">
            {tags.length} hashtags · mixed high-volume, medium-volume and niche reach.
          </p>
        </ResultBox>
      )}
    </GenShell>
  );
}

export function InstagramHashtagGenerator() {
  return (
    <HashtagTool
      label="Keyword or topic"
      placeholder="e.g. street photography, home workout, vegan baking"
      defaultCount={30}
      generic={HIGH_VOLUME}
    />
  );
}

export function YouTubeHashtagGenerator() {
  return (
    <HashtagTool
      label="Video keyword or topic"
      placeholder="e.g. iphone camera test, excel tutorial, gaming setup"
      defaultCount={20}
      generic={YT_GENERIC}
    />
  );
}

// ---------------------------------------------------------------------------
// 4. YouTube Title Generator
// ---------------------------------------------------------------------------
const CLICKBAIT = [
  "I Tried {T} For 30 Days — Here's What Happened",
  "Stop Doing {T} Wrong (Do This Instead)",
  "The Truth About {T} Nobody Tells You",
  "{T}: I Was Completely Wrong",
  "This {t} Trick Changed Everything",
  "Why Everyone Is Talking About {T}",
];
const PROFESSIONAL = [
  "{T}: A Complete Walkthrough",
  "Understanding {T} — Explained Simply",
  "A Practical Guide to {T}",
  "{T} Fundamentals for Beginners",
  "How {T} Actually Works",
  "{T} Explained in 10 Minutes",
];
const SEO_TITLES = [
  "{T} Tutorial for Beginners (Step by Step)",
  "How to {t} in 2026 — Full Guide",
  "Best {T} Tips That Actually Work",
  "{T} for Beginners: Everything You Need to Know",
  "{T} Step by Step Guide (2026 Update)",
  "Top 10 {T} Mistakes and How to Fix Them",
];

type Title = { text: string; style: "Clickbait" | "Professional" | "SEO Optimized"; score: number };

function seoScore(text: string, topic: string): number {
  let s = 40;
  const len = text.length;
  if (len >= 40 && len <= 60) s += 20;
  else if (len > 60 && len <= 70) s += 12;
  else if (len < 40) s += 6;
  if (text.toLowerCase().includes(topic.toLowerCase())) s += 18;
  if (/\d/.test(text)) s += 8;
  if (/how to|guide|tutorial|tips|best|step by step/i.test(text)) s += 10;
  if (/\?|\(|\)/.test(text)) s += 4;
  return Math.max(30, Math.min(99, s));
}

export function YouTubeTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState<Title[]>([]);
  const [err, setErr] = useState("");

  const run = () => {
    const t = topic.trim();
    if (!t) {
      setErr("Enter a video topic first.");
      setTitles([]);
      return;
    }
    setErr("");
    const build = (pool: string[], style: Title["style"], n: number) =>
      sample(pool, n).map((tpl) => {
        const text = fill(tpl, t);
        return { text, style, score: seoScore(text, t) };
      });
    setTitles([
      ...build(CLICKBAIT, "Clickbait", 3),
      ...build(PROFESSIONAL, "Professional", 3),
      ...build(SEO_TITLES, "SEO Optimized", 4),
    ]);
  };

  return (
    <GenShell
      topic={topic}
      setTopic={setTopic}
      label="Video topic"
      placeholder="e.g. learn python, budget travel japan, air fryer recipes"
      onRun={run}
      hasResult={titles.length > 0}
    >
      {err && <p className="text-sm text-destructive">{err}</p>}
      {titles.length > 0 && (
        <ResultBox className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{titles.length} titles</p>
            <CopyBtn text={titles.map((t) => t.text).join("\n")} label="Copy all" />
          </div>
          {titles.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{t.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium uppercase tracking-wide">{t.style}</span>
                  <span>{t.text.length} chars</span>
                  <span className="font-semibold text-primary">SEO score {t.score}/100</span>
                </p>
              </div>
              <CopyBtn text={t.text} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Titles between 40 and 60 characters score highest — they rarely get truncated in search results.
          </p>
        </ResultBox>
      )}
    </GenShell>
  );
}

// ---------------------------------------------------------------------------
// 5. YouTube Caption / Description Generator
// ---------------------------------------------------------------------------
const DESC_OPENERS = [
  "In this video we break down {t} from start to finish, without the fluff.",
  "Here is everything you need to know about {t} in one place.",
  "If you have been curious about {t}, this walkthrough covers the whole process.",
  "{T} made simple — watch this before you start.",
];
const DESC_BODY = [
  "I cover the tools I use, the mistakes I made early on, and the exact steps that finally worked.",
  "Every step is shown on screen so you can follow along at your own pace.",
  "By the end you will have a repeatable process you can use straight away.",
  "I also answer the questions I get asked most about this topic.",
];
const CHAPTERS = ["00:00 Intro", "00:45 What you need", "02:10 Step by step", "06:30 Common mistakes", "09:15 Final result"];

type Desc = { style: string; text: string };

function buildDescriptions(topic: string): Desc[] {
  const t = topic.trim();
  const tags = buildHashtags(t, 8, YT_GENERIC).join(" ");
  const opener = fill(pick(DESC_OPENERS), t);
  const body = sample(DESC_BODY, 3);
  const short = `${opener}\n\n${tags}`;
  const seo = `${opener}\n\n${body[0]} ${body[1]}\n\nIn this video:\n${CHAPTERS.join("\n")}\n\nIf this helped, subscribe for more ${t.toLowerCase()} videos every week.\n\n${tags}`;
  const long = `${opener}\n\n${body.join(" ")}\n\nWhat you will learn:\n• The basics of ${t.toLowerCase()} explained clearly\n• The exact steps I follow, in order\n• Mistakes to avoid and how to fix them\n• Tips to get better results faster\n\nChapters:\n${CHAPTERS.join("\n")}\n\nDrop your questions in the comments and I will answer them. Like and subscribe if you want more ${t.toLowerCase()} content.\n\n${tags}`;
  const promo = `🔥 ${titleCase(t)} — the only guide you need.\n\n${body[2]}\n\n👉 Watch till the end for the bonus tip.\n👍 Like · 💬 Comment · 🔔 Subscribe\n\n${tags}`;
  return [
    { style: "SEO Friendly", text: seo },
    { style: "Short", text: short },
    { style: "Long", text: long },
    { style: "Promotional", text: promo },
  ];
}

export function YouTubeCaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [descs, setDescs] = useState<Desc[]>([]);
  const [err, setErr] = useState("");

  const run = () => {
    if (!topic.trim()) {
      setErr("Enter a video topic first.");
      setDescs([]);
      return;
    }
    setErr("");
    setDescs(buildDescriptions(topic));
  };

  return (
    <GenShell
      topic={topic}
      setTopic={setTopic}
      label="Video topic"
      placeholder="e.g. beginner guitar lesson, notion setup, marathon training"
      onRun={run}
      hasResult={descs.length > 0}
    >
      {err && <p className="text-sm text-destructive">{err}</p>}
      {descs.length > 0 && (
        <ResultBox className="space-y-4">
          {descs.map((d) => (
            <div key={d.style} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  {d.style}
                </span>
                <CopyBtn text={d.text} />
              </div>
              <p className="whitespace-pre-wrap break-words text-sm">{d.text}</p>
              <p className="mt-2 text-xs text-muted-foreground">{d.text.length} characters</p>
            </div>
          ))}
        </ResultBox>
      )}
    </GenShell>
  );
}

