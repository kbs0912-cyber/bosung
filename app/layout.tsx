import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "관계·커뮤니케이션 분석 AI",
  description: "연인 관계에서의 대화 패턴을 분석해드립니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
