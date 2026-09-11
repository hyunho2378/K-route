// [V5-3] K-Route 취향 설문 문항 · IA §11.3 확정(5문항 · 탭 즉시 전진 · q1만 복수선택).
// option id = 서버 recommendService.ANSWERS 값과 1:1 · 라벨·보조문 = i18n quiz.{문항}.{id} · quiz.{문항}.{id}Sub.
// q1 선택지는 SOURCE_SPOTS 검증분만(K-푸드 앵커 · 겨울연가 · 애니메이션박물관 · 춘천에서 자란 아이돌 · 미정).
// 아이콘은 lucide-react만(설치본 실존 확인 2026-09-11).
import {
  Bus,
  Camera,
  CarFront,
  Clapperboard,
  Clock3,
  Coffee,
  Compass,
  HeartHandshake,
  Music,
  Palette,
  Soup,
  Sun,
  Trees,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

export const quizQuestions = [
  {
    id: 'q1',
    multi: true,
    options: [
      { id: 'kfood', icon: Soup },
      { id: 'kdrama', icon: Clapperboard },
      { id: 'kanime', icon: Palette },
      { id: 'kpop', icon: Music },
      { id: 'undecided', icon: Compass },
    ],
  },
  {
    id: 'q2',
    options: [
      { id: 'photo', icon: Camera },
      { id: 'localfood', icon: UtensilsCrossed },
      { id: 'nature', icon: Trees },
      { id: 'cafe', icon: Coffee },
    ],
  },
  {
    id: 'q3',
    options: [
      { id: 'solo', icon: User },
      { id: 'friends', icon: Users },
      { id: 'family', icon: HeartHandshake },
    ],
  },
  {
    id: 'q4',
    options: [
      { id: 'half', icon: Clock3 },
      { id: 'day', icon: Sun },
    ],
  },
  {
    id: 'q5',
    options: [
      { id: 'transit', icon: Bus },
      { id: 'taxi', icon: CarFront },
    ],
  },
];

// q1 '아직 안 정함'은 배타 선택(고르면 나머지 해제 · 다른 콘텐츠를 고르면 해제) · GtsContext.setQuizAnswer가 적용
export const Q1_EXCLUSIVE = 'undecided';

// 결과 여행 타입 = q2 성향 결정론 4종(이름·설명 i18n quiz.type.{id}.name·body)
export const TRAVEL_TYPE_ICONS = { photo: Camera, localfood: UtensilsCrossed, nature: Trees, cafe: Coffee };
