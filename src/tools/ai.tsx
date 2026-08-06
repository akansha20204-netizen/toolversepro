import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Trash2, User, Loader2, Copy, Check } from "lucide-react";
import { TButton, copyText } from "@/components/site/tool-ui";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain async/await in JavaScript with an example",
  "Write a regex to validate an email address",
  "Give me a SQL query to find duplicate rows",
  "Summarise the difference between REST and GraphQL",
];

/** Minimal, dependency-free renderer: fenced code blocks + inline emphasis. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/```/);
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, i) =>
        i % 2 === 1 ? (
          <CodeBlock key={i} raw={block} />
        ) : (
          block.trim() && (
            <p key={i} className="whitespace-pre-wrap break-words">
              {block.replace(/\*\*(.+?)\*\*/g, "$1").trim()}
            </p>
          )
        ),
      )}
    </div>
  );
}

function CodeBlock({ raw }: { raw: string }) {
  const [copied, setCopied] = useState(false);
  const lines = raw.replace(/^\n/, "").split("\n");
  const lang = /^[a-z0-9+#-]{1,15}$/i.test(lines[0].trim()) ? lines.shift()!.trim() : "";
  const code = lines.join("\n").replace(/\s+$/, "");
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/60">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{lang || "code"}</span>
        <button
          onClick={async () => {
            if (await copyText(code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function AIChatAssistant() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={boxRef}
        className="min-h-[320px] max-h-[520px] overflow-y-auto rounded-2xl border border-border bg-background/70 p-4"
      >
        {!messages.length && !loading ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold">Ask the AI anything</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Code help, explanations, writing, debugging, SQL, regex and more — powered by Gemini, free and with no signup.
            </p>
            <div className="mx-auto mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card p-3 text-left text-xs transition-colors hover:border-primary hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-slate-500 to-slate-700"
                      : "bg-gradient-to-br from-violet-500 to-purple-600"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-3">
                  <RichText text={m.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask anything… (Enter to send, Shift+Enter for a new line)"
          className="min-h-[52px] flex-1 resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <TButton onClick={() => void send(input)} disabled={loading || !input.trim()} className="h-[52px] px-4">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
        </TButton>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Conversation stays in this tab only — nothing is saved.</span>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError("");
              inputRef.current?.focus();
            }}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" /> New chat
          </button>
        )}
      </div>
    </div>
  );
}
