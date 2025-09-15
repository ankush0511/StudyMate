'use client'; // This page uses a client-side hook

// This is much cleaner and won't break if you move your page file
import { useStreak } from '../../lib/hooks/useStreak';
import { badgesData } from '../../lib/badges';
import BadgeCard from '../../components/BadgeCard'; 
import styles from '../../styles/Badge.module.css';
import '../../styles/globals.css';

export default function BadgesPage() {
  const { streak, unlockedBadges } = useStreak();

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ textAlign: 'center' }}>
        <h1>Your Badges ✨</h1>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>
          Your current daily login streak is: <strong style={{ color: '#0070f3' }}>{streak} day{streak !== 1 && 's'}</strong>
        </p>
      </header>
      ``
      <div className={styles.grid}>
        {badgesData.map((badge) => {
          // Check if the current badge is in the array of unlocked badges
          const isUnlocked = unlockedBadges.some(unlocked => unlocked.name === badge.name);
          return (
            <BadgeCard key={badge.name} badge={badge} isUnlocked={isUnlocked} />
          );
        })}
      </div>
    </div>
  );
}


