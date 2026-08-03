import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { BLOG_POSTS, getPost } from "@/data/blog";
import { getToolBlogPost, slugifyHeading } from "@/data/tool-blogs";
import { getTool } from "@/data/tools";
import * as Icons from "lucide-react";

const SITE = "https://toolsforuse.online";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post, toolPost: getToolBlogPost(params.slug) ?? null };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Post not found" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.post;
    const tp = loaderData.toolPost;
    const url = `${SITE}/blog/${params.slug}`;
    const img = p.image.startsWith("http") ? p.image : `${SITE}${p.image}`;
    const desc = tp?.metaDescription ?? p.excerpt;
    const scripts: { type: string; children: string }[] = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: desc,
          image: img,
          datePublished: p.date,
          dateModified: tp?.updated ?? p.date,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          author: { "@type": "Organization", name: p.author },
          publisher: { "@type": "Organization", name: "ToolHub Pro" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
            { "@type": "ListItem", position: 3, name: p.title, item: url },
          ],
        }),
      },
    ];
    if (tp) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tp.faqs.map((f: { q: string; a: string }) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      });
    }
    return {
      meta: [
        { title: p.title },
        { name: "description", content: desc },
        ...(tp ? [{ name: "keywords", content: [tp.focusKeyword, ...tp.relatedKeywords].join(", ") }] : []),
        { property: "og:title", content: p.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: img },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p.title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: img },
        { property: "article:published_time", content: p.date },
        { property: "article:author", content: p.author },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Article not found</h1>
      <Link to="/blog" className="mt-6 inline-flex rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white">
        Back to blog
      </Link>
    </div>
  ),
});

function ShareButtons({ title, url }: { title: string; url: string }) {
  const enc = encodeURIComponent;
  const links = [
    { label: "Share on X", icon: Icons.Twitter, href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { label: "Share on Facebook", icon: Icons.Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Share on LinkedIn", icon: Icons.Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Share on WhatsApp", icon: Icons.MessageCircle, href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Share:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={l.label}
          title={l.label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={() => navigator.clipboard?.writeText(url)}
        aria-label="Copy article link"
        title="Copy link"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Icons.Link2 className="h-3.5 w-3.5" /> Copy link
      </button>
    </div>
  );
}

function PostPage() {
  const { post, toolPost } = Route.useLoaderData();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [post.slug]);

  const tool = toolPost ? getTool(toolPost.toolSlug) : undefined;

  const toc = useMemo(() => {
    const out: string[] = [];
    const rx = /<h2[^>]*>([^<]+)<\/h2>/g;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(post.content)) !== null) out.push(m[1]);
    return out;
  }, [post.content]);

  const related = useMemo(() => {
    const same = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category);
    const rest = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category);
    return [...same, ...rest].slice(0, 3);
  }, [post.slug, post.category]);

  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null;
  const next = idx >= 0 && idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <Icons.ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-foreground">Blog</Link>
        <Icons.ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{post.title}</span>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-border">
        <img src={post.image} alt={post.title} width={1200} height={630} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            {post.category}
          </span>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{post.author}</span>
            <span>· {new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>· {post.readingTime} min read</span>
            {toolPost && <span>· Updated {new Date(toolPost.updated).toLocaleDateString()}</span>}
          </div>
        </div>
      </header>

      <p className="mt-6 max-w-3xl text-base text-muted-foreground">{post.excerpt}</p>

      <ShareButtons title={post.title} url={`${SITE}/blog/${post.slug}`} />

      {/* Primary CTA */}
      {tool && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border glass-strong p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">{tool.name}</div>
            <div className="text-sm text-muted-foreground">{tool.description}</div>
          </div>
          <Link
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
          >
            Use This Tool <Icons.ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {toc.length > 1 && (
            <nav className="mb-8 rounded-2xl border border-border bg-muted/40 p-5 lg:hidden">
              <h2 className="mb-2 text-sm font-semibold">Table of contents</h2>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {toc.map((h) => (
                  <li key={h}>
                    <a href={`#${slugifyHeading(h)}`} className="hover:text-primary">{h}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div
            className="prose-toolhub blog-body text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ accordion */}
          {toolPost && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold">FAQ</h2>
              <div className="mt-4 space-y-3">
                {toolPost.faqs.map((f: { q: string; a: string }) => (
                  <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                      <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                      {f.q}
                    </summary>
                    <p className="mt-2 pl-5 text-sm text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {tool && (
            <div className="mt-12 rounded-3xl border border-border gradient-mesh p-6 text-center">
              <h2 className="text-xl font-bold">Ready to try it yourself?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                {tool.name} runs entirely in your browser — free, private and unlimited.
              </p>
              <Link
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow"
              >
                Open {tool.name} <Icons.ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">#{t}</span>
            ))}
          </div>

          {/* Prev / next */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev && (
              <Link to="/blog/$slug" params={{ slug: prev.slug }} className="rounded-2xl border border-border bg-card p-4 card-hover">
                <div className="text-xs text-muted-foreground">← Previous</div>
                <div className="mt-1 text-sm font-semibold">{prev.title}</div>
              </Link>
            )}
            {next && (
              <Link to="/blog/$slug" params={{ slug: next.slug }} className="rounded-2xl border border-border bg-card p-4 text-right card-hover sm:col-start-2">
                <div className="text-xs text-muted-foreground">Next →</div>
                <div className="mt-1 text-sm font-semibold">{next.title}</div>
              </Link>
            )}
          </div>

          {/* Related */}
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-2xl border border-border bg-card card-hover">
                  <div className="aspect-[1200/630] overflow-hidden bg-muted">
                    <img src={p.image} alt={p.title} loading="lazy" width={1200} height={630} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground">{p.category}</div>
                    <div className="mt-1 text-sm font-semibold group-hover:text-primary">{p.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {toc.length > 1 && (
            <nav className="hidden rounded-2xl border border-border bg-muted/40 p-5 lg:block">
              <h2 className="mb-2 text-sm font-semibold">Table of contents</h2>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {toc.map((h) => (
                  <li key={h}>
                    <a href={`#${slugifyHeading(h)}`} className="hover:text-primary">{h}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {tool && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-2 text-sm font-semibold">Featured tool</h2>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <Link
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white"
              >
                Use This Tool
              </Link>
            </div>
          )}

          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
            Advertisement
          </div>
        </aside>
      </div>
    </article>
  );
}
