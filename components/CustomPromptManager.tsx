"use client";

import { useEffect, useState } from "react";
import {
  MAX_CUSTOM_PROMPTS,
  MAX_CUSTOM_PROMPT_LENGTH,
  type CustomPrompt,
} from "@/lib/types";

const STORAGE_KEY = "ai-ddalkkak-custom-prompts";

function loadFromStorage(): CustomPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is CustomPrompt =>
        p &&
        typeof p.id === "string" &&
        typeof p.title === "string" &&
        typeof p.content === "string" &&
        typeof p.enabled === "boolean",
    );
  } catch {
    return [];
  }
}

export default function CustomPromptManager({
  onChange,
}: {
  onChange: (enabledContents: string[]) => void;
}) {
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    // localStorage is only readable on the client, so the saved prompts
    // are loaded once after mount rather than during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrompts(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch {
      // localStorage 사용 불가 시 조용히 무시 (이번 세션에서만 값 유지)
    }
    onChange(prompts.filter((p) => p.enabled).map((p) => p.content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts, hydrated]);

  function openNewForm() {
    setEditingId(null);
    setDraftTitle("");
    setDraftContent("");
    setIsFormOpen(true);
  }

  function openEditForm(prompt: CustomPrompt) {
    setEditingId(prompt.id);
    setDraftTitle(prompt.title);
    setDraftContent(prompt.content);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setDraftTitle("");
    setDraftContent("");
  }

  function handleSave() {
    const title = draftTitle.trim() || "제목 없음";
    const content = draftContent.trim();
    if (!content) return;

    if (editingId) {
      setPrompts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, title, content } : p)),
      );
    } else {
      if (prompts.length >= MAX_CUSTOM_PROMPTS) return;
      setPrompts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, content, enabled: true },
      ]);
    }
    closeForm();
  }

  function handleDelete(id: string) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleToggle(id: string) {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    );
  }

  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-700">커스텀 프롬프트</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            자주 쓰는 문체·강조점을 저장해두고 켜고 끄면서 생성에 반영하세요.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openNewForm}
            disabled={prompts.length >= MAX_CUSTOM_PROMPTS}
            className="shrink-0 rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + 프롬프트 추가
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mt-4 rounded-2xl border border-[#03C75A]/30 bg-[#03C75A]/5 p-4">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="프롬프트 이름 (예: 내 블로그 말투)"
            maxLength={60}
            className="mb-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#03C75A] focus:ring-2 focus:ring-[#03C75A]/20"
          />
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="예: 항상 반말 대신 다정한 존댓말을 쓰고, 문장 끝에 이모지는 쓰지 않는다. 우리 매장 이름 '○○카페'를 자연스럽게 한 번 언급한다."
            rows={4}
            maxLength={MAX_CUSTOM_PROMPT_LENGTH}
            className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#03C75A] focus:ring-2 focus:ring-[#03C75A]/20"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draftContent.trim()}
              className="rounded-full bg-[#03C75A] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              저장
            </button>
          </div>
        </div>
      )}

      {prompts.length === 0 && !isFormOpen && (
        <p className="mt-4 text-sm text-zinc-400">
          아직 저장된 커스텀 프롬프트가 없어요. 콘텐츠 생성에 항상 반영하고 싶은
          말투나 조건을 추가해보세요.
        </p>
      )}

      {prompts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {prompts.map((prompt) => (
            <li
              key={prompt.id}
              className={`rounded-xl border px-3.5 py-3 transition ${
                prompt.enabled
                  ? "border-[#03C75A]/30 bg-[#03C75A]/5"
                  : "border-black/8 bg-zinc-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(prompt.id)}
                  className="flex flex-1 items-start gap-2 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
                      prompt.enabled ? "bg-[#03C75A]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow transition ${
                        prompt.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-zinc-800">
                      {prompt.title}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-zinc-500">
                      {prompt.content}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditForm(prompt)}
                    className="rounded-full px-2.5 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-200"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prompt.id)}
                    className="rounded-full px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
