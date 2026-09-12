INBOUND TOURISM SERVICE DESIGN
Team Bomnae Helper Hyun Ho, Min woo, Seung Hun, Mi ju, Fudai, Hyun Jin
Global  Tourism System
Real-time transit-based travel platform for foreign visitors in Chuncheon
PROBLEM
Independent travelers search for transport first, and hit a digital wall.
Independent travel share
Top pre-trip info needs
Top pain points in Korea
[ VADER 0 to 1 ]
transport
52.4%
0.52
0.48
80.5%
attractions
47.3%
0.39
0.38
food
46.8%
Digital
Transport
Dining
Tourist info
Source: MCST, 2024 International Visitor Survey
Source: MCST, 2024 International Visitor Survey
Source: Yanolja Research (2026.4), 7,260 Reddit posts
INSIGHT
Eight in ten now travel independently, 
yet the transport info they need is lost behind language and app barriers.
USER RESEARCH X FIELD RESEARCH
Travelers named the problem, and we went to Chuncheon to see it.
Getting around
FIELD FINDINGS, 2026.07.21
"A ten-minute ride takes about forty minutes by bus."
Google review, Chuncheon Station
Language
1
One bus in that hour at Soyang Art Circle stop.
"The bus drivers only speak Korean, so you're out of luck."
TripAdvisor, Legoland
Info & payment
2
Korean-only signage at the downtown stop.
"Naver Map in English feels like a treasure hunt, not a map."
Reddit r/koreatravel (56 upvotes)
INSIGHT
The slow buses and language barriers travelers report online 
are the same ones we saw on the ground.
MARKET BACKGROUND
The inbound market is back at an all-time high, and it already reaches Chuncheon.
Inbound visitors to Korea (2021–2025)
Foreign share of Chuncheon visitors
18.7M
20M
16.4M
15M
1.03M
11.0M
10M
5M
0.97M
0
2021
2023
2024
2025
Foreign visitors (11.7%)
Source: MCST, Korea Tourism Organization
Source: Chuncheon City 2025.1 (total 8,835,670 · foreign 1,034,741)
WHY CHUNCHEON
1.03M come to Chuncheon, but almost none of them reach downtown.
A downtown hub 
with no bus to it
The city tour bus, 
funded but avoided
foreign visitor asked 
for a way 
around the city
Soyang Art Circle, 
next bus up to 3 hours
"I wouldn't take it again" 
- rider
"one bus that goes around 
all the tourist spots"
INSIGHT
1.03M already reach Chuncheon, but with no way around the city, 
they leave before spending a single day downtown.
TARGET & PERSONAS
One can't read the bus stop. One can't get five people and their bags into one taxi.
Pain Points
NEEDS
User Story
English search returns nothing.Naver Map in English feels like a treasure hunt.
To see where to go, by what transport, and how long it takes, all in English
"I booked the room, but nobody tells me 
in English how to get anywhere from here."
Train, bus and map data sit in five different apps
To pull the scattered pieces into one plan on one screen
Nattapong
No way to tell which places are worth it, and the risk is all his
To build a day only from places others have already proven
27, Bangkok, solo developer
Pain Points
NEEDS
User Story
She has to move five people and their bags, and one taxi won't take them
A vehicle sized to her party, waiting where they stand
"There are five of us with suitcases. One taxi is too small, and the next bus is thirty minutes away."
She spends the day carrying luggage instead of showing her parents the city
To drop the bags once and move light for the rest of the day
Anucha
Her parents, her kids and she want three different days
To build one course that works for all three generations
34, Chiang Mai, traveling with her parents and two kids
SOLUTION
GTS reads live transit data, matches a ride to your group, and lets you set the route.
PLAN THE RIDE
MATCH THE RIDE
BUILD THE DAY
Real transit data, readable in English
A vehicle sized to the partyand the bags
A course the traveler assembles, not a fixed tour
Train and intercity bus times from the national TAGO API
Every leg on one screen, no app switching
Routes and durations written in the traveler's language
Party size and luggage decide taxi or van
Dispatched to where the group is standing
Luggage stored so the day starts light
Meals, spaces and activities picked one by one
Each place carries its story, reviews and details
One day that fits a solo traveler or three generations
You land, your vehicle is waiting, and you decide where the day goes.
COMPETITIVE EDGE
Among five existing services, not one lets a foreign traveler finish a journey alone.
Solo Foreigner
Usability
Information
Intergration
Journey
Connectivity
Schedule
Freedom
Kakao T
O
O
O
Naver Map
O
X
X
O
Yanolja
X
X
X
O
City Tour Bus
O
O
X
Hana Tour
O
O
X
GTS
O
O
O
O
BUSINESS MODEL: B2G2C
GTS turns a city's tourism budget into a day the traveler can actually run.
City of Chuncheon
Sbsidy, paid direct
local government
Platform contract
approx. ₩140M / year
Time pass
GTS
Settlement
Mobility operator
Traveler
licensed taxi partner
foreign visitor
Intergrated platform
owns no vehicle
Booking·route
Promotion fee
Local partners
shops / attractions
ENGINE 1:B2G contract
ENGINE 2: Partner marketing
Traveler pricing
Build and operation ₩100M
License, maintenance, data ₩40M
Setup · routing · multilingual ops · analytics
Free basic listingPaid priority placement
Featured routes · banners · promotions
2h ₩20,000
4h ₩40,000
all-day ₩60,000
luggage ₩5,000
1h ₩10,000(*per add hour)
PROTOTYPE
Independent travelers search for transport first, and hit a digital wall.
1
Trip Planner
2
Party & Luggage
You set your departure point and time, and get live train and bus routes to Chuncheon from the national TAGO API.
You enter headcount and bag count, and a taxi or a van is matched to that.
3
Course Builder
4
Route Confirmed
You open each place's detail panel, then add the ones 
you want to your own course.
The places you added are drawn as one ordered route on the map, 
run by the vehicle matched in step 2.
USABILITY EVALUATION
We put the deployed service in front of 21 international travelers.
Real User Feedback
Who
21 international testers
USA, Thailand, Vietnam, Germany, Kyrgyzstan
Google sign-in with real accounts, no anonymous entries
How
Validation Dashboard
Free exploration of the deployed service, no script
Every session stored in the DB, reviewable on the dashboard
Written feedback collected per tester
TRACTION
They told us what was missing, and we built it in.
WHAT THEY ASKED
WHAT WE BUILT
WOULD THEY USE IT
"People are more places"
Photos on every card
Sy, USA
"I wish we had it when we were in Korea."
"More places and foods"
29 → 42 local places
Soo, USA
"Add currency conversion"
Home-currency display
"Like your own travel agent."
Hillwa, Germany
"Luggage option confusing"
Fixed selection
"I'd be happy to share web with friends"
The same testers who listed the problems said they would travel with it.
GO TO MARKET
Gangwon Tourist Taxi for Foreigners is a public program. Its operator is re-selected every year.
Program office interview(22.07.2026)
Program office confirmation
This year's operator is under contract, so immediate connection is closed. 
We will submit a formal proposal for next year's program, and the office confirmed it will be reviewed for collaboration.
Step flow
User validation
Deployed MVP
Measured effect
Formal proposal
Collaboration review
completed
deployed
in progress
planned
confirmed
MARKET SIZE
Our customer is not the traveler. It is the city that budgets for them.
Entry market · ₩139.86M / year
How each figure is built
Public budget signals
SOM
Same procurement benchmark applied
₩139.86M per municipality
243, 18 and 3 × the benchmark
₩11.55B (2024 Smart Tourism City budget)
₩139.86M (KTO smart-tourism project)
₩420M
3 municipalities
Why cities buy
Where it goes next
SAM
Better visitor mobility increaseslocal spending and lengthens stays.
Chuncheon → Gangwon → Nationwide → Abroad
Template: transit API, brand database, language layer
₩2.52B
18 in Gangwon
TAM
The traveler's day is the product. 
The city's budget is the market.
₩33.99B
Beyond 243 → any city with a transit API
Estimate based on the KTO smart-tourism project benchmark (₩139.86M). Actual contract value varies by scope and operating period.
IMPACT
One run pays a local shop, carries a traveler downtown, and holds four partners together.
Decent Work & Economic Growth
Sustainable Cities & Communities
Partnerships for the Goals
Travelers routed to local restaurants, cafés and markets across the city
New multilingual host and customer support roles
Higher utilization for existing tourist taxi drivers
A route from the station into the downtown, where none ran before
One vehicle for a group instead of separate rides
Language barrier removed from local transit
Built on the city's tourist taxi program and national transit API
Connects local brands, tourism offices and a university team
Every run we add sends a visitor into a Chuncheon local brand that a tour bus never stops at.
TEAM
Six people cover build, design, planning, operations, education and a global lens, all in-house.
Hyunho Ju (CEO)
Minwoo Oh
Miju Heo
UX/UI Designer, Frontend Dev

Platform design and development
Backend Developer

Server, auth, data pipeline
Planning & Operations

Field research and agency inquiry
Seunghoon Han
Fudai Taleh
Hyunjin Lee
Data Science, Business

Validation metrics and dashboard
Business & Thai Market

Thai market validation
Education

Onboarding and guidance design
KEY TAKEAWAY
Sightseeing on your terms.
GTS, not GPS.
We’ll navigate your every detail.