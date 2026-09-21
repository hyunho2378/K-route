// ============================================================
// reviews.js · Reviews 시드 (IA §10.8 · 존 C5 신설) — 전부 mock:true 목업 데이터.
// 할루시네이션 방지 계약:
//   본문 실명 언급은 venues.js 허용 실명 11곳만(그 외 브랜드 창작 절대 금지).
//   별점 1~5 다양 · 만족 톤이되 과장 광고 금지 · 구체 디테일 위주.
//   (만족 톤 제약과 모순이라 최저 별점은 2 — 완료 보고 명세 밖 결정 참조)
// 본문·제목 = 작성 언어 원문 그대로(언어 동형 원칙의 명시 예외 · UI 크롬만 3언어).
//   lang = 본문 언어 코드(html lang 속성용). country = 표기용 3언어 객체(국기 이모지 금지).
//   courseKey = i18n reviews.course.* 참조(코스 문자열 · UI 크롬으로 3언어 렌더).
// 날짜는 2026-07 이전 분포. likes = 시드 카운트(세션 메모리에서 증감).
// 서버 연동 시 reviews·review_likes 테이블로 승격(IA §10.8 · 백엔드 체크리스트).
// ============================================================

export const seedReviews = [
  // [V5-35] 사용자 지시(심사위원 시뮬레이션 발견) — 기존 시드가 전부 "밴 기사·선주문·시간 슬롯"
  //   구 GTS 예약 서비스 얘기라 지금 K-Route(퀴즈→라인→NFC 스탬프) 경험과 안 맞았음. 홈 미리보기
  //   3장만 지금 서비스에 맞게 새로 썼다(장소명은 이미 앱 전역에서 실사용 중인 실명만 사용).
  {
    id: 'rv-kroute-01',
    rating: 5,
    lang: 'en',
    title: 'Picked K-Food Line and it just worked',
    body: 'The quiz took less than a minute and put me on the K-Food Line. I picked Tongnamujip Dakgalbi and Chuncheon Makguksu Museum, and the app ordered them by bus time so I never backtracked. Tapped the NFC sticker at each stop for my passport stamp.',
    initials: 'R.T.',
    country: { en: 'Thailand', ko: '태국', th: 'ไทย' },
    courseKey: 'reviews.course.lunchDinner2act',
    date: '2026-07-28',
    likes: 21,
    mock: true,
  },
  {
    id: 'rv-kroute-02',
    rating: 4,
    lang: 'ko',
    title: '남이섬 대신 다른 곳도 갈 수 있었어요',
    body: '드라마 라인을 골랐는데 남이섬 하나만 나올까 걱정했는데, 근처 로컬 장소까지 같이 묶어줘서 하루가 심심하지 않았습니다. 어떤 곳이 진짜 겨울연가 관련인지 배지로 정확히 구분해 준 게 좋았어요.',
    initials: 'J.K.',
    country: { en: 'South Korea', ko: '대한민국', th: 'เกาหลีใต้' },
    courseKey: 'reviews.course.lunchCafeAct',
    date: '2026-08-03',
    likes: 15,
    mock: true,
  },
  {
    id: 'rv-kroute-03',
    rating: 5,
    lang: 'en',
    title: 'Animation Museum line, no Korean needed',
    body: 'I do not read Korean and still finished the whole route. Every card had English descriptions straight from the tourism board, and the map showed bus wait times so I knew exactly when to leave. Animation Museum was worth the trip on its own.',
    initials: 'M.G.',
    country: { en: 'Germany', ko: '독일', th: 'เยอรมนี' },
    courseKey: 'reviews.course.lunchDinner2act',
    date: '2026-08-11',
    likes: 12,
    mock: true,
  },
  {
    id: 'rv-01',
    rating: 5,
    lang: 'en',
    title: 'The pre-order actually works',
    body: 'Our dakgalbi at Tongnamujip was already on the grill when the van pulled up. We walked the Soyanggang Skywalk with no rush because the driver kept our two hour slot. Booking in English was the part I appreciated most.',
    initials: 'S.W.',
    country: { en: 'United Kingdom', ko: '영국', th: 'สหราชอาณาจักร' },
    courseKey: 'reviews.course.lunchDinner2act',
    date: '2026-05-14',
    likes: 24,
    mock: true,
  },
  {
    id: 'rv-02',
    rating: 4,
    lang: 'ko',
    title: '부모님과 다녀온 하루',
    body: '부모님 모시고 택시형으로 다녀왔어요. 감자밭 감자빵을 미리 주문해 둔 덕분에 줄을 안 섰습니다. 소양강댐 전망은 좋았는데 바람이 많이 부니 겉옷을 챙기세요.',
    initials: 'H.K.',
    country: { en: 'South Korea', ko: '대한민국', th: 'เกาหลีใต้' },
    courseKey: 'reviews.course.lunchCafeAct',
    date: '2026-06-02',
    likes: 18,
    mock: true,
  },
  {
    id: 'rv-03',
    rating: 5,
    lang: 'th',
    title: 'จองง่าย เที่ยวสนุก',
    body: 'จองเป็นภาษาไทยได้จริง คนขับใจดีมาก มื้อกลางวันที่ Tongnamujip อร่อย และพายแคนูที่ Jungdo Mullegil สนุกที่สุด เวลาสองชั่วโมงต่อจุดกำลังพอดี',
    initials: 'N.P.',
    country: { en: 'Thailand', ko: '태국', th: 'ไทย' },
    courseKey: 'reviews.course.lunchDinner2act',
    date: '2026-04-21',
    likes: 31,
    mock: true,
  },
  {
    id: 'rv-04',
    rating: 4,
    lang: 'ja',
    title: '初めての春川、快適でした',
    body: '初めての春川でしたが、車で回れたので楽でした。マッククス体験博物館で麺作りをして、公池川をゆっくり散歩。昼食の予約が済んでいたのは助かりました。',
    initials: 'T.M.',
    country: { en: 'Japan', ko: '일본', th: 'ญี่ปุ่น' },
    courseKey: 'reviews.course.lunch2act',
    date: '2026-03-18',
    likes: 12,
    mock: true,
  },
  {
    id: 'rv-05',
    rating: 3,
    lang: 'en',
    title: 'Good for groups, plan for winter',
    body: 'Good value for a group of five in the van. The Art Circle workshop was the highlight. The two hour slots felt a bit long at Gongjicheon in winter, so I would pick different stops in cold months.',
    initials: 'J.R.',
    country: { en: 'Australia', ko: '호주', th: 'ออสเตรเลีย' },
    courseKey: 'reviews.course.none2act',
    date: '2026-02-27',
    likes: 7,
    mock: true,
  },
  {
    id: 'rv-06',
    rating: 5,
    lang: 'zh',
    title: '按自己的节奏玩春川',
    body: '行程按我们选的顺序走，司机每一站都准时。通木屋鸡排提前点好了，到店就能吃。Soul Roastery 的咖啡很好，湖上的天空步道也值得去。',
    initials: 'L.W.',
    country: { en: 'China', ko: '중국', th: 'จีน' },
    courseKey: 'reviews.course.lunchDinnerMix',
    date: '2026-05-30',
    likes: 27,
    mock: true,
  },
  {
    id: 'rv-07',
    rating: 4,
    lang: 'es',
    title: 'Un día completo sin estrés',
    body: 'Reservamos todo desde el móvil sin hablar coreano. La comida en Tongnamujip llegó rápida porque ya estaba pedida. El paseo en canoa por Jungdo Mullegil fue lo mejor del día.',
    initials: 'C.G.',
    country: { en: 'Spain', ko: '스페인', th: 'สเปน' },
    courseKey: 'reviews.course.lunchDinner2act',
    date: '2026-06-15',
    likes: 15,
    mock: true,
  },
  {
    id: 'rv-08',
    rating: 2,
    lang: 'en',
    title: 'Nice day, book a weekday',
    body: 'The day itself was fine but our taxi arrived about ten minutes late and the Skywalk was crowded on a Saturday. The schedule still worked because the slots have slack. I would book a weekday next time.',
    initials: 'D.K.',
    country: { en: 'Canada', ko: '캐나다', th: 'แคนาดา' },
    courseKey: 'reviews.course.lunch2act',
    date: '2026-01-25',
    likes: 4,
    mock: true,
  },
  {
    id: 'rv-09',
    rating: 5,
    lang: 'ko',
    title: '저녁까지 착착 진행돼요',
    body: '친구 넷이서 밴으로 하루를 꽉 채웠어요. 화동2571에서 쉬어 가는 코스로 짰는데 동선이 겹치지 않아서 좋았습니다. 저녁까지 미리 주문돼 있으니 기다림이 없네요.',
    initials: 'J.P.',
    country: { en: 'South Korea', ko: '대한민국', th: 'เกาหลีใต้' },
    courseKey: 'reviews.course.lunchDinnerMix',
    date: '2026-06-28',
    likes: 33,
    mock: true,
  },
  {
    id: 'rv-10',
    rating: 5,
    lang: 'ja',
    title: '身軽に回れる一日',
    body: 'ソウルロースタリーのコーヒーと昭陽江スカイウォークの組み合わせが良かったです。荷物を預けられたので身軽に回れました。チケットの画面を見せるだけで乗車できます。',
    initials: 'K.S.',
    country: { en: 'Japan', ko: '일본', th: 'ญี่ปุ่น' },
    courseKey: 'reviews.course.lunchCafeAct',
    date: '2026-04-05',
    likes: 20,
    mock: true,
  },
  {
    id: 'rv-11',
    rating: 4,
    lang: 'en',
    title: 'Simple and predictable',
    body: 'We skipped the meal plan and just did the Soyang River Dam and the Soyanggang Maiden Statue. The driver waited at each stop as promised. Simple, predictable, and cheaper than chartering a car ourselves.',
    initials: 'A.B.',
    country: { en: 'Germany', ko: '독일', th: 'เยอรมนี' },
    courseKey: 'reviews.course.none2act',
    date: '2026-03-09',
    likes: 9,
    mock: true,
  },
  {
    id: 'rv-12',
    rating: 3,
    lang: 'th',
    title: 'ดีแต่คนเยอะช่วงวันหยุด',
    body: 'โดยรวมดี รถสะอาดและตรงเวลา อาหารกลางวันอร่อย แต่พิพิธภัณฑ์มักกุกซูคนเยอะช่วงสุดสัปดาห์ อยากให้มีรอบเช้ากว่านี้',
    initials: 'S.C.',
    country: { en: 'Thailand', ko: '태국', th: 'ไทย' },
    courseKey: 'reviews.course.lunch2act',
    date: '2026-05-08',
    likes: 6,
    mock: true,
  },
];

export default seedReviews;

// ============================================================
// [G1] 서버 접근 계층(명세 5-②) · seedReviews export는 폴백·홈 스트립 계약으로 보존.
// 서버 실패 시 호출부(Reviews.jsx)가 seedReviews 세션 메모리로 폴백한다.
// ============================================================
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function fetchReviews(sort = 'latest') {
  const res = await fetch(`${API_BASE}/api/reviews?sort=${sort === 'likes' ? 'likes' : 'latest'}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { reviews } = await res.json();
  return reviews;
}

export async function postReview(payload) {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { review } = await res.json();
  return review;
}

export async function toggleLikeRemote(id) {
  const res = await fetch(`${API_BASE}/api/reviews/${id}/like`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { liked, likes }
}
