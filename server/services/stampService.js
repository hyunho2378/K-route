// [V5-6] NFC 성지 스탬프 · IA §11.10 개정(URL 태그 최소 데모)
//   찍는 곳 = SOURCE_SPOTS 앵커 중 grade 강함 · 갈래(kType)도 거기서 나온다(현재 kfood · kanime)
//     근거 강함인 K-드라마 앵커가 venues 에 없어 K-드라마 스탬프는 없다(공지천 = 촬영 근거 없음 · SOURCE §8)
//   태그 = NFC 스티커에 URL(/stamp/<spotId>/<토큰>)을 심는다(토큰을 경로에 둬야 로그인 후에도 남는다) · iOS·안드로이드 모두 앱 없이 연다
//   토큰 = HMAC(SESSION_SECRET, 'stamp:' + spotId) 12자 · URL 추측은 막지만 현장 도착 증명은 아니다(발전단계: 위치 교차 검증)
const crypto = require('crypto');
const { ksource } = require('../data/ksource');

const stampable = () =>
  Object.entries(ksource())
    .filter(([, t]) => t.anchor && t.grade === '강함')
    .map(([id, t]) => ({ id, kType: t.kType }));

const tagToken = (spotId) =>
  crypto
    .createHmac('sha256', process.env.SESSION_SECRET || 'dev-secret')
    .update(`stamp:${spotId}`)
    .digest('base64url')
    .slice(0, 12);

const sameToken = (a, b) => typeof a === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

// 사용자 스탬프 행 → 화면 요약 · 배지 = 갈래별 첫 스탬프 · 완주 = 찍을 수 있는 갈래 전부 배지
function summary(rows) {
  const spots = stampable();
  const kindOf = new Map(spots.map((s) => [s.id, s.kType]));
  const kinds = [...new Set(spots.map((s) => s.kType))];
  const got = rows.filter((r) => kindOf.has(r.spot_id));
  const badges = kinds.filter((k) => got.some((r) => kindOf.get(r.spot_id) === k));
  return {
    spots: spots.map(({ id, kType }) => ({ id, kType })),
    stamps: got.map((r) => ({ spotId: r.spot_id, kType: kindOf.get(r.spot_id), at: r.created_at })),
    kinds,
    badges,
    complete: kinds.length > 0 && badges.length === kinds.length,
  };
}

module.exports = { stampable, tagToken, sameToken, summary };
