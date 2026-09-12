# VENUE_DETAILS.md — 장소 상세 패널 콘텐츠 전문 (v5)

규칙: i18n `venues` 네임스페이스로 그대로 이식(EN 원문, ko·th 번역·3언어 동형). 줄표 없음. [VERIFY]는 현장·전화 확인 대기 값 — UI에는 표기하지 않고 코드 주석으로만. Guest reviews 는 전부 목업(mock: true) — 실후기 아님을 데이터에 명시. 여기 없는 정보를 컴포넌트에서 창작 금지.

구조(패널 공통): heroFacts(카테고리·체류시간·한 줄) / brandStory(2~3문단) / guestReviews(3건, mock) / storeInfo(주소·시간·요금·팁).

---

## gamja-batt — Cafe Gamja Batt (감자밭) · foodspace
- heroFacts: "Bakery cafe · 120 min stay · The birthplace of Chuncheon's potato bread"
- brandStory:
  EN p1: "Gamja Batt began with a father who spent decades preserving thousands of potato varieties, and a daughter, Miso Lee, who came home to tell that story in a way people could taste. The result is gamja-bbang, a potato-shaped bread made without wheat flour, using potato starch and rice flour for its signature chewy skin."
  EN p2: "The cafe sits in a real garden where unusual flower varieties bloom on purpose. The founders wanted visitors to feel crop diversity instead of being lectured about it, so they planted teddy bear sunflowers and lemon-leafed blooms where the potato story could grow on you quietly."
  EN p3: "What started as a small farm cafe now hosts its own potato festival and ships nationwide, but the bread is still best here, warm, a few minutes from the fields it came from."
- guestReviews (mock):
  1. rating 5 · "I came for one potato bread and left with a box. The garden made us stay a whole hour longer." · A., Singapore
  2. rating 5 · "Chewy outside, soft inside. My kids thought they were real potatoes." · R., Thailand
  3. rating 4 · "Busy on weekends, but the line moves and the coffee is better than expected." · K., Korea
- storeInfo:
  address: "674 Sinsaembat-ro, Sinbuk-eup, Chuncheon"
  hours: "Daily 10:00 to 21:00"
  price: "Potato bread from around 3,500 won [VERIFY]"
  tip: "Weekday mornings are calmest. The garden photo spots face afternoon light."

## tongnamujip — Log House Dakgalbi (통나무집닭갈비) · meal
- heroFacts: "Chuncheon dakgalbi · 90 min stay · Forty years by the Soyang Dam"
- brandStory:
  EN p1: "For about forty years this log house near Soyang Dam has done one thing: dakgalbi, chicken cut fresh the same day, tossed on a hot iron plate with vegetables, rice cakes and a house sauce fermented on site."
  EN p2: "It has grown into several branches and a TV-famous name, but the original formula holds, high ceilings, big windows toward the river, and a kitchen that turns tables fast enough that even peak-hour queues keep moving."
  EN p3: "Finish the plate the local way, with fried rice pressed into the leftover sauce, and a bowl of icy dongchimi makguksu made on a water-kimchi broth."
- guestReviews (mock):
  1. rating 5 · "The fried rice at the end is the real main dish. Trust the ritual." · M., Canada
  2. rating 5 · "Big, loud, fast and delicious. Exactly what we wanted after the dam." · P., Thailand
  3. rating 4 · "Go slightly before noon. We walked straight to a window table." · J., Japan
- storeInfo:
  address: "Near Soyang Dam, Sinbuk-eup, Chuncheon [VERIFY exact branch address]"
  hours: "Sun to Fri 11:00 to 21:30, Sat to 22:00, last order one hour before close"
  price: "Dakgalbi from around 14,000 won per person [VERIFY]"
  tip: "Order the makguksu together. The cold broth resets the spice."

## skywalk — Soyang River Skywalk (소양강스카이워크) · activity
- heroFacts: "Landmark walk · 60 min stay · Korea's longest glass skywalk"
- brandStory:
  EN p1: "A 156 meter glass walkway runs straight out over the Soyang River, the longest of its kind in Korea. The middle lane is fully transparent, so the river moves directly under your feet."
  EN p2: "At the far circle you get open water on every side, with the Soyanggang Maiden statue and the giant mandarin fish sculpture waiting as photo spots on the way."
  EN p3: "Come back after sunset if you can. Colored lights turn the walkway and the bridge behind it into one of Chuncheon's favorite night views."
