'use client'; // This hook uses browser-specific APIs (localStorage)

import { useState, useEffect } from 'react';
import { badgesData } from '../badges';

// Function to normalize a date to midnight (to compare days easily)
const getDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  useEffect(() => {
    // This logic runs once when the component mounts
    const today = getDay(new Date());

    const lastLoginStr = localStorage.getItem('lastLoginDate');
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0', 10);

    if (lastLoginStr) {
      const lastLoginDate = parseInt(lastLoginStr, 10);
      const yesterday = getDay(new Date(Date.now() - 86400000)); // 24 hours ago

      if (lastLoginDate === today) {
        // Already logged in today, do nothing.
        setStreak(currentStreak);
      } else if (lastLoginDate === yesterday) {
        // Logged in yesterday, continue the streak!
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem('currentStreak', newStreak.toString());
        localStorage.setItem('lastLoginDate', today.toString());
      } else {
        // Streak is broken, reset to 1.
        setStreak(1);
        localStorage.setItem('currentStreak', '1');
        localStorage.setItem('lastLoginDate', today.toString());
      }
    } else {
      // First login ever!
      setStreak(1);
      localStorage.setItem('currentStreak', '1');
      localStorage.setItem('lastLoginDate', today.toString());
    }

    // After calculating the streak, determine which badges are unlocked
    const newStreak = parseInt(localStorage.getItem('currentStreak') || '0', 10);
    const unlocked = badgesData.filter(badge => newStreak >= badge.requiredStreak);
    setUnlockedBadges(unlocked);
  }, []);

  return { streak, unlockedBadges };
};