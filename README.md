# AI 딸깍 블로그

키워드 하나만 입력하면 네이버 블로그 **홈판(메인 피드)** 노출을 겨냥한 콘텐츠 패키지를
AI가 한 번에 만들어주는 서비스입니다. 제목 5개, 대표 문구 3개, 완성형 본문, 이미지 생성
프롬프트, 해시태그, 홈판 클릭 포인트까지 한 화면에서 생성 → 확인 → 복사까지 이어집니다.

이 도구는 클릭률·가독성·콘텐츠 품질·체류 가능성을 높이는 데 도움을 주는 **콘텐츠 제작
보조 도구**이며, 홈판 노출이나 상위 노출을 보장하지 않습니다.

## 주요 기능

- 키워드 + 카테고리(9종) + 글 분위기(6종) 선택만으로 콘텐츠 패키지 생성
- 제목/본문/이미지 프롬프트/해시태그별 개별 재생성
- 톤 조절: 더 자극적으로 / 더 전문적으로 / 더 자연스럽게 / 짧게 / 길게
- 전체 다시 생성, 항목별 복사, 전체 복사, 초기화
- 모바일 우선 반응형 UI, 로딩 상태 표시, 오류 안내
- **Windows 데스크톱 앱**: 앱 내 "⚙ 설정" 화면에서 API 키를 입력해 로컬 PC에 저장 (`.env` 파일 편집 불필요)

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

## Windows 데스크톱 앱 (Electron)

이 프로젝트는 Next.js 웹 서비스를 Electron으로 감싸서 Windows용 설치 파일(.exe)로도
배포할 수 있게 구성되어 있습니다. API 키는 `.env` 파일 대신 앱 안의 **⚙ 설정** 화면에서
입력하며, PC의 사용자 데이터 폴더(`%APPDATA%\AI 딸깍 블로그`)에 저장됩니다.

### 개발 중 Electron 창으로 실행

```bash
npm install
npm run electron:dev
```

`next dev`가 백그라운드에서 실행되고, 그 화면을 띄운 Electron 창이 함께 열립니다.

### Windows 설치 파일(.exe) 빌드

> **반드시 Windows PC(또는 Windows 러너가 있는 CI)에서 실행하세요.** macOS/Linux에서도
> `wine`이 설치되어 있으면 크로스 빌드가 가능하지만, 가장 안정적인 방법은 실제 Windows
> 환경에서 빌드하는 것입니다.

```bash
npm install
npm run dist:win
```

- `npm run electron:build`가 먼저 `next build`를 standalone 모드로 실행해서
  `.next/standalone`에 최소 서버 번들을 만들고,
- 이어서 `electron-builder`가 그 서버 + Electron 셸을 묶어 `release/` 폴더에
  NSIS 설치 파일(`AI 딸깍 블로그 Setup x.x.x.exe`)과 포터블 실행 파일을 생성합니다.

빌드된 앱을 실행하면 내부적으로 로컬 포트(기본 4173)에서 Next.js 서버가 함께 뜨고,
Electron 창이 그 화면을 표시합니다. 최초 실행 시 **⚙ 설정**에서 Anthropic API 키를
입력하면 바로 사용할 수 있습니다.

### 배포용 환경변수로 API 키를 고정하고 싶다면

사내 배포처럼 관리자가 API 키를 미리 고정하고 싶다면, 빌드 전에 `ANTHROPIC_API_KEY`
환경변수를 설정해두면 됩니다. 이 경우 앱의 설정 화면은 읽기 전용으로 바뀌고
("서버 환경변수로 이미 설정되어 있어 변경할 수 없습니다"), 사용자가 키를 바꿀 수 없습니다.

## 구조

- `system_prompt.md` — 콘텐츠 생성 시스템 프롬프트(제목/본문/이미지/해시태그 작성 규칙)
- `lib/contentSchema.ts` — Claude 도구 호출(tool use)용 콘텐츠 패키지 JSON 스키마
- `lib/actions.ts` — "제목 다시 만들기", "더 자극적으로" 등 각 액션의 지시문
- `app/api/generate/route.ts` — 생성/재생성 요청을 처리하는 API 라우트
- `app/api/settings/route.ts` — 설정 화면에서 API 키/모델을 저장·조회하는 API 라우트
- `lib/config.ts` — API 키/모델을 환경변수 또는 로컬 설정 파일에서 읽고 쓰는 로직
- `components/ContentStudio.tsx` — 입력 → 생성 → 결과 확인 전체 플로우를 관리하는 메인 컴포넌트
- `components/SettingsModal.tsx` — API 키/모델 설정 화면
- `electron/main.js` — Windows 데스크톱 앱의 Electron 진입점

## 참고

- API 키는 서버(또는 데스크톱 앱의 로컬 프로세스)에서만 사용되며 브라우저로 전달되지 않습니다.
- Claude 모델은 기본값 `claude-sonnet-5`이며, 웹 배포에서는 `.env.local`의
  `CLAUDE_MODEL_ID`로, 데스크톱 앱에서는 설정 화면에서 변경할 수 있습니다.
- 생성 결과는 브라우저 새로고침 시 사라집니다 (서버 저장 없음).
