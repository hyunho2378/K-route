// [V5-6] K-가이드 봇 RAG 검색 · IA §11.8 · 동해사이(G-Local-Station) 검증 챗봇의 rag.mjs 이식.
//   검색(키워드 + 동의어 확장) · 후속질문 판정 · 검색어 보강 · 출처 추출 · 시스템 프롬프트 조립 로직은 원본 그대로다.
//   바뀐 것은 지식 소스뿐이다: 정적 JSON 대신 spot_chunks(공사 다국어 상세·odii·연관관광지·SOURCE_SPOTS 큐레이션)를
//   ragService 가 setKnowledge 로 넣는다. 동의어·구체 주제어·말투 규칙·장소 id 접두어는 춘천 맥락으로 교체했다.

// 지식 항목 = { id: 'spot-<풀 id>-<lang>', lang, keywords: [표시 이름, ...소문자 검색어], content, weight, link: <풀 id> }
let knowledge = []

export function setKnowledge(items) {
  knowledge = items
}

// 키워드 매칭이라 동의어에 약하다. 대표어로 질문을 넓혀 유사 표현을 같은 의도로 잡는다
// 질문은 소문자로 들어온다(영문 키워드 매칭). 태국어 질문은 영어로 옮긴 뒤 들어온다
const SYNONYMS = [
  { hit: /닭갈비|닭 ?갈비|dakgalbi|chicken/, add: ' 닭갈비 dakgalbi' },
  { hit: /막국수|메밀|국수|makguksu|buckwheat|noodle/, add: ' 막국수 makguksu' },
  { hit: /애니|만화|캐릭터|로봇|animation|anime|cartoon|character/, add: ' 애니메이션 animation' },
  { hit: /드라마|촬영지|겨울연가|drama|filming|winter sonata/, add: ' 드라마 촬영 drama' },
  { hit: /성지|순례|덕질|k-?콘텐츠|k-?content|pilgrimage/, add: ' 닭갈비 막국수 애니메이션 dakgalbi makguksu animation' },
  { hit: /먹을|맛집|밥|식당|먹거리|저녁|점심|food|restaurant|eat/, add: ' 맛집 음식 food restaurant' },
  { hit: /카페|커피|디저트|cafe|coffee|dessert/, add: ' 카페 cafe' },
  { hit: /아이|애들|아기|자녀|키즈|어린이|가족|kid|child|family/, add: ' 가족 아이 family' },
  { hit: /걷|산책|둘레길|트레킹|walk|trail|hike/, add: ' 산책 walk' },
  { hit: /호수|강|댐|물|lake|river|dam/, add: ' 호수 lake' },
  { hit: /체험|놀거리|액티비티|즐길|볼거리|experience|activity/, add: ' 체험 experience' },
  { hit: /혼잡|붐비|사람 ?많|한산|여유|집중률|crowd|busy|quiet/, add: ' 집중률 crowd' },
]

const MIN_SCORE = 2
const FOLLOWUP_MARKER = /아까|방금|앞에서|위에서|위의|앞의|그중|그곳|거기|각각|추천(?:한|해준)|말(?:한|해준)|첫\s*번째|두\s*번째|세\s*번째|다른\s*곳/
const CONCRETE_TOPIC = /춘천|소양|의암|공지천|중도|강촌|김유정|삼악산|닭갈비|막국수|애니|박물관|카페|맛집|식당|호수|산책|체험|아이|가족|버스|기차|코스/

function isContextOnlyFollowUp(query) {
  return FOLLOWUP_MARKER.test(query) && !CONCRETE_TOPIC.test(query)
}

export function isFollowUpQuery(query = '') {
  return FOLLOWUP_MARKER.test(query)
}

// "위에서 각각 하나"처럼 현재 문장만으로 검색할 수 없는 질문은 직전 문답을 검색어에 붙인다.
// 모델에 히스토리를 보내는 것과 별개로 RAG도 같은 대상을 보게 해야 새 자료와 앞선 답변이 충돌하지 않는다.
export function buildRetrievalQuery(message, history = []) {
  if (!isFollowUpQuery(message) || !Array.isArray(history)) return message

  const recentContext = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-2)
    .map((m) => m.content.trim())
    .filter(Boolean)

  return recentContext.length ? `${recentContext.join('\n')}\n${message}` : message
}

function expandQuery(query) {
  let q = query
  for (const { hit, add } of SYNONYMS) if (hit.test(query)) q += add
  return q
}

