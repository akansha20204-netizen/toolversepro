import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, Shield, Heart } from "lucide-react";
import * as Icons from "lucide-react";
import { CATEGORIES, TOOLS, getToolsByCategory, type ToolCategory } from "@/data/tools";
import { ToolCard } from "@/components/site/ToolCard";
import { BLOG_POSTS } from "@/data/blog";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ToolHub Pro — 70+ Free Browser Tools for Everyone" },
      { name: "description", content: "70+ free online tools that run entirely in your browser. Calculators, image editors, PDF utilities, developer helpers and unit converters. No signup, no upload, 100% private." },
      { property: "og:title", content: "ToolHub Pro — 70+ Free Browser Tools" },
      { property: "og:description", content: "Fast, private and beautifully designed online tools." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function CategoryPill({ id }: { id: ToolCategory }) {
  const c = CATEGORIES[id];
  const Icon = (Icons[c.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
  return (
    <Link
      to="/category/$slug"
      params={{ slug: id }}
      className="group flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary hover:shadow-md"
    >
      <span className={`grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br ${c.color} text-white`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      {c.name}
    </Link>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const featured = TOOLS.filter((t) => t.featured).slice(0, 8);
  const popular = TOOLS.filter((t) => t.popular).slice(0, 8);
  const trending = TOOLS.filter((t) => t.trending).slice(0, 6);
  const latest = TOOLS.filter((t) => t.latest).slice(0, 6);
  const [email, setEmail] = useState("");
  const [q, setQ] = useState("");
  const results = q ? TOOLS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  const faqs = [
    { q: "Are ToolHub Pro tools really free?", a: "Yes. Every one of our 70+ tools is 100% free with unlimited usage, no signup and no watermarks." },
    { q: "Is my data safe?", a: "Absolutely. All tools run entirely in your browser using client-side JavaScript. Your files and text never leave your device." },
    { q: "Do the tools work offline?", a: "Most tools work offline once the page has loaded, thanks to modern web APIs." },
    { q: "Can I use ToolHub Pro on mobile?", a: "Yes. Every tool is fully responsive and works smoothly on phones, tablets and desktops." },
    { q: "How often are new tools added?", a: "We ship new tools and improvements every week based on user requests." },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> 70+ tools · Free forever · No signup
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            All the <span className="gradient-text">tools you need</span>,
            <br /> right in your browser.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Calculators, image editors, PDF utilities, developer helpers and unit converters — beautifully designed, lightning fast and 100% private.
          </p>

          {/* Big search */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Icons.Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 70+ tools — try 'compress image', 'json', 'BMI'..."
                className="w-full rounded-full border border-border bg-background/80 py-4 pl-14 pr-6 text-base shadow-elegant outline-none backdrop-blur focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
            {q && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-elegant">
                {results.length ? results.map((t) => (
                  <Link key={t.slug} to="/tools/$slug" params={{ slug: t.slug }} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted">
                    <div><div className="font-medium">{t.name}</div><div className="text-xs text-muted-foreground">{t.description}</div></div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )) : <div className="p-4 text-sm text-muted-foreground">No tools match "{q}"</div>}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-primary" /> Instant results</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-primary" /> 100% private</span>
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-primary" /> Loved by 100k+ users</span>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-4">
        <div className="flex min-w-max items-center gap-2">
          {Object.keys(CATEGORIES).map((k) => <CategoryPill key={k} id={k as ToolCategory} />)}
          <Link to="/blog" className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary">
            <Icons.Newspaper className="h-4 w-4" /> Blog
          </Link>
        </div>
      </div>

      {/* Featured */}
      <Section title="Featured Tools" subtitle="Hand-picked essentials to get you started." action={<Link to="/categories" className="text-sm font-medium text-primary hover:underline">View all →</Link>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </Section>

      {/* Category cards */}
      <Section title="Browse by Category" subtitle="Every tool, organised into 6 focused categories.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(CATEGORIES) as [ToolCategory, typeof CATEGORIES[ToolCategory]][]).map(([id, c]) => {
            const Icon = (Icons[c.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
            const count = getToolsByCategory(id).length;
            return (
              <Link key={id} to="/category/$slug" params={{ slug: id }} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 card-hover">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{count} tools</span>
                  <span className="text-primary font-medium">Explore →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Popular */}
      <Section title="Popular Tools" subtitle="Most-used tools this month.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </Section>

      {/* Trending + Latest */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Icons.Flame className="h-5 w-5 text-orange-500" /> Trending Now</h2>
            <div className="grid gap-3 sm:grid-cols-2">{trending.map((t) => <ToolCard key={t.slug} tool={t} compact />)}</div>
          </div>
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Icons.Rocket className="h-5 w-5 text-primary" /> Latest Tools</h2>
            <div className="grid gap-3 sm:grid-cols-2">{latest.map((t) => <ToolCard key={t.slug} tool={t} compact />)}</div>
          </div>
        </div>
      </section>

      {/* Blogs */}
      <Section title="From Our Blog" subtitle="Guides, tips and how-tos." action={<Link to="/blog" className="text-sm font-medium text-primary hover:underline">All posts →</Link>}>
        <div className="grid gap-4 md:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card card-hover">
              <div className="aspect-video gradient-hero" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{p.category}</span>
                  <span>· {p.readingTime} min read</span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-semibold group-hover:text-primary">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-white sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)" }} />
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Get new tools in your inbox</h2>
              <p className="mt-2 text-white/85">One short email a week. New tools, tips and product updates. Unsubscribe anytime.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); if (!email) return; toast.success("Thanks for subscribing!"); setEmail(""); }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com" className="w-full rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm placeholder:text-white/70 outline-none backdrop-blur focus:bg-white/25" />
              <button type="submit" className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Section title="Frequently Asked Questions" subtitle="Quick answers about ToolHub Pro.">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card p-5 open:shadow-sm">
              <summary className="cursor-pointer list-none text-sm font-semibold">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>{f.q}
              </summary>
              <p className="mt-3 pl-5 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}
