"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import ActionBar from "@/components/ActionBar";
import ResultPackage from "@/components/ResultPackage";
import CustomPromptManager from "@/components/CustomPromptManager";
import SettingsModal from "@/components/SettingsModal";
import { CATEGORIES } from "@/lib/categories";
import type { GenerateAction, HomepanPost } from "@/lib/types";

// Actions whose result carries a new 메인 썸네일 프롬프트 — only these should
// trigger a fresh image generation. Tone/length tweaks keep the same prompt
// (see lib/actions.ts), so the existing image stays valid.
const THUMBNAIL_CHANGING_ACTIONS: GenerateAction[] = [
  "generate",
  "regenerate_all",
  "regenerate_thumbnail",
];

export default function ContentStudio() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [pkg, setPkg] = useState<HomepanPost | null>(null);
  const [loadingAction, setLoadingAction] = useState<GenerateAction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customPromptContents, setCustomPromptContents] = useState<string[]>([]);

  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const loading = loadingAction !== null;

  async function generateImage(prompt: string) {
    setImageLoading(true);
    setImageError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImageError(data.error ?? "이미지 생성에 실패했습니다.");
        setThumbnailImage(null);
        return;
      }
      setThumbnailImage(data.imageDataUrl as string);
    } catch {
      setImageError("네트워크 오류로 이미지를 받지 못했습니다.");
      setThumbnailImage(null);
    } finally {
      setImageLoading(false);
    }
  }

  async function runAction(action: GenerateAction) {
    if (!keyword.trim()) {
      setErrorMsg("주제어를 먼저 입력해주세요.");
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
          categoryId,
          action,
          current: pkg ?? undefined,
          customPrompts: customPromptContents,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "콘텐츠 생성 중 오류가 발생했습니다.");
        return;
      }
      const post = data.post as HomepanPost;
      setPkg(post);
      if (THUMBNAIL_CHANGING_ACTIONS.includes(action)) {
        void generateImage(post.mainThumbnailPrompt);
      }
    } catch {
      setErrorMsg("네트워크 오류로 콘텐츠를 받지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleReset() {
    setPkg(null);
    setErrorMsg(null);
    setThumbnailImage(null);
    setImageError(null);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6">
      <header className="relative text-center">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="absolute right-0 top-0 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm transition hover:bg-zinc-50"
        >
          ⚙ 설정
        </button>
        <span className="mb-3 inline-block rounded-full bg-[#03C75A]/10 px-3 py-1 text-xs font-semibold text-[#03C75A]">
          AI 딸깍 블로그
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          주제어 하나로 홈판용 글 완성
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          실시간 검색과 팩트체크를 거쳐, 바로 붙여넣을 수 있는 완성글과 대표 썸네일 이미지를 만들어드립니다.
        </p>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <GeneratorForm
        keyword={keyword}
        categoryId={categoryId}
        loading={loading}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategoryId}
        onSubmit={() => runAction("generate")}
      />

      <CustomPromptManager onChange={setCustomPromptContents} />

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {loading && !pkg && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-black/8 bg-white p-10 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#03C75A]/20 border-t-[#03C75A]" />
          <p className="text-sm text-zinc-500">
            AI가 실시간으로 자료를 찾고 글을 쓰는 중이에요. 최대 1~2분 정도 걸릴 수 있어요...
          </p>
        </div>
      )}

      {pkg && (
        <>
          <ResultPackage
            pkg={pkg}
            thumbnailImage={thumbnailImage}
            imageLoading={imageLoading}
            imageError={imageError}
            onRegenerateImage={() => generateImage(pkg.mainThumbnailPrompt)}
          />
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
