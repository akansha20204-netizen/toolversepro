import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/data/blog";
import { useMemo, useState } from "react";
import * as Icons from "lucide-react";

const SITE = "https://toolsforuse.online";
const PER_PAGE = 9;

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — PDF & Image Tool Guides, Tips and Tutorials | ToolHub Pro" },
      {
        name: "description",
        content:
          "In-depth guides for every PDF and image tool on ToolHub Pro: compress, resize, convert, merge, split and more — step-by-step tutorials with examples and FAQs.",
      },
      { property: "og:title", content: "ToolHub Pro Blog — PDF & Image Tool Guides" },
      { property: "og:description", content: "Step-by-step tutorials for every PDF and image tool, plus tips and best practices." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/blog` }],
  }),
  component: BlogList,
});

type Sort = "latest" | "featured" | "popular";

function BlogList() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("latest");
  const [page, setPage] = useState(1);

  const cats = useMemo(() => ["All", ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))], []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = BLOG_POSTS.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle))
      );
    });
    if (sort === "featured") list = list.filter((p) => "featured" in p && (p as { featured?: boolean }).featured);
    if (sort === "popular") list = list.filter((p) => "popular" in p && (p as { popular?: boolean }).popular);
    return list;
  }, [q, cat, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Blog</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          A dedicated guide for every PDF and image tool on ToolHub Pro — with steps, examples and FAQs.
        </p>
      </header>

      <div className="mb-6 grid gap-4">
        <div className="relative">
          <Icons.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => reset(() => setQ(e.target.value))}
            placeholder="Search articles..."
            className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => reset(() => setCat(c))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                cat === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
          {(["latest", "featured", "popular"] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => reset(() => setSort(s))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                sort === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="grid gap-6 sm:grid-cols-2">
            {visible.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card card-hover"
              >
                <div className="aspect-[1200/630] overflow-hidden bg-muted">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    width={1200}
                    height={630}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{p.category}</span>
                    <span>· {p.readingTime} min</span>
                    <span>· {new Date(p.date).toLocaleDateString()}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read guide <Icons.ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
            {visible.length === 0 && <p className="text-sm text-muted-foreground">No articles match your filters.</p>}
          </div>

          {pages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, current - 1))}
                disabled={current === 1}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-full border text-xs font-medium ${
                    n === current ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(pages, current + 1))}
                disabled={current === pages}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Recent Posts</h2>
            <ul className="space-y-3">
              {BLOG_POSTS.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-sm hover:text-primary">
                    {p.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(BLOG_POSTS.flatMap((p) => p.tags)))
                .slice(0, 24)
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => reset(() => setQ(t))}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary"
                  >
                    #{t}
                  </button>
                ))}
            </div>
          </div>
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
            Advertisement
          </div>
        </aside>
      </div>
    </div>
  );
}
