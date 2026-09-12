# K-가이드 챗봇 골든셋 · English(150)

> 기준 규칙 = `server/services/rag.mjs`의 `RULES`(한국어)·`RULES_EN`(영어·태국어). 답변은 그 규칙을 적용한 모범 응답이다.
> 병렬 골든셋: 같은 150문항을 ko·en·th 세 파일로 나란히 둔다(문항 번호 동일). 키 설정 후 돌려 규칙 준수(무환각·출처·거짓전제 거부·언어 유지)를 PASS/FAIL로 검증한다.
> 사실 근거 = 공사 데이터 + K-Route 검증(플랜·리서치). 자료에 없는 운영시간·가격·촬영지·연고는 넣지 않는다. 라이브 답변은 `spot_chunks` 근거로 생성되어 세부가 더 풍부할 수 있으며, 아래는 규칙 준수 기준선이다.


## A. 정상 추천·안내 (55)

**A1.** What should I eat in Chuncheon?
```
Chuncheon is the home of dakgalbi and makguksu, so both are worth trying.
- **Chuncheon Dakgalbi**: The stalls cluster around Myeongdong dakgalbi street, so it is easy to pick one.
- **Chuncheon Makguksu**: A cold buckwheat noodle that pairs well with the spicy dakgalbi.
If you want to make it yourself, there is the Chuncheon Makguksu Experience Museum.
```

**A2.** What is the Animation Museum?
```
The Animation Museum is the only museum in Korea dedicated to animation. It sits in Seomyeon with the Toy Robot Museum next door, so you can see exhibits and try hands-on activities together. Buses there can be infrequent, so it helps to check the timetable first.
```

**A3.** I want to see places related to Winter Sonata.
```
You can visit the places tied to the drama Winter Sonata.
- **Chuncheon High School**: Known as a backdrop for the drama.
- **Jungang Market**: In the city centre and easy to reach on foot.
- **Jungdo**: An island on Uiam Lake with calm waterside views.
```

**A4.** Is there a place to make makguksu myself?
```
At the Chuncheon Makguksu Experience Museum you can make your own makguksu. It is more than just eating, so it is fun to come with family or friends.
```

**A5.** Recommend an indoor place to go with kids.
```
With kids, an indoor place that stays dry works well.
- **Animation Museum**: The only animation museum in Korea, with plenty for children.
- **Toy Robot Museum**: Right next to it, so you can see both in one visit.
Buses can be infrequent, so check the times before you set off.
```

**A6.** Any place to go on a rainy day?
```
For a rainy day, indoor spots work best.
- **Animation Museum**: Indoor exhibits, good in any weather.
- **Chuncheon Makguksu Experience Museum**: You can make makguksu indoors.
```

**A7.** What about the Soyanggang Skywalk?
```
The Soyanggang Skywalk lets you walk out over the water for a city lake view. It is close to Chuncheon Station, so it is easy to add to another plan.
```

**A8.** Where is good for couples?
```
Here is a waterside route that is nice to walk together.
- **Soyanggang Skywalk**: A viewing deck over the water, good for a stroll together.
- **Jungdo**: An island on Uiam Lake, pleasant for a lakeside walk.
```

**A9.** Tell me about the Kim Yu-jeong Literary Village.
```
The Kim Yu-jeong Literary Village is a literary exhibition site in Sille Village, Sindong-myeon. It is close to Kim Yu-jeong Station on the Gyeongchun Line, so it is easy to reach by transit and pairs well with Gangchon Rail Park.
```

**A10.** I want somewhere with good nature views.
```
Here are spots with lake and waterside scenery.
- **Cheongpyeongsa**: A temple reached by boat across Soyang Lake, with water and mountains together.
- **Jungdo**: An island on Uiam Lake, water on all sides.
Land transit to Cheongpyeongsa is rare, so check the boat and bus times first.
```

**A11.** I want a cafe, any recommendation?
```
There is a street where scenic cafes gather.
- **Gubongsan Cafe Street**: Cafes cluster in Dong-myeon with open views, easy to choose from.
If you tell me your taste, I can narrow it down further.
```

