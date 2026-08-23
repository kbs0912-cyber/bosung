// Completed post ready to paste into Naver Blog, plus the single main
// thumbnail prompt (7단계). This is intentionally the *default, collapsed*
// output of the 0~7단계 category guides in prompts/*.md — sub-thumbnails,
// the 6단계 실사 이미지 프롬프트, and the raw 30-title list are generated
// internally by the model but never surfaced.
export interface HomepanPost {
  title: string;
  post: string;
  mainThumbnailPrompt: string;
}

export type GenerateAction =
  | "generate"
  | "regenerate_all"
  | "more_provocative"
  | "more_professional"
  | "more_natural"
  | "shorten"
  | "lengthen"
  | "regenerate_thumbnail";

export interface CustomPrompt {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

export const MAX_CUSTOM_PROMPTS = 20;
export const MAX_CUSTOM_PROMPT_LENGTH = 4000;

export interface GenerateRequestBody {
  keyword: string;
  categoryId: string;
  action: GenerateAction;
  current?: HomepanPost;
  customPrompts?: string[];
}