export function searchKnowledge(rawQuery, maxHits = 3) {
  // 지시어뿐인 후속 질문은 억지로 자료를 붙이지 않는다.
  // 0건을 반환하면 chat 라우트가 이미 전달한 대화 히스토리를 우선 활용한다.
  if (isContextOnlyFollowUp(rawQuery)) return []

  const query = expandQuery(rawQuery)
  const scored = knowledge.map((item, idx) => {
    let score = 0
    for (const kw of item.keywords) {
      if (kw.length >= 2 && query.includes(kw)) {
        score += 2 // 키워드 전체가 질문에 들어 있으면 더 준다
      } else {
        for (const word of kw.split(' ')) {
          if (word.length >= 2 && query.includes(word)) score += 1
        }
      }
    }
    // 사용자가 코스를 명시하면 가족 패스처럼 주변 키워드가 많은 항목보다 코스 자료를 우선한다.
    if (/코스|일정|동선/.test(rawQuery) && item.id.startsWith('course-')) score += 4
    // 권역 요약과 코스처럼 여러 곳을 한 번에 설명하는 항목을 개별 스팟보다 위에 둔다
    return { item, score: score * (item.weight || 1), idx }
  })

  return scored
    .filter(s => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, maxHits)
    .map(s => s.item)
}

// 답변에 실제로 이름이 등장한 개별 장소만 출처 카드로 돌려준다.
// 검색 hit 자체를 그대로 노출하면 묶음 자료는 카드에서 사라지고, 우연히 링크가 있는 한 곳만 남는다.
export function findMentionedSources(answer, fallbackHits = [], maxSources = 12) {
  const mentioned = knowledge.filter((item) => {
    if (!item.link || !item.id.startsWith('spot-')) return false
    const name = item.keywords?.[0]
    return typeof name === 'string' && name.length >= 2 && answer.includes(name)
  })

  // 모델에게 추천 장소명을 굵게 쓰도록 지시하므로, 굵은 이름이 있으면 단순 위치 설명에
  // 스쳐 나온 지명(예: "소양강 근처")은 카드에서 제외한다.
  const emphasized = mentioned.filter((item) => answer.includes(`**${item.keywords[0]}**`))
  const answerSources = emphasized.length ? emphasized : mentioned
  const sources = answerSources.length ? answerSources : fallbackHits.filter((item) => item.link)
  const seen = new Set()
  return sources.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  }).slice(0, maxSources)
}

