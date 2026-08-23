"use client";

import { ACTION_LABELS } from "@/lib/actions";
import type { GenerateAction } from "@/lib/types";

const TONE_ACTIONS: GenerateAction[] = [
  "more_provocative",
  "more_professional",
  "more_natural",
  "shorten",
  "lengthen",
];

export default function ActionBar({
  loading,
  loadingAction,
  onAction,
}: {
  loading: boolean;
  loadingAction: GenerateAction | null;
  onAction: (action: GenerateAction) => void;
}) {
  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700">AI로 다듬기</h3>
      <div className="flex flex-wrap gap-2">
        {TONE_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            disabled={loading}
            onClick={() => onAction(action)}
            className="rounded-full border border-black/10 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:border-[#03C75A]/40 hover:bg-[#03C75A]/5 hover:text-[#03C75A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAction === action ? "생성 중..." : ACTION_LABELS[action]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => onAction("regenerate_thumbnail")}
          className="rounded-full border border-black/10 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:border-[#03C75A]/40 hover:bg-[#03C75A]/5 hover:text-[#03C75A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "regenerate_thumbnail" ? "생성 중..." : ACTION_LABELS.regenerate_thumbnail}
        </button>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() => onAction("regenerate_all")}
        className="mt-4 w-full rounded-2xl border-2 border-[#03C75A] py-3 text-sm font-bold text-[#03C75A] transition hover:bg-[#03C75A]/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingAction === "regenerate_all" ? "전체 재생성 중..." : "전체 다시 생성"}
      </button>
    </div>
  );
}
