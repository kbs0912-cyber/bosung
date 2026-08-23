import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 딸깍 블로그 — 키워드 하나로 홈판용 글 완성",
  description:
    "제목부터 본문, 이미지 프롬프트, 해시태그까지 AI가 한 번에 만들어드립니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
