'use client';

import { useState, useEffect } from 'react';

// This function can be shared or kept here
const getDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

/**
 * A generic hook to manage a daily activity streak.
 * @param {string} storageKey - A unique key for localStorage (e.g., 'login' or 'quiz').
 * @param {Array<object>} badgeData - An array of badge objects to check against.
 */
export const useStreak = (storageKey, badgeData) => {
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Use more descriptive names for localStorage items
  const lastActivityKey = `last${storageKey}Date`;
  const currentStreakKey = `current${storageKey}Streak`;

  // This effect runs ONCE on mount to initialize the streak from localStorage
  useEffect(() => {
    const today = getDay(new Date());

    const lastActivityStr = localStorage.getItem(lastActivityKey);
    const currentStreak = parseInt(localStorage.getItem(currentStreakKey) || '0', 10);

    if (lastActivityStr) {
      const lastActivityDate = parseInt(lastActivityStr, 10);
      const yesterday = getDay(new Date(Date.now() - 86400000));

      if (lastActivityDate === today) {
        // Activity already recorded today, just load the streak.
        setStreak(currentStreak);
      } else if (lastActivityDate === yesterday) {
        // Continued the streak!
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem(currentStreakKey, newStreak.toString());
        localStorage.setItem(lastActivityKey, today.toString());
      } else {
        // Streak broken, reset to 1.
        setStreak(1);
        localStorage.setItem(currentStreakKey, '1');
        localStorage.setItem(lastActivityKey, today.toString());
      }
    } else {
      // First-time activity! Welcome!
      setStreak(1);
      localStorage.setItem(currentStreakKey, '1');
      localStorage.setItem(lastActivityKey, today.toString());
    }
  }, [storageKey, lastActivityKey, currentStreakKey]);


  // --- THIS IS THE FIX ---
  // A new effect that runs whenever the 'streak' state changes.
  // Its only job is to update the list of unlocked badges.
  useEffect(() => {
    if (badgeData && streak > 0) {
        const unlocked = badgeData.filter(badge => streak >= badge.requiredStreak);
        setUnlockedBadges(unlocked);
    }
  }, [streak, badgeData]); // Dependency array ensures this runs when streak changes


  // This function is no longer needed, as the logic is handled on load.
  // You can remove recordActivity if you only care about login streaks on page load.
  const recordActivity = () => {
    // ... this can be kept if you have other activities like quizzes to track manually
  };

  return { streak, unlockedBadges };
};
