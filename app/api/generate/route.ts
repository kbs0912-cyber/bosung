import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, getModel } from "@/lib/anthropic";
import { getApiKey } from "@/lib/config";
import { getCategorySystemPrompt } from "@/lib/systemPrompt";
import { OUTPUT_POST_TOOL, WEB_SEARCH_TOOL } from "@/lib/contentSchema";
import { ACTION_INSTRUCTIONS } from "@/lib/actions";
import { findCategory } from "@/lib/categories";
import {
  MAX_CUSTOM_PROMPTS,
  MAX_CUSTOM_PROMPT_LENGTH,
  type HomepanPost,
  type GenerateAction,
  type GenerateRequestBody,
} from "@/lib/types";

export const runtime = "nodejs"; // needs fs — do not use edge runtime
export const maxDuration = 300; // web search can chain several rounds before the final tool call

const VALID_ACTIONS: GenerateAction[] = [
  "generate",
  "regenerate_all",
  "more_provocative",
  "more_professional",
  "more_natural",
  "shorten",
  "lengthen",
  "regenerate_thumbnail",
];

function isHomepanPost(value: unknown): value is HomepanPost {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.post === "string" &&
    typeof v.mainThumbnailPrompt === "string"
  );
}

function sanitizeCustomPrompts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, MAX_CUSTOM_PROMPTS)
    .map((v) => v.trim().slice(0, MAX_CUSTOM_PROMPT_LENGTH));
}

function buildUserMessage(body: GenerateRequestBody): string {
  const instruction = ACTION_INSTRUCTIONS[body.action];
  const conditions = `주제어: ${body.keyword}`;
  const customPromptsBlock =
    body.customPrompts && body.customPrompts.length > 0
      ? `\n\n[사용자 커스텀 프롬프트]\n${body.customPrompts
          .map((p, i) => `${i + 1}. ${p}`)
          .join("\n")}`
      : "";

  if (body.action === "generate" || body.action === "regenerate_all" || !body.current) {
    return `${conditions}${customPromptsBlock}\n\n요청: ${instruction}`;
  }

  return `${conditions}${customPromptsBlock}\n\n기존 결과 (JSON):\n${JSON.stringify(
    body.current,
  )}\n\n요청: ${instruction}`;
}

export async function POST(req: NextRequest) {
  if (!getApiKey()) {
    return NextResponse.json(
      { error: "API 키가 설정되지 않았습니다. 오른쪽 위 '설정'에서 API 키를 입력해주세요." },
      { status: 500 },
    );
  }

  let body: Partial<GenerateRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { keyword, categoryId, action, current, customPrompts } = body;

  if (typeof keyword !== "string" || !keyword.trim()) {
    return NextResponse.json({ error: "주제어를 입력해주세요." }, { status: 400 });
  }
  const category = typeof categoryId === "string" ? findCategory(categoryId) : undefined;
  if (!category) {
    return NextResponse.json({ error: "카테고리를 선택해주세요." }, { status: 400 });
  }
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "알 수 없는 요청입니다." }, { status: 400 });
  }
  if (action !== "generate" && action !== "regenerate_all" && !isHomepanPost(current)) {
    return NextResponse.json(
      { error: "수정할 기존 결과가 없습니다. 먼저 콘텐츠를 생성해주세요." },
      { status: 400 },
    );
  }

  const requestBody: GenerateRequestBody = {
    keyword: keyword.trim(),
    categoryId: category.id,
    action,
    current: isHomepanPost(current) ? current : undefined,
    customPrompts: sanitizeCustomPrompts(customPrompts),
  };

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: getModel(),
      // The final post is ~1,000~1,500자 plus a short thumbnail prompt —
      // capped well below the default to keep a runaway response cheap.
      max_tokens: 8000,
      // Low effort trims reasoning-token spend the most. This is a writing
      // task, not a hard reasoning problem, so the accuracy loss vs. medium
      // is small relative to the token savings.
      output_config: { effort: "low" },
      // Cached: the per-category guide is 5~7만자 and byte-identical across
      // every action (제목 다시 만들기, 톤 조절, ...) within a category, so
      // caching it cuts repeat-click cost drastically (~90% off cached
      // input tokens instead of full price every time).
      system: [
        {
          type: "text",
          text: getCategorySystemPrompt(category.promptFile),
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [WEB_SEARCH_TOOL, OUTPUT_POST_TOOL],
      tool_choice: { type: "auto" },
      messages: [{ role: "user", content: buildUserMessage(requestBody) }],
    });

    const toolUseBlock = [...response.content]
      .reverse()
      .find(
        (b): b is Anthropic.ToolUseBlock =>
          b.type === "tool_use" && b.name === OUTPUT_POST_TOOL.name,
      );

    if (!toolUseBlock || !isHomepanPost(toolUseBlock.input)) {
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json({ post: toolUseBlock.input as HomepanPost });
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
    if (error instanceof Anthropic.APIConnectionError) {
      return NextResponse.json(
        { error: "AI 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요." },
        { status: 502 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error("[api/generate] Anthropic APIError:", error.status, error.message);
      if (error.status === 400 && /credit balance/i.test(error.message)) {
        return NextResponse.json(
          { error: "Anthropic 계정의 크레딧 잔액이 부족합니다. Plans & Billing에서 충전 후 다시 시도해주세요." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        {
          error: `AI 콘텐츠 생성 중 오류가 발생했습니다. (${error.status}) ${error.message}`,
        },
        { status: 502 },
      );
    }
    console.error("[api/generate] Unexpected error:", error);
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했습니다. 터미널 창에 표시된 오류 내용을 확인해주세요." },
      { status: 500 },
    );
  }
}
