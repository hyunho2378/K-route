// [V5-15] /gts 인트로 · 퀴즈 직행 대신 "노선도 2층 구조"를 한 화면으로 설명하고 시작하기로 퀴즈에 잇는다(사용자 지시 A4).
//   IA §11.2 는 /gts → /gts/quiz 직행이었다 · 이 화면이 그 앞에 선다(PROGRESS 에 명세 밖 결정으로 기록).
//   2층 구조 = 위층 K-콘텐츠 노선(역 = 검증된 성지만 · SOURCE_SPOTS 규율) / 아래층 실제 이동(공사 데이터로 잇는 동선).
//   건너뛰기: 웹스토리지 금지(DESIGN §13)라 모듈 인메모리 플래그(MobileMenu.hintShown 선례) ·
//     이번 앱 로드에서 한 번 지나가면 이후 /gts 진입은 퀴즈로 바로 간다(이미 해본 사용자).
//   라인 정의·색은 data/gts/lineSystem 단일 출처를 재사용한다(신규 색·신규 라인 만들지 않는다 · DESIGN §16.1).
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { LINES, LINE_BG, LINE_FACE } from '../data/gts/lineSystem';
import { LINE_ICONS } from '../data/gts/quizQuestions';
import LangSwap from '../i18n/LangSwap';
import { useLang } from '../i18n/LangContext';
import SubwayNetworkMap from '../components/gts/SubwayNetworkMap';

// 앱 로드당 1회 · 인트로를 이미 지난 사용자는 다시 세우지 않는다(웹스토리지 없이)
let seenIntro = false;

const FLOW = ['s1', 's2', 's3'];

export default function GtsIntro() {
  const navigate = useNavigate();
  const { t, lang } = useLang();

  // 이미 본 사용자는 인트로를 건너뛴다(뒤로가기로 되돌아오지 않게 replace)
  useEffect(() => {
    if (seenIntro) navigate('/gts/quiz', { replace: true });
  }, [navigate]);

  const start = () => {
    seenIntro = true;
    navigate('/gts/quiz');
  };

  return (
    <Container>
      <div className="flex flex-col gap-40 pb-64 pt-96">
        <div className="flex flex-col gap-12">
          <LangSwap
            k="gtsIntro.eyebrow"
            as="p"
            className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
          />
          <LangSwap k="gtsIntro.title" as="h1" className="text-h1 font-bold tracking-display" />
          <LangSwap k="gtsIntro.sub" as="p" className="max-w-[62ch] text-body font-medium text-inkSec" />
        </div>

        {/* 2층 구조 한 화면 · 위층(노선) 위에 아래층(실제 이동)이 받친다는 것을 세로 순서로 보인다 */}
        <div className="flex flex-col gap-16">
          {/* 위층 = K-콘텐츠 노선 3종 */}
          <div className="flex flex-col gap-16 rounded-lg bg-white p-24 shadow-sm">
            <div className="flex flex-col gap-4">
              <LangSwap k="gtsIntro.layer.topLabel" as="p" className="text-h3 font-semibold" />
              <LangSwap k="gtsIntro.layer.topBody" as="p" className="text-small font-medium text-inkSec" />
            </div>
            <ul className="flex flex-col gap-12">
              {LINES.map((line) => {
                const Icon = LINE_ICONS[line.id];
                return (
                  <li key={line.id} className="flex items-center gap-12">
                    <span
                      aria-hidden="true"
                      className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-pill ${LINE_FACE[line.id]}`}
                    >
                      <Icon size={16} />
                    </span>
                    <LangSwap k={`gts.line.${line.id}.name`} as="span" className="shrink-0 text-small font-semibold" />
                    {/* 노선 = 색 막대 · 역은 담기 화면에서 붙으므로 여기서는 라인 자체만 말한다 */}
                    <span aria-hidden="true" className={`h-4 min-w-0 flex-1 rounded-pill ${LINE_BG[line.id]}`} />
                  </li>
                );
              })}
            </ul>
            {/* [V5-24] 옵토리니어 노선도 다이어그램(신귝 SubwayNetworkMap) · 데모 스케마틱 배치(SAMPLE_NETWORK,
                역 이름은 검증된 라인 코스명 그대로 · 위치는 실좌표 아님을 note에 명시) · 위 리스트는 유지(접근성 폴백) */}
            <div className="mt-8">
              <SubwayNetworkMap lang={lang} showLegend={false} title="" />
            </div>
          </div>

          {/* 아래층 = 실제 이동(공사 데이터) · 위층을 받치는 면이라 중립 면(surface)으로 둔다 */}
          <div className="flex flex-col gap-8 rounded-lg bg-surface p-24">
            <span className="flex items-center gap-8">
              <MapPin size={20} aria-hidden="true" className="shrink-0 text-primary" />
              <LangSwap k="gtsIntro.layer.bottomLabel" as="span" className="text-h3 font-semibold" />
            </span>
            <LangSwap k="gtsIntro.layer.bottomBody" as="p" className="text-small font-medium text-inkSec" />
          </div>
        </div>

        {/* 흐름 3단계 · 번호는 실제 순서라 숫자 마커 허용(COMPONENTS B · HowItWorks 선례) */}
        <ol className="grid gap-16 md:grid-cols-3 md:gap-24">
          {FLOW.map((step, i) => (
            <li key={step} className="rounded-lg bg-white p-24 shadow-sm">
              <span aria-hidden="true" className="font-display text-h1 font-bold text-primary">
                {i + 1}
              </span>
              <LangSwap k={`gtsIntro.flow.${step}.title`} as="h2" className="mt-16 text-h3 font-medium" />
              <LangSwap k={`gtsIntro.flow.${step}.body`} as="p" className="mt-8 text-small font-medium text-inkSec" />
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-16">
          <Button onClick={start} size="lg">
            {t('gtsIntro.start')}
          </Button>
          {/* 이미 해본 사용자용 · 같은 곳으로 가되 다음부터는 인트로를 건너뛴다 */}
          <Link
            to="/gts/quiz"
            onClick={() => {
              seenIntro = true;
            }}
            className="pressable inline-flex min-h-44 items-center gap-4 text-small font-semibold text-primary"
          >
            <LangSwap k="gtsIntro.skip" />
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Container>
  );
}
