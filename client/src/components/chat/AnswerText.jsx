// [V5-6] K-가이드 답변 렌더 · 동해사이 AnswerText 이식(볼드 · 불릿 · 번호 목록 · 문단 분할 로직 그대로)
//   빠진 것: 표(무보더 원칙 · 말투 규칙에서 표 금지) · 복사·공유·좋아요 액션 바(명세 밖) · 문단별 출처 칩(출처는 답변 하단 한 줄 · IA §11.8)
//   클래스는 K-Route 토큰만(보더·임의 px 없음) · innerHTML 금지(텍스트 노드로만 그린다)

// 별표 두 개로 감싼 구간만 굵게 그린다. 짝이 안 맞으면 그대로 둔다
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

// 블록 안의 줄들을 문단/불릿(- )/번호(1. ) 그룹으로 나눠 그린다.
// 나열은 목록으로, 단계는 번호로 보여준다. 볼드는 항목 안에서도 적용된다
const BULLET = /^-\s+(.*)$/;
const NUMBER = /^\d+\.\s+(.*)$/;
function renderRich(raw) {
  const lines = raw.split('\n');
  const out = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (BULLET.test(t) || NUMBER.test(t)) {
      const re = BULLET.test(t) ? BULLET : NUMBER;
      const List = re === BULLET ? 'ul' : 'ol';
      const items = [];
      while (i < lines.length && re.test(lines[i].trim())) {
        items.push(lines[i].trim().match(re)[1]);
        i++;
      }
      out.push(
        <List key={key++} className={`flex flex-col gap-4 pl-20 ${re === BULLET ? 'list-disc' : 'list-decimal'}`}>
          {items.map((it, j) => (
            <li key={j} className="text-small text-ink">
              {renderInline(it)}
            </li>
          ))}
        </List>,
      );
    } else {
      const para = [];
      while (i < lines.length) {
        const s = lines[i].trim();
        if (BULLET.test(s) || NUMBER.test(s)) break;
        para.push(lines[i]);
        i++;
      }
      const txt = para.join('\n').trim();
      if (txt)
        out.push(
          <p key={key++} className="whitespace-pre-wrap text-small text-ink">
            {renderInline(txt)}
          </p>,
        );
    }
  }
  return out;
}

export default function AnswerText({ text }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (!blocks.length) return null;
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((b, i) => (
        <div key={i} className="flex flex-col gap-4">
          {renderRich(b)}
        </div>
      ))}
    </div>
  );
}