- guestReviews (mock):
  1. rating 5 · "My legs said no, my camera said yes. Worth every step." · L., Vietnam
  2. rating 4 · "Shoe covers required, so skip the heels. The center lane is the thrill." · S., USA
  3. rating 5 · "Went at sunset, stayed for the lights. Best free-feeling hour of the trip." · H., Korea
- storeInfo:
  address: "2675 Yeongseo-ro, Chuncheon"
  hours: "Seasonal hours, closes in bad weather [VERIFY current season]"
  price: "Small entry fee, refunded as local gift certificate [VERIFY]"
  tip: "Shoe covers are provided at the entrance and heels are not allowed on the glass."

## makguksu-museum — Makguksu Experience Museum (막국수체험박물관) · activity
- heroFacts: "Hands-on museum · 90 min stay · Make your own buckwheat noodles"
- brandStory:
  EN p1: "Chuncheon's other signature dish gets its own museum. Downstairs tells the story of makguksu, buckwheat noodles born from lean mountain harvests that became the city's comfort food."
  EN p2: "Upstairs is the fun part: press your own noodles from buckwheat dough in the experience kitchen, then eat what you made on the spot."
  EN p3: "It is small, cheap and genuinely local, the kind of stop that turns a lunch dish into a story you can retell."
- guestReviews (mock):
  1. rating 5 · "We made terrible noodles and had the best time. Staff were lovely." · E., Germany
  2. rating 4 · "Quick visit, ticket costs less than a coffee. Kids loved the press." · N., Thailand
  3. rating 4 · "Do this before dakgalbi day two. You will respect the noodle." · C., Korea
- storeInfo:
  address: "Sindong-myeon, Chuncheon [VERIFY exact address]"
  hours: "Closed Mondays [VERIFY hours]"
  price: "Entry adult 1,000 won, child 500 won, noodle-making experience separate [VERIFY fee]"
  tip: "Reserve the noodle experience ahead on busy weekends."

## mullegil — Jungdo Mullegil Canoe (중도 물레길 카누) · activity
- heroFacts: "Lake canoe · 120 min stay · Paddle the calm side of Uiamho Lake"
- brandStory:
  EN p1: "Mullegil means the water path. Two-person canoes glide out from the dock into Uiamho Lake, where the water is calm enough that first-timers settle in within minutes."
  EN p2: "A short safety briefing, a paddle each, and the city noise drops away. Mornings give mirror water and mist, late afternoons give the long gold light."
- guestReviews (mock):
  1. rating 5 · "Ten minutes in, we stopped paddling and just floated. Unreal quiet." · D., Australia
  2. rating 5 · "Guide was patient with total beginners. Felt safe the whole time." · W., Thailand
  3. rating 4 · "Book the first slot. The morning mist is the photo." · Y., Korea
- storeInfo:
  address: "Songam-dong lakeside, Chuncheon [VERIFY dock address]"
  hours: "Daytime slots, weather dependent [VERIFY]"
  price: "Canoe rental per boat [VERIFY fee]"
  tip: "Phones go in the dry bag. Trust the dry bag."

## gongjicheon — Gongjicheon Riverside (공지천) · activity
- heroFacts: "Riverside walk · 60 min stay · Chuncheon's everyday waterfront"
- brandStory:
  EN p1: "Gongjicheon is where Chuncheon itself comes to walk: a long riverside park of paths, sculpture, old cafes and rental bikes where the city meets the water without a ticket gate."
  EN p2: "It is the easiest hour on any route, a reset between big stops, best taken slowly with something warm in hand."
- guestReviews (mock):
  1. rating 5 · "Rented bikes and did the loop. Locals everywhere, tourists nowhere. Perfect." · F., France
  2. rating 4 · "Simple and calm. The sculpture park photographs better than expected." · T., Taiwan
  3. rating 5 · "Our host timed it for sunset. Ten out of ten decision." · B., Korea
- storeInfo:
  address: "Gongjicheon area, Geunhwa-dong, Chuncheon"
  hours: "Open riverside, always accessible"
  price: "Free. Bike rental nearby [VERIFY fee]"
  tip: "Pair it with a coffee stop. The riverside benches face the sunset."

---

## 목업 카드 공통 상세 (mock: true 카드 전부)
- heroFacts: "Local partner · Coming soon"
- body EN: "We are onboarding this local partner right now. Full story, photos and reviews will appear here once the partnership is confirmed."
- storeInfo: 미표기. guestReviews: 미표기.
- CTA: 선택 버튼은 동일하게 동작(일정 조립은 가능).