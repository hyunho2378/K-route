// octolinear.js · 옥토리니어(8방향) 선 배치 유틸. SubwayNetworkMap.jsx 전용 보조 파일.
// 근거: 2023 서울 지하철 노선도 리디자인(Cameron Booth "Octolinear"). 역과 역을 잇는 선은
// 오직 8방향(수평 0°/180° · 수직 90°/270° · 대각 45°/135°/225°/315°)으로만 꺾인다.
// 이 파일은 좌표만 다루는 순수 함수 모음이다(색·JSX·tokens 의존 없음). SubwayNetworkMap.jsx가 색을 입힌다.
// 좌표 단위는 "그리드 단위"(임의의 논리 좌표)이며, px 변환은 호출부 책임이다.

// 두 점을 잇는 구간이 이미 8방향 중 하나로 정렬돼 있는지 검사한다.
export function isOctolinear(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
}

// p1→p2 구간이 8방향을 벗어나면 꺾이는 점(elbow) 하나를 끼워 [45도 대각선] + [수평 또는 수직]
// 두 구간으로 나눈다. 두 축 중 더 짧은 차이만큼 먼저 대각선으로 움직이고 나머지를 직선으로 간다.
// 이미 8방향이면 원본 두 점을 그대로 돌려준다(불필요한 꺾임을 만들지 않는다).
export function octolinearSegment(p1, p2) {
  if (isOctolinear(p1, p2)) return [p1, p2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const diag = Math.min(Math.abs(dx), Math.abs(dy));
  const elbow = { x: p1.x + Math.sign(dx) * diag, y: p1.y + Math.sign(dy) * diag };
  return [p1, elbow, p2];
}

// 역 좌표 목록(방문 순서) → 옥토리니어 규칙을 지키는 전체 폴리라인 점 목록.
// 각 구간을 octolinearSegment로 펼치고 중복되는 접합점(이전 구간의 끝 = 다음 구간의 시작)은 한 번만 남긴다.
export function buildOctolinearRoute(stations) {
  if (!stations || stations.length < 2) return stations ? stations.slice() : [];
  const points = [stations[0]];
  for (let i = 1; i < stations.length; i += 1) {
    const seg = octolinearSegment(stations[i - 1], stations[i]);
    points.push(...seg.slice(1)); // seg[0]은 이미 앞 구간 끝점으로 들어가 있으므로 건너뛴다
  }
  return points;
}

// 점 목록 → SVG points 속성 문자열("x1,y1 x2,y2 ...")
export const toSvgPoints = (points) => points.map((p) => `${p.x},${p.y}`).join(' ');

// 점 목록의 바운딩 박스(그리드 단위 padding 포함). viewBox 계산용.
export function boundingBox(points, padding = 1) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + padding;
  const maxY = Math.max(...ys) + padding;
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}
