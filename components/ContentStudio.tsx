"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import ActionBar from "@/components/ActionBar";
import ResultPackage from "@/components/ResultPackage";
import type { Category, ContentPackage, GenerateAction, Tone } from "@/lib/types";

export default function ContentStudio() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<Category>("생활");
  const [tone, setTone] = useState<Tone>("정보형");
  const [pkg, setPkg] = useState<ContentPackage | null>(null);
  const [loadingAction, setLoadingAction] = useState<GenerateAction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loading = loadingAction !== null;

  async function runAction(action: GenerateAction) {
    if (!keyword.trim()) {
      setErrorMsg("키워드를 먼저 입력해주세요.");
      return;
    }
    setErrorMsg(null);
    setLoadingAction(action);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          category,
          tone,
          action,
          current: pkg ?? undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "콘텐츠 생성 중 오류가 발생했습니다.");
        return;
      }
      setPkg(data.package as ContentPackage);
    } catch {
      setErrorMsg("네트워크 오류로 콘텐츠를 받지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleReset() {
    setPkg(null);
    setErrorMsg(null);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6">
      <header className="text-center">
        <span className="mb-3 inline-block rounded-full bg-[#03C75A]/10 px-3 py-1 text-xs font-semibold text-[#03C75A]">
          AI 딸깍 블로그
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          키워드 하나로 홈판용 글 완성
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          제목부터 본문, 이미지 프롬프트, 해시태그까지 AI가 한 번에 만들어드립니다.
        </p>
      </header>

      <GeneratorForm
        keyword={keyword}
        category={category}
        tone={tone}
        loading={loading}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onToneChange={setTone}
        onSubmit={() => runAction("generate")}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {loading && !pkg && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-black/8 bg-white p-10 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#03C75A]/20 border-t-[#03C75A]" />
          <p className="text-sm text-zinc-500">
            AI가 홈판용 콘텐츠를 기획하고 있어요. 잠시만 기다려주세요...
          </p>
        </div>
      )}

      {pkg && (
        <>
          <ResultPackage pkg={pkg} />
          <ActionBar loading={loading} loadingAction={loadingAction} onAction={runAction} />
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-2xl border border-black/10 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50"
          >
            초기화하고 새로 시작하기
          </button>
        </>
      )}
    </div>
  );
}
