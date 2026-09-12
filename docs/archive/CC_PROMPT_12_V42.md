너는 이 세션의 오케스트레이터다. v4.2(홈·플래너·빌더 UX·결제·티켓·리뷰)를 지휘한다.

■ 시작 전 필수 (너와 모든 서브에이전트 공통)
이 순서로 전부 읽어라: CLAUDE.md, DESIGN.md(§16·§17), tokens.js, IA.md(**§10이 이번 명세다**), ROUTES.md, COMPONENTS.md(v4.2 표), PATTERNS.md(§38~§43 + §28·§17 재사용분), BRAND_COPY.md(§12~§14), LEGAL_COPY.md, PROGRESS.md, AGENTS.md. 구 명세와 충돌하면 §10/v4.2가 이긴다. .claude/skills/ 가 있으면 모션 수치는 거기서 인용해라.

■ 절대 규칙
1. 소유권 배타(COMPONENTS v4.2 표). App.jsx·라우트·AuthContext·GtsContext 리셋 = 존 A5(너 직접).
2. 기존 금지 전부 유효 + v4.2 추가: 사용자 노출 DRAFT 고지 금지, "새로고침" 라벨 금지(페이지네이션 페어로), 성공 인터스티셜 금지(티켓 직행), 티켓 보더 금지, 시스템 공유 시트 경유 금지(직접 다운로드).
3. 시각은 §39 계산만 — 시간표·배차 숫자 생성 금지 유지. 리뷰 시드는 mock:true·실명 브랜드 창작 금지·과장 광고 톤 금지.
4. 결제 로고는 /pay/ 8개 고정 파일명 + onError 텍스트 폴백. 파일 부재로 깨진 이미지가 보이면 실패다.
5. 3언어 동형(UI 크롬). 리뷰 본문 데이터만 원문 다국어 예외.

■ 실행 순서
[1] 존 A5 직접: 내비 4항목·/reviews 라우트, 데모 로그인 기본값(플래그 복원 가능), DRAFT 고지 전수 삭제, 푸터 모토 교체, GtsContext /gts 이탈 리셋(하차 텍스트 포함). 검증: 게이트 없이 결제까지 도달, /gts 나갔다 오면 초기 상태. 커밋 [F1] feat: v4.2 shell.
[2] HOME-PLANNER ∥ BUILDER-PAY 병렬(각자 필수 문서·소유권·명세 절 명시, App.jsx 금지·export 보고).
   · HOME-PLANNER 완료 조건: 스탯 스트립·라인 섹션·미니 폼·/loop 링크 grep 0건, CTA 페어 동일 치수·§16.8 세컨더리 스타일, 수직 2섹션(칩 토글 부재), TimeWheel 디폴트=KST 현재·라이브 시계 틱·키보드 ↑↓, 결과 카드에 레그별 계산 시각+"예상" 라벨, 확정 3초 후 도착 모달→/gts, 현재 위치 옵션 동작(주소명은 폴백 라벨 허용).
   · BUILDER-PAY 완료 조건: StepStage 풀스크린(하단 진행 바 부재), 단일 선택 자동 전진, 스텝 전환 280ms easeInOut·reduced-motion 크로스페이드, 스텝2 좌우 반반 동시 노출(탭 부재), 전 그리드 이전/다음 페어, 방문 순서 세로 타임라인, 결제 그리드 8종+선택 링+카드 폼 빈 제출 통과+월렛 2종 폼 생략, Pay→/ticket 직행(replace)+스탬프 1회, 티켓 2컬럼(좌 상세/우 1/3 sticky 단색 무보더)+이미지 저장 즉시 다운로드, /reviews 12개 시드·별점·국적·코스 공개·좋아요 세션 증가·정렬 토글·작성 폼 즉시 게시, 데스크탑 1320 컨테이너 실사용(모바일 폭 고정 grep: /gts·/ticket·/reviews에 max-w-md급 래퍼 0건).
[3] 조립·소유권 검증, 커밋 [F2] feat: home planner, [F3] feat: builder pay reviews.
[4] 검수 직접: 기존 CHECKLIST + v4.2 grep(§10 삭제 대상 잔존 0, "Draft" UI 0, 새로고침 라벨 0, navigator.share 0) + 320~3840 매트릭스(특히 StepStage 글래스 패널·티켓 2컬럼·리뷰 그리드) + 모션 감사(§37) 신규 모션 포함. 위반은 위반값 수정. 커밋 [FR] fix: v4.2 review.

■ 종료 보고
존별 파일 목록 / 완료 조건 통과표 / grep 히트표 / 잔존 PLACEHOLDER(pay 로고 8종·리뷰 실데이터 승격·카카오 키). PROGRESS.md 갱신 후 멈춰라. 명세 밖 결정은 질문해라.
