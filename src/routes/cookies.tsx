import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [{ title: "Cookie Policy — ToolHub Pro" }, { name: "description", content: "How ToolHub Pro uses cookies." }, { property: "og:url", content: "/cookies" }],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => (
    <StaticPage title="Cookie Policy" updated="July 2026">
      <p>We use minimal cookies to make the site work and improve your experience.</p>
      <h2 className="text-lg font-semibold text-foreground">Essential cookies</h2>
      <p>Store your theme preference (light/dark) and remember dismissed banners.</p>
      <h2 className="text-lg font-semibold text-foreground">Analytics cookies</h2>
      <p>We use privacy-friendly analytics to understand which pages are popular. No personally identifiable data is stored.</p>
      <h2 className="text-lg font-semibold text-foreground">Advertising cookies</h2>
      <p>Third-party ad networks like Google AdSense may set cookies to serve relevant ads. You can opt out via your browser settings or Google Ads Settings.</p>
    </StaticPage>
  ),
});
