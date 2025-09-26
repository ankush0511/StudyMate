"use client";

import { useStreak } from "../../lib/hooks/useStreak";
import { badgesData } from "../../lib/badges";
import BadgeCard from "../../components/BadgeCard";
import QuizBadgesDisplay from "../../components/QuizBadgesDisplay";
import styles from "../../styles/Badge.module.css";
import "../../styles/globals.css";

// Define a stable empty array for the quiz badges outside the component
const quizBadgesData = [];

// This is the required default export for a page component
export default function BadgesPage() {
  const { streak: loginStreak, unlockedBadges: unlockedLoginBadges } = useStreak('login', badgesData);
  const { streak: quizStreak } = useStreak('quiz', quizBadgesData);

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ textAlign: "center", marginBottom: '3rem' }}>
        <h1>Your Badges ✨</h1>
        <p style={{ fontSize: "1.2rem", color: "#333" }}>
          Your current daily login streak is:{" "}
          <strong style={{ color: "#0070f3" }}>
            {loginStreak} day{loginStreak !== 1 && "s"}
          </strong>
        </p>
      </header>

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Login Streak Badges
      </h2>
      <div className={styles.grid}>
        {badgesData.map((badge) => {
          const isUnlocked = unlockedLoginBadges.some(
            (unlocked) => unlocked.name === badge.name
          );
          return (
            <BadgeCard key={badge.name} badge={badge} isUnlocked={isUnlocked} />
          );
        })}
      </div>

      <div className="text-center mt-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Quiz Badges
        </h2>
        <p className="mt-4 text-md text-gray-500 mb-8">
            🔥 Your current quiz streak is:{" "}
            <strong>
            {quizStreak} day{quizStreak !== 1 && "s"}
            </strong>
        </p>
        <QuizBadgesDisplay />
      </div>
    </div>
  );
}

