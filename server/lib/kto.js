// [V5-0] 한국관광공사 OpenAPI 공통 호출기 스텁 · tago.js 동형(serviceKey 원문 이어붙이기 · 재인코딩 금지 · asItems 정규화).
// 엔드포인트·오퍼레이션명·파라미터는 docs/kto/ 활용가이드 근거로만 채운다(KTO_API.md · 문서 없이 URL 기재 금지).
// 공사 키 env 이름은 발급 후 실제 이름으로 확정(현재 server/.env에 없음 · 추측 변수 금지).
const { asItems } = require('./tago'); // items.item 단건/복수/빈값 → 배열 정규화(tago.js 재사용)

async function ktoGet(/* base, op, params */) {
  throw new Error('NOT_IMPLEMENTED');
}

module.exports = { ktoGet, asItems };
