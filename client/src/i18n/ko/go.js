// go 네임스페이스(KR) · IA §11.7 현위치 → 코스 장소 · [V5-3] · 3언어 키 동형.
// 교통: 춘천 시내 실시간 provider 미연결 → 서버 /api/go 직선거리 기반 도보·택시 '예상' · 집중률 카드 = 공사 관광지 집중률 예측.
export default {
  go: {
    title: '다음 장소로 출발',
    from: '출발',
    to: '도착',
    current: '현재 위치',
    station: '춘천역',
    stopN: '{n}번째 장소',
    locate: {
      title: '길 안내에 현재 위치를 사용할까요?',
      body: '장소까지 가는 길을 보여 드리려고 현재 위치를 한 번 확인합니다. 위치는 저장하지 않아요.',
      allow: '현재 위치 사용',
      later: '춘천역에서 출발',
      footnote: '언제든 현재 위치로 바꿀 수 있어요.',
    },
    locating: '현재 위치를 확인하고 있어요',
    useLocation: '현재 위치 사용',
    noLocation: '위치를 쓰지 않아 춘천역에서 출발하는 길을 보여 드려요.',
    resultTitle: '가는 방법',
    mode: {
      walk: '도보',
      taxi: '택시',
    },
    minutes: '약 {min}분',
    distance: '직선거리 {km}km',
    estimate: '예상',
    fallbackNote: '춘천 시내 실시간 교통은 아직 연결 전이라 예상 시간이에요.',
    crowd: {
      title: '혼잡도 예보',
      now: '지금 가면',
      quietest: '앞으로 30일 중 가장 한가한 날',
      none: '이 장소는 아직 혼잡도 예보가 없어요.',
      source: '한국관광공사 관광지 집중률 예측',
    },
    next: '다음 장소',
    last: '마지막 장소예요.',
    back: '동선으로 돌아가기',
    mapLabel: '길 안내 지도',
    error: '길 안내를 불러오지 못했어요. 다시 시도해 주세요.',
    retry: '다시 시도',
  },
};
