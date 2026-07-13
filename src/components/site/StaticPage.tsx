import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function StaticPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {updated && <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>}
      <div className="prose-toolhub mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