**A12.** I only have half a day, where should I go?
```
For half a day, keep it in the city centre where travel is short.
- **Soyanggang Skywalk**: Close to Chuncheon Station for a quick visit.
- **Myeongdong Dakgalbi Street**: In the centre, easy to add to the skywalk.
The outskirts have long bus gaps, so grouping city-centre spots is best for half a day.
```

**A13.** Plan a one-day course for me.
```
Here is a one-day course that keeps travel short.
1. **Animation Museum**: Start the morning with the indoor exhibits.
2. **Myeongdong Dakgalbi Street**: Come back to the centre for lunch.
3. **Soyanggang Skywalk**: Walk by the water in the afternoon.
Outskirt buses are infrequent, so changing the order can add travel time.
```

**A14.** I get around on foot, where can I go?
```
On foot, it is easiest to stay in the city centre.
- **Jungang Market**: In the centre, walkable, and known as a Winter Sonata backdrop.
- **Myeongdong Dakgalbi Street**: Near the market, easy to continue on foot.
- **Soyanggang Skywalk**: A waterside spot within walking distance of Chuncheon Station.
```

**A15.** I'm thinking of Nami Island, how is it?
```
Nami Island draws the most visitors, but its ferry pier is on the Gapyeong side. Transit from Chuncheon's city centre is weak, so seeing only Nami Island means missing inner Chuncheon. Plan your route ahead if you want to combine it with downtown spots.
```

**A16.** Where are the K-content spots in Chuncheon?
```
Chuncheon holds several strands of K-content.
- **Winter Sonata backdrops**: Chuncheon High School, Jungang Market and Jungdo are known drama backdrops.
- **Dakgalbi and Makguksu**: The origin of these globally loved K-foods.
- **Animation Museum**: The only animation museum in Korea.
```

**A17.** Tell me good photo spots.
```
Here are spots with waterside scenery for photos.
- **Soyanggang Skywalk**: Capture the city and lake together from over the water.
- **Jungdo**: In the middle of Uiam Lake, water all around.
```

**A18.** I want an activity with friends.
```
For something active, the rail bike is a good pick.
- **Gangchon Rail Park**: A rail bike you pedal along an old railway.
- **Kim Yu-jeong Literary Village**: Near Kim Yu-jeong Station, easy to pair with the rail park.
```

**A19.** What is Jungang Market?
```
Jungang Market is a traditional market in central Chuncheon. It is also known as a Winter Sonata backdrop, and being downtown it is easy to combine with other spots on foot.
```

**A20.** What is Gangchon Rail Park?
```
Gangchon Rail Park is a rail bike you pedal along a former railway. It is near the Kim Yu-jeong area on the Gyeongchun Line, so it pairs well with the literary village.
```

**A21.** Somewhere easy to visit with my parents?
```
The city centre, with little travel and easy walking, works well.
- **Soyanggang Skywalk**: Close to Chuncheon Station for an easy visit.
- **Jungang Market**: Downtown and gentle to stroll through.
```

**A22.** A quiet place to walk alone?
```
Here is a calm waterside route for a walk.
- **Jungdo**: An island on Uiam Lake, quiet to stroll.
- **Soyanggang Skywalk**: A deck over the water, nice for a walk.
```

**A23.** Somewhere cool on a hot day?
```
On a hot day, indoors or the waterside is best.
- **Animation Museum**: Indoor exhibits to escape the heat.
- **Soyanggang Skywalk**: By the water, with a cool breeze.
```

**A24.** A spot for an early morning walk?
```
For an early walk, the downtown waterside is nice. The **Soyanggang Skywalk** is close to Chuncheon Station and pleasant for a light morning stroll. Check the opening hours before you go.
```

**A25.** Recommend somewhere for the evening.
```
For the evening, the centre avoids last-bus worries. Have dinner at the **Myeongdong Dakgalbi Street** and walk downtown with no travel stress. The outskirts have early last buses, so keep the evening in the centre.
```

**A26.** Anywhere to enjoy for free?
```
A downtown route you can enjoy just by walking works well.
- **Jungang Market**: Fun just to browse, and a known Winter Sonata backdrop.
- **Myeongdong Dakgalbi Street**: Near the market, easy to continue on foot.
```

**A27.** I like literature, any spot?
```
If you like literature, the **Kim Yu-jeong Literary Village** is a good pick. It is a literary exhibition site in Sille Village, close to Kim Yu-jeong Station.
```

