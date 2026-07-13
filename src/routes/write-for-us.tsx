import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/write-for-us")({
  head: () => ({
    meta: [{ title: "Write For Us — ToolHub Pro Blog" }, { name: "description", content: "Guest post guidelines for the ToolHub Pro blog." }, { property: "og:url", content: "/write-for-us" }],
    links: [{ rel: "canonical", href: "/write-for-us" }],
  }),
  component: () => (
    <StaticPage title="Write For Us">
      <p>We accept high-quality guest posts on productivity, developer tools, image and PDF workflows, and browser-based utilities. Original, well-researched pieces are always welcome.</p>
      <h2 className="text-lg font-semibold text-foreground">Guidelines</h2>
      <ul className="list-disc pl-5">
        <li>Minimum 1,200 words, original and not published elsewhere.</li>
        <li>Practical, hands-on tone with concrete examples.</li>
        <li>One author bio (up to 60 words) with two backlinks.</li>
        <li>No promotional or spun content.</li>
      </ul>
      <p>Pitch your topic through the Contact page. We reply within a week.</p>
    </StaticPage>
  ),
});
