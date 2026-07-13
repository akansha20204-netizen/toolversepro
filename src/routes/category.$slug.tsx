import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/data/tools";
import { ToolCard } from "@/components/site/ToolCard";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    if (!(params.slug in CATEGORIES)) throw notFound();
    const cat = params.slug as ToolCategory;
    return { cat, tools: getToolsByCategory(cat), meta: CATEGORIES[cat] };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] };
    const { meta } = loaderData;
    const title = `${meta.name} — Free Online ${meta.name} | ToolHub Pro`;
    return {
      meta: [
        { title },
        { name: "description", content: `${meta.description}. ${loaderData.tools.length} free browser-based tools with no signup or upload.` },
        { property: "og:title", content: title },
        { property: "og:description", content: meta.description },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, tools, meta } = Route.useLoaderData();
  const Icon = (Icons[meta.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <Icons.ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{meta.name}</span>
      </nav>
      <header className="mb-10 grid grid-cols-[auto_1fr] items-center gap-5">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${meta.color} text-white shadow-glow`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{meta.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{meta.description} — {tools.length} tools available.</p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </div>
  );
}
