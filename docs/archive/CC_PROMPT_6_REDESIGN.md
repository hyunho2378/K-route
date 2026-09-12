너는 이 세션의 오케스트레이터다. v3.1 리디자인 전체를 지휘한다. 직접 페이지 코드를 짜는 건 [존 A]와 최종 조립뿐이고, 존 B·C는 서브에이전트에 위임한다.

■ 시작 전 필수 (너와 모든 서브에이전트 공통)
아래 파일을 이 순서로 전부 읽는다: CLAUDE.md, DESIGN.md, tokens.js(문서 팩 루트의 v3.1 — client/src/tokens.js를 이 내용으로 갱신부터 해라), IA.md, ROUTES.md, COMPONENTS.md, PATTERNS.md, BRAND_COPY.md, LEGAL_COPY.md, PROGRESS.md, AGENTS.md. COMPONENTS.md "v3.1 리디자인 증분" 표와 PATTERNS.md "v3.1 신규 패턴"이 이번 작업의 명세다. 구 명세와 충돌하면 v3.1이 이긴다.

■ 절대 규칙
1. 파일 소유권 배타. 표 밖 파일을 쓰면 즉시 중단·보고.
2. src/data/api.js와 서버 코드는 아무도 수정 금지.
3. App.jsx·라우트 인덱스는 오케스트레이터 전용. 서브에이전트는 export 목록만 보고.
4. i18n: 존 A가 네임스페이스 분할을 먼저 끝낸다. 이후 B는 gate 네임스페이스 3언어 파일만, C는 loop·brand 네임스페이스 3언어 파일만 쓴다. common·legal은 A 전용. 이 분할이 병렬 무충돌의 전제다.
5. 금지 전면 유지: 하드코딩 hex/px, localStorage/sessionStorage, 이모지, TS, 화이트리스트 밖 scale, 그리고 v3.1 신규 금지인 줄표(—)·액센트 보더·네이티브 select·time input.

■ 파일 소유권
· 존 A(오케스트레이터 직접, 선행): tokens.js 갱신, tailwind.config 토큰 반영, src/i18n/** 전체(분할+th 신설+en·ko 이관), Header·Footer·LangMenu·FieldSelect·프리미티브 무보더 스윕, pages/Legal*.jsx, 전역 카피 스윕(줄표)·측정폭 해제
· 존 B(서브에이전트 GATE): pages/{Home,Gate,HandsFree}.jsx, components/{home,gate}/**, i18n */gate.js
· 존 C(서브에이전트 LOOP): pages/{Loop,LineDetail,Booking,Ticket,About}.jsx, Pilot.jsx 삭제, components/{map,loop,booking,brand}/**, i18n */{loop,brand}.js
· 최종 조립(오케스트레이터): App.jsx 라우트 갱신(ROUTES.md v3.1: /hands-free, /about, /legal/*, 리다이렉트 2개)

■ 실행 순서
[1] 존 A를 네가 직접, 전부 완료하고 검증한다: 무보더 grep 0건(PATTERNS §16), 줄표 grep 0건, en/ko/th 키 동형, LangMenu 동작, FieldSelect 시간 라벨이 en에서 영어인지, 푸터 새 탭 링크·법적 페이지 렌더, 헤더 액티브 primary·불투명. 커밋 [B1] feat: v3.1 foundation.
[2] 서브에이전트 GATE와 LOOP를 병렬로 띄운다. 각각에게 시작 전 필수 문서 목록과 자기 소유권·명세 위치(COMPONENTS v3.1 증분의 존 B/존 C 행, PATTERNS §11~§15, IA §2 해당 절, BRAND_COPY.md는 C만)를 명시해 지시한다. App.jsx 금지와 export 보고 의무 포함.
   · GATE 완료 조건: GateJourney 모드 전환·reduced-motion 정지, FieldSelect 3종 키보드 완주, HandsFree 2컬럼, Home 캐러셀 크로스페이드·도트.
   · LOOP 완료 조건: 3레이어 라인+draw-on, 셔틀 무자글거림(콘솔 rAF 확인), StopPopup, 글래스 라인 카드가 마진 안, LinePreviewOverlay에 금지 블록(Stories·캘린더·호스트·Reserve) 부재, StickyBookPanel 스크롤 동행, Booking 단일 페이지 왕복(Edit 복귀 쿼리 보존), About 11섹션이 BRAND_COPY.md와 문안 일치, /pilot 부재.
[3] 두 결과 수신 후 네가 App.jsx 라우트를 한 번에 갱신하고 소유권 위반 여부를 git status로 검증. 커밋 [B2] feat: gate zone, [B3] feat: loop zone 순차.
[4] 검수를 네가 직접: AGENTS.md CHECKLIST + v3.1 추가 검사(무보더·줄표·네이티브 select·max-w 텍스트캡·새 탭 rel, 뷰포트 320~3840에서 Loop 카드가 마진 안인지, 헤더 불투명). 위반은 위반값을 고친다. 커밋 [BR] fix: v3.1 review.

■ 종료 보고 (표)
각 존이 쓴 파일 목록(소유권 위반 0 증명) / grep 검사별 히트 수 / 완료 조건 통과표 / 잔존 PLACEHOLDER(hero 실사진 3장, 지표 실측, th 네이티브 검수 포함).

완료 후 PROGRESS.md 갱신하고 멈춰라. 서버 연동은 이번 범위가 아니다. 명세 밖 결정은 질문해라.
