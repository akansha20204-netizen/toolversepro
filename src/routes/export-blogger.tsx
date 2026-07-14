import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileCode2, CheckCircle2, Sparkles } from "lucide-react";
import { downloadBloggerXml } from "@/lib/blogger-export";
import { TOOLS } from "@/data/tools";
import { BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/export-blogger")({
  head: () => ({
    meta: [
      { title: "Export to Blogger XML — ToolHub Pro" },
      {
        name: "description",
        content:
          "One-click export of all ToolHub Pro tools and blog posts into a Blogger-compatible XML backup file you can import directly into Blogger.",
      },
      { property: "og:title", content: "Export to Blogger XML — ToolHub Pro" },
      {
        property: "og:description",
        content:
          "Download every tool page and blog post as a single Blogger import file.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/export-blogger" }],
  }),
  component: ExportBloggerPage,
});

function ExportBloggerPage() {
  const [status, setStatus] = useState<{ size: number; count: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    setBusy(true);
    // Defer so the UI can update before the (fast) synchronous build.
    setTimeout(() => {
      try {
        const res = downloadBloggerXml();
        setStatus(res);
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  const totalTools = TOOLS.length;
  const totalPosts = BLOG_POSTS.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Blogger migration</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Export to Blogger XML
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Generate a Blogger-compatible Atom XML backup containing every tool
        page and blog post on ToolHub Pro. Import it into Blogger from{" "}
        <em>Settings → Import &amp; back up → Import content</em>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Tools" value={totalTools} />
        <Stat label="Blog posts" value={totalPosts} />
        <Stat label="Total entries" value={totalTools + totalPosts} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow">
            <FileCode2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">One-click export</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The file is built entirely in your browser — no uploads, no
              server. Includes labels, categories, HTML content and authored
              metadata for each entry.
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {busy ? "Building XML…" : "Download Blogger XML"}
        </button>

        {status && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
            <p>
              Export ready — {status.count} entries,{" "}
              {(status.size / 1024).toFixed(1)} KB. If the download did not
              start, check your browser's download bar.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">How to import into Blogger</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Open your Blogger dashboard and select the target blog.</li>
          <li>
            Navigate to <strong>Settings → Manage blog → Import content</strong>.
          </li>
          <li>Upload the downloaded XML file and solve the CAPTCHA.</li>
          <li>
            Choose whether to automatically publish imported posts or keep them
            as drafts to review.
          </li>
          <li>Click <strong>Import</strong> and wait for Blogger to process the file.</li>
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: Blogger accepts Atom-format exports. This file is generated in
          the same shape Blogger produces when you back up an existing blog.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-3xl font-bold gradient-text">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