**A28.** I love animation. Anywhere to go?
```
If you love animation, this is the perfect spot.
- **Animation Museum**: The only animation museum in Korea.
- **Toy Robot Museum**: Right next door, easy to see together.
```

**A29.** A place to relax by a lake?
```
Here are spots to relax by the lake.
- **Jungdo**: An island on Uiam Lake, water all around.
- **Soyanggang Skywalk**: Look over the lake from above the water.
```

**A30.** I want to browse a market.
```
The **Jungang Market** is a good choice. It is a traditional market in central Chuncheon, walkable and known as a Winter Sonata backdrop.
```

**A31.** I want to try a rail bike.
```
You can ride the rail bike at **Gangchon Rail Park**. You pedal along an old railway, and it is near the Kim Yu-jeong area for easy pairing.
```

**A32.** Where's a good place for dakgalbi?
```
Dakgalbi restaurants cluster on the **Myeongdong Dakgalbi Street**. You can choose from many in one place, which is handy for first-timers.
```

**A33.** Where's good makguksu?
```
You can enjoy makguksu like this.
- **Sambat Makguksu Street**: Makguksu shops gather in Sinbuk-eup.
- **Chuncheon Makguksu Experience Museum**: Make and taste your own.
```

**A34.** Where are cafes with a good view?
```
The **Gubongsan Cafe Street** is nice. Cafes with open views gather in Dong-myeon, easy to choose from.
```

**A35.** Plan a one-day family outing.
```
A one-day family course with little travel.
1. **Animation Museum**: Start the morning with indoor exhibits.
2. **Myeongdong Dakgalbi Street**: Lunch downtown.
3. **Soyanggang Skywalk**: An afternoon walk by the water.
```

**A36.** An active day out with friends.
```
Here is an active one-day course.
1. **Gangchon Rail Park**: Ride the rail bike on the old railway.
2. **Kim Yu-jeong Literary Village**: Near the station, an easy next stop.
```

**A37.** A half-day date course for a couple.
```
A half-day course nice to walk together.
1. **Soyanggang Skywalk**: Walk over the water together.
2. **Jungdo**: Stroll on the island in the lake.
```

**A38.** Just one best photo spot.
```
I recommend the **Soyanggang Skywalk**. From over the water you can frame the city and lake in one shot.
```

**A39.** Recommend just one indoor place.
```
I recommend the **Animation Museum**. As the only animation museum in Korea, it is good in any weather.
```

**A40.** Anywhere for water or riverside fun?
```
Here are waterside spots to enjoy.
- **Soyanggang Skywalk**: A city viewing deck over the water.
- **Cheongpyeongsa**: Reached by boat across Soyang Lake for a water route.
Check the boat times for Cheongpyeongsa in advance.
```

**A41.** I'm a Winter Sonata fan, a course to follow?
```
A course through the Winter Sonata backdrops in the centre.
1. **Chuncheon High School**: A known drama backdrop.
2. **Jungang Market**: Downtown, easy to continue on foot.
3. **Jungdo**: Finish on the island in Uiam Lake.
```

**A42.** I want a K-food tour.
```
You can enjoy Chuncheon's K-food like this.
- **Chuncheon Dakgalbi**: Try the signature taste on Myeongdong dakgalbi street.
- **Chuncheon Makguksu**: Great alongside dakgalbi.
- **Chuncheon Makguksu Experience Museum**: Make your own too.
```

**A43.** Plan an animation tour.
```
A course centred on animation.
1. **Animation Museum**: The only animation museum in Korea.
2. **Toy Robot Museum**: Right next door to see together.
```

**A44.** I want to do everything within the city centre.
```
A course you can walk within the centre.
- **Jungang Market**: A downtown traditional market.
- **Myeongdong Dakgalbi Street**: Near the market.
- **Soyanggang Skywalk**: Walkable from Chuncheon Station.
```

**A45.** A day in the outskirts nature.
```
For outskirts nature, **Cheongpyeongsa** is good. Reached by boat across Soyang Lake, it offers water and mountains together. The land bus runs only twice a day, so check the boat and bus times first.
```

**A46.** First time in Chuncheon, what first?
```
For a first visit, here are three highlights.
- **Chuncheon Dakgalbi**: The signature food on Myeongdong dakgalbi street.
- **Soyanggang Skywalk**: A waterside sight close to the centre.
- **Animation Museum**: The only animation museum in Korea.
```

