import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BLOG_POSTS, getPost } from "@/data/blog";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Post not found" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.post;
    return {
      meta: [
        { title: `${p.title} | ToolHub Pro Blog` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "og:image", content: p.image },
        { name: "twitter:image", content: p.image },
        { property: "article:published_time", content: p.date },
        { property: "article:author", content: p.author },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: p.excerpt,
            datePublished: p.date,
            author: { "@type": "Organization", name: p.author },
          }),
        },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [post.slug]);
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  // Extract h2s for TOC
  const tocMatches: string[] = [];
  const rx = /<h2>([^<]+)<\/h2>/g;
  let mt: RegExpExecArray | null;
  while ((mt = rx.exec(post.content)) !== null) tocMatches.push(mt[1]);
  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <Icons.ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-foreground">Blog</Link>
        <Icons.ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{post.title}</span>
      </nav>

      <header className="mb-8">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{post.category}</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-white font-semibold">TH</div>
          <div>
            <div className="font-medium text-foreground">{post.author}</div>
            <div className="text-xs">{new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · {post.readingTime} min read</div>
          </div>
        </div>
      </header>

      <div className="mb-8 aspect-video overflow-hidden rounded-3xl bg-muted">
        <img src={post.image} alt={post.title} width={1280} height={720} className="h-full w-full object-cover" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          {tocMatches.length > 1 && (
            <nav className="mb-8 rounded-2xl border border-border bg-muted/40 p-5">
              <h3 className="mb-2 text-sm font-semibold">Table of contents</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                {tocMatches.map((h) => <li key={h}><a href={`#${h.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-primary">{h}</a></li>)}
              </ol>
            </nav>
          )}
          <div className="prose-toolhub text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

          <section className="mt-10">
            <h3 className="text-lg font-semibold">Comments</h3>
            <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Comments are powered by your Blogger template once exported.
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t: string) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">#{t}</span>)}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-white font-semibold">TH</div>
              <div>
                <div className="text-sm font-semibold">{post.author}</div>
                <div className="text-xs text-muted-foreground">Writing about tools & productivity.</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Related Posts</h3>
            <ul className="space-y-3">
              {related.map((p) => (
                <li key={p.slug}><Link to="/blog/$slug" params={{ slug: p.slug }} className="text-sm hover:text-primary">{p.title}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
