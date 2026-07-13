import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [{ title: "DMCA — ToolHub Pro" }, { name: "description", content: "How to file a DMCA takedown notice for content on ToolHub Pro." }, { property: "og:url", content: "/dmca" }],
    links: [{ rel: "canonical", href: "/dmca" }],
  }),
  component: () => (
    <StaticPage title="DMCA Policy" updated="July 2026">
      <p>ToolHub Pro respects intellectual property rights. If you believe content on our site infringes your copyright, please send a written notice including:</p>
      <ul className="list-disc pl-5">
        <li>Identification of the copyrighted work.</li>
        <li>URL or description of the allegedly infringing material.</li>
        <li>Your contact information.</li>
        <li>A statement made under penalty of perjury that you are authorised to act on behalf of the owner.</li>
      </ul>
      <p>Send DMCA notices to our Contact page. We remove verified infringing content promptly.</p>
    </StaticPage>
  ),
});
