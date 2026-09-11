// PATTERNS §1 기준 구현의 v3.1 3언어 확장(§18) · 레이아웃 시프트 0. 임의 변형 금지.
// 세 언어를 같은 grid 셀에 겹치고 비활성 언어를 invisible 처리. 폭은 최장 언어 기준 고정.
import { useLang } from './LangContext';
import en from './en/index.js';
import ko from './ko/index.js';
import th from './th/index.js';

const dicts = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];
const pick = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);
// [V5-3] vars = { 이름: 값 } → 각 언어 문자열의 {이름} 치환(숫자처럼 언어와 무관한 값 전용 · 겹침 렌더 구조는 불변)
const fill = (text, vars) =>
  vars ? Object.entries(vars).reduce((s, [name, v]) => s.replaceAll(`{${name}}`, String(v)), text) : text;

export default function LangSwap({ k, as: Tag = 'span', className = '', vars }) {
  const { lang } = useLang();
  return (
    <Tag className={`grid ${className}`}>
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {fill(pick(dicts[code], k) ?? k, vars)}
        </span>
      ))}
    </Tag>
  );
}
