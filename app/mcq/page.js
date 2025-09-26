'use client';

import { useState, useMemo, useEffect } from 'react';

// --- MOCKED HOOKS & DATA (for standalone functionality) ---

// Mock implementation of the useQuizStreak custom hook
const useQuizStreak = () => {
  const [streak, setStreak] = useState(5); // Example streak
  const [unlockedBadges, setUnlockedBadges] = useState([{ name: 'Quiz Novice' }]); // Example badge

  // A function to simulate recording activity. In a real app, this would
  // likely involve API calls or updating local storage.
  const recordActivity = () => {
    console.log('Quiz activity recorded.');
    // You could add logic here to increment the streak based on dates
  };

  return { streak, unlockedBadges, recordActivity };
};

// Mock data for quiz badges, assuming some structure
const quizBadgesData = [
    { name: 'Quiz Novice', description: 'Complete your first quiz.', icon: () => '🏆' },
    { name: '5-Day Streak', description: 'Maintain a 5-day quiz streak.', icon: () => '🔥' },
    { name: 'Topic Master', description: 'Score 100% on a quiz.', icon: () => '🧠' },
];


// --- Helper Components (included directly for a single-file solution) ---

// A simple loading spinner component
function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-white border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

// Component to display the user's quiz history
function QuizHistoryDisplay({ history, isLoading, error, onSelectQuiz }) {
  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert"><p>{error}</p></div>;
  }

  if (history.length === 0) {
    return <p className="text-center text-gray-500 mt-8">You haven't completed any quizzes yet. Generate one to get started!</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((quiz) => (
        <div key={quiz._id || quiz.createdAt} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all cursor-pointer" onClick={() => onSelectQuiz(quiz)}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{quiz.topic}</h3>
              <p className="text-gray-500 text-sm">
                {new Date(quiz.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-extrabold text-blue-600">{quiz.score} / {quiz.totalQuestions}</p>
                 <span className="text-sm font-semibold text-gray-600">Score</span>
            </div>
          </div>
        </div>
      ))}
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
    const [view, setView] = useState('quiz'); // 'quiz', 'history', 'history-detail'
    
    // --- HISTORY STATE ---
    const [quizHistory, setQuizHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [selectedHistoryQuiz, setSelectedHistoryQuiz] = useState(null);

    // --- CUSTOM HOOKS ---
    const { streak, recordActivity } = useQuizStreak();

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError('');
            try {
                // This endpoint should be created on your backend to fetch data from MongoDB
                const res = await fetch('/api/quiz-history'); 
                if (!res.ok) throw new Error('Failed to fetch quiz history.');
                const data = await res.json();
                setQuizHistory(data.history || []);
            } catch (err) {
                setHistoryError(err.message || 'Could not load quiz history.');
            } finally {
                setHistoryLoading(false);
            }
        };

        if (view === 'history') {
            fetchHistory();
        }
    }, [view]);


    const score = useMemo(() => {
        if (!showResults) return 0;
        return mcqs.reduce((correctCount, mcq) => {
            const userAnswerKey = userAnswers[mcq.question];
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
        setView('quiz'); // Switch back to quiz view
        setSelectedHistoryQuiz(null);

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

    const handleSelectAnswer = (question, optionKey) => {
        if (showResults || selectedHistoryQuiz) return;
        setUserAnswers({ ...userAnswers, [question]: optionKey });
    };

    const handleQuizSubmit = async () => {
        setShowResults(true);

        const finalScore = mcqs.reduce((correctCount, mcq) => {
            const userAnswerKey = userAnswers[mcq.question];
            return correctCount + (userAnswerKey === mcq.correct_answer ? 1 : 0);
        }, 0);

        const quizResult = {
            topic,
            score: finalScore,
            totalQuestions: mcqs.length,
            questions: mcqs,
            userAnswers,
            createdAt: new Date().toISOString(),
        };

        try {
            // This endpoint should be created on your backend to save data to MongoDB
            const res = await fetch('/api/quiz-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizResult),
            });

            if (res.ok) {
                const { savedQuiz } = await res.json();
                // Add the new quiz to the top of the history list for immediate UI update
                setQuizHistory(prevHistory => [savedQuiz, ...prevHistory]);
            } else {
               console.error("Failed to save quiz history.");
            }
        } catch (err) {
           console.error("Error saving quiz history:", err);
        }
    };
    
    const handleSelectHistoryQuiz = (quiz) => {
        setSelectedHistoryQuiz(quiz);
        setView('history-detail');
    }

    const getOptionStyle = (mcq, optionKey, quizContext) => {
        const isSelected = quizContext.userAnswers[mcq.question] === optionKey;
        const isCorrect = optionKey === mcq.correct_answer;

        if (isCorrect) return 'bg-green-100 text-green-900 ring-2 ring-green-500 shadow-lg shadow-green-500/50';
        if (isSelected && !isCorrect) return 'bg-red-100 text-red-900 ring-2 ring-red-500 shadow-lg shadow-red-500/50';
        return 'bg-gray-100 border-gray-200 text-gray-600 opacity-80';
    };
    
    const renderQuizContent = (questions, answers, isReview) => (
        <div className="space-y-8">
            {isReview && selectedHistoryQuiz && (
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-blue-500">
                    <h2 className="text-2xl font-bold text-gray-800">Reviewing: {selectedHistoryQuiz.topic}</h2>
                    <p className="text-4xl font-extrabold text-blue-600 my-2">{selectedHistoryQuiz.score} / {selectedHistoryQuiz.totalQuestions}</p>
                    <p className="text-gray-600">Completed on {new Date(selectedHistoryQuiz.createdAt).toLocaleDateString()}</p>
                </div>
            )}
             {showResults && !isReview && (
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-blue-500">
                    <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
                    <p className="text-4xl font-extrabold text-blue-600 my-2">{score} / {mcqs.length}</p>
                    <p className="text-gray-600">Great job! See your results below.</p>
                </div>
            )}
            {questions.map((mcq, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-800 mb-4">
                        <span className="font-bold">Q{index + 1}:</span> {mcq.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mcq.options && Object.entries(mcq.options).map(([key, value]) => (
                            <button
                                key={key}
                                disabled={showResults || isReview}
                                onClick={() => handleSelectAnswer(mcq.question, key)}
                                className={`p-3 text-left rounded-lg border-2 transition-all duration-300 w-full ${
                                    (showResults || isReview)
                                    ? getOptionStyle(mcq, key, { userAnswers: answers, ...mcq })
                                    : (answers[mcq.question] === key ? 'bg-blue-500 border-blue-600 text-white shadow-md ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300')
                                }`}
                            >
                                <span className="font-bold mr-2">{key}:</span>{value}
                            </button>
                        ))}
                    </div>
                     {(showResults || isReview) && (
                        <div className="mt-5 pt-5 border-t border-dashed">
                            <p className="text-gray-800">
                                <span className="font-bold">Explanation: </span>
                                {mcq.explanation}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );


    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <style>{`
                /* Basic styles that might have been in globals.css */
                body {
                    background-color: #f7fafc; /* A light gray background */
                    font-family: sans-serif;
                }
            `}</style>
            <div className="text-center mb-8">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                    {view === 'history' && 'Quiz History'}
                    {view === 'history-detail' && 'Review Quiz'}
                    {view === 'quiz' && 'MCQ Quiz Generator'}
                </h1>
                 <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    {view === 'quiz' ? 'Test your knowledge. Enter a topic, generate questions, and take the quiz!' : 'Review your past performance.'}
                </p>
                <p className="mt-4 text-md text-gray-500">
                    🔥 Your current quiz streak is: <strong>{streak} day{streak !== 1 && 's'}</strong>
                </p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-12 border border-gray-200 flex justify-center gap-4">
                 <button onClick={() => { setView('quiz'); setSelectedHistoryQuiz(null); setMcqs([]); setShowResults(false); setTopic(''); setUserAnswers({}); }} className={`px-6 py-2 font-bold rounded-lg transition ${view === 'quiz' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    New Quiz
                </button>
                 <button onClick={() => setView('history')} className={`px-6 py-2 font-bold rounded-lg transition ${view === 'history' || view === 'history-detail' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    History
                </button>
            </div>

            {view === 'quiz' && (
                <>
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
                                className="md:col-span-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 font-bold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-full min-h-[50px]"
                            >
                                {loading ? <Spinner/> : 'Generate'}
                            </button>
                        </div>
                    </form>
                    
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8" role="alert"><p>{error}</p></div>}

                    {mcqs.length > 0 && (
                        <>
                            {renderQuizContent(mcqs, userAnswers, false)}
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
                        </>
                    )}
                </>
            )}

            {view === 'history' && (
                <QuizHistoryDisplay
                    history={quizHistory}
                    isLoading={historyLoading}
                    error={historyError}
                    onSelectQuiz={handleSelectHistoryQuiz}
                />
            )}
            
            {view === 'history-detail' && selectedHistoryQuiz && (
                renderQuizContent(selectedHistoryQuiz.questions, selectedHistoryQuiz.userAnswers, true)
            )}

        </div>
    );
}

