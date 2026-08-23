import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, MODEL_ID } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { CONTENT_PACKAGE_TOOL } from "@/lib/contentSchema";
import { ACTION_INSTRUCTIONS } from "@/lib/actions";
import {
  CATEGORIES,
  TONES,
  type ContentPackage,
  type GenerateAction,
  type GenerateRequestBody,
} from "@/lib/types";

export const runtime = "nodejs"; // needs fs — do not use edge runtime

const VALID_ACTIONS: GenerateAction[] = [
  "generate",
  "regenerate_titles",
  "regenerate_body",
  "more_provocative",
  "more_professional",
  "more_natural",
  "shorten",
  "lengthen",
  "generate_images",
  "generate_hashtags",
  "regenerate_all",
];

function isContentPackage(value: unknown): value is ContentPackage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.titles) &&
    Array.isArray(v.thumbnailPhrases) &&
    typeof v.body === "string" &&
    Array.isArray(v.images) &&
    Array.isArray(v.hashtags) &&
    typeof v.homeClickPoints === "string"
  );
}

function buildUserMessage(body: GenerateRequestBody): string {
  const instruction = ACTION_INSTRUCTIONS[body.action];
  const conditions = `키워드: ${body.keyword}\n카테고리: ${body.category}\n글 분위기: ${body.tone}`;

  if (body.action === "generate" || !body.current) {
    return `${conditions}\n\n요청: ${instruction}`;
  }

  return `${conditions}\n\n기존 콘텐츠 패키지 (JSON):\n${JSON.stringify(
    body.current,
  )}\n\n요청: ${instruction}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "서버에 API 키가 설정되지 않았습니다. 관리자에게 문의하세요." },
      { status: 500 },
    );
  }

  let body: Partial<GenerateRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { keyword, category, tone, action, current } = body;

  if (typeof keyword !== "string" || !keyword.trim()) {
    return NextResponse.json({ error: "키워드를 입력해주세요." }, { status: 400 });
  }
  if (!category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "카테고리를 선택해주세요." }, { status: 400 });
  }
  if (!tone || !TONES.includes(tone)) {
    return NextResponse.json({ error: "글 분위기를 선택해주세요." }, { status: 400 });
  }
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "알 수 없는 요청입니다." }, { status: 400 });
  }
  if (action !== "generate" && action !== "regenerate_all" && !isContentPackage(current)) {
    return NextResponse.json(
      { error: "수정할 기존 콘텐츠가 없습니다. 먼저 콘텐츠를 생성해주세요." },
      { status: 400 },
    );
  }

  const requestBody: GenerateRequestBody = {
    keyword: keyword.trim(),
    category,
    tone,
    action,
    current: isContentPackage(current) ? current : undefined,
  };

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 8192,
      system: getSystemPrompt(),
      tools: [CONTENT_PACKAGE_TOOL],
      tool_choice: { type: "tool", name: CONTENT_PACKAGE_TOOL.name },
      messages: [{ role: "user", content: buildUserMessage(requestBody) }],
    });

    const toolUseBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (!toolUseBlock || !isContentPackage(toolUseBlock.input)) {
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json({ package: toolUseBlock.input as ContentPackage });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API 인증에 실패했습니다. 서버 설정을 확인하세요." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "요청이 많아 일시적으로 제한되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return NextResponse.json(
        { error: "AI 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요." },
        { status: 502 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      if (error.status === 400 && /credit balance/i.test(error.message)) {
        return NextResponse.json(
          { error: "Anthropic 계정의 크레딧 잔액이 부족합니다. Plans & Billing에서 충전 후 다시 시도해주세요." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: "AI 콘텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
