"use client";

import { ACTION_LABELS } from "@/lib/actions";
import type { GenerateAction } from "@/lib/types";

const GROUPS: { title: string; actions: GenerateAction[] }[] = [
  {
    title: "다시 만들기",
    actions: ["regenerate_titles", "regenerate_body", "generate_images", "generate_hashtags"],
  },
  {
    title: "톤 & 분량 조절",
    actions: ["more_provocative", "more_professional", "more_natural", "shorten", "lengthen"],
  },
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
      <div className="space-y-3">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-wrap gap-2">
            {group.actions.map((action) => (
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
        ))}
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
