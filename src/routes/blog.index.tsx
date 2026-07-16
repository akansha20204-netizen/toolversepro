import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/data/blog";
import { useState } from "react";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Tips, Tutorials & Guides | ToolHub Pro" },
      { name: "description", content: "Practical guides on image compression, PDF workflows, personal finance, developer tools and more." },
      { property: "og:title", content: "ToolHub Pro Blog" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogList,
});

function BlogList() {
  const [q, setQ] = useState("");
  const filtered = q ? BLOG_POSTS.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.includes(q.toLowerCase()))) : BLOG_POSTS;
  const cats = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Blog</h1>
        <p className="mt-3 text-muted-foreground">Guides and how-tos that make your tools work harder.</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Icons.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setQ(c.toLowerCase())} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary">{c}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card card-hover">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={p.image} alt={p.title} loading="lazy" width={1280} height={720} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{p.category}</span>
                  <span>· {p.readingTime} min</span>
                  <span>· {new Date(p.date).toLocaleDateString()}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No posts match "{q}"</p>}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Recent Posts</h3>
            <ul className="space-y-3">
              {BLOG_POSTS.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-sm hover:text-primary">{p.title}</Link>
                  <div className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(BLOG_POSTS.flatMap((p) => p.tags))).map((t) => (
                <button key={t} onClick={() => setQ(t)} className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary">#{t}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
