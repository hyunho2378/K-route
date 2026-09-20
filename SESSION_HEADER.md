# SESSION_HEADER.md · Cheongchun Line 세션 시작 규약

모든 작업 프롬프트는 아래 파일을 순서대로 전부 읽고 시작한다.

[표준 — 항상]
1. CLAUDE.md
2. AGENTS.md
3. PITFALLS.md   (프로젝트 루트 · fullstack-product-setup 스킬 폴더가 레포에 없으므로 루트에 이식됨)

[프로젝트 문서 — 항상]
4. DESIGN.md
5. client/src/tokens.js
6. IA.md   (§11 = Cheongchun Line)
7. ROUTES.md   (v5 섹션 포함)
8. COMPONENTS.md
9. PATTERNS.md
10. PROGRESS.md   (v5 섹션)
11. SOURCE_SPOTS.md   (K-콘텐츠 태깅 · 무결성 대상)

[작업 성격에 따라 — 해당하면 반드시]
- UI·애니메이션·인터랙션 → MOTION.md (루트 이식)
- 레이아웃·반응형·4K → RESPONSIVE.md (루트 이식)
- 백엔드·DB·API → server/lib/tago.js(계약 선례) + docs/kto/*(공사 활용가이드) + KTO_API.md
- 공사 API 작업 → KTO_API.md (엔드포인트 근거는 docs/kto 문서에서만)
- 제출물 작업 → docs/submission/*(기능설명서 · 공사 OpenAPI 사용처 · 시연 시나리오) + README.md

규칙: 문서를 새로 만들거나 이름 바꾸면 이 파일을 즉시 갱신. 이 목록에 없는 문서를 근거로 삼지 않는다.
비고: 레포 .claude/skills 에는 animation-vocabulary·apple-design·emil-design-eng·improve/review-animations
계열만 있고 fullstack-product-setup 스킬은 없다. 그래서 PITFALLS/MOTION/RESPONSIVE 를 루트로 이식했다.