**A47.** Half a day, K-content only.
```
For half a day, the downtown Winter Sonata backdrops work well.
- **Chuncheon High School**: A known drama backdrop.
- **Jungang Market**: Downtown, easy to continue on foot.
```

**A48.** A course that's fine even if it rains.
```
A course that stays indoors even in rain.
1. **Animation Museum**: Start with indoor exhibits.
2. **Chuncheon Makguksu Experience Museum**: Make makguksu indoors too.
```

**A49.** Any hands-on activity kids would like?
```
Here are hands-on activities kids enjoy.
- **Chuncheon Makguksu Experience Museum**: Make your own makguksu.
- **Toy Robot Museum**: Next to the Animation Museum, kids love it.
```

**A50.** I just want a quiet walk.
```
Here are calm waterside spots for a walk.
- **Jungdo**: An island on Uiam Lake, quiet.
- **Soyanggang Skywalk**: A slow walk over the water.
```

**A51.** Is there a city tour bus?
```
Yes, there is a Chuncheon city tour bus. It departs from Chuncheon Station and is closed on Mondays. It follows a set course, so booking ahead is a good idea.
```

**A52.** How to make a day trip full?
```
For a day trip, keep travel short and group city-centre spots.
1. **Animation Museum**: Indoor exhibits in the morning.
2. **Myeongdong Dakgalbi Street**: Lunch downtown.
3. **Soyanggang Skywalk**: A waterside walk in the afternoon.
Mixing in the outskirts adds travel and often ends at one spot.
```

**A53.** My parents can't walk much, an easy course?
```
A downtown course with less travel and walking.
- **Soyanggang Skywalk**: Close to Chuncheon Station for a short visit.
- **Myeongdong Dakgalbi Street**: Near the skywalk, easy to combine.
```

**A54.** I want to rest somewhere with an open view.
```
For an open view to rest, here are good spots.
- **Gubongsan Cafe Street**: Cafes with open views in Dong-myeon.
- **Soyanggang Skywalk**: A wide view of city and lake from over the water.
```

**A55.** Just the must-do course in Chuncheon.
```
The signature Chuncheon course not to miss.
1. **Animation Museum**: The only animation museum in Korea.
2. **Myeongdong Dakgalbi Street**: Eat the signature dakgalbi.
3. **Soyanggang Skywalk**: Finish by the downtown water.
```

## B. 교통·실현 가능성 (30)

**B1.** Can I visit Cheongpyeongsa and Nami Island in one day?
```
Doing both in one day by public transport is hard. The trip between them takes around three hours, and the land bus to Cheongpyeongsa runs only twice a day. It is better to pick one and take your time.
```

**B2.** Are buses to the Animation Museum frequent?
```
Buses into Seomyeon, where the Animation Museum is, enter the area about five times a day. Gaps can stretch to two or three hours, so check the timetable before you go.
```

**B3.** What time is the last bus from the outskirts?
```
The outskirts and waterside spots have early last buses, mostly between 17:30 and 19:00. Staying late can make it hard to get back downtown. City trunk buses run later, so end your route in the centre.
```

**B4.** How do I get to Cheongpyeongsa?
```
The usual way to Cheongpyeongsa is by boat from Soyanggang Dam. The land bus runs only twice a day, so check both the boat and bus times in advance.
```

**B5.** Can I reach Jade Garden by public transport?
```
Jade Garden is hard to reach directly by public transport. Even the nearest Gulbongsan Station is about four kilometres away, so check how to get there before you go.
```

**B6.** Do Chuncheon city buses run late at night?
```
It depends on the route. Trunk buses around the centre run into the night, but branch lines to the outskirts stop early in the evening. Finish outskirt plans during the day and head back downtown.
```

**B7.** What train goes to Chuncheon?
```
From Seoul you can reach Chuncheon by the ITX-Cheongchun and regular trains. They run along the Gyeongchun Line, so getting into the centre is easy.
```

**B8.** Is the Kim Yu-jeong Literary Village easy to reach by transit?
```
Yes, transit access is good. It is close to Kim Yu-jeong Station on the Gyeongchun Line and walkable, and it pairs nicely with Gangchon Rail Park.
```

