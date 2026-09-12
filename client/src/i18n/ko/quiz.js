// quiz 네임스페이스(KR) · IA §11.3 취향 찾기 + [V5-2] 추천 사유 폴백 문장(서버 reasonKey · LLM 꺼짐/실패 시) · 3언어 키 동형.
// [V5-3] 선택지 카피는 SOURCE_SPOTS 검증분만: K-푸드(닭갈비·막국수) · 겨울연가('촬영지' 표현 금지) · 애니메이션박물관(전시·체험 허브) ·
//   춘천에서 자란 아이돌(실명 미기재 · 초상권) · 미정. 여행 타입 = q2 성향 결정론 4종.
export default {
  quiz: {
    title: '나의 춘천 찾기',
    exitTitle: '취향 찾기를 나갈까요?',
    exitBody: '길찾기로 돌아가며 답변은 지워져요.',
    exitStay: '계속하기',
    exitLeave: '나가기',
    step: {
      q1: '끌린 콘텐츠',
      q2: '여행 성향',
      q3: '동행',
      q4: '체류',
      q5: '이동',
      result: '나의 노선', // [V5-9] 결과 스텝이 라인 판독으로 바뀌어 스텝 이름도 맞춘다
    },
    multiHint: '해당하는 것을 모두 고르세요.',
    needOne: '하나 이상 고르면 넘어갈 수 있어요',
    q1: {
      title: '춘천의 무엇에 끌리나요?',
      kfood: 'K-푸드',
      kfoodSub: '닭갈비·막국수',
      kdrama: 'K-드라마',
      kdramaSub: '겨울연가',
      kanime: '애니·캐릭터',
      kanimeSub: '애니메이션박물관 전시',
      kpop: 'K-팝 연고',
      kpopSub: '춘천에서 자란 아이돌',
      undecided: '아직 안 정함',
      undecidedSub: '춘천이 사랑하는 곳을 보여 주세요',
    },
    q2: {
      title: '어떤 여행을 좋아하나요?',
      photo: '인증샷',
      photoSub: '사진 남기기 좋은 풍경과 명소',
      localfood: '로컬 먹거리',
      localfoodSub: '현지인이 실제로 가는 곳',
      nature: '자연·산책',
      natureSub: '호수와 강, 느긋한 걸음',
      cafe: '감성 카페',
      cafeSub: '좋은 커피와 조용한 자리',
    },
    q3: {
      title: '누구와 함께하나요?',
      solo: '혼자',
      soloSub: '나 혼자 여행',
      friends: '친구',
      friendsSub: '친구들과 함께',
      family: '가족',
      familySub: '아이나 부모님과 함께',
    },
    q4: {
      title: '시간은 얼마나 있나요?',
      half: '반나절',
      halfSub: '3곳',
      day: '하루',
      daySub: '4곳',
    },
    q5: {
      title: '어떻게 이동할까요?',
      transit: '대중교통·도보',
      transitSub: '버스를 타거나 걸을게요',
      taxi: '택시 OK',
      taxiSub: '짧은 택시 이동은 괜찮아요',
    },
    result: {
      eyebrow: '나의 노선', // [V5-9] 리빌 주인공이 여행 타입에서 K-콘텐츠 라인으로 바뀌었다
      loading: '추천 장소를 찾고 있어요',
      ready: '{n}곳을 골라 뒀어요.',
      capHalf: '반나절 코스로 이 중 3곳을 고르세요.',
      capDay: '하루 코스로 이 중 4곳을 고르세요.',
      cta: '추천 {n}곳 보기',
      error: '추천을 불러오지 못했어요. 다시 시도해 주세요.',
      retry: '다시 시도',
    },
    type: {
      photo: { name: '프레임 헌터', body: '이야기가 담긴 한 컷을 찾아 떠나요.' },
      localfood: { name: '로컬 테이스터', body: '무엇을 먹을지가 하루의 중심이에요.' },
      nature: { name: '호숫가 산책러', body: '탁 트인 공기와 느긋한 걸음이 좋아요.' },
      cafe: { name: '카페 호퍼', body: '조용한 자리와 좋은 커피 한 잔을 모아요.' },
    },
    // [V5-9] 스탯 게이지(라인 축 3개) · 크루 레벨 인디케이터 · 라인 이름은 gts.line.* 재사용
    gauge: '취향 게이지',
    level: '레벨 {n}',
    reason: {
      anchor: '고르신 K-콘텐츠와 연결된 검증된 장소예요.',
      linked: '고르신 K-콘텐츠 장소 가까이에 있는 로컬 명소예요.',
      style: '좋아하신다고 한 여행 스타일에 잘 맞아요.',
      company: '함께하는 일행과 즐기기 좋아요.',
      default: '춘천에서 사랑받는 장소예요.',
      spread: '방문객이 이어서 가는 춘천 내륙 장소예요.', // [V5-5] 내륙 확산 추천
    },
  },
};
