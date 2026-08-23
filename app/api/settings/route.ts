import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_MODEL,
  getModelId,
  isApiKeyManagedByEnv,
  isGeminiApiKeyManagedByEnv,
  readConfig,
  writeConfig,
} from "@/lib/config";

export const runtime = "nodejs"; // needs fs — do not use edge runtime

export async function GET() {
  const managedByEnv = isApiKeyManagedByEnv();
  const geminiManagedByEnv = isGeminiApiKeyManagedByEnv();
  const fileConfig = readConfig();

  return NextResponse.json({
    hasApiKey: managedByEnv || Boolean(fileConfig.apiKey),
    managedByEnv,
    modelId: getModelId(),
    defaultModel: DEFAULT_MODEL,
    hasGeminiApiKey: geminiManagedByEnv || Boolean(fileConfig.geminiApiKey),
    geminiManagedByEnv,
  });
}

export async function POST(req: NextRequest) {
  let body: {
    apiKey?: string;
    clearApiKey?: boolean;
    modelId?: string;
    geminiApiKey?: string;
    clearGeminiApiKey?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const current = readConfig();
  const next = { ...current };
  const errors: string[] = [];

  if (body.clearApiKey || (typeof body.apiKey === "string" && body.apiKey.trim())) {
    if (isApiKeyManagedByEnv()) {
      errors.push("Anthropic API 키는 서버 환경변수로 고정되어 있어 앱에서 변경할 수 없습니다.");
    } else if (body.clearApiKey) {
      next.apiKey = undefined;
    } else if (typeof body.apiKey === "string") {
      next.apiKey = body.apiKey.trim();
    }
  }

  if (typeof body.modelId === "string") {
    next.modelId = body.modelId.trim() || undefined;
  }

  if (
    body.clearGeminiApiKey ||
    (typeof body.geminiApiKey === "string" && body.geminiApiKey.trim())
  ) {
    if (isGeminiApiKeyManagedByEnv()) {
      errors.push("Gemini API 키는 서버 환경변수로 고정되어 있어 앱에서 변경할 수 없습니다.");
    } else if (body.clearGeminiApiKey) {
      next.geminiApiKey = undefined;
    } else if (typeof body.geminiApiKey === "string") {
      next.geminiApiKey = body.geminiApiKey.trim();
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 409 });
  }

  try {
    writeConfig(next);
  } catch {
    return NextResponse.json(
      {
        error:
          "설정을 저장하지 못했습니다. 이 배포 환경에서는 파일 저장이 제한될 수 있습니다.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
