import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ToolLayout } from "@/components/site/ToolLayout";
import { getTool } from "@/data/tools";
import { toolRegistry } from "@/tools";
import { generateToolContent } from "@/data/tool-content";

const BASE = "https://toolsforuse.online";

export const Route = createFileRoute("/audio-video-tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool || tool.category !== "media") throw notFound();
    return { tool };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Tool not found" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.tool;
    const title = `${t.name} — Free Online Audio & Video Tool | ToolHub Pro`;
    const desc = t.description;
    const url = `${BASE}/audio-video-tools/${params.slug}`;
    const content = generateToolContent(t);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: t.keywords.join(", ") + ", free online tool, ffmpeg, browser" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: t.name,
            description: desc,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            url,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: content.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE + "/" },
              { "@type": "ListItem", position: 2, name: "Audio/Video Tools", item: `${BASE}/category/media` },
              { "@type": "ListItem", position: 3, name: t.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: MediaToolPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Tool not found</h1>
      <p className="mt-2 text-muted-foreground">That audio/video tool doesn't exist.</p>
      <Link to="/category/$slug" params={{ slug: "media" }} className="mt-6 inline-flex rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white">
        All Audio/Video tools
      </Link>
    </div>
  ),
});

function MediaToolPage() {
  const { tool } = Route.useLoaderData();
  const Component = toolRegistry[tool.slug];
  return (
    <ToolLayout tool={tool}>
      {Component ? <Component /> : <div className="p-8 text-center text-muted-foreground">Tool coming soon.</div>}
    </ToolLayout>
  );
}
