'use client';

import { useStreak } from './useStreak';
import { quizBadgesData } from '../quizBadges';

export const useQuizStreak = () => {
  // We pass 'Quiz' as the unique key and the specific badge data
  const { streak, unlockedBadges, recordActivity } = useStreak('Quiz', quizBadgesData);
  return { streak, unlockedBadges, recordActivity };
};