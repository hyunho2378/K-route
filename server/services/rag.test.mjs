// [V5-6] 이식한 rag.mjs 로직 검증 · 동해사이 rag.test.mjs 와 같은 네 가지를 춘천 지식으로 확인한다(+ 자료 없는 질문 0건)
//   지식은 DB 대신 고정 항목으로 넣는다(ragService 가 만드는 모양과 같다) · 실행: node --test server/services/rag.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  setKnowledge,
  buildRetrievalQuery,
  buildSystemPrompt,
  findMentionedSources,
  isFollowUpQuery,
  searchKnowledge
} from './rag.mjs'

setKnowledge([
  {
    id: 'spot-tongnamujip-ko', lang: 'ko', link: 'tongnamujip', weight: 1.3,
    keywords: ['통나무집 닭갈비', '통나무집닭갈비', '통나무집', '춘천 닭갈비', '닭갈비', '맛집', '식당', '음식'],
    content: '[통나무집 닭갈비]\n통나무집 닭갈비 · 춘천 닭갈비 · 춘천 닭갈비는 K-치킨벨트 미식여행상품·막국수닭갈비축제로 제도화된 K-푸드'
  },
  {
    id: 'spot-chuncheon-makguksu-museum-ko', lang: 'ko', link: 'chuncheon-makguksu-museum', weight: 1.3,
    keywords: ['춘천막국수체험박물관', '막국수체험박물관', '춘천 막국수 체험박물관', '막국수', '체험박물관', '관광지', '명소', '체험'],
    content: '[춘천막국수체험박물관]\n춘천막국수체험박물관 · 춘천 막국수 (체험박물관) · 막국수체험박물관 실재 · 만들기 체험 운영'
  },
  {
    id: 'spot-animation-museum-ko', lang: 'ko', link: 'animation-museum', weight: 1.3,
    keywords: ['애니메이션박물관', 'k-애니메이션', '애니메이션', '전시', '체험 허브', '관광지', '명소', '체험'],
    content: '[애니메이션박물관]\n애니메이션박물관 · K-애니메이션 (전시·체험 허브) · 국내 유일 애니메이션 전문 박물관 · GICA 운영'
  },
  {
    id: 'spot-animation-museum-en', lang: 'en', link: 'animation-museum', weight: 1.3,
    keywords: ['Animation Museum', 'animation museum', 'animationmuseum', 'animation', 'museum', 'attraction', 'sightseeing'],
    content: '[Animation Museum]\nInteractive place to discover the evolution of K-animation and robots'
  }
])

const firstQuestion = '춘천 닭갈비랑 막국수 체험 할 수 있는 곳 알려줘'
const firstAnswer = [
  '- **통나무집 닭갈비**: 춘천 닭갈비로 알려진 곳이에요.',
  '- **춘천막국수체험박물관**: 막국수를 직접 만들어 보는 체험을 운영해요.'
].join('\n')

test('닭갈비 질문은 닭갈비 앵커를, 막국수 체험 질문은 체험박물관을 찾는다', () => {
  assert.equal(searchKnowledge('춘천 닭갈비 어디가 유명해')[0]?.link, 'tongnamujip')
  assert.equal(searchKnowledge('막국수 만들기 체험 할 수 있어')[0]?.link, 'chuncheon-makguksu-museum')
})

test('영문 질문은 소문자로 넘기면 영문 항목을 찾는다', () => {
  assert.ok(searchKnowledge('what can i do at the animation museum?').some((h) => h.id === 'spot-animation-museum-en'))
})

test('자료에 없는 질문은 0건이다', () => {
  assert.deepEqual(searchKnowledge('부산 해운대 횟집 추천'), [])
})

test('지시어형 후속 질문은 직전 문답을 RAG 검색어에 포함한다', () => {
  const followUp = '위에서 설명한 거에서 각각 1개씩 골라봐'
  const query = buildRetrievalQuery(followUp, [
    { role: 'user', content: firstQuestion },
    { role: 'assistant', content: firstAnswer }
  ])
  assert.equal(isFollowUpQuery(followUp), true)
  assert.match(query, /통나무집 닭갈비/)
  assert.ok(searchKnowledge(query, 8).some((hit) => hit.link === 'chuncheon-makguksu-museum'))
})

test('일반 질문은 이전 대화로 검색어를 오염시키지 않는다', () => {
  const question = '애니메이션박물관은 뭐가 있어?'
  assert.equal(buildRetrievalQuery(question, [{ role: 'assistant', content: firstAnswer }]), question)
})

test('근거는 검색 상위 hit가 아니라 최종 답변에 굵게 등장한 장소로 만든다', () => {
  const answer = `${firstAnswer}\n애니메이션박물관 근처도 함께 들르기 좋아요.`
  const sources = findMentionedSources(answer, searchKnowledge(firstQuestion))
  assert.deepEqual(new Set(sources.map((s) => s.link)), new Set(['tongnamujip', 'chuncheon-makguksu-museum']))
})

test('각각 하나를 고르는 후속 질문은 추가 장소를 금지한다', () => {
  const prompt = buildSystemPrompt([], true, '위에서 설명한 거에서 각각 1개씩 골라봐')
  assert.match(prompt, /요청한 분류마다 정확히 한 곳만/)
  assert.match(prompt, /직전 답변에 없던 장소/)
  assert.match(prompt, /후속 질문은 붙이지 않는다/)
})

test('시스템 프롬프트에 동해 흔적이 없다', () => {
  const prompt = buildSystemPrompt(searchKnowledge('춘천 닭갈비'))
  assert.doesNotMatch(prompt, /동해|묵호|무릉|소버린|데이터센터/)
})
