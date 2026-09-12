아래 작업을 순서대로 실행해라.
세션 시작. 작업 전 아래 파일을 순서대로 전부 읽어라.
1. CLAUDE.md
2. DESIGN.md
3. src/tokens.js (아직 없으면 레포 루트의 tokens.js를 읽어라)
4. IA.md
5. ROUTES.md
6. COMPONENTS.md
7. PATTERNS.md
8. PROGRESS.md
9. AGENTS.md

[세션 정체성] 너는 PHASE 0 — SETUP 에이전트다. 스캐폴드만 만든다. 컴포넌트 구현은 이 세션의 범위가 아니다.

[작업]
1. `client/` 생성: Vite + React **18** + JavaScript(JSX) 프로젝트.
   - 의존성 버전 고정: `react@18.3.1 react-dom@18.3.1 react-router-dom@6 lucide-react maplibre-gl@^5`
   - devDependencies: `tailwindcss@3.4 postcss autoprefixer` — **Tailwind 4 금지** (tokens.js를 import하는 tailwind.config.js 방식은 3.x 기준이다).
   - Vite 템플릿이 React 19를 깔면 18.3.1로 다운그레이드해라.
2. 레포 루트의 `tokens.js`를 `client/src/tokens.js`로 복사.
3. `client/tailwind.config.js`: tokens.js를 import해서 colors / fontFamily / fontSize / spacing / screens(sm~3xl) / borderRadius / boxShadow / zIndex / transitionTimingFunction을 전부 토큰에서 생성. 임의 값 추가 금지.
4. `client/index.html`:
   - lang="en", title "Bomnae Helper"
   - 폰트: preconnect + Kanit(Google Fonts, 300;400;500;600;700) + Pretendard Variable(jsDelivr dynamic-subset css)
5. `client/src/index.css`: @tailwind 3줄 + 베이스(배경 bg, 텍스트 ink, 폰트 body 스택, `-webkit-font-smoothing`) + `prefers-reduced-motion` 전역 처리 + focus-visible 기본 스타일. 그 외 커스텀 CSS 금지.
6. 디렉토리 스캐폴드(빈 폴더 + .gitkeep): `client/src/{i18n,context,data,pages,components/{layout,nav,ui,home,gate,map,loop,booking}}`, `client/public/images/{crew,stops,illustrations}`, `server/`
7. `server/`: `npm init -y` + `express pg cookie-parser cors dotenv` 설치만. `server/index.js`는 헬스체크 1개(`GET /api/health`)만 있는 최소 부트스트랩.
8. `.gitignore`(node_modules, dist, .env), `.env.example`(DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, CLIENT_ORIGIN).
9. 검증: `client` dev 서버 기동 → 순백 배경 + tokens 폰트가 적용된 "Bomnae Helper" h1 한 줄이 뜨는지 확인. `server` 기동 → /api/health 200 확인.

[금지] TypeScript 파일 생성 금지. 명세에 없는 라이브러리 설치 금지. 페이지·컴포넌트 구현 금지(그건 PHASE 1).

완료 후 PROGRESS.md 갱신, 커밋 제안([A0] chore: 프로젝트 스캐폴드) 후 멈춰라. 다음 프롬프트를 스스로 이어서 실행하지 마라. 명세 밖 결정은 질문해라.
