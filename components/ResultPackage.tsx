"use client";

import CopyButton from "@/components/CopyButton";
import type { HomepanPost } from "@/lib/types";

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ResultPackage({
  pkg,
  thumbnailImage,
  imageLoading,
  imageError,
  onRegenerateImage,
}: {
  pkg: HomepanPost;
  thumbnailImage: string | null;
  imageLoading: boolean;
  imageError: string | null;
  onRegenerateImage: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-[#03C75A]/8 px-4 py-3">
        <span className="text-sm font-medium text-[#03C75A]">
          완성된 글이 준비됐어요
        </span>
        <CopyButton text={pkg.post} label="전체 복사" />
      </div>

      <Card title="완성된 글" action={<CopyButton text={pkg.post} label="복사" />}>
        <p className="mb-2 text-sm font-semibold text-zinc-900">{pkg.title}</p>
        <div className="max-h-[480px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800">
          {pkg.post}
        </div>
      </Card>

      <Card
        title="메인 썸네일"
        action={<CopyButton text={pkg.mainThumbnailPrompt} label="프롬프트 복사" />}
      >
        {imageLoading && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-50 p-8 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#03C75A]/20 border-t-[#03C75A]" />
            <p className="text-xs text-zinc-500">Gemini로 썸네일 이미지를 만드는 중...</p>
          </div>
        )}

        {!imageLoading && thumbnailImage && (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from Gemini, next/image can't optimize it anyway */}
            <img
              src={thumbnailImage}
              alt="AI가 생성한 메인 썸네일"
              className="w-full rounded-xl border border-black/8"
            />
            <div className="mt-2 flex gap-2">
              <a
                href={thumbnailImage}
                download="ai-ddalkkak-thumbnail.png"
                className="flex-1 rounded-full border border-black/10 py-2 text-center text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                이미지 다운로드
              </a>
              <button
                type="button"
                onClick={onRegenerateImage}
                className="flex-1 rounded-full border border-black/10 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                이미지 다시 만들기
              </button>
            </div>
          </div>
        )}

        {!imageLoading && !thumbnailImage && imageError && (
          <div className="mb-3 rounded-xl bg-red-50 p-4 text-center">
            <p className="mb-2 text-xs text-red-500">{imageError}</p>
            <button
              type="button"
              onClick={onRegenerateImage}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100"
            >
              다시 시도
            </button>
          </div>
        )}

        <p className="mb-2 text-xs text-zinc-400">
          아래는 이미지 생성에 사용된 영문 프롬프트예요. 다른 이미지 생성 도구에도 붙여넣어 쓸 수 있어요.
        </p>
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-600 break-words">
          {pkg.mainThumbnailPrompt}
        </p>
      </Card>
    </div>
  );
}
