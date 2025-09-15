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
    name: 'Weekly Warrior',
    description: 'Achieve a 15-day login streak.',
    icon: FaStar,
    requiredStreak: 15,
  },
  {
    name: 'Consistent Learner',
    description: 'Maintain a 30-day login streak.',
    icon: FaFire,
    requiredStreak: 30,
  },
  {
    name: 'Dedicated Scholar',
    description: 'Keep up a 6-month login streak.',
    icon: FaAward,
    requiredStreak: 180,
  },
  {
    name: 'StudyMate Royalty',
    description: 'Incredible! A 1-Year login streak.',
    icon: FaCrown,
    requiredStreak: 365,
  },
];