**B9.** How do I get to Legoland?
```
Legoland is connected by bus from Chuncheon Station. The line from Chuncheon Station crosses the bridge straight to it, so it is not hard to reach from the centre.
```

**B10.** What's the problem with staying out at the outskirts until evening?
```
The problem is the early last bus. Waterside and outskirt areas mostly stop between 17:30 and 19:00, so staying into the evening can strand you from downtown. It is safer to end the evening in the centre.
```

**B11.** How long from Kim Yu-jeong to the Soyanggang Skywalk by transit?
```
It takes a little over an hour by public transport. That is more than three times the car time, so allow plenty for the train and downtown transfer.
```

**B12.** Is Nami Island to the Soyanggang Skywalk long by transit?
```
It takes about two and a half times longer than by car. From Nami Island you transfer between train and bus via Gapyeong, so allow extra travel time.
```

**B13.** Is Jade Garden to Nami Island easy?
```
It is not an easy stretch by public transport. It crosses the Gangwon-Gyeonggi boundary with detours and transfers on rural buses, so check the route in advance.
```

**B14.** Can I go from Gangchon Rail Park to Cheongpyeongsa?
```
It is possible but slow by public transport. It needs a train, city bus and a Soyang Lake boat, so rather than combining both, one place a day is better.
```

**B15.** Is Legoland quick from Chuncheon Station?
```
Yes, it is fairly quick. The bus from Chuncheon Station crosses the bridge straight there, so it is easy from the centre.
```

**B16.** Is Kim Yu-jeong Literary Village easy from Namchuncheon Station?
```
Yes, access is good. It is one stop on the Gyeongchun Line, so the transit timing lines up well.
```

**B17.** How do I take the city tour bus?
```
It departs from Chuncheon Station and runs at set times. Walk-up seats may be available, but booking ahead is safer.
```

**B18.** Does the city tour bus run on Mondays?
```
It is closed on Mondays. It runs on other days, so check the day and book ahead.
```

**B19.** When does the Cheongpyeongsa boat stop?
```
The Cheongpyeongsa boat stops in the afternoon. The end time varies by season, so be sure to check the return boat time before you go.
```

**B20.** Is the last bus around the Seomyeon Animation Museum early?
```
Yes, the last bus in Seomyeon is early. Buses into the city run about five times a day, so leave in good time and check the timetable first.
```

**B21.** How do I get from here to the first spot?
```
If you turn on your location, I can show the walking route and estimated taxi time to the first spot. Allow location and check it on the go screen.
```

**B22.** No car — can I reach the outskirts?
```
You can reach the outskirts, but buses are infrequent and stop early. Areas like Seomyeon or Cheongpyeongsa run few times a day, so match the timetable and go during the day.
```

**B23.** Are there buses downtown at night?
```
Yes, downtown trunk buses run into the night. But branch lines to the outskirts stop early, so keep night travel within the centre.
```

**B24.** Can I get around without a rental car?
```
Within the centre you can manage well without a rental car. But outskirt sites have big bus and last-service limits, so plan the timetable ahead if you include them.
```

**B25.** How do I get to Soyanggang Dam?
```
Soyanggang Dam is connected by bus from the centre. The downtown line runs fairly often, so access is not hard, and the Cheongpyeongsa boat departs from here.
```

**B26.** Can I reach Cheongpyeongsa by land too?
```
There is a land bus, but only twice a day. It is hard to fit into a schedule, so most visitors take the boat from Soyanggang Dam.
```

**B27.** Can I see more than two places in a day?
```
Grouping city-centre spots, more than two is doable. But mixing in the outskirts can mean two or three hours of travel and ending at one place, so keep it centre-focused.
```

**B28.** What if I miss the last bus?
```
If you miss the last bus in the outskirts, you may need a taxi out. So check the return bus or boat times in advance for outskirt trips.
```

**B29.** Can I go from the Animation Museum to Legoland?
```
The travel is long, so fitting both in one day is tight. It takes over an hour by transit, so start early if you want to see both.
```

**B30.** Can I add Legoland after Kim Yu-jeong?
```
It is possible, but transfers take a while. From Kim Yu-jeong via Namchuncheon to a Legoland bus, allow plenty for waits, so move in good time.
```

