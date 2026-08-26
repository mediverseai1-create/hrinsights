"use client";

import { useRef, useState } from "react";
import { Mic, Paperclip, Send, Sparkles, MessagesSquare } from "lucide-react";
import { sendAssistantMessage } from "@/app/dashboard/assistant/actions";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { GeminiTurn } from "@/lib/ai/gemini";

const SUGGESTIONS = [
  "Who hasn't checked in today?",
  "Summarize attendance this week.",
  "What needs my attention today?",
  "Show our open roles and how many candidates are in each pipeline.",
];

interface Message {
  role: "user" | "model";
  text: string;
}

export function AssistantView({ aiConfigured }: { aiConfigured: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(!aiConfigured);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    if (!question.trim() || sending) return;
    setError(null);
    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", text: question }];
    setMessages(nextMessages);
    setSending(true);

    const history: GeminiTurn[] = messages.map((m) => ({ role: m.role, text: m.text }));
    const result = await sendAssistantMessage(history, question);
    setSending(false);

    if (result?.notConfigured) {
      setNotConfigured(true);
      return;
    }
    if (result?.error) {
      setError(result.error);
      return;
    }
    setMessages([...nextMessages, { role: "model", text: result.answer ?? "" }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  if (notConfigured) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900">HR Assistant</h1>
        <p className="mt-1 text-sm text-ink-500">Ask HRInsights anything about your workspace.</p>
        <EmptyState
          className="mt-6"
          icon={Sparkles}
          title="HR Assistant — coming soon"
          description="This organization hasn't connected an AI provider yet. Once GEMINI_API_KEY is configured on the server, the assistant will answer using your real workspace data."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">HR Assistant</h1>
        <p className="mt-1 text-sm text-ink-500">
          Ask about attendance, people, recruiting, or your company policies.
        </p>
      </div>

      <Card className="mt-4 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div>
              <div className="flex items-center gap-2 text-ink-400">
                <MessagesSquare className="h-4 w-4" />
                <p className="text-sm">Try asking:</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-ink-900/10 bg-cream-50 px-3 py-1.5 text-xs text-ink-700 hover:bg-cream-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={
                      m.role === "user"
                        ? "inline-block max-w-[85%] rounded-2xl bg-forest-950 px-4 py-2.5 text-left text-sm text-cream-50"
                        : "inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl bg-cream-50 px-4 py-2.5 text-left text-sm text-ink-900"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && <p className="text-sm text-ink-400">Thinking…</p>}
              {error && <p className="text-sm text-danger-600">{error}</p>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-ink-900/8 p-3">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask HRInsights anything…"
              className="min-h-12 resize-none pr-28"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button type="button" disabled title="Voice input — coming soon" className="rounded-md p-1.5 text-ink-300 cursor-not-allowed">
                <Mic className="h-4 w-4" />
              </button>
              <button type="button" disabled title="Attach a file — coming soon" className="rounded-md p-1.5 text-ink-300 cursor-not-allowed">
                <Paperclip className="h-4 w-4" />
              </button>
              <Button size="sm" onClick={() => send(input)} disabled={sending || !input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
