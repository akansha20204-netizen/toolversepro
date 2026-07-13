import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [{ title: "Disclaimer — ToolHub Pro" }, { name: "description", content: "Disclaimer about the accuracy and use of ToolHub Pro tools." }, { property: "og:url", content: "/disclaimer" }],
    links: [{ rel: "canonical", href: "/disclaimer" }],
  }),
  component: () => (
    <StaticPage title="Disclaimer" updated="July 2026">
      <p>The information and tools provided on ToolHub Pro are for general informational purposes only. While we strive for accuracy, we make no warranties of any kind about the completeness, reliability or suitability of the results.</p>
      <p>Calculators for financial, medical, legal or scientific matters are intended as a quick reference only. Always consult a qualified professional before making decisions based on the output.</p>
      <p>Your use of the site and its tools is solely at your own risk.</p>
    </StaticPage>
  ),
});
