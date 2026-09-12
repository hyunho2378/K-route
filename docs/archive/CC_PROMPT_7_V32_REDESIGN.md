너는 이 세션의 오케스트레이터다. v3.2 리디자인(2차 크리틱)을 지휘한다.

■ 시작 전 필수 (너와 모든 서브에이전트 공통)
이 순서로 전부 읽어라: CLAUDE.md, DESIGN.md(특히 §16 v3.2), tokens.js(문서 팩 루트 v3.2 — client/src/tokens.js 동기화가 첫 작업), IA.md(특히 §8), ROUTES.md, COMPONENTS.md(v3.2 증분 표), PATTERNS.md(§19~§27), BRAND_COPY.md, LEGAL_COPY.md, PROGRESS.md, AGENTS.md. 구 명세와 충돌하면 v3.2가 이긴다.

■ 절대 규칙 (v3.1 규칙 전부 유지 + 추가)
1. 파일 소유권 배타(아래 표). App.jsx·라우트는 오케스트레이터 전용. src/data/api.js·서버 수정 금지(단, 이번에 라우트 신설 없음 — /loop/ar은 존 D2 프롬프트 몫이므로 이번 세션에서 만들지 마라).
2. i18n: 존 A2가 표시명 교체·공용 키를 먼저 끝낸다. B2는 gate 네임스페이스만, C2는 loop 네임스페이스만.
3. 신규 금지 목록: 회색 텍스트(inkMeta는 12~13px 캡션만), Light 웨이트, 파스텔·soft·알파 틴트 면, 라인 아이콘 배지, 네이티브 date/select, 스텝 뒤에 가격·잔여석 숨기기.
4. 언어 동형: en/ko/th 어떤 언어에서도 레이아웃·요소 위치 동일. 언어별 분기 금지.
5. AR·locar.js·three 설치는 이 세션에서 금지(존 D2 별도 세션).

■ 파일 소유권
· 존 A2(너 직접, 선행): client/src/tokens.js, tailwind.config, index.html(폰트), src/i18n/** (표시명·공용), Header, Footer, Button, FieldSelect, CalendarGrid 신설, 전역 회색·틴트·웨이트 스윕, pages/Legal*
· 존 B2(서브에이전트 GATE): pages/{Gate,HandsFree,Home}.jsx, components/gate/**, components/home/**, ArrivalContext + Arrival 3컴포넌트, i18n */gate.js
· 존 C2(서브에이전트 LINES): pages/{Loop,LineDetail,Booking,Ticket,About}.jsx, components/{map,loop,booking,brand}/**, GateToLinesTransition, i18n */loop.js
  (전환 연출 컴포넌트는 C2가 만들고, B2의 ArrivalModal은 승인 시 navigate('/loop', { state:{ transition:true } })만 호출 — 파일 교차 금지)

■ 실행 순서
[1] 존 A2를 네가 직접 완료·검증: primary #0073EC 전면 반영(구 블루 grep 0건: `009FE3` 검색), SUIT 로딩·Pretendard 링크 제거, Light 0건, inkMeta 오남용 0건, soft/틴트 0건, 헤더 80/17px/순서/모바일 상단 헤더, 모바일 메뉴 깨짐 재현→수정 확인, 푸터 240px 이내 + 저작권 문구, 컨테이너 확폭 반영. 커밋 [C1] feat: v3.2 foundation.
[2] GATE ∥ LINES 서브에이전트 병렬. 각자 시작 전 필수 문서 목록 + 자기 소유권 + 명세 위치(IA §8 해당 절, PATTERNS §19~§25, COMPONENTS v3.2 자기 존 행) 명시.
   · GATE 완료 조건: 현재 위치 옵션 + 거부 폴백, CalendarField 키보드 완주, 크로스셀 부재, Optional 배지, ArrivalWatcher 상태기 7종 각 상태 문안 일치(IA §8.5), 사전 설명 모달이 권한 요청보다 먼저, 좌표 수치 비노출.
   · LINES 완료 조건: 초기 라인 0개 + 칩 3개 + 선택 시 draw-on, hover 즉시 팝업, scroll-quiet 적용·키보드 스크롤 생존, 모바일 카드 ≤132px, 2개월 캘린더 + 원색 도트 범례 + 회차 전부 펼침, 빈 이미지 박스 0, 아이콘 배지 0, PATTERNS §23 6항목 전부 적용 후 줌 인·아웃 20회 아티팩트 무발생, 전환 연출 850ms·Escape 스킵·reduced-motion 즉시.
[3] 조립: 라우트 변화 없음 확인, 소유권 위반 git status 검증. 커밋 [C2] feat: getting-here, [C3] feat: city-lines.
[4] 검수(너 직접): AGENTS CHECKLIST + v3.2 추가 — 닐슨 10·황금률 8을 라우트별로 표로 점검(각 원칙당 통과/위반/수정), 3언어 스크린샷 레이아웃 동형 비교, 회색 텍스트·틴트·Light·구 블루·아이콘 배지 grep 전수, 320~3840 매트릭스. 위반은 위반값을 고친다. 커밋 [CR] fix: v3.2 review.

■ 종료 보고
존별 파일 목록 / grep 히트표 / 완료 조건 통과표 / 휴리스틱 점검표 / 잔존 PLACEHOLDER. 완료 후 PROGRESS.md 갱신하고 멈춰라. 존 D2(AR)와 서버 확장은 다음 프롬프트다. 명세 밖 결정은 질문해라.
