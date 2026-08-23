"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "복사",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 rounded-full border border-[#03C75A]/30 bg-[#03C75A]/5 px-3 py-1 text-xs font-medium text-[#03C75A] transition hover:bg-[#03C75A]/10 active:scale-95 ${className}`}
    >
      {copied ? "복사됨!" : label}
    </button>
  );
}
