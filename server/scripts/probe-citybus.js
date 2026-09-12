// probe-citybus.js · TAGO 시내버스(국토부) 실호출 검증(PITFALLS: 활용가이드 부재 시 probe 채택 · probe-train.js·probe-kto.js 선례).
// docs/tago 에는 시외버스·열차 가이드만 있다 → 시내버스 서비스·오퍼레이션명을 기억으로 확정하지 않는다.
// 후보를 실호출해 HTTP 200 + resultCode '00' 이 확인된 조합만 채택한다(응답 헤더 콘솔 출력 · 키 마스킹 · 재인코딩 금지).
// 실행: node scripts/probe-citybus.js
// [결과 2026-09-12 · TAGO_SERVICE_KEY] 후보 4개 서비스 전부 HTTP 403 · SERVICE_KEY_IS_NOT_REGISTERED_ERROR
//   (404가 아니라 403 = 경로는 존재 · 우리 키 미등록 → data.go.kr 활용신청 대기) · 채택 0건 → 시내버스 live 판정 없음
//   BusSttnInfoInqireService/getCtyCodeList · BusRouteInfoInqireService/getCtyCodeList ·
//   ArvlInfoInqireService/getCtyCodeList · BusLcInfoInqireService/getCtyCodeList
//   승인 후 재실행해 '00'이 나오면 정류소(근접)·노선(첫차·막차·배차) 오퍼레이션을 이어서 검증한다.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const KEY = process.env.TAGO_SERVICE_KEY;
const HOST = 'http://apis.data.go.kr/1613000';
const mask = (s) => s.split(KEY).join('***');

// 후보 = 시외버스 가이드(SuburbsBusInfo)와 같은 1613000 계열 서비스명 · 도시코드 조회로 인증·경로만 확인
const CANDIDATES = [
  ['BusSttnInfoInqireService', 'getCtyCodeList'],
  ['BusRouteInfoInqireService', 'getCtyCodeList'],
  ['ArvlInfoInqireService', 'getCtyCodeList'],
  ['BusLcInfoInqireService', 'getCtyCodeList'],
];

async function main() {
  if (!KEY) throw new Error('TAGO_SERVICE_KEY 미설정');
  for (const [svc, op] of CANDIDATES) {
    try {
      const res = await fetch(`${HOST}/${svc}/${op}?serviceKey=${KEY}&_type=json&numOfRows=200&pageNo=1`, {
        signal: AbortSignal.timeout(15000),
      });
      const text = mask(await res.text());
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* XML·HTML 오류 응답 */
      }
      const h = json?.response?.header;
      const item = json?.response?.body?.items?.item;
      const items = !item ? [] : Array.isArray(item) ? item : [item];
      const city = items.find((c) => String(c.cityname ?? '').includes('춘천'));
      console.log(
        `${svc}/${op} → HTTP ${res.status} · ${h ? `resultCode=${h.resultCode} ${h.resultMsg}` : `raw=${text.slice(0, 140).replace(/\s+/g, ' ')}`}` +
          ` · 도시 ${items.length} · 춘천 ${city ? JSON.stringify(city) : '-'}`,
      );
    } catch (e) {
      console.log(`${svc}/${op} → 실패 ${e.message}`);
    }
  }
}

main();
