import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [{ title: "Affiliate Disclosure — ToolHub Pro" }, { name: "description", content: "Affiliate relationships and disclosures for ToolHub Pro." }, { property: "og:url", content: "/affiliate-disclosure" }],
    links: [{ rel: "canonical", href: "/affiliate-disclosure" }],
  }),
  component: () => (
    <StaticPage title="Affiliate Disclosure" updated="July 2026">
      <p>Some links on ToolHub Pro may be affiliate links, meaning we may earn a small commission at no additional cost to you if you make a purchase through them.</p>
      <p>We only recommend products and services we have personally tested and believe will be useful to our readers. Affiliate commissions help us keep every tool on ToolHub Pro free forever.</p>
    </StaticPage>
  ),
});
