import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useState } from "react";
import { toast } from "sonner";
import { TButton, TInput, TTextarea, Field } from "@/components/site/tool-ui";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ToolHub Pro" },
      { name: "description", content: "Get in touch with ToolHub Pro — feedback, feature requests and partnership inquiries." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  return (
    <StaticPage title="Contact Us">
      <p>Have a suggestion, spotted a bug, or want to collaborate? We reply within 48 hours.</p>
      <form
        className="not-prose grid gap-4 rounded-2xl border border-border bg-card p-6 mt-6"
        onSubmit={(e) => { e.preventDefault(); if (!f.email || !f.message) return; toast.success("Message received — we'll reply soon!"); setF({ name: "", email: "", message: "" }); }}
      >
        <Field label="Name"><TInput required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email"><TInput type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Message"><TTextarea rows={6} required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
        <TButton type="submit">Send message</TButton>
      </form>
    </StaticPage>
  );
}
