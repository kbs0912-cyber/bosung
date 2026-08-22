"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "오류가 발생했습니다.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
    } catch {
      setErrorMsg("네트워크 오류로 응답을 받지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-black">
      <header className="border-b border-black/10 dark:border-white/15 p-4 text-lg font-semibold">
        관계·커뮤니케이션 분석 AI
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-zinc-400 text-sm">
            연인의 말이나 행동, 대화 내용을 입력하면 분석해드립니다.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-2xl px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 bg-zinc-100 text-zinc-500 text-sm dark:bg-zinc-800 dark:text-zinc-400">
              답변을 생성하는 중...
            </div>
          </div>
        )}
        {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-black/10 dark:border-white/15 p-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="상황을 입력하세요 (Shift+Enter로 줄바꿈)"
          rows={2}
          className="flex-1 border border-black/15 dark:border-white/20 rounded-lg p-2 text-sm resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          전송
        </button>
      </div>
    </div>
  );
}
