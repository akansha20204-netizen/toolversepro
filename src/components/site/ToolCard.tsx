import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { CATEGORIES, type ToolMeta } from "@/data/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, compact = false }: { tool: ToolMeta; compact?: boolean }) {
  const Icon = (Icons[tool.icon as keyof typeof Icons] as any) ?? Icons.Wrench;
  const cat = CATEGORIES[tool.category];
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 card-hover",
        compact && "p-4",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110",
          cat.color,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {cat.name}
        </span>
        <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open →
        </span>
      </div>
    </Link>
  );
}
