// Home · v4.2 존 B5 재건(IA §10.2 섹션 순서) · [V5-15] 정체성을 K-Route 로 재작성:
// ①Hero(K-Route 피치 + CTA 페어) ②K-Route 라인 3종 + 흐름 ③Why K-Route(문제 근거 + 해법 한 줄)
// ④How it works(퀴즈 → 여권 → 스탬프) ⑤보조 도구(Trip Planner · Travel Log) ⑥Reviews ⑦Proof ⑧Footer(셸이 렌더).
// 첫 화면만 보고 "이게 K-Route 서비스"임을 알 수 있어야 한다 = Hero 다음이 곧 라인 소개다(구 "두 서비스" 섹션이 여기 있었다).
import Section from '../components/layout/Section';
import EvidenceStrip from '../components/home/EvidenceStrip';
import HeroCarousel from '../components/home/HeroCarousel';
import HowItWorks from '../components/home/HowItWorks';
import KRouteLines from '../components/home/KRouteLines';
import PilotStrip from '../components/home/PilotStrip';
import ReviewsStrip from '../components/home/ReviewsStrip';
import ServiceCards from '../components/home/ServiceCards';
import LangSwap from '../i18n/LangSwap';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      {/* [V5-15] 주 피치 = K-콘텐츠 노선 3종 · 라인 정의·색은 lineSystem 단일 출처를 재사용한다 */}
      <Section id="lines" eyebrow="home.lines.eyebrow" title="home.lines.title">
        <KRouteLines />
      </Section>
      {/* [V5-11] 문제 근거 · 검증 확정 수치만 노출하고 각 수치에 출처를 병기한다(data/evidence.js 단일 출처).
          [V5-15] 라벨을 "Why K-Route" 로 바꾸고, 이 문제를 케이로드가 어떻게 푸는지 한 줄을 수치 위에 잇는다. */}
      <Section id="evidence" eyebrow="home.evidence.eyebrow" title="home.evidence.title">
        <div className="flex flex-col gap-24">
          <LangSwap
            k="home.evidence.solution"
            as="p"
            className="max-w-[62ch] text-body font-medium text-inkSec"
          />
          <EvidenceStrip />
        </div>
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
