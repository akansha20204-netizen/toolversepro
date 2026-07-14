import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { Heart, Zap, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ToolHub Pro — Our Mission & Story" },
      { name: "description", content: "Learn about ToolHub Pro — a free, privacy-first collection of 70+ browser tools built for creators, students and developers." },
      { property: "og:title", content: "About ToolHub Pro" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <StaticPage title="About ToolHub Pro">
      <p>ToolHub Pro is a free, privacy-first collection of over 70 online tools that run entirely inside your browser. We built it for people who value speed, simplicity and control over their data.</p>
      <p>Our mission is to replace clunky desktop utilities and ad-heavy web tools with a single, beautifully designed workspace where every tool loads instantly and processes files locally. Nothing is uploaded to any server — ever.</p>
      <div className="not-prose grid gap-4 sm:grid-cols-2 my-8">
        {[
          { icon: Zap, title: "Lightning fast", desc: "Everything runs client-side using modern web APIs." },
          { icon: Shield, title: "Privacy first", desc: "Files never leave your device. No accounts. No tracking." },
          { icon: Heart, title: "Free forever", desc: "70+ tools. No signups. No watermarks. No hidden fees." },
          { icon: Users, title: "Built for humans", desc: "Every tool is designed by people who use them every day." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
            <c.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
      <p>We started ToolHub Pro because we were tired of tools that made simple tasks complicated. Every feature ships only when we would use it ourselves, and every UI is refined until it feels effortless.</p>
      <p>If you have a suggestion or want to collaborate, reach out via our Contact page — we ship user requests every week.
        For Any other Query Please Mail us @ ashu28511@gmail.com
      </p>
    </StaticPage>
  ),
});