// 말투 규칙. 질문이 바뀌어도 이 블록은 그대로라 프롬프트 앞에 둔다.
// 앞자리에 두면 Ollama가 프리픽스를 다시 평가하지 않아 첫 토큰이 빨라진다.
const RULES = `너는 K-Route 춘천 여행 안내원이다. 춘천으로 여행 오는 사람에게 말을 건네는 안내자다.
한국관광공사 공식 데이터와 K-Route가 사실을 확인한 자료만 가지고 답한다.

말투.
친절한 존댓말 대화체로 답한다. 이에요 예요 좋아요 있어요 어때요 해보세요 같은 부드러운 어미를 쓴다.
이다 한다 같은 문어체 종결이나 명사만 늘어놓는 문장은 쓰지 않는다.
장소만 나열하지 말고 왜 그곳이 좋은지 이유를 한 마디씩 붙인다. 이유도 자료집에 있는 사실에서만 가져온다.
질문한 사람의 상황에 맞춘다. 가족이라고 하면 아이와 함께 움직이는 상황을, 걸어서 다닌다고 하면 차 없이 걷고 버스 타는 상황을 기준으로 답한다.
네가 AI라는 말은 하지 않는다.

근거.
자료집에 적힌 사실만 말한다. 자료집에 없는 장소, 운영시간, 가격, 촬영지, 연예인 연고는 지어내지 않는다.
자료집이 촬영 근거가 없다고 적은 곳은 촬영지라고 말하지 않는다.
춘천 철도는 ITX 청춘과 일반열차다. 자료집에 없는 열차 이름을 붙이지 않는다.

대화 이어가기.
아까 위에서 그중 각각처럼 앞 답변을 가리키는 말은 바로 직전 답변을 기준으로 이해한다.
각각 하나씩 골라 달라는 요청은 앞 답변의 분류마다 이미 언급한 고유한 장소명 한 곳을 골라 정확히 이름을 쓴다.
식당을 골라 달라는 질문에 근처 식당 같은 뭉뚱그린 표현을 대신 쓰지 않는다.
자료집에 인기 순위 근거가 없으면 가장 인기 있다고 단정하지 말고 자료집에 소개된 곳이라고 안내한다.

답변 형식 우선 규칙.
여러 장소나 항목을 안내할 때는 반드시 하이픈 불릿을 쓰고, 각 항목의 이름은 별표 두 개로 굵게 한다. 이동 순서나 단계는 번호 목록으로 쓴다.

조사.
받침 있는 단어 뒤에는 은 이 을 과 으로를 쓰고, 받침 없는 단어 뒤에는 는 가 를 와 로를 쓴다.
예로 춘천은, 박물관은, 소양강댐은, 닭갈비는, 막국수는, 카페는처럼 이름 마지막 글자의 받침에 맞춰 조사를 고른다.
장소 이름을 별표로 감쌀 때도 조사는 그 이름의 받침에 맞춘다.

자료집 문장 옮겨 쓰기 금지.
아래 자료집은 공공데이터 원문이라서 문장이 딱딱하다. 사실만 가져오고 문장은 네 말로 다시 만든다.
kType 앵커 grade 근거강도 같은 내부 표시는 답변에 쓰지 않는다.

확인 안 됨 처리.
자료집에 없는 정보는 아예 언급하지 않고 넘어간다. 꼭 짚어야 하면 방문 전에 한 번 확인해보시는 게 좋아요처럼 자연스럽게 안내한다.
자료집에 없는 것은 지어내지 않는다. 그 부분은 아직 모른다고 솔직히 말한다.

강조.
장소 이름과 가격과 시간처럼 눈에 걸려야 하는 값만 별표 두 개로 감싼다.
줄글 문단에서는 한 문단에 두 곳까지만 감싸고 문장 전체를 감싸지 않는다. 불릿이나 번호 항목에서는 각 항목의 이름을 굵게 한다.
추천한 장소의 이름은 자료집에 적힌 이름 그대로 그 장소를 설명하는 문단이나 항목 안에 반드시 쓴다.

서식.
정보가 여러 개일 때는 줄글로 쭉 잇지 말고 읽기 좋게 나눈다.
장소나 항목을 여러 개 안내할 때는 하이픈 불릿으로 한 줄에 한 곳씩 정리한다. 이름은 별표 두 개로 굵게 하고 그 뒤에 설명을 붙인다.
예로 - **춘천막국수체험박물관**: 막국수를 직접 만들어 보는 체험을 운영해요.
순서나 단계가 있는 내용은 1. 2. 3. 번호로 정리한다.
불릿과 번호 항목도 이에요 예요 어때요 같은 부드러운 존댓말 어미로 끝낸다. 이름만 툭 끊지 않는다.
불릿 앞에는 한 줄로 무엇을 안내하는지 소개하고, 어울리면 맨 뒤에 후속 질문을 한 문장 붙인다.
짧은 단답이나 되묻는 질문에는 불릿을 억지로 쓰지 않고 한두 문장으로 자연스럽게 답한다.

정보 표기.
일반 문장에서는 콜론을 쓰지 않고 항목 이름과 값 사이를 빈칸으로 띄운다. 다만 불릿이나 번호 항목에서 볼드로 감싼 이름 바로 뒤에는 콜론을 써도 된다.
운영시간 10:00에서 19:00처럼 적는다.
숫자는 자료집에 적힌 값을 그대로 쓴다. 바꾸거나 어림하지 않는다.

배치.
한 문단은 세 문장까지다. 문단이 바뀌면 빈 줄 하나를 넣는다.
샵과 이모지는 쓰지 않는다. 표는 쓰지 않는다.
전체는 여덟 문장 안쪽으로 유지한다.
어울릴 때만 마지막에 후속 제안을 한 문장 붙인다. 매번 기계적으로 붙이지 않는다.

답변 예시.
나쁜 예는 애니메이션박물관은 국내 유일 애니메이션 전문 박물관이다.
좋은 예는 애니메이션박물관은 국내에 하나뿐인 애니메이션 전문 박물관이에요. 전시와 체험을 함께 즐길 수 있어요.`

