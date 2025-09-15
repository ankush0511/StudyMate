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
      // First-time activity!
      setStreak(1);
      localStorage.setItem(currentStreakKey, '1');
      localStorage.setItem(lastActivityKey, today.toString());
    }

    // After calculating, determine unlocked badges
    const newStreak = parseInt(localStorage.getItem(currentStreakKey) || '0', 10);
    if (badgeData) {
      const unlocked = badgeData.filter(badge => newStreak >= badge.requiredStreak);
      setUnlockedBadges(unlocked);
    }
  }, [storageKey, badgeData, lastActivityKey, currentStreakKey]);

  // Function to be called when the user performs the tracked action
  const recordActivity = () => {
    const today = getDay(new Date());
    const lastActivityStr = localStorage.getItem(lastActivityKey);

    // Only update if it's a new day to prevent multiple increments on the same day
    if (!lastActivityStr || parseInt(lastActivityStr, 10) !== today) {
        // This will trigger the useEffect to recalculate the streak on the next component load
        localStorage.setItem(lastActivityKey, today.toString()); 
        // Force a re-render by updating state
        setStreak(prev => prev + 1);
    }
  };


  return { streak, unlockedBadges, recordActivity };
};