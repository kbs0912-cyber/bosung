"use client";

import { CATEGORIES, TONES, type Category, type Tone } from "@/lib/types";

export default function GeneratorForm({
  keyword,
  category,
  tone,
  loading,
  onKeywordChange,
  onCategoryChange,
  onToneChange,
  onSubmit,
}: {
  keyword: string;
  category: Category;
  tone: Tone;
  loading: boolean;
  onKeywordChange: (v: string) => void;
  onCategoryChange: (v: Category) => void;
  onToneChange: (v: Tone) => void;
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
        키워드
      </label>
      <input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="예: 강남 파스타 맛집, 전기차 보조금, 겨울 여행지..."
        disabled={loading}
        className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-4 text-base outline-none transition focus:border-[#03C75A] focus:bg-white focus:ring-2 focus:ring-[#03C75A]/20"
      />

      <div className="mt-6">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">카테고리</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              disabled={loading}
              onClick={() => onCategoryChange(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c
                  ? "bg-[#03C75A] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">글 분위기</span>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={loading}
              onClick={() => onToneChange(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tone === t
                  ? "bg-[#03C75A] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t}
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
        {loading ? "AI가 콘텐츠를 만드는 중..." : "AI 딸깍 생성"}
      </button>
    </div>
  );
}
