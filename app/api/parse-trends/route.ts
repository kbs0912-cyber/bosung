import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, getModel } from "@/lib/anthropic";
import { getApiKey } from "@/lib/config";
import { TREND_PARSE_TOOL } from "@/lib/trendSchema";
import { findCategory } from "@/lib/categories";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — generous for a screenshot
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

function isAllowedMimeType(value: unknown): value is AllowedMimeType {
  return typeof value === "string" && (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export async function POST(req: NextRequest) {
  if (!getApiKey()) {
    return NextResponse.json(
      { error: "API 키가 설정되지 않았습니다. 오른쪽 위 '설정'에서 API 키를 입력해주세요." },
      { status: 500 },
    );
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  if (typeof imageBase64 !== "string" || !imageBase64) {
    return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
  }
  if (!isAllowedMimeType(mimeType)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식입니다. (PNG/JPEG/WEBP/GIF만 가능)" },
      { status: 400 },
    );
  }
  // base64 is ~4/3 the size of the raw bytes
  if (imageBase64.length > (MAX_IMAGE_BYTES * 4) / 3) {
    return NextResponse.json(
      { error: "이미지 용량이 너무 큽니다. 8MB 이하 스크린샷으로 다시 시도해주세요." },
      { status: 400 },
    );
  }

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: getModel(),
      max_tokens: 1024,
      system:
        "너는 네이버 크리에이터 어드바이저의 '검색 유입 트렌드' 화면 스크린샷에서 순위 목록을 읽어내는 도구다. 화면에 보이는 순서(위에서 아래) 그대로 키워드만 최대 10개 추출한다. 순위 변동 화살표, 숫자, 'new' 배지는 무시한다. 반드시 output_trend_keywords 도구를 정확히 한 번 호출해서 반환한다.",
      tools: [TREND_PARSE_TOOL],
      tool_choice: { type: "tool", name: TREND_PARSE_TOOL.name },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            { type: "text", text: "이 화면에서 순위 상위 10개 키워드를 순서대로 추출해줘." },
          ],
        },
      ],
    });

    const toolUseBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock =>
        b.type === "tool_use" && b.name === TREND_PARSE_TOOL.name,
    );

    const input = toolUseBlock?.input as
      | { keywords?: unknown; suggestedCategoryId?: unknown }
      | undefined;
    const keywords = Array.isArray(input?.keywords)
      ? input.keywords
          .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
          .slice(0, 10)
      : [];

    if (keywords.length === 0) {
      return NextResponse.json(
        {
          error:
            "이미지에서 키워드를 읽어내지 못했습니다. 목록이 잘 보이는 스크린샷으로 다시 시도해주세요.",
        },
        { status: 502 },
      );
    }

    const suggestedCategoryId =
      typeof input?.suggestedCategoryId === "string" && findCategory(input.suggestedCategoryId)
        ? input.suggestedCategoryId
        : undefined;

    return NextResponse.json({ keywords, suggestedCategoryId });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API 인증에 실패했습니다. '설정'에서 API 키가 올바른지 확인해주세요." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "요청이 많아 일시적으로 제한되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error("[api/parse-trends] Anthropic APIError:", error.status, error.message);
      return NextResponse.json(
        { error: `이미지 분석 중 오류가 발생했습니다. (${error.status}) ${error.message}` },
        { status: 502 },
      );
    }
    console.error("[api/parse-trends] Unexpected error:", error);
    return NextResponse.json({ error: "알 수 없는 오류가 발생했습니다." }, { status: 500 });
  }
}
