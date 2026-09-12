// [V5-6] K-가이드 챗 상태 · IA §11.8 · 동해사이 챗 훅 이식(ndjson 스트리밍 token / sources 읽기 로직 · 조사 교정 · 마크다운 정리 그대로)
//   바뀐 것: 요청 본문(lang · 현재 선택 스팟 · 세션 id) · noinfo(인용 자료 없음) · mode(원문 모드) 이벤트 · 출처 = 풀 스팟 객체 ·
//   오류 문구는 화면이 사전(chat.error)으로 그린다 · 대화는 메모리에만(브라우저 저장소 금지 · 새로고침 시 초기화)
import { useState } from 'react';
import { openChat } from '../../data/gts/ktoApi';

const EMOJI_CODEPOINTS = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const EMOJI_JOINERS = /[\uFE0E\uFE0F\u200D\u20E3]/g;

// 답변 표시 직전에만 적용한다. 원본 메시지와 서버 로그는 그대로 유지한다.
export function stripEmoji(text = '') {
  return text.replace(EMOJI_CODEPOINTS, '').replace(EMOJI_JOINERS, '');
}

// 한글 마지막 글자의 받침 유무. 0xAC00 기준 (코드-0xAC00)%28 이 0이면 받침 없음
// 반환: null(한글 아님), 0(받침 없음), 8(ㄹ받침), 그 외 양수(받침 있음)
function lastBatchim(word) {
  const ch = (word || '').trimEnd().slice(-1);
  if (!ch) return null;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null; // 한글 음절 아님
  return (code - 0xac00) % 28;
}

// 받침 유무로 조사를 고른다. 한글이 아니면 원래 조사를 그대로 둔다
function correctJosa(word, josa) {
  const jong = lastBatchim(word);
  if (jong === null) return josa;
  const hasBatchim = jong !== 0;
  switch (josa) {
    case '은': case '는': return hasBatchim ? '은' : '는';
    case '이': case '가': return hasBatchim ? '이' : '가';
    case '을': case '를': return hasBatchim ? '을' : '를';
    case '과': case '와': return hasBatchim ? '과' : '와';
    // 받침 없거나 ㄹ받침(종성 8)이면 로, 그 외 받침이면 으로
    case '으로': case '로': return (!hasBatchim || jong === 8) ? '로' : '으로';
    default: return josa;
  }
}

// LLM 조사 오류 안전망. 볼드로 감싼 장소명 뒤에 붙은 조사만 받침에 맞게 고친다
// 볼드 뒤로 한정해 멀쩡한 문장을 깨뜨릴 위험을 줄인다. 스트리밍 미완성 볼드는 매칭 안 됨
export function fixJosa(text) {
  return text.replace(/(\*\*[^*\n]+\*\*)(으로|로|은|는|이|가|을|를|과|와)/g,
    (_, bold, josa) => bold + correctJosa(bold.slice(2, -2), josa));
}

// 모델이 남긴 마크다운 기호를 지운다. 스트리밍 중 잘린 기호도 같이 처리된다
export function stripMarkdown(text) {
  let out = stripEmoji(text)
    .replace(/^#{1,6}\s*/gm, '')
    // 별표 불릿(* 항목)을 하이픈 불릿(- 항목)으로 통일한다. 렌더러가 목록으로 그린다
    .replace(/^([ \t]*)\*[ \t]+/gm, '$1- ')
    .replace(/[#`]/g, '')
    .replace(/\*{3,}/g, '**')
    // 일반 문장의 항목 콜론만 지운다. 볼드 이름 뒤(불릿 라벨) 콜론과 시각 10:00은 남긴다
    .replace(/([^\d\s*])\s*:[ \t]+/g, '$1 ');
  // 모델이 홑별표로 강조하는 경우가 잦다. 짝이 맞는 홑별표는 볼드로 승격한다
  out = out.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1**$2**');
  // 짝이 없이 남은 홑별표는 지운다
  out = out.replace(/(^|[^*])\*(?!\*)/g, '$1');
  // 스트리밍 도중 짝이 안 맞는 마지막 별표는 감춘다
  const marks = out.match(/\*\*/g);
  if (marks && marks.length % 2 === 1) out = out.replace(/\*\*(?=[^*]*$)/, '');
  // 볼드 장소명 뒤 조사를 받침에 맞게 교정한다
  return fixJosa(out);
}

export default function useGuideChat({ lang, selectedSpotIds = [] }) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID()); // chat_logs 묶음용 · 저장하지 않는다

  // 마지막 어시스턴트 말풍선만 갈아 끼운다
  const patchLast = (fn) =>
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === 'assistant') next[next.length - 1] = fn(last);
      return next;
    });

  async function send(raw) {
    const text = raw.trim();
    if (!text || streaming) return;

    // 최근 대화 맥락을 서버로 함께 보낸다. role/content 만, 최근 8개(질문 4 + 답변 4)로 제한한다.
    // 정보 없음·오류 말풍선은 제외. 후속 지시어면 서버가 이 히스토리로 RAG 검색도 보강한다
    const history = messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && !m.error)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    // 빈 어시스턴트 말풍선을 먼저 추가한다. 여기에 토큰을 이어붙인다
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '', sources: [] }]);
    setStreaming(true);

    try {
      const res = await openChat({ message: text, history, lang, selectedSpotIds, sessionId });
      // 서버 실패는 200 JSON { source:'fallback' } 으로 온다(스트림 아님)
      if (!res?.ok || !res.body || !(res.headers.get('content-type') ?? '').includes('ndjson')) {
        throw new Error('스트림 없음');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          return;
        }
        if (parsed.type === 'sources') patchLast((last) => ({ ...last, sources: parsed.sources || [] }));
        if (parsed.type === 'noinfo') patchLast((last) => ({ ...last, noInfo: true }));
        if (parsed.type === 'mode') patchLast((last) => ({ ...last, extractive: parsed.mode === 'extractive' }));
        if (parsed.type === 'token' && parsed.token) patchLast((last) => ({ ...last, content: last.content + parsed.token }));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) processLine(line);
      }

      // TextDecoder 내부와 개행 없는 마지막 NDJSON 줄을 EOF에서 빠뜨리지 않는다.
      buffer += decoder.decode();
      if (buffer.trim()) processLine(buffer);
    } catch {
      patchLast((last) => (last.content === '' && !last.noInfo ? { ...last, error: true } : last));
    } finally {
      setStreaming(false);
    }
  }

  return { messages, streaming, send };
}
