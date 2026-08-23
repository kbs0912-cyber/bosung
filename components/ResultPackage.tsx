"use client";

import CopyButton from "@/components/CopyButton";
import type { ContentPackage } from "@/lib/types";

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

function buildFullText(pkg: ContentPackage): string {
  const titles = pkg.titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const phrases = pkg.thumbnailPhrases.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const images = pkg.images
    .map(
      (img) =>
        `[이미지 ${img.index}] 위치: ${img.position}\n설명: ${img.description}\n프롬프트: ${img.prompt}`,
    )
    .join("\n\n");
  const hashtags = pkg.hashtags.map((h) => `#${h}`).join(" ");

  return [
    "■ 추천 제목",
    titles,
    "",
    "■ 대표 문구",
    phrases,
    "",
    "■ 본문",
    pkg.body,
    "",
    "■ 이미지 구성",
    images,
    "",
    "■ 해시태그",
    hashtags,
    "",
    "■ 홈판 클릭 포인트",
    pkg.homeClickPoints,
  ].join("\n");
}

export default function ResultPackage({ pkg }: { pkg: ContentPackage }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-[#03C75A]/8 px-4 py-3">
        <span className="text-sm font-medium text-[#03C75A]">
          콘텐츠 패키지가 완성됐어요
        </span>
        <CopyButton text={buildFullText(pkg)} label="전체 복사" />
      </div>

      <Card title="추천 제목 (5)">
        <ul className="space-y-2">
          {pkg.titles.map((title, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3.5 py-2.5"
            >
              <span className="text-sm text-zinc-800">{title}</span>
              <CopyButton text={title} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="대표 문구 (3)">
        <ul className="space-y-2">
          {pkg.thumbnailPhrases.map((phrase, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3.5 py-2.5"
            >
              <span className="text-sm font-medium text-zinc-800">{phrase}</span>
              <CopyButton text={phrase} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="최종 본문" action={<CopyButton text={pkg.body} label="본문 복사" />}>
        <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800">
          {pkg.body}
        </div>
      </Card>

      <Card title={`이미지 구성 (${pkg.images.length})`}>
        <div className="space-y-3">
          {pkg.images.map((img) => (
            <div key={img.index} className="rounded-xl bg-zinc-50 p-3.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#03C75A]">
                  이미지 {img.index} · {img.position}
                </span>
                <CopyButton text={img.prompt} label="프롬프트 복사" />
              </div>
              <p className="mb-2 text-sm text-zinc-700">{img.description}</p>
              <p className="rounded-lg bg-white px-3 py-2 text-xs text-zinc-500 font-mono break-words">
                {img.prompt}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={`해시태그 (${pkg.hashtags.length})`}
        action={<CopyButton text={pkg.hashtags.map((h) => `#${h}`).join(" ")} label="전체 복사" />}
      >
        <div className="flex flex-wrap gap-2">
          {pkg.hashtags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-[#03C75A]/8 px-3 py-1 text-xs font-medium text-[#03C75A]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Card>

      <Card title="홈판 클릭 포인트">
        <p className="text-sm leading-relaxed text-zinc-700">{pkg.homeClickPoints}</p>
      </Card>
    </div>
  );
}
