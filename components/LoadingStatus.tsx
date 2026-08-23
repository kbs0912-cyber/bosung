"use client";

import { useEffect, useState } from "react";

// Not a live progress feed — the API returns one shot at the end, so this is
// an honest approximation of the guide's internal steps, rotated on a timer
// just to make a genuinely long wait (real-time search + a full article)
// feel less like the app has frozen.
const STEPS = [
  "실시간 자료를 검색하고 있어요...",
  "제목 후보를 구상하고 있어요...",
  "본문 초안을 쓰고 있어요...",
  "사실 확인을 하고 있어요...",
  "가독성을 다듬고 있어요...",
];

export default function LoadingStatus({ message }: { message?: string }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-black/8 bg-white p-10 text-center shadow-sm">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#03C75A]/20 border-t-[#03C75A]" />
      <p className="text-sm font-medium text-zinc-600">{STEPS[stepIndex]}</p>
      <p className="text-xs text-zinc-400">{message ?? "실시간 검색이 포함돼 다소 시간이 걸려요 (보통 1~2분)"}</p>
    </div>
  );
}
