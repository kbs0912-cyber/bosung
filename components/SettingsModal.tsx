"use client";

import { useEffect, useState } from "react";

const MODEL_OPTIONS = [
  { id: "claude-sonnet-5", label: "Sonnet 5 (기본, 빠르고 균형 잡힌 품질)" },
  { id: "claude-opus-5", label: "Opus 5 (고품질, 느리고 비용이 높음)" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 (가장 빠르고 저렴)" },
];

interface SettingsState {
  hasApiKey: boolean;
  managedByEnv: boolean;
  modelId: string;
  hasGeminiApiKey: boolean;
  geminiManagedByEnv: boolean;
}

type Message = { type: "success" | "error"; text: string } | null;

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<SettingsState | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [modelId, setModelId] = useState("claude-sonnet-5");
  const [showKey, setShowKey] = useState(false);
  const [savingAnthropic, setSavingAnthropic] = useState(false);
  const [anthropicMessage, setAnthropicMessage] = useState<Message>(null);

  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [geminiMessage, setGeminiMessage] = useState<Message>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnthropicMessage(null);
    setGeminiMessage(null);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: SettingsState) => {
        setStatus(data);
        setModelId(data.modelId);
      })
      .catch(() => setAnthropicMessage({ type: "error", text: "설정을 불러오지 못했습니다." }));
  }, [open]);

  async function handleSaveAnthropic() {
    setSavingAnthropic(true);
    setAnthropicMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
          modelId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnthropicMessage({ type: "error", text: data.error ?? "저장에 실패했습니다." });
        return;
      }
      setApiKeyInput("");
      setAnthropicMessage({ type: "success", text: "설정이 저장되었습니다." });
      setStatus((prev) => (prev ? { ...prev, hasApiKey: true, modelId } : prev));
    } catch {
      setAnthropicMessage({ type: "error", text: "네트워크 오류로 저장하지 못했습니다." });
    } finally {
      setSavingAnthropic(false);
    }
  }

  async function handleClearAnthropicKey() {
    setSavingAnthropic(true);
    setAnthropicMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearApiKey: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnthropicMessage({ type: "error", text: data.error ?? "삭제에 실패했습니다." });
        return;
      }
      setAnthropicMessage({ type: "success", text: "API 키가 삭제되었습니다." });
      setStatus((prev) => (prev ? { ...prev, hasApiKey: false } : prev));
    } catch {
      setAnthropicMessage({ type: "error", text: "네트워크 오류로 삭제하지 못했습니다." });
    } finally {
      setSavingAnthropic(false);
    }
  }

  async function handleSaveGemini() {
    setSavingGemini(true);
    setGeminiMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: geminiKeyInput.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeminiMessage({ type: "error", text: data.error ?? "저장에 실패했습니다." });
        return;
      }
      setGeminiKeyInput("");
      setGeminiMessage({ type: "success", text: "설정이 저장되었습니다." });
      setStatus((prev) => (prev ? { ...prev, hasGeminiApiKey: true } : prev));
    } catch {
      setGeminiMessage({ type: "error", text: "네트워크 오류로 저장하지 못했습니다." });
    } finally {
      setSavingGemini(false);
    }
  }

  async function handleClearGeminiKey() {
    setSavingGemini(true);
    setGeminiMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearGeminiApiKey: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeminiMessage({ type: "error", text: data.error ?? "삭제에 실패했습니다." });
        return;
      }
      setGeminiMessage({ type: "success", text: "API 키가 삭제되었습니다." });
      setStatus((prev) => (prev ? { ...prev, hasGeminiApiKey: false } : prev));
    } catch {
      setGeminiMessage({ type: "error", text: "네트워크 오류로 삭제하지 못했습니다." });
    } finally {
      setSavingGemini(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">설정</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Anthropic (글 생성) */}
        <h3 className="mb-2 text-sm font-bold text-zinc-800">글 생성 (Claude)</h3>
        {status?.managedByEnv ? (
          <p className="mb-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            이 배포는 서버 환경변수(ANTHROPIC_API_KEY)로 API 키가 이미 설정되어
            있어요. 앱에서는 변경할 수 없습니다.
          </p>
        ) : (
          <>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
              Anthropic API 키
            </label>
            <p className="mb-2 text-xs text-zinc-400">
              {status?.hasApiKey
                ? "API 키가 저장되어 있어요. 바꾸려면 새 키를 입력하세요."
                : "console.anthropic.com에서 발급받은 API 키를 입력하세요."}
            </p>
            <div className="mb-4 flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-[#03C75A] focus:bg-white focus:ring-2 focus:ring-[#03C75A]/20"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0 rounded-xl border border-black/10 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50"
              >
                {showKey ? "숨기기" : "표시"}
              </button>
            </div>

            <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
              사용할 모델
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mb-4 w-full rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-[#03C75A] focus:bg-white focus:ring-2 focus:ring-[#03C75A]/20"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>

            {anthropicMessage && (
              <p
                className={`mb-4 text-sm ${
                  anthropicMessage.type === "success" ? "text-[#03C75A]" : "text-red-500"
                }`}
              >
                {anthropicMessage.text}
              </p>
            )}

            <div className="mb-6 flex gap-2">
              {status?.hasApiKey && (
                <button
                  type="button"
                  onClick={handleClearAnthropicKey}
                  disabled={savingAnthropic}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-50 disabled:opacity-50"
                >
                  키 삭제
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveAnthropic}
                disabled={savingAnthropic || (!apiKeyInput.trim() && !status?.hasApiKey)}
                className="flex-1 rounded-xl bg-[#03C75A] py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {savingAnthropic ? "저장 중..." : "저장"}
              </button>
            </div>
          </>
        )}

        {/* Gemini (썸네일 이미지 생성) */}
        <div className="border-t border-black/8 pt-5">
          <h3 className="mb-2 text-sm font-bold text-zinc-800">메인 썸네일 이미지 생성 (Gemini)</h3>
          {status?.geminiManagedByEnv ? (
            <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              이 배포는 서버 환경변수(GEMINI_API_KEY)로 API 키가 이미 설정되어
              있어요. 앱에서는 변경할 수 없습니다.
            </p>
          ) : (
            <>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                Gemini API 키
              </label>
              <p className="mb-2 text-xs text-zinc-400">
                {status?.hasGeminiApiKey
                  ? "API 키가 저장되어 있어요. 바꾸려면 새 키를 입력하세요."
                  : "aistudio.google.com에서 발급받은 API 키를 입력하면, 글 생성과 동시에 메인 썸네일 이미지도 자동으로 만들어져요. 비워두면 프롬프트 텍스트만 제공됩니다."}
              </p>
              <div className="mb-4 flex gap-2">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:border-[#03C75A] focus:bg-white focus:ring-2 focus:ring-[#03C75A]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey((v) => !v)}
                  className="shrink-0 rounded-xl border border-black/10 px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-50"
                >
                  {showGeminiKey ? "숨기기" : "표시"}
                </button>
              </div>

              {geminiMessage && (
                <p
                  className={`mb-4 text-sm ${
                    geminiMessage.type === "success" ? "text-[#03C75A]" : "text-red-500"
                  }`}
                >
                  {geminiMessage.text}
                </p>
              )}

              <div className="flex gap-2">
                {status?.hasGeminiApiKey && (
                  <button
                    type="button"
                    onClick={handleClearGeminiKey}
                    disabled={savingGemini}
                    className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    키 삭제
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveGemini}
                  disabled={savingGemini || (!geminiKeyInput.trim() && !status?.hasGeminiApiKey)}
                  className="flex-1 rounded-xl bg-[#03C75A] py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {savingGemini ? "저장 중..." : "저장"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
