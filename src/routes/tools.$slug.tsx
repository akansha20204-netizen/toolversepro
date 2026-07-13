import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ToolLayout } from "@/components/site/ToolLayout";
import { getTool } from "@/data/tools";
import { toolRegistry } from "@/tools";
import { generateToolContent } from "@/data/tool-content";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Tool not found" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.tool;
    const title = `${t.name} — Free Online Tool | ToolHub Pro`;
    const desc = t.description;
    const content = generateToolContent(t);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: t.keywords.join(", ") + ", online tool, free" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/tools/${params.slug}` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/tools/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: t.name,
            description: desc,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
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
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: t.category, item: `/category/${t.category}` },
              { "@type": "ListItem", position: 3, name: t.name, item: `/tools/${params.slug}` },
            ],
          }),
        },
      ],
    };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Tool not found</h1>
      <p className="mt-2 text-muted-foreground">The tool you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-flex rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white">Back home</Link>
    </div>
  ),
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Component = toolRegistry[tool.slug];
  return (
    <ToolLayout tool={tool}>
      {Component ? <Component /> : <div className="p-8 text-center text-muted-foreground">Tool coming soon.</div>}
    </ToolLayout>
  );
}
