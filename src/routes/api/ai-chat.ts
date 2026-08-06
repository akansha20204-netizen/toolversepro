import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are ToolHub Pro AI Assistant, a helpful, accurate and concise assistant for developers, students and creators. " +
  "Answer clearly in Markdown-friendly plain text. Use short paragraphs, bullet points and fenced code blocks for code. " +
  "When a question relates to converting files, images, PDFs, text, JSON or units, mention that ToolHub Pro has free browser tools for it.";

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["GEMINI_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI is not configured." }, { status: 500 });
        }

        let messages: ChatMsg[] = [];
        try {
          const body = (await request.json()) as { messages?: ChatMsg[] };
          messages = Array.isArray(body.messages) ? body.messages : [];
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        messages = messages
          .filter((m) => typeof m?.content === "string" && m.content.trim())
          .slice(-20);

        if (!messages.length || messages[messages.length - 1].role !== "user") {
          return Response.json({ error: "Send a message to start." }, { status: 400 });
        }

        try {
          const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-goog-api-key": key },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: messages.map((m) => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }],
                })),
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
              }),
            },
          );

          const text = await res.text();
          if (!res.ok) {
            console.error(`Gemini request failed [${res.status}]: ${text}`);
            const status = res.status === 429 ? 429 : 502;
            return Response.json(
              {
                error:
                  status === 429
                    ? "Too many requests right now — please try again in a moment."
                    : "The AI service returned an error. Please try again.",
              },
              { status },
            );
          }

          const data = JSON.parse(text) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const reply =
            data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";

          if (!reply) {
            return Response.json({ error: "The AI returned an empty response. Try rephrasing." }, { status: 502 });
          }
          return Response.json({ reply });
        } catch (err) {
          console.error("AI chat error", err);
          return Response.json({ error: "Could not reach the AI service." }, { status: 502 });
        }
      },
    },
  },
});
