import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — ToolHub Pro" }, { name: "description", content: "How ToolHub Pro handles your data — spoiler: we don't collect it." }, { property: "og:url", content: "/privacy" }],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <StaticPage title="Privacy Policy" updated="July 2026">
      <p>ToolHub Pro is designed to be privacy-first. All 70+ tools run entirely in your browser using client-side JavaScript. Files you drop into any tool are processed locally and never uploaded to our servers.</p>
      <h2 className="text-lg font-semibold text-foreground">Information We Do Not Collect</h2>
      <p>We do not collect the contents of files you process, the text you paste, or the settings you choose inside any tool. Nothing you compute leaves your device.</p>
      <h2 className="text-lg font-semibold text-foreground">Information We May Collect</h2>
      <p>We use privacy-friendly analytics to understand which tools are popular. This may include your browser type, country, referrer and pages visited. No personally identifiable information is stored.</p>
      <h2 className="text-lg font-semibold text-foreground">Advertising</h2>
      <p>We may display advertisements via Google AdSense. Google may use cookies to serve ads based on prior visits. You can opt out via <a href="https://adssettings.google.com/" target="_blank" rel="noopener" className="text-primary underline">Google Ads Settings</a>.</p>
      <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
      <p>ToolHub Pro uses minimal cookies for theme preference (light/dark) and analytics. See our Cookie Policy for details.</p>
      <h2 className="text-lg font-semibold text-foreground">Contact</h2>
      <p>If you have questions about this policy, please contact us via the Contact page.</p>
    </StaticPage>
  ),
});
