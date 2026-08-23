import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_MODEL,
  getModelId,
  isApiKeyManagedByEnv,
  readConfig,
  writeConfig,
} from "@/lib/config";

export const runtime = "nodejs"; // needs fs — do not use edge runtime

export async function GET() {
  const managedByEnv = isApiKeyManagedByEnv();
  const fileConfig = readConfig();

  return NextResponse.json({
    hasApiKey: managedByEnv || Boolean(fileConfig.apiKey),
    managedByEnv,
    modelId: getModelId(),
    defaultModel: DEFAULT_MODEL,
  });
}

export async function POST(req: NextRequest) {
  if (isApiKeyManagedByEnv()) {
    return NextResponse.json(
      {
        error:
          "서버 환경변수(ANTHROPIC_API_KEY)로 이미 설정되어 있어 앱에서 변경할 수 없습니다.",
      },
      { status: 409 },
    );
  }

  let body: { apiKey?: string; modelId?: string; clearApiKey?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const current = readConfig();
  const next = { ...current };

  if (body.clearApiKey) {
    next.apiKey = undefined;
  } else if (typeof body.apiKey === "string" && body.apiKey.trim()) {
    next.apiKey = body.apiKey.trim();
  }

  if (typeof body.modelId === "string") {
    next.modelId = body.modelId.trim() || undefined;
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
