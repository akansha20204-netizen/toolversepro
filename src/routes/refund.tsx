import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [{ title: "Refund Policy — ToolHub Pro" }, { name: "description", content: "Refund policy for ToolHub Pro." }, { property: "og:url", content: "/refund" }],
    links: [{ rel: "canonical", href: "/refund" }],
  }),
  component: () => (
    <StaticPage title="Refund Policy" updated="July 2026">
      <p>All tools on ToolHub Pro are free to use. If in the future we introduce a paid tier or product, refund terms will be posted here and communicated at checkout.</p>
      <p>For any billing-related questions on optional donations or supporter tiers, please contact us and we will respond within 48 hours.</p>
    </StaticPage>
  ),
});
