세션 시작. 이 세션은 실험 기능 격리 세션이다 — AR 정류장 뷰 하나만 만든다. 다른 파일 개선·리팩토링 일절 금지.

■ 시작 전 필수
이 순서로 읽어라: CLAUDE.md, DESIGN.md §16, tokens.js, IA.md §8.6, ROUTES.md, COMPONENTS.md 존 D2 행, PATTERNS.md §26, PROGRESS.md, AGENTS.md.

■ 할루시네이션 방지 계약 (이 세션의 존재 이유)
1. locar.js API는 PATTERNS §26에 적힌 것만 사실로 취급해라: `import { App } from 'locar'` / `new App({ cameraOptions:{ hFov, near, far } })` / `await app.start()` / `locar.add(mesh, lng, lat)` / `locar.fakeGps(lng, lat)`. **이 외의 메서드·옵션이 필요하면 추측하지 말고 node_modules/locar의 타입 정의(dist/locar.d.ts)를 직접 열어 확인한 뒤 사용하고, 확인 결과를 보고에 인용해라.**
2. 의존성은 정확히 `locar@^0.2.3`과 `three@^0.175.0` 두 개만 추가한다. 다른 three 버전·three 예제 코드의 r128 관용구(구식 API) 사용 금지.
3. 웹 검색·기억 속 AR.js(구 aframe 방식) 문법 혼입 금지 — 이 프로젝트는 locar 단독이다.

■ 작업
1. `pages/ArStop.jsx` + 라우트 `/loop/ar/:stopId` 추가(App.jsx 이 한 줄만 수정 허용).
2. 진입점: StopPopup에 "View in AR" 버튼 — 단 `('DeviceOrientationEvent' in window) && matchMedia('(pointer:coarse)').matches` 충족 시에만 렌더(데스크탑·미지원 기기 비노출). StopPopup 파일의 이 버튼 추가분만 수정 허용.
3. ArStop: 풀스크린 카메라 뷰 + 해당 정류장 좌표에 라인 컬러 마커 메시(평면 + 라벨 스프라이트, tokens 색) + 상단 Beta Chip·닫기(지도 복귀) + 하단 정류장명 카드.
4. 실패 처리: app.start() reject(권한 거부·미지원) catch → "이 기기에서 AR을 사용할 수 없어요" EmptyState + 지도 복귀 CTA. 페이지 이탈 시 renderer·스트림 dispose.
5. stopId 검증 실패 → /loop replace.

■ 완료 조건
- 데스크탑: 진입 버튼 미노출 확인. 개발 검증은 fakeGps로 씬 구성만 확인.
- 빌드 통과 + 기존 라우트 전부 무영향(git diff가 신규 파일 + App.jsx 1줄 + StopPopup 버튼 분기뿐임을 증명).
- 타입 정의에서 확인한 API 목록을 보고에 첨부.

완료 후 PROGRESS.md 갱신, 커밋 [CX] feat: AR stop view (beta) 제안 후 멈춰라. 실기기(iPhone/Android) 검증은 사용자 몫으로 보고서에 절차를 적어라(HTTPS 배포 URL 접속 → 권한 허용 → 정류장 방향 확인). 명세 밖 결정은 질문해라.
