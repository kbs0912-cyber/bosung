import type Anthropic from "@anthropic-ai/sdk";

export const OUTPUT_POST_TOOL: Anthropic.Tool = {
  name: "output_post",
  description:
    "0~7단계를 내부적으로 모두 마친 뒤, 5단계 최종 완성본과 7단계 메인 썸네일 프롬프트만 반환한다.",
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "2단계에서 내부적으로 선정한 최종 제목 (post의 첫 줄과 동일해야 함)",
      },
      post: {
        type: "string",
        description:
          "5단계(팩트체크·다듬기 완료) 최종본 그대로. 제목 → 소제목 → 본문 → 하단 해시태그 10개까지 포함한, 네이버 블로그에 바로 붙여넣을 수 있는 순수 텍스트. 마크다운 문법(굵게, #, - 등)은 사용하지 않는다.",
      },
      mainThumbnailPrompt: {
        type: "string",
        description:
          "7단계의 메인 썸네일(대표 이미지) 전용 영문 프롬프트 1개. 소제목별 썸네일은 포함하지 않는다. 1:1 정사각형 비율을 명시한다.",
      },
    },
    required: ["title", "post", "mainThumbnailPrompt"],
  },
};

// Anthropic server tool (executes on Anthropic's infrastructure — no client
// loop needed). Lets the model actually perform the guide's 1단계 실시간
// 검색 requirement instead of relying on memorized facts.
// max_uses is capped low — each search adds its own cost plus the fetched
// page content as input tokens, and 1단계 only needs a handful of queries.
export const WEB_SEARCH_TOOL = {
  type: "web_search_20260209",
  name: "web_search",
  max_uses: 4,
} as unknown as Anthropic.Tool;
