너는 이 세션의 오케스트레이터다. v4 GTS 피벗 전체를 지휘한다. 전제: [D1] 데이터 시드 커밋이 존재한다. 없으면 멈추고 CC_PROMPT_9 먼저를 요청해라.

■ 시작 전 필수 (너와 모든 서브에이전트 공통)
이 순서로 전부 읽어라: CLAUDE.md, DESIGN.md(§16), tokens.js, IA.md(**§9 v4가 이번 명세다**), ROUTES.md, COMPONENTS.md(v4 표), PATTERNS.md(§28~§33), PROGRESS.md, AGENTS.md, 그리고 src/data/gts/ 3파일. 구 명세와 충돌하면 v4가 이긴다.

■ 절대 규칙
1. 파일 소유권 배타(COMPONENTS v4 표). App.jsx·라우트·GtsContext·i18n gts 네임스페이스 뼈대 = 존 A4(너 직접). src/data/api.js 수정 금지(GTS 목 창구는 src/data/gts/api.js 신설, §33).
2. 데이터는 조회만: 경로·요금·장소를 컴포넌트에서 생성·보정하지 마라. data/gts/* 에 없으면 빈 상태 UI 로 처리하고 보고해라.
3. 구 loop 계열(pages/Loop·LineDetail·Booking, components/loop 등)은 **삭제 금지** — 라우트만 끊고 파일 상단 `// DEPRECATED v4` 주석. 구 GateJourney 는 삭제 대상(§28).
4. 디자인 시스템 불변: v3.2 금지 목록 전부 유효(회색 텍스트·Light·틴트·보더·네이티브 셀렉트·이모지·localStorage·줄표·scale). 신규 화면도 tokens·기존 프리미티브(FieldSelect·CalendarGrid·Stepper·Chip·Dialog·BottomSheet·Button 페어)만으로 조립 — 새 프리미티브가 필요하면 만들지 말고 질문해라.
5. 3언어 동형: gts 네임스페이스 en/ko/th 키 완전 동일, 레이아웃 언어 분기 금지.

■ 실행 순서
[1] 존 A4 를 네가 직접: 라우트 4개 신설 + 리다이렉트 2개 + 구 loop 라우트 제거, 헤더 내비 3항목, GtsContext(§31, 파생 vehicle 셀렉터·스텝 가드 포함), i18n gts 뼈대 키. 검증: 전 리다이렉트 동작, 가드 위반 진입 시 앞 단계 replace. 커밋 [D2] feat: v4 shell.
[2] 서브에이전트 PLANNER ∥ BUILDER 병렬. 각자에게 필수 문서 목록 + 자기 소유권 + 명세 절(§9.2 / §9.3~9.6, §28~§33 해당분) 명시, App.jsx 금지·export 보고 의무 포함.
   · PLANNER 완료 조건: 방향 토글 시 DOM 구조 불변(필드 역할만 교체), 현재 위치 플로우가 사전 설명 모달 선행, 결과 카드가 hubs.js 조회만으로 렌더(콘솔에 임의 시각 문자열 0), RouteTimeline 세로 렌더 + 구 수평 애니메이션 코드 grep 0건, 도착 감지 카드 잔존.
   · BUILDER 완료 조건: 매칭 4케이스(2/짐, 3/짐, 4/무짐, 5/무짐) 전부 규칙 일치, 아이콘 실존 확인 보고, mealPlan 3분기(none 스킵 / lunch 1픽 / lunchDinner 2픽 순서 배지), 픽 합산 정확히 2 강제 + 초과 시 자동 해제 없음, 새로고침 로테이션 중 선택 보존, 목업 카드에 사진 영역 없음, ItineraryMap 번호 핀+draw-on+fitBounds, 목업 픽 포함 시 리스트 폴백, 체크아웃 1뷰 금액 내역 + 하차 텍스트 필수 검증 + 프로토타입 고지 Dialog + 로그인 게이트 → 스탬프 → Ticket GTS 모드.
[3] 조립·검증 후 커밋 [D3] feat: planner, [D4] feat: gts flow 순차.
[4] 검수(너 직접): AGENTS CHECKLIST + v3.2 grep 세트 + v4 추가(임의 시각 정규식 `\d{1,2}:\d{2}` 가 data 외 신규 코드에 0건, DEPRECATED 파일 라우트 참조 0건, 3언어 키 동형, 320~3840 매트릭스에서 4열→2열 그리드·진행 바·타임라인). 위반은 위반값을 고쳐라. 커밋 [DR] fix: v4 review.

■ 종료 보고
존별 파일 목록 / 완료 조건 통과표 / grep 히트표 / 빈 상태·목업 처리 스크린샷 목록 / 잔존 PLACEHOLDER. PROGRESS.md 갱신 후 멈춰라. 서버의 gts_bookings 확장은 다음 서버 세션 몫이다. 명세 밖 결정은 질문해라.
