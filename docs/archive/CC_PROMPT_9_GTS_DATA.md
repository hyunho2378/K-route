세션 시작. 이 세션은 GTS 데이터 시드 격리 세션이다 — `src/data/gts/` 3파일만 만든다. 다른 파일 수정 전면 금지.

■ 시작 전 필수
CLAUDE.md, tokens.js, IA.md §9, PATTERNS.md §29·§30, COMPONENTS.md v4 표, PROGRESS.md 를 읽어라.

■ 할루시네이션 방지 계약 (이 세션의 존재 이유)
1. **시각표·요금·편명·배차 숫자를 생성하지 마라.** 소요시간(durMin)은 대략값만 넣되 전 항목 `// PLACEHOLDER — verify` 주석. 배차는 사전 키 참조 문자열만.
2. **장소 실명 창작 금지.** venues.js 의 실명은 이 목록만 허용: 감자밭(Gamja Farm, 베이커리), 소울로스터리(Soul Roastery, 카페), 통나무집 닭갈비(식사), 막국수체험박물관(액티비티), 소양강 스카이워크, 소양강댐, 공지천, 소양강처녀상, 중도 물레길(카누), 화동2571(카페), 아트서클. 이 외 카드가 필요한 슬롯은 전부 name "Mockup 1", "Mockup 2"… 로 만들고 mock:true 플래그를 단다. 좌표는 실명 장소만 대략 좌표 + PLACEHOLDER 주석, 목업은 coord:null.
3. hubs.js 는 PATTERNS §29 의 6개 허브 + 춘천 도착점 2개(춘천역, 춘천시외버스터미널)로 시작하고, 확신 없는 허브를 추가하지 마라.

■ 작업
1. `src/data/gts/hubs.js`: §29 형태 그대로 — hubs, chuncheonPoints(역·터미널), routeTemplates(각 허브→역/터미널 조합, legs mode ∈ rail|intercityBus|subway|taxi|walk).
2. `src/data/gts/vehicles.js`: 매칭 규칙 함수 `matchVehicle(party, luggage)`(IA §9.3 결정론 규칙) + 요금표 { taxi:{base, perPerson}, van:{base, perPerson}, luggageFee } 전부 DRAFT 주석.
3. `src/data/gts/venues.js`: { id, name:{en,ko,th}, category:'meal'|'foodspace'|'activity', oneLine:{en,ko,th}, stayMin:120, coord|null, mock:bool }. meal 8+ / foodspace 8+ / activity 8+ 가 되도록 목업으로 채워라(새로고침 로테이션 검증용으로 카테고리당 12개 권장). 3언어 값 동형.

■ 완료 조건
- 3파일 import 문법 검증(node로 파싱 확인), 창작 실명 0(허용 목록 대조표 보고), 숫자 전 항목 PLACEHOLDER 주석, mock 카드에 mock:true.

완료 후 PROGRESS.md 갱신(사용자 준비물에 "허브 소요시간·요금 실측 검증, 실명 브랜드 추가 확보" 등재), 커밋 [D1] feat: GTS seed data 제안 후 멈춰라. 명세 밖 결정은 질문해라.
