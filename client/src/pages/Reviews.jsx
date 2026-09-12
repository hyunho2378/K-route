// Reviews · IA §10.8 (존 C5 확장) — 시드 12개(data/reviews.js · 전부 mock:true) + 세션 메모리.
// 카드 그리드(별점 primary 채운 별 · 작성자 이니셜+국가명 · 코스 · 날짜 · 좋아요) ·
// 정렬 토글(최신순/좋아요순 Chip 페어) · 좋아요 = 세션 메모리 증가 + 중복 방지 토글 ·
// 작성 폼 → 데모 유저로 즉시 게시(세션 메모리 배열 선두 삽입 · localStorage 금지).
// 리뷰 본문은 원문 그대로(언어 동형 예외) — UI 크롬만 3언어. v3.2 컨테이너 확폭 실사용(§10.4).
// [G1] 데이터 배선만 서버 연동(사용자 승인: UI 구조·레이아웃·카피 불변) —
//   로드 = fetchReviews(실패 시 seedReviews 세션 메모리 폴백 · 명세 5-②),
//   게시 = postReview / 좋아요 = toggleLikeRemote(실패 시 기존 세션 로직 유지).
import { useEffect, useMemo, useRef, useState } from 'react';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import Container from '../components/layout/Container';
import Chip from '../components/ui/Chip';
import Pagination from '../components/ui/Pagination';
import { seedReviews, fetchReviews, postReview, toggleLikeRemote } from '../data/reviews';
import LangSwap from '../i18n/LangSwap';

// [V11] 리뷰 100+건 페이지네이션 · 페이지당 24개. 숫자 페이지 + 이전/다음 화살표(접근성 aria).
// [V5-8] 페이지 로컬 사본을 공용 ui/Pagination 으로 이관(같은 행동·상태 계약 = 공용 1곳 · 히트 영역 44).
const PAGE_SIZE = 24;

export default function Reviews() {
  const [reviews, setReviews] = useState(seedReviews);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [sort, setSort] = useState('latest');
  const [serverLive, setServerLive] = useState(false);

  // 서버 로드 · 실패 시 seedReviews 유지(폴백)
  useEffect(() => {
    let alive = true;
    fetchReviews('latest')
      .then((rows) => {
        if (!alive) return;
        setServerLive(true);
        setReviews(rows);
        setLikedIds(new Set(rows.filter((r) => r.liked).map((r) => r.id)));
      })
      .catch(() => {
        /* 폴백: 세션 메모리 시드 유지 */
      });
    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sort === 'likes') list.sort((a, b) => b.likes - a.likes);
    else list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return list;
  }, [reviews, sort]);

  // [V11] 페이지네이션 · 정렬 변경 시 1페이지로 · 페이지 이동 시 그리드 상단으로 스크롤
  //   [V5-8] 화살표 라벨은 공용 Pagination이 직접 t로 읽는다 → 이 화면의 t는 더 이상 쓰지 않는다
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const paged = sorted.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);
  const gridRef = useRef(null);
  const goto = (p) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 좋아요 · 서버 토글(카운트는 서버 값 반영) · 실패·폴백 시 기존 세션 로직(§10.8)
  const toggleLike = (id) => {
    const isLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, likes: r.likes + (isLiked ? -1 : 1) } : r)));
    if (serverLive) {
      toggleLikeRemote(id)
        .then(({ liked, likes }) => {
          setLikedIds((prev) => {
            const next = new Set(prev);
            if (liked) next.add(id);
            else next.delete(id);
            return next;
          });
          setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, likes } : r)));
        })
        .catch(() => {
          /* 서버 실패 시 낙관 갱신 유지(세션 폴백) */
        });
    }
  };

  // 게시 · 서버 저장 성공 시 서버 레코드로 치환(실패 시 세션 메모리 게시 유지)
  const handlePost = (review) => {
    setReviews((rs) => [review, ...rs]);
    if (serverLive) {
      postReview({
        rating: review.rating,
        body: review.body,
        title: review.title ?? '',
        country: review.country,
        courseKey: review.courseKey,
        lang: review.lang,
        initials: review.initials,
      })
        .then((saved) => setReviews((rs) => rs.map((r) => (r === review || r.id === review.id ? saved : r))))
        .catch(() => {
          /* 세션 게시 유지 */
        });
    }
  };

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-8">
          <LangSwap k="reviews.title" as="h1" className="text-h1 font-bold tracking-display" />
          <LangSwap k="reviews.sub" as="p" className="text-body text-inkSec" />
        </div>

        {/* 작성 폼 · 즉시 게시 = 배열 선두 삽입(§10.8) */}
        <ReviewForm onPost={handlePost} />

        {/* 정렬 토글 · 최신순/좋아요순 Chip 페어(§10.8) */}
        <div className="flex items-center gap-8">
          {/* [H2-17] 정렬 라벨 600 상향(과경량 수리 · Chip 기본 500 위에 자식 세미볼드) */}
          <Chip active={sort === 'latest'} onClick={() => setSort('latest')}>
            <LangSwap k="reviews.sortLatest" className="font-semibold" />
          </Chip>
          <Chip active={sort === 'likes'} onClick={() => setSort('likes')}>
            <LangSwap k="reviews.sortLikes" className="font-semibold" />
          </Chip>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 gap-16 md:grid-cols-3 md:gap-24 lg:grid-cols-4">
          {paged.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              liked={likedIds.has(review.id)}
              onLike={() => toggleLike(review.id)}
            />
          ))}
        </div>
        {/* 공용 Pagination 은 0-based · 이 화면은 1-based라 경계에서 변환한다 */}
        <Pagination
          page={pageClamped - 1}
          pages={totalPages}
          onSelect={(i) => goto(i + 1)}
          arrows
          align="center"
        />
      </div>
    </Container>
  );
}
