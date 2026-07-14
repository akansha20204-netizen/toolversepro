import { TOOLS, CATEGORIES } from "@/data/tools";
import { BLOG_POSTS } from "@/data/blog";
import { generateToolContent } from "@/data/tool-content";

// Blogger's importer requires an Atom feed that closely matches its own
// backup format. Common failure causes we defend against here:
//   • post IDs must be unique 19-digit numerics
//   • no <link rel='alternate'> with a placeholder domain (Blogger validates it)
//   • no <thr:total> on entries at import time
//   • content must be valid HTML wrapped as escaped text in type='html'
//   • only ASCII / valid XML characters (strip control chars)

const AUTHOR_NAME = "ToolHub Team";
const AUTHOR_EMAIL = "noreply@blogger.com";

function xmlEscape(s: string): string {
  return stripControl(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripControl(s: string): string {
  // XML 1.0 forbids most C0 control chars except \t \n \r
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function isoDate(date?: string): string {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

// Deterministic-ish 19-digit numeric ID, unique per entry.
function makePostId(seed: number): string {
  const base = (Date.now() * 1000 + seed).toString();
  // Pad to 19 digits so it looks like a real Blogger post id.
  return (base + "0000000000000000000").slice(0, 19);
}

// Blog id is arbitrary for import — Blogger reassigns on ingest.
const BLOG_ID = "1" + "0".repeat(18);

interface Entry {
  title: string;
  content: string;
  labels: string[];
  published: string;
  updated: string;
}

function entryXml(e: Entry, idx: number): string {
  const postId = makePostId(idx + 1);
  const labels = e.labels
    .filter((l, i, a) => l && a.indexOf(l) === i)
    .map(
      (l) =>
        `    <category scheme='http://www.blogger.com/atom/ns#' term='${xmlEscape(l)}'/>`,
    )
    .join("\n");
  return `  <entry>
    <id>tag:blogger.com,1999:blog-${BLOG_ID}.post-${postId}</id>
    <published>${e.published}</published>
    <updated>${e.updated}</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
${labels}
    <title type='text'>${xmlEscape(e.title)}</title>
    <content type='html'>${xmlEscape(e.content)}</content>
    <author>
      <name>${xmlEscape(AUTHOR_NAME)}</name>
      <email>${AUTHOR_EMAIL}</email>
    </author>
  </entry>`;
}

function toolHtml(slug: string): string {
  const tool = TOOLS.find((t) => t.slug === slug)!;
  const c = generateToolContent(tool);
  const features = c.features
    .map((f) => `<li><strong>${f.title}:</strong> ${f.desc}</li>`)
    .join("");
  const howto = c.howTo.map((s) => `<li>${s}</li>`).join("");
  const faqs = c.faqs.map((f) => `<h3>${f.q}</h3><p>${f.a}</p>`).join("");
  const desc = c.description.map((p) => `<p>${p}</p>`).join("");
  return `<div class="toolhub-tool"><p>${c.intro}</p><h2>How to use the ${tool.name}</h2><ol>${howto}</ol><h2>Key features</h2><ul>${features}</ul><h2>Why choose this tool</h2><p>${c.benefits}</p><h2>About the ${tool.name}</h2>${desc}<h2>Frequently asked questions</h2>${faqs}</div>`;
}

export function buildBloggerXml(): string {
  const now = isoDate();
  const entries: Entry[] = [];

  BLOG_POSTS.forEach((p) => {
    entries.push({
      title: p.title,
      content: p.content.trim(),
      labels: [p.category, ...p.tags],
      published: isoDate(p.date),
      updated: isoDate(p.date),
    });
  });

  TOOLS.forEach((t) => {
    entries.push({
      title: t.name,
      content: toolHtml(t.slug),
      labels: [CATEGORIES[t.category].name, "Tools", ...t.keywords],
      published: now,
      updated: now,
    });
  });

  const feed = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' xmlns:blogger='http://schemas.google.com/blogger/2008' xmlns:gd='http://schemas.google.com/g/2005'>
  <id>tag:blogger.com,1999:blog-${BLOG_ID}</id>
  <updated>${now}</updated>
  <title type='text'>ToolHub Pro</title>
  <author>
    <name>${xmlEscape(AUTHOR_NAME)}</name>
    <email>${AUTHOR_EMAIL}</email>
  </author>
  <generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
  <openSearch:totalResults>${entries.length}</openSearch:totalResults>
  <openSearch:startIndex>1</openSearch:startIndex>
${entries.map((e, i) => entryXml(e, i)).join("\n")}
</feed>`;
  return feed;
}

export function downloadBloggerXml(): { size: number; count: number } {
  const xml = buildBloggerXml();
  const blob = new Blob([xml], { type: "application/atom+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `toolhub-pro-blogger-export-${new Date().toISOString().slice(0, 10)}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { size: blob.size, count: TOOLS.length + BLOG_POSTS.length };
}
