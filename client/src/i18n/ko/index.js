// KR 사전 병합 index (PATTERNS §18).
import brand from './brand';
import common from './common';
import gate from './gate';
import legal from './legal';
import gts from './gts';
import loop from './loop';
import reviews from './reviews';
import travelLog from './travelLog';
import venues from './venues';
import profile from './profile'; // [V10]
import team from './team'; // [V10]
import quiz from './quiz'; // [V5-0]
import chat from './chat'; // [V5-0]
import go from './go'; // [V5-0]

const ko = { ...common, ...gate, ...loop, ...brand, ...legal, ...gts, ...reviews, ...venues, ...travelLog, ...profile, ...team, ...quiz, ...chat, ...go };
export default ko;
