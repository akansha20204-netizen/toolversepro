import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/data/tools";
import { BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [{ title: "Sitemap — ToolHub Pro" }, { name: "description", content: "All pages and tools on ToolHub Pro." }, { property: "og:url", content: "/sitemap" }],
    links: [{ rel: "canonical", href: "/sitemap" }],
  }),
  component: () => (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">Sitemap</h1>
      <p className="mt-2 text-muted-foreground">Every page and tool on ToolHub Pro.</p>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        {(Object.entries(CATEGORIES) as [ToolCategory, typeof CATEGORIES[ToolCategory]][]).map(([id, c]) => (
          <div key={id}>
            <h2 className="text-lg font-bold">{c.name}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {TOOLS.filter((t) => t.category === id).map((t) => (
                <li key={t.slug}><Link to="/tools/$slug" params={{ slug: t.slug }} className="text-muted-foreground hover:text-primary">{t.name}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Blog</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {BLOG_POSTS.map((p) => (
            <li key={p.slug}><Link to="/blog/$slug" params={{ slug: p.slug }} className="text-muted-foreground hover:text-primary">{p.title}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  ),
});
