export type Category =
  | "자동차"
  | "IT"
  | "생활"
  | "여행"
  | "맛집"
  | "재테크"
  | "건강"
  | "쇼핑"
  | "기타";

export type Tone =
  | "정보형"
  | "후기형"
  | "비교형"
  | "뉴스형"
  | "추천형"
  | "궁금증 유발형";

export const CATEGORIES: Category[] = [
  "자동차",
  "IT",
  "생활",
  "여행",
  "맛집",
  "재테크",
  "건강",
  "쇼핑",
  "기타",
];

export const TONES: Tone[] = [
  "정보형",
  "후기형",
  "비교형",
  "뉴스형",
  "추천형",
  "궁금증 유발형",
];

export interface ImagePlan {
  index: number;
  position: string;
  description: string;
  prompt: string;
}

export interface ContentPackage {
  titles: string[];
  thumbnailPhrases: string[];
  body: string;
  images: ImagePlan[];
  hashtags: string[];
  homeClickPoints: string;
}

export type GenerateAction =
  | "generate"
  | "regenerate_titles"
  | "regenerate_body"
  | "more_provocative"
  | "more_professional"
  | "more_natural"
  | "shorten"
  | "lengthen"
  | "generate_images"
  | "generate_hashtags"
  | "regenerate_all";

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
  category: Category;
  tone: Tone;
  action: GenerateAction;
  current?: ContentPackage;
  customPrompts?: string[];
}