// 영어·태국어 답변용 규칙. 위 한국어 규칙 블록 뒤에서는 모델이 계속 한국어로 답한다(2026-09-12 실측: 영어 질문에
// 한국어 불릿, 태국어 질문에 태국어 인사 + 한국어 본문) → 같은 제약을 답변 언어로 준다. 자료집은 한국어여도 된다.
const RULES_EN = `You are the K-Route guide for Chuncheon, Korea. You speak to travellers visiting the city.
You only use facts from the source pack below. It comes from Korea Tourism Organization open data and facts K-Route has verified.

Language.
Write EVERY sentence in {LANG}. Do not answer in Korean.
The source pack may be written in Korean. Read it, then say it in {LANG}.
Keep place names as written in the pack. When a pack entry shows an English name next to the Korean one, use the English name.

Grounding.
Use only facts from the pack. Never invent places, opening hours, prices, filming locations or celebrity connections.
When the pack says there is no evidence for something, say that plainly instead of repeating the claim.
When the pack does not cover the question, say you do not have that information. Do not guess.
Do not mention internal labels such as kType, anchor or grade.

Format.
Be warm and polite. For each place add one short clause on why it is worth going, taken from the pack.
When you list places, use hyphen bullets, one place per line, and wrap each place name in double asterisks.
Use a numbered list only for an order of visits. No tables, no emoji, no hash marks.
Keep the whole answer under eight sentences. Add one follow-up question only when it fits naturally.`

// 한국어 프롬프트와 같은 조립이되 규칙·안내문이 영어다. 후속질문 보강은 한국어 지시어 정규식이라 여기서는 쓰지 않는다.
export function buildSystemPromptEn(hits, hasHistory = false, langName = 'English') {
  const context = hits.map((h) => h.content).join('\n\n')
  const rules = RULES_EN.replaceAll('{LANG}', langName)
  if (!context) {
    return hasHistory
      ? rules + `

Chuncheon source pack.
No new pack entry matches this question, but the conversation is ongoing. Build on the places you already named above and invent nothing new.`
      : rules + `

Chuncheon source pack.
Nothing in the pack matches this question. Say you do not have that information yet and invite another question. Invent nothing.`
  }
  return rules + `

Chuncheon source pack. Use only these facts.
${context}

Do not copy the pack sentences. Say them in your own words, in ${langName}.`
}

function buildFollowUpInstruction(message) {
  if (!isFollowUpQuery(message)) return ''

  const exactCount = /각각|하나씩|한\s*곳씩|1\s*개씩/.test(message)
  if (!exactCount) {
    return `\n\n이번 질문은 앞선 대화의 후속 질문이다. 직전 답변에 나온 고유 장소명을 직접 사용해서 답하고 근처 장소처럼 바꾸어 말하지 않는다.`
  }

  return `\n\n이번 질문은 직전 답변의 분류마다 한 곳을 고르는 요청이다.
요청한 분류마다 정확히 한 곳만 골라 - **고유 장소명**: 선택 이유 형식으로 답한다.
분류명만 굵게 쓰지 말고 선택한 장소명을 굵게 쓴다.
직전 답변에 없던 장소, 주변의 다른 장소, 추가 추천, 후속 질문은 붙이지 않는다.`
}

export function buildSystemPrompt(hits, hasHistory = false, message = '') {
  const context = hits.map(h => h.content).join('\n\n')
  const followUpInstruction = buildFollowUpInstruction(message)
  if (!context) {
    // 앞선 대화가 있으면 이어지는 후속 질문일 수 있다. 거절하지 말고 앞 답변 맥락으로 답한다
    if (hasHistory) {
      return RULES + `

춘천 자료집.
지금 질문에 딱 맞는 새 자료집 항목은 없지만 대화가 이어지는 중이다. 직전 대화에서 언급한 장소를 최우선으로 참고해 자연스럽게 답한다. 바로 위에서 네가 이미 안내한 곳들을 떠올리고, 앞에서 말한 장소를 다시 활용하되 없는 사실은 새로 지어내지 않는다. 정말 정보가 부족하면 무엇을 더 알려줄지 한 문장으로 되묻는다.${followUpInstruction}`
    }
    return RULES + `

춘천 자료집.
지금 질문과 맞는 자료집 항목이 없다. 아직 가진 자료가 없어 답을 드리기 어렵다고 친절하게 말하고 다른 것을 물어보라고 한 문장 덧붙인다. 없는 사실은 지어내지 않는다.`
  }
  return RULES + `

춘천 자료집. 아래 사실만 근거로 삼는다.
${context}

위 자료집 문장을 그대로 옮기지 말고 친절한 존댓말 대화체로 다시 말해라.${followUpInstruction}`
}
