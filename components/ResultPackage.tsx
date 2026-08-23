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

export default function ResultPackage({ pkg }: { pkg: HomepanPost }) {
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
        title="메인 썸네일 프롬프트"
        action={<CopyButton text={pkg.mainThumbnailPrompt} label="복사" />}
      >
        <p className="mb-2 text-xs text-zinc-400">
          AI 이미지 생성 도구(예: 미드저니, 이미지 생성 서비스)에 붙여넣어 대표 썸네일을 만드세요.
        </p>
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-600 break-words">
          {pkg.mainThumbnailPrompt}
        </p>
      </Card>
    </div>
  );
}
