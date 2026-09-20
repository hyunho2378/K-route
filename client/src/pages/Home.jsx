// Home · v4.2 존 B5 재건(IA §10.2 섹션 순서) · [V5-15] 정체성을 K-Route 로 재작성:
// ①Hero(K-Route 피치 + CTA 페어) ②K-Route 라인 3종 + 흐름 ③How it works(퀴즈 → 여권 → 스탬프)
// ④보조 도구(Trip Planner · Travel Log) ⑤Reviews ⑥Proof ⑦Footer(셸이 렌더).
// 첫 화면만 보고 "이게 K-Route 서비스"임을 알 수 있어야 한다 = Hero 다음이 곧 라인 소개다(구 "두 서비스" 섹션이 여기 있었다).
// [V5-28] "Why K-Route / The problem in numbers"(공모전 근거 자료 스트립) 섹션 전체 삭제(사용자 지시,
//   3회 반복 지적) — 처음 보는 외국인 관광객이 볼 웹사이트에 공모전 발표 자료용 통계·기관 인용이
//   있는 건 맞지 않는다는 판단. 그 근거 자료 자체는 삭제하지 않고 기능설명서(PPTX) 제출본에만 남긴다.
//   data/evidence.js·EvidenceStrip.jsx 컴포넌트 파일은 보존(재사용 가능성 대비, import만 제거).
import Section from '../components/layout/Section';
import HeroCarousel from '../components/home/HeroCarousel';
import HowItWorks from '../components/home/HowItWorks';
import KRouteLines from '../components/home/KRouteLines';
import PilotStrip from '../components/home/PilotStrip';
import ReviewsStrip from '../components/home/ReviewsStrip';
import ServiceCards from '../components/home/ServiceCards';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      {/* [V5-15] 주 피치 = K-콘텐츠 노선 3종 · 라인 정의·색은 lineSystem 단일 출처를 재사용한다 */}
      <Section id="lines" eyebrow="home.lines.eyebrow" title="home.lines.title">
        <KRouteLines />
      </Section>
      <Section id="how-it-works" eyebrow="home.how.eyebrow" title="home.how.title">
        <HowItWorks />
      </Section>
      {/* [V5-15] 보조 도구 · Trip Planner 는 주 피치에서 내려와 여기(춘천까지 오는 길)로, Travel Log 를 함께 둔다 */}
      <Section id="services" eyebrow="home.services.eyebrow" title="home.services.title">
        <ServiceCards />
      </Section>
      <Section id="reviews" eyebrow="home.reviews.eyebrow" title="home.reviews.title">
        <ReviewsStrip />
      </Section>
      <Section id="proof" eyebrow="home.proof.eyebrow" title="home.proof.title">
        <PilotStrip />
      </Section>
    </>
  );
}
