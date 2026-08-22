# 관계·커뮤니케이션 분석 AI

연인 관계에서의 대화, 행동, 상황을 입력하면 Claude가 `system_prompt.md`의 지침에 따라
관찰된 사실 / 가능한 해석 / 대안적 설명 / 의심 신호 수준(1~5) / 대화 제안을 분석해주는
간단한 채팅 웹앱입니다.

## 설치 및 실행 (Setup & Run)

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경 변수 설정

   ```bash
   cp .env.example .env.local
   # .env.local 파일을 열어 ANTHROPIC_API_KEY 값을 입력하세요.
   ```

3. 개발 서버 실행

   ```bash
   npm run dev
   ```

4. 브라우저에서 http://localhost:3000 접속

## 참고

- 대화 내용은 브라우저 새로고침 시 사라집니다 (서버 저장 없음, 세션 유지 없음).
- Claude 모델은 기본값 `claude-sonnet-5`이며, `.env.local`의 `CLAUDE_MODEL_ID`로 변경 가능합니다.
- API 키는 서버에서만 사용되며 브라우저로 전달되지 않습니다.
