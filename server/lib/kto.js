// [V5-2b] 한국관광공사 OpenAPI 공통 호출기 · tago.js 계약 그대로 재사용(serviceKey 원문 이어붙이기 · 재인코딩 금지 · _type=json ·
//   8s 타임아웃 · asItems 정규화). 정상 resultCode '0000'과 최상위 오류 envelope 판정은 tago.js(probe-kto 근거).
// 키: KTO_SERVICE_KEY 우선, 없으면 TAGO_SERVICE_KEY(data.go.kr 인증키는 계정 공통).
// 오퍼레이션명·파라미터는 probe-kto.js 실호출 확인분만 서비스에서 쓴다(KTO_API.md 표 · 문서 없는 호출 금지).
const { tagoGet, asItems } = require('./tago');

// 실호출 1줄 로그(서비스/오퍼레이션 · 소요 · totalCount) · 키·쿼리는 남기지 않는다
async function ktoGet(base, op, params) {
  const t0 = Date.now();
  const body = await tagoGet(base, op, params, process.env.KTO_SERVICE_KEY || process.env.TAGO_SERVICE_KEY);
  console.log(`[kto] ${base.split('/').pop()}/${op} · ${Date.now() - t0}ms · totalCount=${body?.totalCount ?? '-'}`);
  return body;
}

module.exports = { ktoGet, asItems };
