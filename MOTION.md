# MOTION.md · 애니메이션·인터랙션·재질 표준 (UI·모션 작업 시 필독)

기존 tokens.js motion 토큰과 .claude/skills/animation-vocabulary·improve-animations 계열을 기반으로 한다.
새 화면(quiz·go·chat)의 모션은 기존 Cheongchun Line 패턴과 이질감 없게.

## 원칙
- transform·opacity만 애니메이트. layout/paint 유발 속성(width/height/top/left/margin) 금지.
- hover scale 금지. press 피드백 scale(0.97)만 허용.
- prefers-reduced-motion: 전 모션 축소(등장은 즉시 표시·이동 제거). 필수.
- 60fps 유지. 큰 리스트 stagger는 최대 지연 상한 둔다(끝없이 밀리지 않게).

## 화면별
- **quiz(StepStage)**: 스텝 전환 = 기존 StepStage 전환 재사용. 탭 즉시 전진 시 선택 카드 press(0.97)
  → 다음 스텝 slide/fade(x+opacity). 진행 도트는 width/opacity 트랜지션(색 채움).
- **결과 배지**: SuccessStamp 스탬프 1회(기존 컴포넌트). 과한 컨페티 금지.
- **build 카드**: 기존 VenueGrid 등장 stagger·상세 FLIP(§V2) 그대로. K배지는 페이드 인만.
- **route 맵**: 기존 ItineraryMap 라인 draw-on·핀 drop 유지. 새로 만들지 마라.
- **go**: 현위치→목적지 폴리라인 draw-on(라인 길이 기반 duration). 레그 타임라인 순차 페이드.
- **chat(BottomSheet)**: 시트 spring 등장(기존 §36). 메시지 버블 fade+slide(y). 타이핑 인디케이터
  opacity 펄스만. 스트리밍 텍스트는 리플로우 최소화(고정 폭 컨테이너).
- **집중률 Chip**: 색 전환만(여유 초록/보통 앰버/혼잡 레드 — tokens 경유). 깜빡임 금지.

## 재질
- BottomSheet·모달 backdrop blur는 prefers-reduced-transparency 시 불투명 대체.
- 그림자는 tokens.shadow만. 커스텀 그림자 금지.
