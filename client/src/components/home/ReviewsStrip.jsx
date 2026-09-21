// Reviews 스트립 · v4.2 존 B5(IA §10.2.④): data/reviews.js(존 C5 소유 · 소비 전용 정적 import)에서
// 좋아요순 상위 3개 카드 미리보기 + "모든 후기 보기" → /reviews.
// 카드 UI는 홈 전용 경량(IA §10.2): 별점 primary 채움 · 한 줄 발췌 · 작성자 이니셜 + 국가명 텍스트
// (국기 이모지 금지 · IA §10.8). 리뷰 본문·국적은 사용자 생성 데이터 · 원문 그대로 렌더
// (언어 동형 원칙 예외 · UI 크롬만 3언어). 좋아요 실시간 상태는 /reviews 소관 · 여기선 시드 값 정렬만.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import { seedReviews } from '../../data/reviews';

const STARS = [1, 2, 3, 4, 5];

// C5 시드 계약(reviews.js): initials 문자열 · country = {en,ko,th} 표기 객체(현재 언어로 렌더 · en 폴백)
const authorLine = (review, lang) => {
  const country =
    typeof review.country === 'object' ? (review.country?.[lang] ?? review.country?.en) : review.country;
  return [review.initials, country].filter(Boolean).join(' · ');
};

export default function ReviewsStrip() {
  const { lang } = useLang();
  // [V5-35] 사용자 지시로 홈 미리보기는 K-Route 경험에 맞게 새로 쓴 시드(rv-kroute-*)만 쓴다.
  //   실서버 리뷰(구 GTS 예약 시절 데이터가 섞여 있음)는 /reviews 전체 목록에서만 가져온다 —
  //   심사 직전 홈 화면에 옛 서비스 얘기가 다시 섞이는 걸 막는다(fetchReviews 호출 자체를 홈에서 뺐다).
  const [reviews] = useState(seedReviews);
  const top = [...reviews].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3);

  return (
    <div className="flex flex-col gap-24">
      <div className="grid gap-16 md:grid-cols-3 md:gap-24">
        {top.map((review) => (
          // [H1] min-w-0: truncate 본문의 intrinsic 폭이 grid 아이템 최소폭이 되어 320 가로 스크롤을 만들던 사고 수리
          <article key={review.id} className="flex min-w-0 flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
            {/* 별점 · 채운 별 primary(IA §10.8) · 빈 별은 primary 스트로크만 */}
            <span role="img" aria-label={`${review.rating ?? 0}/5`} className="flex items-center gap-4 text-primary">
              {STARS.map((n) => (
                <Star key={n} size={16} fill={n <= (review.rating ?? 0) ? 'currentColor' : 'none'} />
              ))}
            </span>
            {/* 한 줄 발췌 · 원문 언어 그대로(사용자 생성 데이터 예외 · html lang 부여) */}
            <p lang={review.lang} className="truncate text-body">
              {review.body}
            </p>
            <p className="text-caption font-medium text-inkMeta">{authorLine(review, lang)}</p>
          </article>
        ))}
      </div>
      <div>
        <Button as={Link} to="/reviews" variant="ghost">
          <LangSwap k="home.reviews.viewAll" />
          <ArrowRight size={20} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
