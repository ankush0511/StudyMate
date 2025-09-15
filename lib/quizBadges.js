import { FaBrain, FaBookOpen, FaLightbulb, FaGraduationCap, FaAtom } from 'react-icons/fa';

/**
 * @typedef {object} Badge
 * @property {string} name
 * @property {string} description
 * @property {import('react-icons').IconType} icon
 * @property {number} requiredStreak
 */

/** @type {Badge[]} */
export const quizBadgesData = [
  {
    name: 'Curious Mind',
    description: 'Take a quiz for the first time.',
    icon: FaBrain,
    requiredStreak: 1,
  },
  {
    name: 'Quiz Whiz',
    description: 'Achieve a 15-day quiz streak.',
    icon: FaBookOpen,
    requiredStreak: 15,
  },
  {
    name: 'Knowledge Seeker',
    description: 'Maintain a 30-day quiz streak.',
    icon: FaLightbulb,
    requiredStreak: 30,
  },
  {
    name: 'Expert Learner',
    description: 'Keep up a 6-month quiz streak.',
    icon: FaGraduationCap,
    requiredStreak: 180,
  },
  {
    name: 'Quiz Master',
    description: 'Incredible! A 1-year quiz streak.',
    icon: FaAtom,
    requiredStreak: 365,
  },
];