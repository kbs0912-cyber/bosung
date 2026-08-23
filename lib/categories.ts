export interface CategoryDef {
  id: string;
  label: string;
  promptFile: string;
}

// Each promptFile is a full "0~7단계" 네이버 블로그 홈판 작성 가이드 (user-supplied),
// loaded as the system prompt for that category. See lib/systemPrompt.ts for how
// it's wrapped for single-call, non-interactive use.
export const CATEGORIES: CategoryDef[] = [
  { id: "zisik-gyoyang", label: "지식·교양", promptFile: "zisik-gyoyang.md" },
  { id: "it-auto", label: "IT·자동차", promptFile: "it-auto.md" },
  { id: "health", label: "건강 상식", promptFile: "health.md" },
  { id: "living", label: "리빙 라이프", promptFile: "living.md" },
  { id: "broadcast-issue", label: "방송 이슈", promptFile: "broadcast-issue.md" },
  { id: "sports", label: "스포츠", promptFile: "sports.md" },
  { id: "celeb-gossip", label: "연예인 가십", promptFile: "celeb-gossip.md" },
  { id: "celeb-fashion", label: "연예인 패션", promptFile: "celeb-fashion.md" },
  { id: "finance", label: "재테크 라이프", promptFile: "finance.md" },
];

export function findCategory(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
