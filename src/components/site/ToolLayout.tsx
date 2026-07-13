import { Link } from "@tanstack/react-router";
import { ChevronRight, Home, Share2, Copy, Twitter, Facebook, Linkedin } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { CATEGORIES, getToolsByCategory, type ToolMeta } from "@/data/tools";
import { ToolCard } from "./ToolCard";
import { generateToolContent } from "@/data/tool-content";

export function ToolLayout({ tool, children }: { tool: ToolMeta; children: ReactNode }) {
  const cat = CATEGORIES[tool.category];
  const Icon = (Icons[tool.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
  const related = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 6);
  const content = generateToolContent(tool);
  const url = typeof window !== "undefined" ? window.location.href : `/tools/${tool.slug}`;

  const share = (net: "twitter" | "facebook" | "linkedin") => {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(tool.name);
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    };
    window.open(links[net], "_blank", "noopener");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] gradient-mesh opacity-60" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <Home className="h-3 w-3" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/category/$slug" params={{ slug: tool.category }} className="hover:text-foreground">
            {cat.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground">{tool.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:flex sm:items-center sm:gap-5">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-glow`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{tool.description}</p>
          </div>
        </header>

        {/* Tool card */}
        <div className="glass-strong rounded-3xl p-4 shadow-elegant sm:p-6 animate-fade-up">{children}</div>

        {/* Share */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" /> Share:
          </span>
          <button onClick={() => share("twitter")} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-muted" aria-label="Twitter"><Twitter className="h-4 w-4" /></button>
          <button onClick={() => share("facebook")} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-muted" aria-label="Facebook"><Facebook className="h-4 w-4" /></button>
          <button onClick={() => share("linkedin")} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-muted" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></button>
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
            <Copy className="h-3 w-3" /> Copy link
          </button>
        </div>

        {/* AdSense placeholder */}
        <div className="my-10 flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
          Advertisement
        </div>

        {/* Content */}
        <article className="prose-toolhub mt-10 max-w-none">
          <section id="introduction" className="mb-10">
            <h2 className="text-2xl font-bold">Introduction</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{content.intro}</p>
          </section>
          <section id="how-to-use" className="mb-10">
            <h2 className="text-2xl font-bold">How to Use</h2>
            <ol className="mt-3 space-y-2 pl-5 list-decimal text-muted-foreground">
              {content.howTo.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </section>
          <section id="features" className="mb-10">
            <h2 className="text-2xl font-bold">Features</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {content.features.map((f, i) => (
                <li key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                </li>
              ))}
            </ul>
          </section>
          <section id="benefits" className="mb-10">
            <h2 className="text-2xl font-bold">Benefits</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{content.benefits}</p>
          </section>
          <section id="faq" className="mb-10">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {content.faqs.map((f, i) => (
                <details key={i} className="group rounded-2xl border border-border bg-card p-4 open:shadow-sm">
                  <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                    <span className="inline-block mr-2 transition-transform group-open:rotate-90">▸</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 pl-5 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
          <section id="seo" className="mb-4">
            <h2 className="text-2xl font-bold">About {tool.name}</h2>
            <div className="mt-3 space-y-3 text-muted-foreground leading-relaxed">
              {content.description.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        </article>

        {/* Related tools */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Related Tools</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => <ToolCard key={t.slug} tool={t} compact />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
