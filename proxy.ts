import { NextRequest, NextResponse } from "next/server";

// Simple shared-password gate for a public web deployment (e.g. sharing a
// link with a handful of friends). Only activates when APP_ACCESS_PASSWORD
// is set — local dev and the packaged Windows (Electron) app never set it,
// so this is a no-op there. Any username works; only the password matters.
export function proxy(req: NextRequest) {
  const password = process.env.APP_ACCESS_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const suppliedPassword = decoded.slice(decoded.indexOf(":") + 1);
    if (suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("이 사이트는 비밀번호로 보호되어 있습니다.", {
    status: 401,
    // HTTP header values must be ASCII — the realm can't contain Korean text.
    headers: { "WWW-Authenticate": 'Basic realm="AI Ddalkkak Blog"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
