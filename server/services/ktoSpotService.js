// [V5-0] 공사 관광정보 서비스 스텁 · IA §11.9(국문·다국어 목록·상세 + 관광사진) · 구현은 P1 데이터 세션.
// 오퍼레이션명·파라미터는 docs/kto 활용가이드 근거로만(KTO_API.md) · kto_spots.raw = API 원문 JSON 캐시(TTL 24h).
async function listSpots() {
  throw new Error('NOT_IMPLEMENTED');
}

async function getSpot() {
  throw new Error('NOT_IMPLEMENTED');
}

module.exports = { listSpots, getSpot };
