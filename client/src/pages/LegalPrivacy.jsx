// /legal/privacy · docs/LEGAL_COPY.md 전문(i18n legal 네임스페이스, 임의 축약 금지). PATTERNS §17.
// 푸터에서 새 탭 진입. 본문 측정폭 캡 금지(v3.1) · 줄바꿈은 컨테이너가 결정.
import Container from '../components/layout/Container';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

// v3.2: 위치정보 조항(loc) 병합 이식 · 수집(§2)·목적(§3) 직후 배치(LEGAL_COPY v3.2)
const SECTIONS = ['s1', 's2', 's3', 'loc', 's4', 's5', 's6', 's7', 's8'];

export default function LegalPrivacy() {
  const { t } = useLang();
  return (
    <div className="pb-96 pt-96 lg:pt-128">
      <Container>
        <LangSwap k="legal.privacy.title" as="h1" className="text-h1 font-bold tracking-display" />
        <LangSwap
          k="legal.updated"
          as="p"
          className="mt-8 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
        />
        <div className="mt-48 flex flex-col gap-32">
          {SECTIONS.map((s) => (
            <section key={s}>
              <LangSwap k={`legal.privacy.${s}h`} as="h2" className="text-h3 font-semibold" />
              <p className="mt-8 text-small font-medium text-inkSec">{t(`legal.privacy.${s}`)}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