## C. 거짓 전제 거부 (20)

**C1.** Gongjicheon is a Winter Sonata filming site, right?
```
There is no confirmed evidence that Gongjicheon was a Winter Sonata filming site. The known backdrops are Chuncheon High School, Jungang Market and Jungdo.
```

**C2.** Legoland is Chuncheon K-content too, isn't it?
```
Legoland is not really K-content. For Chuncheon's K-content I can point you to the Winter Sonata backdrops, dakgalbi, makguksu and the Animation Museum.
```

**C3.** I heard Shin Ha-kyun is from Chuncheon, related spots?
```
I do not have information on that connection. I can guide you to Chuncheon's verified K-content spots instead.
```

**C4.** There's a WJSN Dawon cafe in Chuncheon, right?
```
I have no verified information on that. Please ask about places or courses in Chuncheon and I will help.
```

**C5.** Nami Island is where all Chuncheon's money circulates, right?
```
Nami Island is administratively in Chuncheon, but its pier and shops are on the Gapyeong side. So spending does not flow into Chuncheon's centre; pairing it with downtown spots lets you enjoy Chuncheon more.
```

**C6.** There's a Winter Sonata theme park in Chuncheon, right?
```
I have no information on such a theme park. You can visit the known backdrops: Chuncheon High School, Jungang Market and Jungdo.
```

**C7.** There's a data center tourist spot in Chuncheon, right?
```
I have no information on such a spot. Please ask about verified places or courses in Chuncheon.
```

**C8.** Park So-dam is from Chuncheon, so there are related spots, right?
```
I do not have information on that connection. I can point you to Chuncheon's verified spots.
```

**C9.** Legoland is a K-drama filming site, right?
```
There is no evidence of such filming. For Chuncheon's K-content I can point you to the Winter Sonata backdrops, dakgalbi, makguksu and the Animation Museum.
```

**C10.** There's a BTS spot in Chuncheon, right?
```
I have no verified information on that. Please ask about places or courses in Chuncheon.
```

**C11.** Nami Island is Chuncheon's main K-content, right?
```
Nami Island's pier is on the Gapyeong side, so it does not connect to Chuncheon's centre. The verified Chuncheon K-content is the Winter Sonata backdrops, dakgalbi, makguksu and the Animation Museum.
```

**C12.** Gongjicheon appeared in a drama, right?
```
There is no confirmed evidence that Gongjicheon appeared in a drama. The known Winter Sonata backdrops are Chuncheon High School, Jungang Market and Jungdo.
```

**C13.** A famous idol visited the Animation Museum, right?
```
I have no information on that visit. The Animation Museum is Korea's only animation museum, with exhibits and hands-on activities to enjoy.
```

**C14.** Was Squid Game filmed in Chuncheon?
```
There is no evidence of that filming. Chuncheon's verified K-content includes the Winter Sonata backdrops, dakgalbi, makguksu and the Animation Museum.
```

**C15.** The Soyanggang Skywalk is famous as a variety show location, right?
```
I have no information on variety show filming. The Soyanggang Skywalk is a city lake-view deck where you walk over the water.
```

**C16.** Makguksu's origin isn't really Chuncheon, is it?
```
Chuncheon is known as the origin of makguksu. Along with dakgalbi it is a signature food, which you can enjoy on Sambat Makguksu Street or at the Chuncheon Makguksu Experience Museum.
```

**C17.** The dakgalbi street is on Nami Island, right?
```
The dakgalbi street is not on Nami Island but in downtown Myeongdong, Chuncheon. Restaurants cluster on the Myeongdong dakgalbi street, easy to choose from.
```

**C18.** Kim Yu-jeong is an actor's name, right?
```
The Kim Yu-jeong Literary Village is a literature-related site. I have no information on an actor connection, so I will introduce it as a literary exhibition space in Sille Village, Sindong-myeon.
```

**C19.** Jade Garden is Chuncheon's number one, right?
```
I have no basis to declare a popularity ranking. That said, the most visited place is Nami Island, which takes a large share of the top-ten sites' visitors.
```

**C20.** Cheongpyeongsa is downtown, right?
```
Cheongpyeongsa is not downtown but on the outskirts. It is a temple reached by boat across Soyang Lake, so check the boat and bus times in advance.
```

