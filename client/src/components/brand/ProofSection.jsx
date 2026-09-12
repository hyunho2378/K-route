// About §6 Proof(IA §2.8.6 · id="proof") · 구 Pilot 페이지 전체 흡수:
// 실운행 영상(자막 상시) + 지표 3(Kanit Bold · 값은 data/pilot.js PLACEHOLDER) + 갤러리.
// 헤더 카피는 docs/BRAND_COPY.md §6(brand.proof.*). 홈 Proof strip이 /about#proof로 진입한다.
import { gallery, metrics } from '../../data/pilot'; // api.js에 접근자 없음 · 직접 import(기 확정 결정)
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Section from '../layout/Section';
import VideoPlayer from '../ui/VideoPlayer';

// PLACEHOLDER · 3~4일차 촬영 교체(pilot.js 데이터에 video 필드 없음 · 구 Pilot 페이지 상수 승계)
const PILOT_VIDEO_SRC = '/videos/pilot-run.mp4';
const PILOT_VIDEO_POSTER = '/images/stops/pilot-1.jpg'; // PLACEHOLDER · 촬영 교체

// 지표 id(data/pilot.js) → brand.proof.metrics 라벨 키
const METRIC_LABEL = {
  courses: 'brand.proof.metrics.courses',
  riders: 'brand.proof.metrics.riders',
  foreign: 'brand.proof.metrics.international',
};

export default function ProofSection() {
  const { lang } = useLang();
  return (
    <Section id="proof" title="brand.proof.title">
      <div className="flex flex-col gap-32">
        {/* 실운행 영상 · muted autoplay loop + 상시 자막(DESIGN §12) */}
        <VideoPlayer
          src={PILOT_VIDEO_SRC}
          poster={PILOT_VIDEO_POSTER}
          captionKey="brand.proof.caption"
        />

        {/* 지표 3 · Kanit Bold 숫자, 값 PLACEHOLDER 실측 교체(IA §2.8) · 무보더 카드 */}
        <dl className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-24">
          {metrics.map((m) => (
            <div key={m.id} className="flex flex-col gap-4 rounded-lg bg-white p-24 shadow-sm">
              <dd className="font-display text-display font-bold tracking-display">{m.value}</dd>
              <LangSwap
                k={METRIC_LABEL[m.id]}
                as="dt"
                className="text-small font-medium text-inkSec"
              />
            </div>
          ))}
        </dl>

        {/* 갤러리 · PLACEHOLDER 촬영 교체 */}
        <ul className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-24">
          {gallery.map((item) => (
            <li key={item.id}>
              <img
                src={item.photo}
                alt={lang === 'ko' ? item.alt_ko : item.alt_en}
                loading="lazy"
                className="aspect-video w-full rounded-md bg-surface object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
