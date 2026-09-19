// gts 네임스페이스(EN) 뼈대 · 존 A4 소유 골격 — 서브에이전트는 키를 추가(확장)만 한다(교체·이동 금지).
// freq.*는 data/gts/hubs.js headwayNote가 참조하는 배차 카피(구체 시각·횟수 금지 계약).
// ko·th와 키 완전 동형 유지.
// v4 존 C4 확장: draft·vehicle·fare 공용 + setup/build/route/checkout/ticket 키 추가(IA §9.3~§9.6).
export default {
  gts: {
    freq: {
      rail: "Trains run frequently through the day", // PLACEHOLDER — verify 배차 수준 문구
      bus: "Buses run frequently through the day", // PLACEHOLDER — verify
      metro: "Metro-style service through the day", // PLACEHOLDER — verify
    },
    vehicle: {
      taxi: "Taxi",
      van: "Van",
    },
    fare: {
      base: "Base fare",
      luggage: "Luggage storage",
      perPerson: "Per person",
      total: "Total",
    },
    // [V8] 여정 단계 인디케이터 · 라벨 = 지금 하는 단계 그대로(추상 표현 금지)
    steps: {
      label: "Booking steps",
      s1: "Party & vehicle",
      s2: "Course selection",
      s3: "Route check",
      s4: "Pay & confirm",
    },
    // [V7] 시간제 이용권 · 새 요금 체계(카드 4종 + 포함/초과 안내)
    pass: {
      title: "Time pass",
      names: {
        "1h": "1-hour pass",
        "2h": "2-hour pass",
        "4h": "4-hour pass",
        day: "Full-day pass",
      },
      included: "Taxi rides, deposit and course fees are all included.",
      overtime: "Beyond the included hours, 10,000 won is added per extra hour.",
    },
    setup: {
      title: "Make your K-Route day",
      sub: "Tell us who is coming and we will match your ride.",
      dateLabel: "Travel date",
      datePlaceholder: "Select a date",
      partyLabel: "Travelers",
      luggageTitle: "Need luggage storage?",
      luggageBody: "Optional. Skip this if you travel without a carrier or left your bags at your stay.",
      luggageToggle: "Luggage storage",
      matchTitle: "Your ride",
      cta: "Build my day",
      ctaCheckout: "Continue to checkout", // [V5-3] route 경유·Travel Log 템플릿 → 체크아웃 직행
      // [V9] 9명 이상 단체 문의(뒤에 OFFICIAL_EMAIL 링크)
      partyCapHelp: "Groups of 9 or more, please contact us by email:",
    },
    build: {
      title: "Build your day",
      stepLabel: "Step",
      // §41 StepStage 상단 라벨("1 / 3 · …")용 짧은 스텝명 + 나가기 확인 Dialog(존 C5)
      step: {
        plan: "Meal plan",
        meals: "Meal spots",
        picks: "Day picks",
      },
      exitTitle: "Leave the builder?",
      exitBody: "You will go back to the quiz to change your answers.", // [V5-3] 나가기 = 취향 찾기 복귀
      exitStay: "Keep building",
      exitLeave: "Leave",
      // §10.4 페이지네이션 페어(새로고침 폐지 · 경계 비활성)
      planTitle: "How about meals?",
      plan: {
        none: "No meals",
        noneSub: "I will eat on my own",
        lunch: "Lunch course",
        lunchSub: "One local lunch spot",
        lunchDinner: "Lunch and dinner course",
        lunchDinnerSub: "Two spots, your first pick is lunch",
      },
      mealsTitle: "Pick your meal spots",
      mealsOrderHint: "First pick is lunch, second is dinner.",
      lunchBadge: "Lunch",
      dinnerBadge: "Dinner",
      comingSoon: "Coming soon",
      cat: {
        meal: "Meal",
        foodspace: "Food space",
        activity: "Activity",
      },
      picksTitle: "Pick 2 places for your day",
      // [V5-3] 담기 정원 = q4(반나절 3 · 하루 4)
      picksHalf: "Pick 3 places for your half day",
      picksDay: "Pick 4 places for your full day",
      tabFoodspace: "Food spaces",
      tabActivity: "Activities",
      counterLabel: "selected",
      capFull: "Your picks are full. Unselect one first.",
      // [V9] 선택 큐 + 거리 배지
      queueTitle: "Your course",
      queueRemove: "Remove from course",
      approx: "About",
      minUnit: "min",
      routeEstimate: "Estimated route so far", // [V13] 거리 배지 라벨
      reason: {
        plan: "Choose a meal plan to continue",
        meals: "Finish your meal picks to continue",
        picks: "Pick exactly 2 places to continue",
        half: "Pick exactly 3 places to continue", // [V5-3]
        day: "Pick exactly 4 places to continue", // [V5-3]
      },
      // [V5-5] 내륙 확산 · 담은 곳에서 이어 가는 공사 연관 관광지(장소명은 TriText 노드로 옆에 붙는다 · vars 없음)
      spread: {
        title: "Where visitors head next",
        basis: "Based on KTO related attractions for",
        basisNearby: "No related attractions inside Chuncheon, so this follows the nearest one with data:",
      },
    },
    route: {
      title: "Your route",
      listTitle: "Visit order",
      mockNotice: "Exact locations will appear once these places are confirmed.",
      mapLabel: "Itinerary map",
      // [V5-9] 노선 여권 · 담은 코스가 어느 K-콘텐츠 라인의 역으로 이루어졌는지(배지 통과분만 역이 된다)
      lineTitle: "Lines in this course",
      lineLocal: "Linked local",
      // [V5-16] 1층(도시 전체 노선) 고지 · 지도는 하나, 여정은 사람마다 다르다
      networkNote: "Faint lines are every K-content line in the city. Your own route is drawn on top.",
      // [V5-10] 공사 축제(searchFestival2) · 여행 날짜에 걸린 것만 · 기간 한정 배지(상시 역 아님)
      festivalTitle: "Festivals on your date",
      proceed: "Continue with this route",
      rebuild: "Rebuild my day",
      // [V5-3] IA §11.6 CTA 3종(주 go · 보조 build · 텍스트링크 setup)
      go: "Head to the first stop",
      repick: "Pick again",
      vehicle: "Travel by private car",
      // [V5-5] 리듬 코스 · 순서 근거와 정량 지표(서버 routePlanner 산출 · {n}·{m}·{time}·{date}는 LangSwap vars)
      plan: {
        title: "Why this order",
        related: "{n} legs follow places visitors pair up",
        wait: "About {n} min less travel and waiting than a random order",
        lastBusOk: "You can finish the course before the last bus ({time})",
        lastBusWarn: "Leg {n} falls after the last bus ({time}), so that hop needs a taxi",
        crowd: "Busy spots: {n} on your date, {m} on the quietest day ({date})",
        assumed: "Headway and last bus are assumed values, not a published timetable.",
        legWait: "Wait {n} min",
        legRide: "Ride {n} min",
        legLate: "After last bus",
        unknown: "Distance is not calculated until this place is confirmed",
      },
    },
    // [V5-9] K-콘텐츠 노선 · 라인 이름과 한 줄(퀴즈 결과 리빌 · 노선 여권 공용).
    //   카피는 SOURCE_SPOTS 근거 안에서만 쓴다(남이섬은 원문대로 "배경" · 'filming location' 표현 금지 · §8).
    line: {
      drama: { name: "Drama Line", body: "A line through the settings of Winter Sonata." },
      food: { name: "K-Food Line", body: "A line that follows dakgalbi and makguksu." },
      anime: { name: "Animation Line", body: "A line around the Animation Museum exhibits and hands on programs." },
    },
    // [V5-3] K-Route 스팟 공용(K배지 · 집중률 Chip · build·route·go)
    spot: {
      kbadge: {
        kfood: "K-Food",
        kdrama: "K-Drama",
        kanime: "K-Animation",
        kpop: "K-Pop",
      },
      crowd: {
        label: "Crowd level today",
        relaxed: "Relaxed",
        moderate: "Moderate",
        busy: "Busy",
      },
    },
    // [V5-3] 상세 패널 공사 원문 블록 라벨(detailCommon2·detailIntro2 · odii)
    detail: {
      about: "About",
      info: "Visitor info",
      address: "Address",
      contact: "Contact",
      hours: "Hours",
      closed: "Closed",
      fee: "Admission",
      menu: "Menu",
      parking: "Parking",
      homepage: "Website",
      photos: "Photos", // [V5-17] detailImage2 갤러리
      audio: "Audio guide",
      audioBy: "Odii audio guide by Korea Tourism Organization",
      source: "Source: Korea Tourism Organization TourAPI",
      loading: "Loading details",
      error: "Details could not be loaded right now.",
    },
    // [V5-3] K-가이드 봇 FAB 자리(챗은 P3)
    guide: {
      fab: "K-Guide",
    },
    // [V5-6] NFC 성지 스탬프(IA §11.10 개정)
    stamp: {
      title: "Stamp tour",
      eyebrow: "K-Route stamp",
      added: "Stamp collected",
      already: "You already have this stamp",
      bad: "We could not read this tag. Scan the sticker at the place again.",
      progress: "Stamps",
      badges: "Badges",
      complete: "Tour complete",
      certificate: "Save certificate",
      certTitle: "Chuncheon K-Content Stamp Tour",
      certBody: "completed the stamp tour of Chuncheon",
      next: "Keep collecting at the places below",
      toRoute: "Back to my route",
      // [V5-12] 게스트 스탬프는 서버에 저장하지 않는다(이번 화면에만 표시)
      guestNotice: "Guest preview: this stamp shows on this screen only. Sign in to collect stamps.",
    },
    checkout: {
      title: "Checkout",
      summaryTitle: "Your day",
      vehicleLabel: "Vehicle",
      partyLabel: "Travelers",
      luggageLabel: "Luggage storage",
      luggageYes: "Included",
      luggageNo: "Not needed",
      mealPlanLabel: "Meal plan",
      dateLabel: "Travel date",
      editCta: "Edit my day",
      orderTitle: "Visit order",
      dropoffLabel: "Final drop off point",
      dropoffPlaceholder: "e.g. Chuncheon Station, your stay address",
      dropoffOptional: "Optional. Leave blank if you are not sure yet.",
      dropoffRequired: "Enter your drop off point to continue",
      // [V23] 필수 복원 · 배지 · 필수 안내 · 인라인 오류 · 부족 항목 라벨
      requiredBadge: "Required",
      dropoffRequiredNote: "Required. Tell us where to drop you off at the end of the day.",
      payMethodRequired: "Select a payment method to continue.",
      needLabel: "Still needed",
      needPass: "Time pass",
      needDropoff: "Drop off point",
      needPay: "Payment method",
      needConsent: "Refund agreement",
      priceTitle: "Price breakdown",
      payCta: "Pay",
      // [V7] 이용권 선택·전액 포함 밴드·환불 동의
      passTitle: "Choose your time pass",
      passPick: "Pick a time pass above to see your total.",
      allIncluded: "The total shown here is everything you pay. No extra costs.",
      refundTitle: "Cancellation and refund",
      refundBody:
        "Cancel more than 48 hours before your start time and the deposit is fully refunded. From 48 hours before the start, the deposit is not refundable.",
      consentLabel: "I agree to the cancellation and refund policy above.",
      // §42: 폼 하단 caption 1줄 프로토타입 고지(Terms §2 취지) — 확인 Dialog·성공 인터스티셜 폐지
      prototypeNotice: "Prototype: no real payment is processed.",
      // [V5-12] 게스트(비로그인) 진행 표기 · 로그인 없이 끝까지 체험할 수 있다는 사실과 한계를 함께 밝힌다
      guestNotice: "You are exploring as a guest. No sign in is needed, and no real payment or account is created.",
    },
    // §42 결제 수단 그리드 + 카드 폼(존 C5)
    pay: {
      title: "Payment method",
      cardNumber: "Card number",
      expiry: "Expiry",
      expiryPlaceholder: "MM/YY",
      cvc: "CVC",
      nameOnCard: "Name on card",
    },
    ticket: {
      orderTitle: "Day schedule",
      dropoffLabel: "Drop off",
      // §43 좌측 상세 패널(존 C5) · 환불 규정은 legal.terms.s3 재사용(신규 창작 금지)
      detailsTitle: "Booking details",
      payMethodLabel: "Payment method",
      dropoffNone: "Not specified",
      payNone: "Not selected",
      // [V7] 티켓 분리 내역 · 구 예약(pass_type null)은 "Not specified"
      passLabel: "Time pass",
      passNone: "Not specified",
      guideTitle: "Good to know",
      guide1: "Show your ticket code to the driver when you board.",
      guide2: "Each stop runs as a 2 hour slot and your driver keeps the schedule.",
      guide3: "Need a change? Write to official@gts.ac.kr before your day starts.",
      saveCta: "Save image",
    },
  },
  // [V5-15] /gts 인트로 · 노선도 2층 구조를 한 화면으로 설명한다(퀴즈 직행 앞에 선다).
  //   근거 규율: 역은 근거가 확인된 곳만이라는 점을 카피에서도 지킨다(성지 주장 과장 금지 · SOURCE_SPOTS §8).
  gtsIntro: {
    eyebrow: "K-Route",
    title: "Chuncheon, drawn as two layers",
    sub: "A route map you can read in one screen: the K-content lines on top, and the real way to move between them underneath.",
    layer: {
      topLabel: "Upper layer: K-content lines",
      topBody: "Three lines carry Chuncheon's K-content. Only places with checked sources become stations, so a line never claims more than the records do.",
      bottomLabel: "Lower layer: the real move",
      bottomBody: "Korea Tourism Organization data plans what runs between the stations: the visiting order, the distance, and the time your day actually takes.",
    },
    flow: {
      s1: { title: "Find your line", body: "Five questions, about 40 seconds." },
      s2: { title: "Ride your route", body: "Pick your stations and see the order drawn on the map." },
      s3: { title: "Stamp and finish", body: "Tap the NFC sticker at a station to stamp your passport." },
    },
    start: "Start",
    skip: "Skip, I have done this before",
  },
};
