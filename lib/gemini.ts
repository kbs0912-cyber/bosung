import { getGeminiApiKey, getGeminiImageModel } from "@/lib/config";

export interface GeminiImageResult {
  mimeType: string;
  base64: string;
}

export class GeminiImageError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GeminiImageError";
    this.status = status;
  }
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

// Raw HTTP call to the Gemini API (generativelanguage.googleapis.com) — no
// SDK dependency needed for a single request/response image generation call.
export async function generateThumbnailImage(prompt: string): Promise<GeminiImageResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiImageError("Gemini API 키가 설정되지 않았습니다.");
  }

  const model = getGeminiImageModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    let message = `Gemini 이미지 생성 요청이 실패했습니다 (HTTP ${res.status}).`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string } };
      if (errBody.error?.message) message = errBody.error.message;
    } catch {
      // response body wasn't JSON — keep the default message
    }
    throw new GeminiImageError(message, res.status);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] } }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart?.inlineData) {
    throw new GeminiImageError(
      "Gemini가 이미지를 생성하지 못했습니다. 프롬프트를 조정해 다시 시도해주세요.",
    );
  }

  return { mimeType: imagePart.inlineData.mimeType, base64: imagePart.inlineData.data };
}
