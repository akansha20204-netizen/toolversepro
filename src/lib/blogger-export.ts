import { TOOLS, CATEGORIES } from "@/data/tools";
import { BLOG_POSTS } from "@/data/blog";
import { generateToolContent } from "@/data/tool-content";

const BLOG_ID = "8480221735395593333";
const AUTHOR_NAME = "ToolHub Team";
const AUTHOR_EMAIL = "noreply@blogger.com";
const AUTHOR_URI = "https://www.blogger.com/profile/00000000000000000000";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(date?: string): string {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().replace(/\.\d{3}Z$/, "-08:00");
}

interface Entry {
  id: string;
  kind: "post" | "page";
  title: string;
  content: string;
  labels: string[];
  published: string;
  updated: string;
  slug: string;
}

function entryXml(e: Entry, idx: number): string {
  const postId = `${Date.now()}${String(idx).padStart(4, "0")}`;
  const labels = e.labels
    .map(
      (l) =>
        `    <category scheme='http://www.blogger.com/atom/ns#' term='${xmlEscape(l)}'/>`,
    )
    .join("\n");
  const kindTerm =
    e.kind === "post"
      ? "http://schemas.google.com/blogger/2008/kind#post"
      : "http://schemas.google.com/blogger/2008/kind#page";
  return `  <entry>
    <id>tag:blogger.com,1999:blog-${BLOG_ID}.post-${postId}</id>
    <published>${e.published}</published>
    <updated>${e.updated}</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='${kindTerm}'/>
${labels}
    <title type='text'>${xmlEscape(e.title)}</title>
    <content type='html'>${xmlEscape(e.content)}</content>
    <link rel='alternate' type='text/html' href='https://toolhub-pro.blogspot.com/${e.kind === "post" ? "2026/01" : "p"}/${e.slug}.html' title='${xmlEscape(e.title)}'/>
    <author>
      <name>${AUTHOR_NAME}</name>
      <email>${AUTHOR_EMAIL}</email>
      <uri>${AUTHOR_URI}</uri>
    </author>
    <thr:total xmlns:thr='http://purl.org/syndication/thread/1.0'>0</thr:total>
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
      id: p.slug,
      kind: "post",
      title: p.title,
      content: p.content.trim(),
      labels: [p.category, ...p.tags],
      published: isoDate(p.date),
      updated: isoDate(p.date),
      slug: p.slug,
    });
  });

  TOOLS.forEach((t) => {
    entries.push({
      id: t.slug,
      kind: "post",
      title: t.name,
      content: toolHtml(t.slug),
      labels: [CATEGORIES[t.category].name, "Tools", ...t.keywords],
      published: now,
      updated: now,
      slug: t.slug,
    });
  });

  const feed = `<?xml version='1.0' encoding='UTF-8'?>
<?xml-stylesheet href='http://www.blogger.com/styles/atom.css' type='text/css'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' xmlns:blogger='http://schemas.google.com/blogger/2008' xmlns:georss='http://www.georss.org/georss' xmlns:gd='http://schemas.google.com/g/2005' xmlns:thr='http://purl.org/syndication/thread/1.0'>
  <id>tag:blogger.com,1999:blog-${BLOG_ID}</id>
  <updated>${now}</updated>
  <category scheme='http://www.blogger.com/atom/ns#' term='Tools'/>
  <title type='text'>ToolHub Pro</title>
  <subtitle type='html'>70+ free browser-based tools for creators, students and developers.</subtitle>
  <link rel='http://schemas.google.com/g/2005#feed' type='application/atom+xml' href='https://toolhub-pro.blogspot.com/feeds/posts/default'/>
  <link rel='self' type='application/atom+xml' href='https://www.blogger.com/feeds/${BLOG_ID}/posts/default'/>
  <link rel='alternate' type='text/html' href='https://toolhub-pro.blogspot.com/'/>
  <author>
    <name>${AUTHOR_NAME}</name>
    <email>${AUTHOR_EMAIL}</email>
    <uri>${AUTHOR_URI}</uri>
  </author>
  <generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
  <openSearch:totalResults>${entries.length}</openSearch:totalResults>
  <openSearch:startIndex>1</openSearch:startIndex>
  <openSearch:itemsPerPage>${entries.length}</openSearch:itemsPerPage>
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
