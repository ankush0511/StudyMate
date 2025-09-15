'use client';

import { useState, useMemo } from 'react';
import { useQuizStreak } from '../../lib/hooks/useQuizStreak';
import { quizBadgesData } from '../../lib/quizBadges';
import styles from '../../styles/Badge.module.css';
import '../../styles/globals.css';

// --- Badge Components (included directly for a single-file solution) ---

function BadgeCard({ badge, isUnlocked }) {
  const Icon = badge.icon;
  const cardClasses = isUnlocked ? `${styles.card} ${styles.unlocked}` : `${styles.card} ${styles.locked}`;

  return (
    <div className={cardClasses}>
      <div className={styles.icon}>
        <Icon />
      </div>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
    </div>
  );
}

function QuizBadgesDisplay() {
  const { unlockedBadges } = useQuizStreak();

  return (
    <div className="my-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Quiz Badges
      </h2>
      <div className={styles.grid}>
        {quizBadgesData.map((badge) => {
          const isUnlocked = unlockedBadges.some(unlocked => unlocked.name === badge.name);
          return (
            <BadgeCard key={badge.name} badge={badge} isUnlocked={isUnlocked} />
          );
        })}
      </div>
    </div>
  );
}


// --- Main Quiz Page Component ---

export default function MCQGeneratorContent() {
    // --- STATE MANAGEMENT ---
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    
    // --- CUSTOM HOOKS ---
    const { streak, recordActivity } = useQuizStreak();

    const score = useMemo(() => {
        if (!showResults) return 0;
        return mcqs.reduce((correctCount, mcq, index) => {
            const userAnswerKey = userAnswers[index];
            return correctCount + (userAnswerKey === mcq.correct_answer ? 1 : 0);
        }, 0);
    }, [showResults, mcqs, userAnswers]);

    const handleGenerateMCQs = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMcqs([]);
        setError('');
        setUserAnswers({});
        setShowResults(false);

        recordActivity(); // This updates the quiz streak

        const requestBody = {
            aiTask: 'mcq',
            query: { topic, num_questions: numQuestions },
        };

        try {
            const res = await fetch('/api/run-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            if (res.ok && data.response && Array.isArray(data.response.mcqs) && data.response.mcqs.length > 0) {
                setMcqs(data.response.mcqs);
            } else {
                setError(data.error || "No MCQs were generated. Please try a different topic.");
            }
        } catch (err) {
            setError('Network error or problem connecting to the AI service.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionIndex, optionKey) => {
        if (showResults) return;
        setUserAnswers({ ...userAnswers, [questionIndex]: optionKey });
    };

    const handleQuizSubmit = () => setShowResults(true);

    const getOptionStyle = (mcq, questionIndex, optionKey) => {
        const isSelected = userAnswers[questionIndex] === optionKey;
        const isCorrect = optionKey === mcq.correct_answer;

        if (showResults) {
            if (isCorrect) return 'bg-green-100 text-green-900 ring-2 ring-green-500 shadow-lg shadow-green-500/50';
            if (isSelected && !isCorrect) return 'bg-red-100 text-red-900 ring-2 ring-red-500 shadow-lg shadow-red-500/50';
            return 'bg-gray-100 border-gray-200 text-gray-600 opacity-80';
        }
        if (isSelected) return 'bg-blue-500 border-blue-600 text-white shadow-md ring-2 ring-blue-500';
        return 'bg-white hover:bg-gray-50 border-gray-300';
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                    MCQ Quiz Generator
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    Test your knowledge. Enter a topic, generate questions, and take the quiz!
                </p>
                <p className="mt-4 text-md text-gray-500">
                    🔥 Your current quiz streak is: <strong>{streak} day{streak !== 1 && 's'}</strong>
                </p>
            </div>

            <form onSubmit={handleGenerateMCQs} className="bg-white p-6 rounded-2xl shadow-lg mb-12 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter any topic..."
                        className="md:col-span-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1" max="20"
                        className="md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !topic.trim()}
                        className="md:col-span-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 font-bold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-full"
                    >
                        {loading ? '...' : 'Generate'}
                    </button>
                </div>
            </form>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8" role="alert"><p>{error}</p></div>}

            {mcqs.length > 0 && (
                <div className="space-y-8">
                    {showResults && (
                         <div className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-blue-500">
                             <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
                             <p className="text-4xl font-extrabold text-blue-600 my-2">{score} / {mcqs.length}</p>
                             <p className="text-gray-600">You have completed the quiz. See your results below.</p>
                         </div>
                    )}
                    {mcqs.map((mcq, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <p className="text-lg font-semibold text-gray-800 mb-4">
                                <span className="font-bold">Q{index + 1}:</span> {mcq.question}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mcq.options && Object.entries(mcq.options).map(([key, value]) => (
                                    <button
                                        key={key}
                                        disabled={showResults}
                                        onClick={() => handleSelectAnswer(index, key)}
                                        className={`p-3 text-left rounded-lg border-2 transition-all duration-300 w-full ${getOptionStyle(mcq, index, key)}`}
                                    >
                                        <span className="font-bold mr-2">{key}:</span>{value}
                                    </button>
                                ))}
                            </div>
                            {showResults && (
                                 <div className="mt-5 pt-5 border-t border-dashed">
                                     <p className="text-gray-800">
                                         <span className="font-bold">Explanation: </span>
                                         {mcq.explanation}
                                     </p>
                                 </div>
                            )}
                        </div>
                    ))}
                    {!showResults && (
                         <div className="text-center mt-8">
                             <button
                                 onClick={handleQuizSubmit}
                                 disabled={Object.keys(userAnswers).length !== mcqs.length}
                                 className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                             >
                                 Check Answers
                             </button>
                         </div>
                    )}
                </div>
            )}
            
            <hr className="my-16 border-gray-200" />
            
            {/* <QuizBadgesDisplay /> */}
        </div>
    );
}