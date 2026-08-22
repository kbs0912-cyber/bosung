import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, MODEL_ID } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs"; // needs fs — do not use edge runtime

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "서버에 API 키가 설정되지 않았습니다. 관리자에게 문의하세요." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "대화 내용이 비어 있습니다." }, { status: 400 });
  }
  if (messages.some((m) => typeof m.content !== "string" || !m.content.trim())) {
    return NextResponse.json({ error: "빈 메시지는 보낼 수 없습니다." }, { status: 400 });
  }

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 4096,
      system: getSystemPrompt(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );

    return NextResponse.json({
      message: { role: "assistant", content: textBlock?.text ?? "" } as ChatMessage,
    });
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
      return NextResponse.json(
        { error: "AI 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
