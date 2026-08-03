import type { BlogPost } from "./blog";
import { TOOLS, CATEGORIES, type ToolMeta } from "./tools";
import { TOOL_ARTICLES as TOOL_ARTICLES_1, type ToolArticle } from "./tool-blogs.generated";
import { TOOL_ARTICLES_2 } from "./tool-blogs-2.generated";

export type { ToolArticle };

const TOOL_ARTICLES: Record<string, ToolArticle> = { ...TOOL_ARTICLES_1, ...TOOL_ARTICLES_2 };

/** Tools that have a dedicated, hand-crafted 1200x630 thumbnail. */
const UNIQUE_THUMB_SLUGS = new Set(Object.keys(TOOL_ARTICLES_2));

export const BLOG_THUMBS = [
  "/blog/tool-thumb-1.webp",
  "/blog/tool-thumb-2.webp",
  "/blog/tool-thumb-3.webp",
  "/blog/tool-thumb-4.webp",
  "/blog/tool-thumb-5.webp",
  "/blog/tool-thumb-6.webp",
];

const thumbFor = (tool: ToolMeta, i: number) =>
  UNIQUE_THUMB_SLUGS.has(tool.slug) ? `/blog/thumbs/${tool.slug}.webp` : BLOG_THUMBS[i % BLOG_THUMBS.length];

export const slugifyHeading = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

function ctaBlock(tool: ToolMeta) {
  return `<p class="blog-cta"><a class="blog-cta-btn" href="/tools/${tool.slug}">👉 Use This Tool</a></p>
<p>Try our free <a href="/tools/${tool.slug}">${esc(tool.name)}</a> online — no signup, no uploads, no limits.</p>`;
}

function relatedLinks(tool: ToolMeta, articles: Record<string, ToolArticle>) {
  const siblings = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug && articles[t.slug]).slice(0, 3);
  if (!siblings.length) return "";
  return `<p>Want to go further? Read our guides on ${siblings
    .map((t) => `<a href="/blog/${blogSlugFor(t)}">${esc(t.name)}</a>`)
    .join(", ")}.</p>`;
}

export const blogSlugFor = (tool: ToolMeta) => `${tool.slug}-guide`;

function renderArticle(tool: ToolMeta, a: ToolArticle, articles: Record<string, ToolArticle>): string {
  const p = (arr: string[]) => arr.map((t) => `<p>${esc(t)}</p>`).join("\n");
  const h2 = (t: string) => `<h2 id="${slugifyHeading(t)}">${esc(t)}</h2>`;
  return `
${p(a.intro)}
${ctaBlock(tool)}
${h2(`What is ${tool.name}?`)}
${p(a.whatIs)}
${h2(`Why you should use ${tool.name}`)}
${p(a.whyUse)}
${relatedLinks(tool, articles)}
${h2("Main features")}
<ul>
${a.features.map((f) => `<li><strong>${esc(f.title)}:</strong> ${esc(f.desc)}</li>`).join("\n")}
</ul>
${h2(`How to use ${tool.name} step by step`)}
<ol>
${a.steps.map((s) => `<li>${esc(s)}</li>`).join("\n")}
</ol>
${ctaBlock(tool)}
${h2("Real-life examples")}
${a.examples.map((e) => `<h3>${esc(e.title)}</h3>\n<p>${esc(e.text)}</p>`).join("\n")}
${h2("Benefits")}
${p(a.benefits)}
${h2("Common mistakes to avoid")}
<ul>
${a.mistakes.map((m) => `<li><strong>${esc(m.title)}:</strong> ${esc(m.desc)}</li>`).join("\n")}
</ul>
${h2("Tips and best practices")}
<ul>
${a.tips.map((t) => `<li>${esc(t)}</li>`).join("\n")}
</ul>
${h2("Frequently asked questions")}
${a.faqs.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join("\n")}
${h2("Conclusion")}
${p(a.conclusion)}
${ctaBlock(tool)}
`.trim();
}

function dateFor(i: number) {
  // Deterministic publish dates, newest first, spaced 2 days apart.
  const start = new Date("2026-07-20T00:00:00Z").getTime();
  return new Date(start - i * 2 * 86400000).toISOString().slice(0, 10);
}

export interface ToolBlogPost extends BlogPost {
  toolSlug: string;
  updated: string;
  metaDescription: string;
  focusKeyword: string;
  relatedKeywords: string[];
  faqs: { q: string; a: string }[];
  toolName: string;
  toolDescription: string;
  featured: boolean;
  popular: boolean;
}

const TOOL_BLOG_TOOLS = TOOLS.filter((t) => Boolean(TOOL_ARTICLES[t.slug]));

export const TOOL_BLOG_POSTS: ToolBlogPost[] = TOOL_BLOG_TOOLS.map((tool, i) => {
  const a = TOOL_ARTICLES[tool.slug];
  const content = renderArticle(tool, a, TOOL_ARTICLES);
  const wc = words(content);
  return {
    slug: blogSlugFor(tool),
    title: a.seoTitle,
    excerpt: a.excerpt,
    category: CATEGORIES[tool.category].name,
    author: "ToolHub Team",
    date: dateFor(i),
    updated: "2026-08-02",
    readingTime: Math.max(5, Math.round(wc / 220)),
    tags: a.tags,
    image: thumbFor(tool, i),
    content,
    metaDescription: a.metaDescription,
    toolSlug: tool.slug,
    toolName: tool.name,
    toolDescription: tool.description,
    focusKeyword: a.focusKeyword,
    relatedKeywords: a.relatedKeywords,
    faqs: a.faqs,
    featured: Boolean(tool.featured),
    popular: Boolean(tool.popular || tool.trending),
  };
});

export const getToolBlogPost = (slug: string) => TOOL_BLOG_POSTS.find((p) => p.slug === slug);
