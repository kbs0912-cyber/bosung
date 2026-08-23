import type { GenerateAction } from "@/lib/types";

export const ACTION_LABELS: Record<GenerateAction, string> = {
  generate: "AI 딸깍 생성",
  regenerate_all: "전체 다시 생성",
  more_provocative: "더 자극적으로",
  more_professional: "더 전문적으로",
  more_natural: "더 자연스럽게",
  shorten: "짧게 만들기",
  lengthen: "길게 만들기",
  regenerate_thumbnail: "메인 썸네일 다시 만들기",
};

export const ACTION_INSTRUCTIONS: Record<GenerateAction, string> = {
  generate:
    "0단계부터 5단계까지 내부적으로 모두 수행한 뒤, 5단계 최종본과 7단계 메인 썸네일 프롬프트를 새로 생성해줘.",
  regenerate_all:
    "기존 결과는 참고하지 말고 0단계부터 다시 전체를 새로 생성해줘 (제목, 본문, 메인 썸네일 프롬프트 모두 새로).",
  more_provocative:
    "title과 post의 톤을 더 자극적이고 임팩트 있게 바꿔줘. 단, 낚시성·허위 정보 금지 원칙은 계속 지켜줘. mainThumbnailPrompt는 기존 값을 유지해줘.",
  more_professional:
    "title과 post의 톤을 더 전문적이고 신뢰도 있게 바꿔줘. mainThumbnailPrompt는 기존 값을 유지해줘.",
  more_natural:
    "title과 post를 더 사람이 직접 쓴 듯 자연스러운 블로거 말투로 다듬어줘. mainThumbnailPrompt는 기존 값을 유지해줘.",
  shorten:
    "post 분량을 5단계 글자수 기준의 하한 쪽으로 더 짧고 간결하게 줄여줘 (핵심 정보와 결론은 보존). title과 mainThumbnailPrompt는 기존 값을 유지해줘.",
  lengthen:
    "post 분량을 5단계 글자수 기준의 상한 쪽으로 더 풍부하게 늘려줘 (사례·설명 보강). title과 mainThumbnailPrompt는 기존 값을 유지해줘.",
  regenerate_thumbnail:
    "7단계 메인 썸네일 프롬프트만 새로 구성해줘. title과 post는 기존 값을 그대로 유지해줘.",
};
