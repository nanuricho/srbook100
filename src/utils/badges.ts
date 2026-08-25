import { Badge } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'first_book',
    title: '독서의 첫걸음',
    description: '첫 번째 필독도서를 완독했어요!',
    requiredCount: 1,
    icon: '🐣',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'reading_seed',
    title: '독서 씨앗',
    description: '10권의 필독도서를 완독하고 씨앗을 틔웠어요.',
    requiredCount: 10,
    icon: '🌱',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'reading_sprout',
    title: '독서 새싹',
    description: '25권 완독 달성! 독서의 즐거움을 알아가고 있어요.',
    requiredCount: 25,
    icon: '🌿',
    color: 'from-teal-400 to-cyan-600',
  },
  {
    id: 'reading_tree',
    title: '독서 나무',
    description: '50권 완독 달성! 풍성한 지식의 나무가 자라납니다.',
    requiredCount: 50,
    icon: '🌳',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'reading_king',
    title: '서룡 독서왕',
    description: '75권 완독 달성! 자타공인 서룡초 독서왕!',
    requiredCount: 75,
    icon: '👑',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'reading_master',
    title: '100선 완독 대가',
    description: '100권 필독도서 완독 완료! 서룡초 독서의 대가!',
    requiredCount: 100,
    icon: '🏆',
    color: 'from-yellow-400 to-amber-500',
  },
];

export function getCurrentBadge(completedCount: number): Badge | null {
  const achieved = BADGES.filter((b) => completedCount >= b.requiredCount);
  if (achieved.length === 0) return null;
  return achieved[achieved.length - 1];
}

export function getNextBadge(completedCount: number): Badge | null {
  return BADGES.find((b) => completedCount < b.requiredCount) || null;
}
