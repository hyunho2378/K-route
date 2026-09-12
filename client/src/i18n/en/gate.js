// gate 네임스페이스(EN) · 존 B(GATE) 소유. home/gate/handsfree.
// ko·th와 키 완전 동형. 줄표 금지. 존 A가 기존 키를 이관한 베이스라인이며 B가 확장한다.
// v4.2 존 B5(IA §10.2·§10.3): 히어로 카피 교체(BRAND_COPY §12 그대로) + CTA 페어(ctaGate/ctaBuild),
// 스탯 스트립·라인 섹션·미니 폼 키 삭제, 서비스 진입 카드·리뷰 스트립 키 신설,
// How it works 3스텝 §10.2 문안 재작성, 플래너: 시계(§38)·휠 라벨·레그 시각(§39)·데모 도착(§40) 키 신설,
// 30분 스텝 시간 라벨(gate.time.*)·dir.label·form.time·placeholders.time·errors.time 삭제(TimeWheel 대체).
export default {
  home: {
    hero: {
      title: "Chuncheon, on your terms.",
      sub: "Your trip, zero missing links. Choose your ride and create your own adventure.",
      ctaGate: "Plan my route",
      ctaBuild: "Build my day",
      slides: {
        alt1: "A calm blue lake winding between forested mountains",
        alt2: "Morning mist over green ridges and a winding road",
        alt3: "A waterfall pouring into a deep green forest valley",
      },
      dots: {
        d1: "Show photo 1",
        d2: "Show photo 2",
        d3: "Show photo 3",
      },
    },
    // [V5-11] 문제 근거 스트립 · 검증 확정 수치만(값은 data/evidence.js) · 각 수치에 출처를 병기한다.
    //   설문 기반(외래관광객조사)과 통신 기반(한국관광 데이터랩)은 정의가 다르므로 출처에 그 구분을 남긴다.
    evidence: {
      eyebrow: "Why Chuncheon",
      title: "The problem in numbers",
      items: {
        stage: "Share of performance ticket sales in the capital area",
        transit: "Public transport share gap (Seoul 37% vs Gangwon 5.3%)",
        headway: "Average rural bus headway (minutes)",
        seoul: "Inbound travelers who visited Seoul (2023)",
        fit: "Independent travelers (FIT) among inbound visitors (2023)",
        nami: "Nami Island share of Chuncheon's top 10 destinations",
        daytrip: "Chuncheon visitors who return home the same day",
      },
      source: {
        stage: "Korea Arts Management Service, 2025 performance ticket sales report",
        transit: "Ministry of Land, Infrastructure and Transport, modal share 2024",
        headway: "Rural Development Administration, 2024 welfare survey",
        seoul: "Ministry of Culture, Sports and Tourism, International Visitor Survey 2023 (survey based)",
        fit: "Ministry of Culture, Sports and Tourism, International Visitor Survey 2023",
        nami: "Gangwon State official statistics",
        daytrip: "Korea Tourism Data Lab 2022 (mobile network based)",
      },
    },
    services: {
      eyebrow: "Start here",
      title: "Two services, one trip",
      planner: {
        title: "Trip Planner",
        desc: "Compare curated rail and bus routes between your city and Chuncheon.",
      },
      builder: {
        title: "Tour Builder",
        desc: "Pick meals, places and activities, and meet a day that runs with a ride.",
      },
    },
    how: {
      eyebrow: "Why it works",
      title: "How it works",
      step1: {
        title: "Plan your arrival",
        body: "Wherever you start, plan the ride into Chuncheon along curated rail and bus routes.",
      },
      step2: {
        title: "Build your day",
        body: "Assemble your own course from meals, local places and activities, all in one flow.",
      },
      step3: {
        title: "Meet a day that is ready",
        body: "This is the difference: we pre-order ahead, so you arrive with your ride and everything starts without a wait.",
      },
    },
    reviews: {
      eyebrow: "Reviews",
      title: "Travelers who went first",
      viewAll: "See all reviews",
    },
    proof: {
      eyebrow: "Pilot proof",
      title: "We already ran it.",
      body: "A real van, real riders, a real route.\nPhotographed on our first operating day in Chuncheon.",
      cta: "See the proof",
      alt: "GTS van on a real Chuncheon pilot run", // [V10] van-hero 이미지 대체 텍스트
    },
  },
  gate: {
    title: "Airport to Chuncheon",
    intro: "Land at Incheon or Gimpo, clear immigration, and compare the two ways into Chuncheon: rail or direct bus.",
    form: {
      terminal: "Arrival terminal",
      // v3.2 §8.2.1: 출발지 필드(현재 위치 1옵션 + 허브 병존) · Gate 플래너 전용 라벨
      from: "From",
      currentLocation: "Current location",
      date: "Arrival date",
      submit: "Find my route",
      placeholders: {
        terminal: "Airport",
        date: "Date",
      },
      terminals: {
        t1: "Incheon T1",
        t2: "Incheon T2",
        gmp: "Gimpo",
      },
      terminalCodes: {
        t1: "ICN",
        t2: "ICN",
        gmp: "GMP",
      },
    },
    // 날짜 라벨 조립 파트 · 오늘부터 7일 옵션(FieldSelect) · 언어별 겹침 렌더로 시프트 0
    dates: {
      format: "{wd}, {mon} {day}",
      weekdays: { d0: "Sun", d1: "Mon", d2: "Tue", d3: "Wed", d4: "Thu", d5: "Fri", d6: "Sat" },
      months: {
        m1: "Jan", m2: "Feb", m3: "Mar", m4: "Apr", m5: "May", m6: "Jun",
        m7: "Jul", m8: "Aug", m9: "Sep", m10: "Oct", m11: "Nov", m12: "Dec",
      },
    },
    results: {
      heading: "Your options",
      buffer: "Includes a 60-minute immigration buffer after landing.",
      duration: "Total time",
      fare: "Fare",
      transfers: "Transfers",
      direct: "Direct",
      firstAvailable: "First departure",
      nextDay: "Next day",
      stepsHeading: "Step by step",
    },
    // v3.2 §8.5 도착 감지(ArrivalWatcher) · 문안은 IA §8.5 고정 카피의 EN 이식(줄표 금지)
    arrival: {
      card: {
        offTitle: "Continue your journey after you arrive in Chuncheon?",
        offDesc: "Once you arrive in Chuncheon, we check your location and let you know it is time to start the city leg.",
        enable: "Turn on arrival check",
        guide: "How location is used",
        footnote: "We check only while this screen stays open",
        waitingTitle: "Waiting for your arrival in Chuncheon",
        disable: "Turn off arrival check",
        outsideTitle: "You are still outside Chuncheon",
        deniedTitle: "You can confirm arrival yourself, no location permission needed",
        manual: "I have arrived in Chuncheon",
        settings: "See location guidance again",
        errorTitle: "We couldn't read your current location",
        retry: "Check again",
        arrivedTitle: "You have arrived in Chuncheon.",
      },
      explain: {
        title: "We'll check your arrival",
        body: "To let you know when it is time to start the city leg, we use your current location once you reach Chuncheon. Location is used only to confirm arrival.",
        allow: "Allow location use",
        later: "Maybe next time",
        footnote: "You can turn off arrival check anytime in settings.",
      },
      modal: {
        label: "CHUNCHEON ARRIVAL",
        title: "You have arrived in Chuncheon.",
        // IA §8.5.4는 "본문 2문장"만 지정(문장 미확정) · 최소 창작, 오케스트레이터 확인 대상
        body: "The ride from the airport was the first leg. Now the city lines carry your journey inside Chuncheon.",
        continue: "Continue the journey",
        later: "Not right now",
        footnote: "We use your current location to help you move and explore in the city.",
      },
    },
    // v4 존 B4(IA §9.2) 양방향 플래너 · ko·th와 키 완전 동형 · 줄표 금지
    // v4.2 존 B5(IA §10.3): dir.to/from = 수직 2섹션 제목으로 전환(칩 토글 폐지 · dir.label 삭제),
    // clock(§38 라이브 KST)·wheel(TimeWheel 컬럼 라벨)·results.eta*(§39)·demoArrival(§40) 신설
    planner: {
      title: "Getting to and from Chuncheon",
      intro: "Pick where you start and where you arrive, and we show curated ways between your city and Chuncheon. The way back is planned the same way below.",
      clock: "It is {time} in Korea right now",
      dir: {
        to: "To Chuncheon",
        from: "From Chuncheon",
      },
      form: {
        to: "To",
        date: "Travel date",
        time: "Departure time",
        fromPh: "Origin",
        toPh: "Destination",
      },
      wheel: {
        hours: "Hour",
        minutes: "Minute",
      },
      // 위치 사용 사전 설명 모달 · §21 동의 패턴의 플래너 목적 카피
      locate: {
        title: "Use your location to plan this route",
        body: "We read your current location once to match the nearest station, terminal, or airport in our list. Location is used only to plan this route.",
        allow: "Allow location use",
        later: "Maybe next time",
        footnote: "Your location is not stored. You can pick a hub from the list anytime.",
      },
      results: {
        // §9.2.4 PLACEHOLDER 마킹 · 초안 추정값 고지
        totalApprox: "About {min} min",
        legMin: "About {min} min",
        varies: "Travel time varies",
        toPlace: "To {place}",
        // §39 레그 시각 계산 표기 · durMin 합산일 뿐 시간표 아님 · "예상" 라벨 상시
        eta: "Est. {time}",
        etaNextDay: "Est. {time} next day",
      },
      routeKind: {
        rail: "Rail",
        bus: "Bus",
        mixed: "Rail + Bus",
      },
      empty: {
        title: "No curated route for this pair yet",
        body: "We have not verified this combination yet. Try the other Chuncheon stop or another hub while we expand the list.",
      },
      // §40 데모 도착 시퀀스 · To 섹션 결과 확정 3초 뒤 중앙 모달 · label은 연출 카피(Kanit 예외)
      demoArrival: {
        label: "CHUNCHEON ARRIVAL",
        title: "You have arrived in Chuncheon",
        body: "Shall we go book a journey of your own?",
        cta: "Go build my day",
        later: "Later",
      },
    },
  },
  handsfree: {
    title: "Send your bags ahead",
    intro: "Check your bags at the airport counter and they reach your Chuncheon accommodation first. An established luggage-delivery partner carries them. We run the Chuncheon booking layer.",
    // v3.2 §8.4: Optional 배지(StatusBadge 문법) + 선택 사항 카피
    optional: {
      badge: "Optional",
      note: "Every line can be ridden with or without your bags. This service is optional.",
    },
    steps: {
      drop: {
        label: "Drop at airport",
        body: "Check your bags at the partner counter in the arrivals hall, show your drop-off code, and walk out light.",
      },
      carry: {
        label: "We carry to Chuncheon",
        // v3.2 §16.7: 공급자 용어(Loop) 노출 폐지 · 사용자 언어(city line)로 교체
        body: "The delivery partner drives your bags to Chuncheon while you ride in by rail, bus, or a city line.",
      },
      meet: {
        label: "Meet it at your stay",
        body: "Your bags wait at the front desk of your stay. Check in, and they are already there.",
      },
    },
    detail: {
      title: "What happens to your bags",
      body: "You check your bags once at the airport luggage counter. An established delivery partner carries them to Chuncheon, we run the booking layer for the Chuncheon leg, and one drop-off code covers the whole handoff.",
    },
    faq: {
      title: "Before you send",
      q1: "When do my bags arrive?",
      a1: "Bags checked in the morning usually reach your stay by evening. The counter confirms the exact window when you drop off.",
      q2: "Who actually carries my bags?",
      a2: "An established luggage-delivery partner runs the transport. Global Tourism System handles the booking and the Chuncheon side, and your drop-off code works across both.",
      q3: "Can my bags go somewhere outside Chuncheon?",
      a3: "Not yet. The service covers accommodation addresses inside Chuncheon, and that focus is what keeps it reliable.",
    },
    form: {
      bags: "Bags",
      address: "Chuncheon accommodation address",
      email: "Contact email",
      perBag: "per bag",
      total: "Total",
      submit: "Send my bags",
      errors: {
        date: "Pick your arrival date so the counter expects your bags.",
        address: "Enter the Chuncheon address your bags should reach: the name of the stay plus its street address.",
        email: "Enter an email like name@example.com. Your drop-off code goes there.",
      },
    },
    success: {
      title: "Your bags are booked.",
      codeLabel: "Drop-off code",
      body: "Show this code at the airport luggage counter on arrival day.",
      home: "Back to Home",
    },
  },
};
