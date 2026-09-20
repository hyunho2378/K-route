// go 네임스페이스(EN) · IA §11.7 현위치 → 코스 장소 · [V5-3] · 3언어 키 동형.
// 교통: 춘천 시내 실시간 provider 미연결 → 서버 /api/go 직선거리 기반 도보·택시 '예상' · 집중률 카드 = 공사 관광지 집중률 예측.
export default {
  go: {
    title: 'Head to your stop',
    from: 'From',
    to: 'To',
    current: 'Your location',
    station: 'Chuncheon Station',
    stopN: 'Stop {n}',
    // [V5-31] 노선 패스카드(RoutePassCard) · 실제 지하철 플랫폼 행선 안내판 참고자료 반영
    pass: {
      eyebrow: 'Your route pass',
      here: "You're here",
      start: 'Start of your line',
      end: 'End of your line',
    },
    locate: {
      title: 'Use your location for directions?',
      body: 'We check your current location once to show the way to your stop. It is not saved.',
      allow: 'Use my location',
      later: 'Start from Chuncheon Station',
      footnote: 'You can switch to your location anytime.',
    },
    locating: 'Checking your location',
    useLocation: 'Use my location',
    noLocation: 'Location is off, so the route starts from Chuncheon Station.',
    resultTitle: 'How to get there',
    mode: {
      walk: 'Walk',
      taxi: 'Taxi',
    },
    minutes: 'About {min} min',
    distance: '{km} km in a straight line',
    estimate: 'Estimate',
    fallbackNote: 'Live transit inside Chuncheon is not connected yet, so these times are estimates.',
    crowd: {
      title: 'Crowd forecast',
      now: 'If you go now',
      quietest: 'Quietest day in the next 30 days',
      none: 'No crowd forecast for this place yet.',
      source: 'Tourist spot crowd forecast by Korea Tourism Organization',
    },
    next: 'Next stop',
    last: 'This is your last stop.',
    back: 'Back to my route',
    mapLabel: 'Directions map',
    error: 'Directions could not be loaded. Please try again.',
    retry: 'Try again',
  },
};
