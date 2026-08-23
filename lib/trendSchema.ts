import type Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES } from "@/lib/categories";

export const TREND_PARSE_TOOL: Anthropic.Tool = {
  name: "output_trend_keywords",
  description:
    "네이버 크리에이터 어드바이저의 검색 유입 트렌드 스크린샷에서 순위 목록의 키워드를 순서대로 추출한다.",
  input_schema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        description:
          "화면에 보이는 순서(위→아래, 즉 순위 순서) 그대로 추출한 키워드 목록. 순위 변동 화살표(▲▼), 숫자, 'new' 배지는 제외하고 키워드 텍스트만 담는다. 여러 카테고리 섹션이 함께 보이면 화면에 나온 순서를 그대로 유지해 최대 10개까지 담는다.",
        items: { type: "string" },
        minItems: 1,
        maxItems: 10,
      },
      suggestedCategoryId: {
        type: "string",
        description: `이 트렌드 목록의 주제와 가장 가까운 카테고리 ID 하나를 다음 중에서 고른다: ${CATEGORIES.map(
          (c) => `${c.id}(${c.label})`,
        ).join(", ")}. 여러 주제가 섞여 있거나 애매하면 이 필드는 생략한다.`,
      },
    },
    required: ["keywords"],
  },
};
