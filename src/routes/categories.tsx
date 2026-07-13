import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { CATEGORIES, getToolsByCategory, type ToolCategory } from "@/data/tools";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — ToolHub Pro" },
      { name: "description", content: "Browse all 6 tool categories on ToolHub Pro — calculators, images, PDFs, text, developer and unit converters." },
      { property: "og:title", content: "All Categories — ToolHub Pro" },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">All Categories</h1>
      <p className="mt-2 text-muted-foreground">Every ToolHub Pro tool organised into six focused categories.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(CATEGORIES) as [ToolCategory, typeof CATEGORIES[ToolCategory]][]).map(([id, c]) => {
          const Icon = (Icons[c.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
          const count = getToolsByCategory(id).length;
          return (
            <Link key={id} to="/category/$slug" params={{ slug: id }} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 card-hover">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 text-xs text-muted-foreground">{count} tools</div>
            </Link>
          );
        })}
      </div>
    </div>
  ),
});