## D. 범위 밖·자료 없음 noinfo (20)

**D1.** Recommend a sashimi place in Haeundae, Busan.
```
The official data has no information on that. Please ask about places in Chuncheon.
```

**D2.** Where's a good place to stay in Jeju?
```
The official data has no information on that. Please ask about places in Chuncheon.
```

**D3.** What exactly is the Cheongpyeongsa admission fee?
```
I cannot confirm the admission fee from my data. It is best to check before your visit.
```

**D4.** What time does the Animation Museum close today?
```
I cannot confirm today's closing time from my data. Please check the opening hours before you visit.
```

**D5.** How's the weather in Chuncheon?
```
Weather is not in the data I work with. Please ask about places or courses in Chuncheon.
```

**D6.** Tell me the star ranking of Chuncheon restaurants.
```
I have no basis for a star ranking, so I cannot name the top one. Instead I can point you to the signature foods: dakgalbi and makguksu.
```

**D7.** Where can I exchange money?
```
I do not have information on currency exchange. Please ask about places or courses in Chuncheon.
```

**D8.** Recommend a good restaurant in Seoul.
```
The official data has no information on that. Please ask about places in Chuncheon.
```

**D9.** Tell me how to get to Gangneung.
```
The official data has no information on that. Please ask about places in Chuncheon.
```

**D10.** Book a ticket for me now.
```
I cannot make a booking for you. I can help with places or courses in Chuncheon instead.
```

**D11.** How many are waiting at the Animation Museum now?
```
I cannot confirm the real-time wait from my data. Please check on-site conditions before visiting.
```

**D12.** Where's a nearby pharmacy?
```
Pharmacy locations are not in my data. Please ask about tourist places or courses in Chuncheon.
```

**D13.** Where's the restroom?
```
Restroom locations are not in my data. Please check the guidance at the place you are visiting.
```

**D14.** Where is my location?
```
I cannot tell you your current location. Please ask about places or courses in Chuncheon.
```

**D15.** How much per night to stay in Chuncheon?
```
I cannot confirm accommodation prices from my data. It is most accurate to check directly with the booking site.
```

**D16.** Book a rental car for me.
```
I cannot book a rental car for you. I can help with places or courses in Chuncheon instead.
```

**D17.** Where are the coin lockers at Chuncheon Station?
```
Coin locker locations are not in my data. Please check the station guidance.
```

**D18.** Tell me a cafe with Wi-Fi.
```
Wi-Fi details per cafe are not in my data. I can point you to Gubongsan Cafe Street, where scenic cafes gather.
```

**D19.** Tell me the hours of Myeongdong dakgalbi.
```
I cannot confirm each restaurant's hours from my data. It is best to check before your visit.
```

**D20.** What's the exchange rate?
```
Exchange rates are not in my data. Please ask about places or courses in Chuncheon.
```

## E. 후속 질문·멀티턴 (25)

**E1.** [prev: 3 indoor places] Which is best with kids?
```
With kids, the **Animation Museum** is best. It has exhibits and hands-on activities, so children do not get bored.
```

**E2.** [prev: food/sights/activities] Pick one from each.
```
- **Chuncheon Dakgalbi**: The signature food on Myeongdong dakgalbi street.
- **Soyanggang Skywalk**: A signature sight near the centre.
- **Chuncheon Makguksu Experience Museum**: A hands-on makguksu activity.
```

**E3.** [prev: Animation Museum] How do I get there?
```
Buses into Seomyeon, where the Animation Museum is, run about five times a day, so gaps are long. Check the timetable before you set off.
```

**E4.** [prev: one-day course] Problem if I stay until evening?
```
The problem is the earlier last bus further out. Waterside and outskirt areas mostly stop between 17:30 and 19:00, so it is safer to end the evening in the centre.
```

**E5.** [prev: how to reach Cheongpyeongsa] By what time should I leave?
```
Around Cheongpyeongsa the boat and land last services are early, so leave in good time. Check the return boat and bus times in advance.
```

**E6.** [prev: popular spots] Anywhere quieter?
```
If you want somewhere calmer than the crowds, inner-city sites are good. Instead of busy Nami Island, the inland spots let you look around at ease.
```

