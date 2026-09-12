// [V5-6] K-가이드 봇 · IA §11.8 · 동해사이 챗 라우트 이식(Ollama 스트리밍 ndjson · token / sources / done · 바이트 폴백 조립)
//   추가된 것: 언어(ko·en·th · th 는 질문을 영어로 옮겨 en 청크를 찾고 태국어로 답한다) · 현재 선택 스팟 우선 ·
//   인용할 chunk 도 앞선 대화도 없으면 LLM 을 부르지 않고 noinfo 로 끝낸다(지어내기 원천 차단) ·
//   LLM 이 없으면(배포 서버 · Ollama 미기동) 생성하지 않고 검색된 공사 원문을 그대로 보낸다(mode extractive) · chat_logs
//   실패는 200 { source:'fallback', reason }(500 금지 · kto.js 선례)
const express = require('express');
const db = require('../db/pool');
const { readUserId } = require('../lib/session');
const ragService = require('../services/ragService');
const llm = require('../services/llmService');

const router = express.Router();
const LANGS = ['ko', 'en', 'th'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// 지금 고른 코스를 가리키는 질문이면 선택 스팟 자료를 먼저 넣는다
const ASKS_SELECTION = /고른|담은|내 코스|이 코스|선택한|my (course|route|picks|places)|selected|ที่เลือก/i;
// ko = 한국어 규칙 프롬프트 · en·th = 같은 제약의 영어 규칙 프롬프트(rag.buildSystemPromptEn)
const LANG_NAME = { en: 'English', th: 'Thai' };
// 영어·태국어 답은 사용자 차례 끝에도 한 번 더 못박는다(긴 한국어 규칙 뒤에서 모델이 한국어로 새는 것 방지 · 2026-09-12 실측)
const ASK_LANG = { ko: '', en: '\n\n(Answer in English.)', th: '\n\n(ตอบเป็นภาษาไทยเท่านั้น. Answer in Thai only.)' };
// 장소 이름 변형(언어별 · 끝 괄호 별칭을 뗀 이름 · 앞 숫자를 뗀 이름) · 답변에 나온 장소를 칩으로 고를 때 쓴다
const namesOf = (s) =>
  Object.values(s.name ?? {})
    .flatMap((n) => {
      const base = String(n).replace(/\s*\([^()]*\)\s*$/, '').trim();
      return [String(n), base, base.replace(/^[\d.\s]+/, '')];
    })
    .filter((n) => n.length >= 2);
let byteP = null;
const byteFallback = () => (byteP ??= import('../services/byteFallback.mjs'));

router.post('/chat', async (req, res) => {
  const { message, history, lang: rawLang, selectedSpotIds, sessionId } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'message가 없다' });
  const lang = LANGS.includes(rawLang) ? rawLang : 'en';
  const searchLang = lang === 'ko' ? 'ko' : 'en'; // 공사 다국어 데이터에 태국어가 없다
  let answer = '';
  let sourceIds = [];

  try {
    const [{ rag, items }, { createByteFallbackAssembler }] = await Promise.all([ragService.ready(), byteFallback()]);

    // 최근 대화만 컨텍스트로 넘긴다. role/content 만 허용하고 최근 8개로 제한한다(토큰 방어)
    const safeHistory = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    // 지시어형 후속 질문이면 직전 문답도 RAG 검색에 반영한다. 키워드는 소문자로 적재돼 있다(영문 매칭)
    const q = lang === 'th' ? await llm.translate(message, 'English').catch(() => message) : message;
    const retrievalQuery = rag.buildRetrievalQuery(q, safeHistory);
    const maxHits = retrievalQuery === q ? 3 : 8;
    const selected = new Set(Array.isArray(selectedSpotIds) ? selectedSpotIds.map(String) : []);
    // 순위는 전체 언어에서 매긴다(동의어가 영어 질문에도 한국어 대표어를 붙여 한국어 항목이 위로 오므로, 언어로 먼저 거르면 상위가 비어 버린다).
    // 같은 장소는 질문 언어 자료를 쓰고 없으면 한국어 자료를 쓴다 · 답은 모델이 사용자 언어로 옮긴다(th = 영어 검색 → 태국어 답)
    const bySpot = new Map();
    for (const h of rag.searchKnowledge(retrievalQuery.toLowerCase(), Infinity)) {
      const cur = bySpot.get(h.link);
      if (!cur || (cur.lang !== searchLang && h.lang === searchLang)) bySpot.set(h.link, h);
    }
    const found = [...bySpot.values()];
    const pinned = ASKS_SELECTION.test(message) ? ragService.itemsFor([...selected], searchLang) : [];
    const hits = [...new Map([...pinned, ...found.filter((h) => selected.has(h.link)), ...found].map((h) => [h.link, h])).values()].slice(0, maxHits);

    // 줄 단위 JSON 스트림으로 응답한다
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    const send = (o) => res.write(JSON.stringify(o) + '\n');

    // 인용할 자료도 앞선 대화도 없으면 모델을 부르지 않는다 · 문구는 클라 사전(chat.noInfo)
    if (!hits.length && !safeHistory.length) {
      answer = '[noinfo]';
      send({ type: 'noinfo' });
      send({ type: 'sources', sources: [] });
      send({ type: 'done' });
      return res.end();
    }

    const systemPrompt =
      lang === 'ko'
        ? rag.buildSystemPrompt(hits, safeHistory.length > 0, message)
        : rag.buildSystemPromptEn(hits, safeHistory.length > 0, LANG_NAME[lang]);
    const upstream = await llm
      .chatRequest([{ role: 'system', content: systemPrompt }, ...safeHistory, { role: 'user', content: message + ASK_LANG[lang] }])
      .catch((e) => {
        console.warn('[chat] LLM 없음 → 원문 모드:', e.message);
        return null;
      });

    const assembler = createByteFallbackAssembler();
    const writeToken = (t) => {
      if (!t) return;
      answer += t;
      send({ type: 'token', token: t });
    };
    let sentDone = false;

    const finishAnswer = () => {
      if (sentDone) return;
      writeToken(assembler.finish());
      const finalSources = rag.findMentionedSources(answer, hits);
      // 다른 언어 이름·앞 숫자를 뗀 이름으로도 답변에 나온 장소를 찾는다(한국어 자료로 영어 답을 쓴 경우 · "1.5 닭갈비 본점" → "닭갈비 본점")
      const said = [...new Set(hits.map((h) => h.link))].map((id) => items.get(id)).filter((s) => s && namesOf(s).some((n) => answer.includes(n)));
      const spots = said.length ? said : [...new Set(finalSources.map((h) => h.link))].map((id) => items.get(id)).filter(Boolean);
      sourceIds = spots.map((s) => s.id);
      send({ type: 'sources', sources: spots });
      send({ type: 'done' });
      sentDone = true;
    };

    // LLM 없음 → 생성하지 않고 검색된 공사 원문을 그대로 보낸다(근거 밖 문장 0)
    if (!upstream) {
      send({ type: 'mode', mode: 'extractive' });
      writeToken(hits.map((h) => h.content).join('\n\n'));
      finishAnswer();
      return res.end();
    }
    // Gemini(비스트리밍) · 텍스트 한 번에
    if (upstream.text != null) {
      writeToken(upstream.text);
      finishAnswer();
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const parsed = JSON.parse(trimmed);
        const chunk = parsed.message?.content;
        if (chunk) writeToken(assembler.push(chunk));
        if (parsed.done) finishAnswer();
      } catch {
        // 완결됐지만 잘못된 NDJSON 한 줄은 다음 응답을 막지 않고 건너뛴다
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Ollama는 줄 단위 JSON을 흘린다. 완결된 줄만 처리한다
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) processLine(line);
    }

    // TextDecoder 내부에 남은 UTF-8과 개행 없는 마지막 NDJSON 줄까지 EOF에서 처리한다.
    buffer += decoder.decode();
    if (buffer.trim()) processLine(buffer);
    finishAnswer();
    res.end();
  } catch (e) {
    console.warn('[chat] 실패:', e.message);
    if (!res.headersSent) res.json({ source: 'fallback', reason: e.message.slice(0, 120) });
    else res.end();
  } finally {
    if (answer) {
      db.query('INSERT INTO chat_logs (session_id, user_id, lang, q, a, sources) VALUES ($1, $2, $3, $4, $5, $6)', [
        UUID_RE.test(sessionId ?? '') ? sessionId : null,
        readUserId(req),
        lang,
        message.slice(0, 1000),
        answer.slice(0, 4000),
        JSON.stringify(sourceIds),
      ]).catch((e) => console.warn('[chat] 로그 실패:', e.message));
    }
  }
});

module.exports = router;
