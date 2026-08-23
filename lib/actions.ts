import type { GenerateAction } from "@/lib/types";

export const ACTION_LABELS: Record<GenerateAction, string> = {
  generate: "AI 딸깍 생성",
  regenerate_titles: "제목 다시 만들기",
  regenerate_body: "본문 다시 만들기",
  more_provocative: "더 자극적으로",
  more_professional: "더 전문적으로",
  more_natural: "더 자연스럽게",
  shorten: "짧게 만들기",
  lengthen: "길게 만들기",
  generate_images: "이미지 프롬프트 만들기",
  generate_hashtags: "해시태그 만들기",
  regenerate_all: "전체 다시 생성",
};

export const ACTION_INSTRUCTIONS: Record<GenerateAction, string> = {
  generate: "새 콘텐츠 패키지를 처음부터 생성해줘.",
  regenerate_titles:
    "제목 5개만 새로운 각도로 다시 만들어줘. 대표 문구, 본문, 이미지 기획, 해시태그, 홈판 클릭 포인트는 기존 값을 그대로 유지해줘.",
  regenerate_body:
    "본문만 새로운 흐름으로 다시 작성해줘. 제목, 대표 문구, 이미지 기획, 해시태그, 홈판 클릭 포인트는 기존 값을 그대로 유지해줘.",
  more_provocative:
    "제목과 본문의 톤을 더 자극적이고 임팩트 있게 바꿔줘. 단, 낚시성 표현 금지 원칙과 사실 왜곡 금지 원칙은 계속 지켜줘. 나머지 항목은 기존 값을 유지해줘.",
  more_professional:
    "제목과 본문의 톤을 더 전문적이고 신뢰도 있게 바꿔줘. 나머지 항목은 기존 값을 유지해줘.",
  more_natural:
    "제목과 본문을 더 사람이 직접 쓴 듯 자연스러운 말투로 다듬어줘. 나머지 항목은 기존 값을 유지해줘.",
  shorten:
    "본문 분량을 더 짧고 간결하게 줄여줘 (핵심만 남기기). 나머지 항목은 기존 값을 유지해줘.",
  lengthen:
    "본문 분량을 더 풍부하게 늘려줘 (사례, 설명을 보강). 나머지 항목은 기존 값을 유지해줘.",
  generate_images:
    "이미지 기획만 본문 흐름에 맞춰 새로 구성해줘. 나머지 항목은 기존 값을 유지해줘.",
  generate_hashtags:
    "해시태그만 새로 구성해줘. 나머지 항목은 기존 값을 유지해줘.",
  regenerate_all:
    "기존 내용은 참고하지 말고 콘텐츠 패키지 전체를 처음부터 새로 생성해줘.",
};