**E7.** [prev: 3 spots] Which is the closest?
```
The closest to the centre is the **Soyanggang Skywalk**. It is near Chuncheon Station, so travel is easy.
```

**E8.** [prev: one-day course] Can I reverse the order?
```
You can reverse it, but the current order is better for last buses and timing. Leaving the outskirts or waterside for the evening can make the return hard.
```

**E9.** [prev: two places] Which of the two is better?
```
Which is better depends on your situation. If you want less travel, the one nearer the centre is better; if you want nature, the waterside one.
```

**E10.** [prev: Animation Museum] Is it indoors?
```
Yes, the Animation Museum has indoor exhibits, good to browse in any weather.
```

**E11.** [prev: dakgalbi/makguksu in Korean] Give me that in English.
```
Chuncheon is the home of dakgalbi and makguksu.
- **Chuncheon Dakgalbi**: Restaurants cluster on the Myeongdong dakgalbi street.
- **Chuncheon Makguksu**: A cold buckwheat noodle that pairs well with it.
```

**E12.** [prev: a course] Any cheaper way?
```
I cannot confirm exact costs from data, but a walkable downtown course spends less on travel. Grouping walkable spots like Jungang Market and Myeongdong keeps it light.
```

**E13.** [prev: transit] How much by taxi?
```
I cannot confirm taxi fares from my data. Roughly, the longer the distance the higher it goes, so estimate ahead for outskirt trips.
```

**E14.** [prev: active course] Is it okay with a baby?
```
With a baby, switch to indoor spots with short travel. The **Animation Museum** and **Chuncheon Makguksu Experience Museum** are indoors and easy with a child.
```

**E15.** [prev: recommendation] Are there others?
```
Yes, there are more. Besides the ones above, the **Kim Yu-jeong Literary Village** and **Gangchon Rail Park** pair well too.
```

**E16.** [prev: one-day course] Let's start from the first, then.
```
Great, the first stop is the **Animation Museum**. Starting with indoor exhibits in the morning opens the day at ease.
```

**E17.** [prev: two places] What's good about each?
```
- **Soyanggang Skywalk**: Close to the centre with easy travel and waterside views.
- **Jungdo**: An island on Uiam Lake, quiet for a stroll.
```

**E18.** [prev: outdoor course] Where if it rains?
```
If it rains, switch to indoors. The **Animation Museum** and **Chuncheon Makguksu Experience Museum** are indoors, good in any weather.
```

**E19.** [prev: the skywalk] What time is good to go?
```
Please check the exact hours before you go. It is downtown and easy to reach, so a quieter daytime slot lets you look around at ease.
```

**E20.** [prev: the skywalk] Anywhere to eat nearby?
```
For eating nearby in the centre, the **Myeongdong Dakgalbi Street** is good. It connects toward downtown from the skywalk, so travel is short.
```

**E21.** [prev: one-day course] How long does it take?
```
The exact time depends on travel and how long you stay. Grouping city-centre spots keeps travel short, so three places fit comfortably in a day.
```

**E22.** [prev: in English] Tell me in Thai.
```
ชุนช็อนเป็นต้นกำเนิดของทักคาลบีและมักกุกซูค่ะ
- **ทักคาลบีชุนช็อน**: ร้านอยู่รวมกันแถวถนนทักคาลบีเมียงดงค่ะ
- **มักกุกซูชุนช็อน**: เส้นบักวีตเย็น ๆ กินคู่กันเข้ากันดีค่ะ
```

**E23.** [prev: several spots] Which is best for photos?
```
Waterside spots photograph well. Among them, the **Soyanggang Skywalk** frames the city and lake in one shot from over the water.
```

**E24.** [prev: several spots] Just one of them.
```
If just one, I recommend the **Soyanggang Skywalk**. It is near the centre, good even for a short visit.
```

**E25.** [prev: outskirts] Can I stay until evening?
```
Staying out in the outskirts until evening can make the return hard. Last buses mostly stop between 17:30 and 19:00, so head back to the centre before evening.
```

## 검증 체크리스트 (English)

- [ ] 답변 전체 English · 한국어 누출 0(E22 언어전환 제외)
- [ ] A·B 근거 장소만·불릿+볼드·8문장 · C 거짓전제 거부 · D "no information" · 추측 0
- [ ] E 직전 맥락 유지 · 표/이모지/샵 0
