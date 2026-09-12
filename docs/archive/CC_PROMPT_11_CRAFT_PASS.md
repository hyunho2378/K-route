세션 시작. 이 세션은 v4.1 크래프트 패스다 — 모션·머티리얼·타이포 품질을 skills 기준으로 끌어올린다. 공유 프리미티브를 광범위하게 만지므로 **서브에이전트 병렬 금지, 단독 순차 세션**이다. 기능 추가·IA 변경 금지.

■ 시작 전 필수
1) 이 순서로 읽어라: CLAUDE.md, DESIGN.md(**§17이 이번 명세다**), tokens.js(v4.1 motion), IA.md, COMPONENTS.md(v4.1 표), PATTERNS.md(§34~§37), PROGRESS.md, AGENTS.md.
2) 레포 루트 `.claude/skills/` 안에 apple-design, emil-design-eng, review-animations, improve-animations, find-animation-opportunities, animation-vocabulary 6개 폴더가 있는지 확인해라. 없으면 멈추고 사용자에게 배치를 요청해라. 작업 중 세부 근거가 필요하면 해당 SKILL.md를 직접 열어 인용해라 — 기억으로 수치를 추정하지 마라.

■ 절대 규칙
- 디자인 시스템 기존 금지 전부 유효. scale은 DESIGN §17.3의 4범주만(그 외 금지, 지도 마커 scale 금지 유지). ease-in 금지. 키보드 개시 동작 애니메이션 금지. scale(0) 금지.
- 새 의존성은 `motion` 정확히 1개(§36 표면 한정). 다른 애니메이션 라이브러리 금지.
- 카피·레이아웃·라우트 불변. 이 세션의 diff는 모션·머티리얼·타이포 속성과 그 구현 파일에 국한된다.

■ 작업 순서
[1] client/src/tokens.js 를 문서 팩 v4.1 motion으로 동기화하고 tailwind 설정에 이징·지속 토큰 반영. 구 320ms·구 spring 오남용 참조를 grep으로 전수 찾아 §17.2 매핑(진입퇴장 easeOut / 이동 easeInOut / 시트 easeDrawer / 모멘텀만 spring)으로 교체.
[2] §34: 전 pressable 프레스 피드백(:active 0.97, 120ms) + 팝 패널 origin-aware 진입(0.97→1, 180ms) + 퇴장 역재생. FieldSelect·LangMenu·StopPopup·캘린더 팝 포함.
[3] §35: Header·GlassDock 머티리얼 교체(0.72 + blur 20 saturate 180 + 빛 맺힘 엣지), 헤더 하단 스크롤 엣지 페이드(경계선 금지), prefers-reduced-transparency·prefers-contrast 분기 추가. 기존 prefers-reduced-motion 분기에 크로스페이드 대체 규칙 적용.
[4] §36: BottomSheet에 드래그 디스미스 물리(1:1 추적·잡은 오프셋 존중·상단 러버밴드·릴리즈 속도 부호 판정·모멘텀 투영 스냅·속도 인계 스프링·재터치 인터럽트). LinePreviewOverlay 모바일 시트에도 동일 적용.
[5] §17.5: 타이포 트래킹 크기별 적용(display -0.02em / h2·h3 -0.01em / 본문 0 / caption +0.01em), 전역 letter-spacing 제거.
[6] 툴팁류 연속 hover 지연 스킵, 팝 진입 @starting-style(미지원 무해 확인).
[7] **모션 감사(§37)**: .claude/skills/review-animations/STANDARDS.md 를 열고, 전 라우트의 모든 모션을 표(대상/빈도등급/목적/이징/지속/scale적합/인터럽트/reduced 3신호)로 감사해라. 위반은 STANDARDS 수치를 인용해 수정. 추가 제안은 find-animation-opportunities 기준 최대 3건, 구현은 승인 후로 보류하고 목록만 보고.

■ 완료 조건
- grep: `ease-in[^-o]` 0건(easeInOut 제외), `scale(0)` 0건, 구 `0.32, 1.32` spring이 §17.2 허용 표면 밖 0건, 키보드 핸들러 경로에 transition 트리거 0건.
- reduced-motion·reduced-transparency·contrast 세 미디어쿼리 각각 실제 분기 존재.
- 시트: 플릭으로 닫기/약한 드래그 복귀가 속도 기준으로 갈리는지, 애니메이션 중 재터치가 끊기지 않는지.
- 감사 표 전 항목 통과 상태로 보고.

완료 후 PROGRESS.md 갱신, 커밋 [E1] feat: v4.1 craft pass 제안 후 멈춰라. 명세 밖 결정은 질문해라.
