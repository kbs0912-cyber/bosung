"use client";

import { CATEGORIES } from "@/lib/categories";

export default function GeneratorForm({
  keyword,
  categoryId,
  loading,
  onKeywordChange,
  onCategoryChange,
  onSubmit,
}: {
  keyword: string;
  categoryId: string;
  loading: boolean;
  onKeywordChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: () => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-7">
      <label className="mb-2 block text-sm font-semibold text-zinc-700">
        주제어
      </label>
      <input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="예: 테슬라 모델Y, 위고비 부작용, 손흥민 이적설..."
        disabled={loading}
        className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-4 text-base outline-none transition focus:border-[#03C75A] focus:bg-white focus:ring-2 focus:ring-[#03C75A]/20"
      />

      <div className="mt-6">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">카테고리</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={loading}
              onClick={() => onCategoryChange(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoryId === c.id
                  ? "bg-[#03C75A] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !keyword.trim()}
        className="mt-7 w-full rounded-2xl bg-[#03C75A] py-4 text-base font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
      >
        {loading ? "AI가 검색하고 글을 쓰는 중... (최대 1~2분)" : "AI 딸깍 생성"}
      </button>
    </div>
  );
}
