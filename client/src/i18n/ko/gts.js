// gts 네임스페이스(KO) 뼈대 · 존 A4 소유 골격 — 서브에이전트는 키를 추가(확장)만 한다(교체·이동 금지).
// freq.*는 data/gts/hubs.js headwayNote가 참조하는 배차 카피(구체 시각·횟수 금지 계약).
// en·th와 키 완전 동형 유지.
// v4 존 C4 확장: draft·vehicle·fare 공용 + setup/build/route/checkout/ticket 키 추가(IA §9.3~§9.6).
export default {
  gts: {
    freq: {
      rail: "열차가 하루 종일 자주 다닙니다", // PLACEHOLDER — verify 배차 수준 문구
      bus: "버스가 하루 종일 자주 다닙니다", // PLACEHOLDER — verify
      metro: "전철이 수시로 다닙니다", // PLACEHOLDER — verify
    },
    vehicle: {
      taxi: "택시형",
      van: "밴형",
    },
    fare: {
      base: "기본요금",
      luggage: "짐 보관",
      perPerson: "인당 요금",
      total: "합계",
    },
    // [V8] 여정 단계 인디케이터 · 라벨 = 지금 하는 단계 그대로(추상 표현 금지)
    steps: {
      label: "예약 단계",
      s1: "인원과 차량",
      s2: "코스 선택",
      s3: "동선 확인",
      s4: "결제와 확정",
    },
    // [V7] 시간제 이용권 · 새 요금 체계(카드 4종 + 포함/초과 안내)
    pass: {
      title: "시간제 이용권",
      names: {
        "1h": "1시간 이용권",
        "2h": "2시간 이용권",
        "4h": "4시간 이용권",
        day: "종일권",
      },
      included: "택시 이용료, 예약금, 코스 이용료가 모두 포함된 금액입니다.",
      overtime: "기본 이용 시간 초과 시 시간당 10,000원이 추가됩니다.",
    },
    setup: {
      title: "나만의 GTS 하루 만들기",
      sub: "함께 가는 인원을 알려 주세요. 차량은 저희가 맞춰 드립니다.",
      dateLabel: "여행 날짜",
      datePlaceholder: "날짜를 선택하세요",
      partyLabel: "인원",
      luggageTitle: "짐 보관이 필요한가요?",
      luggageBody: "선택 사항입니다. 캐리어가 없거나 숙소에 두고 왔다면 꺼 두세요.",
      luggageToggle: "짐 보관",
      matchTitle: "매칭된 차량",
      cta: "하루 조립하러 가기",
      ctaCheckout: "결제로 이어서 하기", // [V5-3] route 경유·Travel Log 템플릿 → 체크아웃 직행
      // [V9] 9명 이상 단체 문의(뒤에 OFFICIAL_EMAIL 링크)
      partyCapHelp: "9명 이상 단체는 이메일로 문의해 주세요:",
    },
    build: {
      title: "하루 조립",
      stepLabel: "단계",
      // §41 StepStage 상단 라벨("1 / 3 · …")용 짧은 스텝명 + 나가기 확인 Dialog(존 C5)
      step: {
        plan: "식사 플랜",
        meals: "식사 장소",
        picks: "하루 픽",
      },
      exitTitle: "조립을 나갈까요?",
      exitBody: "답을 바꾸러 취향 찾기로 돌아갑니다.", // [V5-3] 나가기 = 취향 찾기 복귀
      exitStay: "계속 조립하기",
      exitLeave: "나가기",
      // §10.4 페이지네이션 페어(새로고침 폐지 · 경계 비활성)
      planTitle: "식사는 어떻게 할까요?",
      plan: {
        none: "식사 안 함",
        noneSub: "식사는 따로 해결할게요",
        lunch: "점심 코스",
        lunchSub: "로컬 점심 한 곳",
        lunchDinner: "점심과 저녁 코스",
        lunchDinnerSub: "두 곳 선택, 먼저 고른 곳이 점심",
      },
      mealsTitle: "식사 장소 고르기",
      mealsOrderHint: "먼저 고른 곳이 점심, 다음이 저녁입니다.",
      lunchBadge: "점심",
      dinnerBadge: "저녁",
      comingSoon: "공개 예정",
      cat: {
        meal: "식사",
        foodspace: "음식 공간",
        activity: "액티비티",
      },
      picksTitle: "하루를 채울 2곳 고르기",
      // [V5-3] 담기 정원 = q4(반나절 3 · 하루 4)
      picksHalf: "반나절을 채울 3곳 고르기",
      picksDay: "하루를 채울 4곳 고르기",
      tabFoodspace: "음식 공간",
      tabActivity: "액티비티",
      counterLabel: "선택됨",
      capFull: "정원이 찼습니다. 먼저 고른 곳을 해제해 주세요.",
      // [V9] 선택 큐 + 거리 배지
      queueTitle: "선택한 코스",
      queueRemove: "코스에서 빼기",
      approx: "약",
      minUnit: "분",
      routeEstimate: "지금까지 예상 동선", // [V13] 거리 배지 라벨
      reason: {
        plan: "식사 플랜을 선택하면 넘어갈 수 있어요",
        meals: "식사 장소 선택을 마치면 넘어갈 수 있어요",
        picks: "정확히 2곳을 고르면 넘어갈 수 있어요",
        half: "정확히 3곳을 고르면 넘어갈 수 있어요", // [V5-3]
        day: "정확히 4곳을 고르면 넘어갈 수 있어요", // [V5-3]
      },
      // [V5-5] 내륙 확산 · 담은 곳에서 이어 가는 공사 연관 관광지(장소명은 TriText 노드로 옆에 붙는다 · vars 없음)
      spread: {
        title: "방문객이 이어서 가는 곳",
        basis: "공사 연관 관광지 기준",
        basisNearby: "춘천 안 연관 데이터가 없어 가까운 기준 관광지로 보여드려요",
      },
    },
    route: {
      title: "나의 동선",
      listTitle: "방문 순서",
      mockNotice: "정확한 위치는 장소 확정 후 표시됩니다.",
      mapLabel: "동선 지도",
      // [V5-9] 노선 여권 · 담은 코스가 어느 K-콘텐츠 라인의 역으로 이루어졌는지(배지 통과분만 역이 된다)
      lineTitle: "이 코스의 노선",
      lineLocal: "연계 로컬",
      // [V5-10] 공사 축제(searchFestival2) · 여행 날짜에 걸린 것만 · 기간 한정 배지(상시 역 아님)
      festivalTitle: "여행 날짜에 열리는 축제",
      proceed: "이 동선으로 진행",
      rebuild: "다시 조립",
      // [V5-3] IA §11.6 CTA 3종(주 go · 보조 build · 텍스트링크 setup)
      go: "첫 장소로 출발",
      repick: "다시 고르기",
      vehicle: "차량으로 이동",
      // [V5-5] 리듬 코스 · 순서 근거와 정량 지표(서버 routePlanner 산출 · {n}·{m}·{time}·{date}는 LangSwap vars)
      plan: {
        title: "이 순서인 이유",
        related: "연관 관광지로 이어 붙인 구간 {n}개",
        wait: "무작위 순서보다 이동·대기 약 {n}분 절감",
        lastBusOk: "막차({time}) 안에 코스를 마칠 수 있어요",
        lastBusWarn: "{n}번째 구간이 막차({time}) 이후라 그 구간은 택시가 필요해요",
        crowd: "선택한 날 혼잡 {n}곳, 가장 한가한 날({date})은 {m}곳",
        assumed: "배차와 막차는 공개 시간표가 아니라 가정값이에요.",
        legWait: "대기 {n}분",
        legRide: "이동 {n}분",
        legLate: "막차 이후",
        unknown: "장소가 확정되기 전이라 거리를 계산하지 않았어요",
      },
    },
    // [V5-9] K-콘텐츠 노선 · 라인 이름과 한 줄(퀴즈 결과 리빌 · 노선 여권 공용).
    //   카피는 SOURCE_SPOTS 근거 안에서만 쓴다(남이섬은 원문대로 "배경" · '촬영지' 표현 금지 · §8).
    line: {
      drama: { name: "드라마 라인", body: "겨울연가의 배경을 지나는 노선이에요." },
      food: { name: "K-푸드 라인", body: "닭갈비와 막국수를 따라가는 노선이에요." },
      anime: { name: "애니 라인", body: "애니메이션박물관의 전시와 체험을 도는 노선이에요." },
    },
    // [V5-3] K-Route 스팟 공용(K배지 · 집중률 Chip · build·route·go)
    spot: {
      kbadge: {
        kfood: "K-푸드",
        kdrama: "K-드라마",
        kanime: "K-애니",
        kpop: "K-팝",
      },
      crowd: {
        label: "오늘 혼잡도",
        relaxed: "여유",
        moderate: "보통",
        busy: "혼잡",
      },
    },
    // [V5-3] 상세 패널 공사 원문 블록 라벨(detailCommon2·detailIntro2 · odii)
    detail: {
      about: "소개",
      info: "이용 안내",
      address: "주소",
      contact: "문의",
      hours: "이용 시간",
      closed: "쉬는 날",
      fee: "이용 요금",
      menu: "대표 메뉴",
      parking: "주차",
      homepage: "홈페이지",
      audio: "오디오 해설",
      audioBy: "한국관광공사 오디 오디오 가이드",
      source: "출처: 한국관광공사 TourAPI",
      loading: "상세 정보를 불러오고 있어요",
      error: "지금은 상세 정보를 불러올 수 없어요.",
    },
    // [V5-3] K-가이드 봇 FAB 자리(챗은 P3)
    guide: {
      fab: "K-가이드",
    },
    // [V5-6] NFC 성지 스탬프(IA §11.10 개정)
    stamp: {
      title: "스탬프 투어",
      eyebrow: "K-Route 스탬프",
      added: "스탬프를 찍었어요",
      already: "이미 찍은 스탬프예요",
      bad: "이 태그를 확인하지 못했어요. 현장 스티커를 다시 스캔해 주세요.",
      progress: "스탬프",
      badges: "배지",
      complete: "투어 완주",
      certificate: "인증서 저장",
      certTitle: "춘천 K-콘텐츠 스탬프 투어",
      certBody: "춘천 스탬프 투어를 완주했습니다",
      next: "아래 장소에서 이어서 모아 보세요",
      toRoute: "내 동선으로",
    },
    checkout: {
      title: "확인 및 결제",
      summaryTitle: "나의 하루",
      vehicleLabel: "차량",
      partyLabel: "인원",
      luggageLabel: "짐 보관",
      luggageYes: "포함",
      luggageNo: "필요 없음",
      mealPlanLabel: "식사 플랜",
      dateLabel: "여행 날짜",
      editCta: "코스 수정하기",
      orderTitle: "방문 순서",
      dropoffLabel: "최종 하차 지점",
      dropoffPlaceholder: "예: 춘천역, 숙소 주소",
      dropoffOptional: "선택 입력입니다. 정하지 않았다면 비워 두세요.",
      dropoffRequired: "하차 지점을 입력하면 결제할 수 있어요",
      // [V23] 필수 복원 · 배지 · 필수 안내 · 인라인 오류 · 부족 항목 라벨
      requiredBadge: "필수",
      dropoffRequiredNote: "필수 입력입니다. 일정 마지막에 내려드릴 장소를 알려주세요.",
      payMethodRequired: "결제 수단을 선택해 주세요.",
      needLabel: "남은 항목",
      needPass: "이용권",
      needDropoff: "도착지",
      needPay: "결제 수단",
      needConsent: "환불 동의",
      priceTitle: "금액 내역",
      payCta: "결제하기",
      // [V7] 이용권 선택·전액 포함 밴드·환불 동의
      passTitle: "시간제 이용권 선택",
      passPick: "위에서 이용권을 선택하면 최종 금액이 표시됩니다.",
      allIncluded: "표시된 최종 금액 외 추가 비용이 없습니다.",
      refundTitle: "취소·환불 규정",
      refundBody:
        "이용 시작 48시간 이전 취소 시 예약금이 전액 환불됩니다. 이용 시작 48시간 전부터는 예약금이 환불되지 않습니다.",
      consentLabel: "위 취소·환불 규정에 동의합니다.",
      // §42: 폼 하단 caption 1줄 프로토타입 고지(Terms §2 취지) — 확인 Dialog·성공 인터스티셜 폐지
      prototypeNotice: "프로토타입: 실제 결제가 이루어지지 않습니다.",
    },
    // §42 결제 수단 그리드 + 카드 폼(존 C5)
    pay: {
      title: "결제 수단",
      cardNumber: "카드 번호",
      expiry: "유효기간",
      expiryPlaceholder: "MM/YY",
      cvc: "CVC",
      nameOnCard: "카드 소유자 이름",
    },
    ticket: {
      orderTitle: "하루 일정",
      dropoffLabel: "하차 지점",
      // §43 좌측 상세 패널(존 C5) · 환불 규정은 legal.terms.s3 재사용(신규 창작 금지)
      detailsTitle: "예약 상세",
      payMethodLabel: "결제 수단",
      dropoffNone: "지정 안 함",
      payNone: "선택 안 함",
      // [V7] 티켓 분리 내역 · 구 예약(pass_type null)은 "지정 안 함"
      passLabel: "시간제 이용권",
      passNone: "지정 안 함",
      guideTitle: "이용 안내",
      guide1: "탑승할 때 기사님께 티켓 코드를 보여 주세요.",
      guide2: "각 장소는 2시간 슬롯으로 진행되며 기사님이 일정을 지켜 드립니다.",
      guide3: "변경이 필요하면 하루 시작 전에 official@gts.ac.kr 로 알려 주세요.",
      saveCta: "이미지 저장",
    },
  },
};
