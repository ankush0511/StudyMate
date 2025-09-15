import { FaRegStar, FaStar, FaAward, FaFire, FaCrown } from 'react-icons/fa';

/**
 * @typedef {object} Badge
 * @property {string} name
 * @property {string} description
 * @property {import('react-icons').IconType} icon
 * @property {number} requiredStreak
 */

/** @type {Badge[]} */
export const badgesData = [
  {
    name: 'Newcomer',
    description: 'Log in for the first time.',
    icon: FaRegStar,
    requiredStreak: 1,
  },
  {
    name: 'Consistent Learner',
    description: 'Achieve a 3-day login streak.',
    icon: FaStar,
    requiredStreak: 3,
  },
  {
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day login streak.',
    icon: FaFire,
    requiredStreak: 7,
  },
  {
    name: 'Dedicated Scholar',
    description: 'Keep up a 14-day login streak.',
    icon: FaAward,
    requiredStreak: 14,
  },
  {
    name: 'StudyMate Royalty',
    description: 'Incredible! A 30-day login streak.',
    icon: FaCrown,
    requiredStreak: 30,
  },
];