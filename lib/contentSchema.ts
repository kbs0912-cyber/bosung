import type Anthropic from "@anthropic-ai/sdk";

export const CONTENT_PACKAGE_TOOL: Anthropic.Tool = {
  name: "output_content_package",
  description:
    "네이버 블로그 홈판용 콘텐츠 패키지를 구조화된 형태로 반환한다.",
  input_schema: {
    type: "object",
    properties: {
      titles: {
        type: "array",
        description: "클릭을 유도하는 제목 5개",
        items: { type: "string" },
        minItems: 5,
        maxItems: 5,
      },
      thumbnailPhrases: {
        type: "array",
        description: "썸네일용 짧은 대표 문구 3개",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
      body: {
        type: "string",
        description: "네이버 블로그에 바로 붙여넣을 수 있는 완성형 본문 (마크다운 소제목 ## 포함)",
      },
      images: {
        type: "array",
        description: "본문 흐름에 맞춘 이미지 기획 3~6개",
        items: {
          type: "object",
          properties: {
            index: { type: "integer" },
            position: { type: "string" },
            description: { type: "string" },
            prompt: { type: "string", description: "영어로 작성된 AI 이미지 생성 프롬프트" },
          },
          required: ["index", "position", "description", "prompt"],
        },
        minItems: 3,
        maxItems: 6,
      },
      hashtags: {
        type: "array",
        description: "관련 해시태그 10~20개 (# 기호 제외)",
        items: { type: "string" },
        minItems: 10,
        maxItems: 20,
      },
      homeClickPoints: {
        type: "string",
        description: "이 글이 어떤 독자의 관심을 끌 수 있는지에 대한 2~4문장 설명",
      },
    },
    required: [
      "titles",
      "thumbnailPhrases",
      "body",
      "images",
      "hashtags",
      "homeClickPoints",
    ],
  },
};
