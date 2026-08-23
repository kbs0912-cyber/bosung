import { NextRequest, NextResponse } from "next/server";
import { generateThumbnailImage, GeminiImageError } from "@/lib/gemini";
import { getGeminiApiKey } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (!getGeminiApiKey()) {
    return NextResponse.json(
      { error: "이미지 생성용 Gemini API 키가 설정되지 않았습니다. '설정'에서 입력해주세요." },
      { status: 500 },
    );
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "이미지 프롬프트가 없습니다." }, { status: 400 });
  }

  try {
    const image = await generateThumbnailImage(body.prompt.trim());
    return NextResponse.json({
      imageDataUrl: `data:${image.mimeType};base64,${image.base64}`,
    });
  } catch (error) {
    if (error instanceof GeminiImageError) {
      const status = error.status === 401 || error.status === 403 ? 500 : 502;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "이미지 생성 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
