'use client';

import { useQuizStreak } from '../lib/hooks/useQuizStreak';
import { quizBadgesData } from '../lib/quizBadges';
import BadgeCard from './BadgeCard';
import styles from '../styles/Badge.module.css';

export default function QuizBadgesDisplay() {
  const { unlockedBadges } = useQuizStreak();

  return (
    <div className="my-12">
      <div className={styles.grid}>
        {quizBadgesData.map((badge) => {
          // Check if this badge's name is in the list of unlocked badges
          const isUnlocked = unlockedBadges.some(unlocked => unlocked.name === badge.name);
          return (
            <BadgeCard key={badge.name} badge={badge} isUnlocked={isUnlocked} />
          );
        })}
      </div>
    </div>
  );
}