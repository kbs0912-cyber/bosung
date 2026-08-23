"use client";

import { useRef, useState } from "react";

interface TrendResult {
  keywords: string[];
  suggestedCategoryId?: string;
}

export default function TrendImportPanel({
  onPick,
}: {
  onPick: (keyword: string, categoryId?: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrendResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(",");
      const meta = dataUrl.slice(0, commaIndex);
      const base64 = dataUrl.slice(commaIndex + 1);
      const mime = meta.match(/data:(.*);base64/)?.[1] ?? file.type;
      setPreview(dataUrl);
      setImageBase64(base64);
      setMimeType(mime);
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!imageBase64 || !mimeType) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "분석에 실패했습니다.");
        return;
      }
      setResult(data as TrendResult);
    } catch {
      setError("네트워크 오류로 분석하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPreview(null);
    setImageBase64(null);
    setMimeType(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-1 text-sm font-semibold text-zinc-700">오늘의 트렌드 키워드 가져오기</h3>
      <p className="mb-3 text-xs text-zinc-400">
        크리에이터 어드바이저의 검색 유입 트렌드 화면을 캡처해서 올리면, 순위 목록을 읽어 키워드로 골라드려요.
      </p>

      {!preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-black/15 py-6 text-sm text-zinc-500 transition hover:border-[#03C75A]/40 hover:bg-[#03C75A]/5 hover:text-[#03C75A]"
        >
          + 스크린샷 올리기
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local file preview, next/image adds no value here */}
          <img
            src={preview}
            alt="업로드한 스크린샷"
            className="max-h-64 w-full rounded-xl border border-black/8 object-contain"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-full border border-black/10 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50"
            >
              다시 선택
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="flex-1 rounded-full bg-[#03C75A] py-2 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? "분석 중..." : "목록 읽어오기"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {result && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-zinc-400">키워드를 클릭하면 주제어 칸에 채워져요.</p>
          <ul className="space-y-1.5">
            {result.keywords.map((kw, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onPick(kw, result.suggestedCategoryId)}
                  className="flex w-full items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-[#03C75A]/8 hover:text-[#03C75A]"
                >
                  <span className="text-xs font-semibold text-zinc-400">{i + 1}</span>
                  {kw}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
