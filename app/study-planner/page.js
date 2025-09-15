'use client';
import '../../styles/globals.css';


import { useState } from 'react';
import { Book, Calendar, Clock, Plus, Sparkles, Trash2, X } from 'lucide-react';

export default function StudyPlannerPage() {
  // --- STATE MANAGEMENT ---
  const [planType, setPlanType] = useState('AI Autonomous Plan');
  const [goal, setGoal] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for the "Personalized Custom Plan"
  const [dailyHours, setDailyHours] = useState(3.0);
  const [subjects, setSubjects] = useState([]);
  const [currentSubjectName, setCurrentSubjectName] = useState('');
  const [currentTopics, setCurrentTopics] = useState('');

  // State for API interaction and results
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  
  // --- DERIVED STATE ---
  const isCustomPlan = planType === 'Personalized Custom Plan';

  // --- EVENT HANDLERS ---
  
  /**
   * Handles adding a new subject with its topics to the custom plan list.
   */
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!currentSubjectName.trim() || !currentTopics.trim()) {
      alert('Please provide both a subject name and at least one topic.');
      return;
    }
    const topicsArray = currentTopics.split('\n').map(t => t.trim()).filter(Boolean);
    setSubjects([...subjects, { name: currentSubjectName, topics: topicsArray }]);
    setCurrentSubjectName('');
    setCurrentTopics('');
  };

  /**
   * Removes a subject from the custom plan list by its index.
   */
  const handleRemoveSubject = (indexToRemove) => {
    setSubjects(subjects.filter((_, index) => index !== indexToRemove));
  };
  
  /**
   * Main submission handler to generate the study plan.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!goal.trim() || !endDate) {
      setError('Please provide a study goal and a target date.');
      return;
    }
    if (isCustomPlan && subjects.length === 0) {
      setError('Please add at least one subject for a personalized plan.');
      return;
    }

    // Reset state and prepare for API call
    setIsLoading(true);
    setError(null);
    setPlan(null);

    // Construct the payload for the API
    const payload = {
      plan_type: planType,
      goal,
      end_date: new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };

    if (isCustomPlan) {
      payload.subjects_with_topics = subjects;
      payload.daily_study_hours = dailyHours;
    }
    
    try {
      // Make the API call to the Next.js backend
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }
      
      // The Python script returns the plan inside a "plan" key
      if (data.plan) {
        setPlan(data.plan);
      } else if (data.error) {
         throw new Error(data.error);
      } else {
         throw new Error("The AI did not return a valid plan.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Book className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Hybrid AI Study Planner</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* --- LEFT COLUMN: INPUTS --- */}
          <div className="space-y-6">
            {/* Plan Type Selection */}
            <div>
              <h2 className="text-lg font-semibold text-indigo-400 mb-3">1. Select Your Plan Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPlanType('AI Autonomous Plan')} className={`p-4 rounded-lg border-2 transition text-left ${!isCustomPlan ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-indigo-600'}`}>
                  <h3 className="font-bold">AI Autonomous Plan</h3>
                  <p className="text-xs text-gray-400 mt-1">Let the AI create a complete curriculum based on your goal.</p>
                </button>
                <button onClick={() => setPlanType('Personalized Custom Plan')} className={`p-4 rounded-lg border-2 transition text-left ${isCustomPlan ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-indigo-600'}`}>
                  <h3 className="font-bold">Personalized Custom Plan</h3>
                  <p className="text-xs text-gray-400 mt-1">Provide your own subjects, topics, and study hours.</p>
                </button>
              </div>
            </div>

            {/* Goal and Date */}
            <div>
              <h2 className="text-lg font-semibold text-indigo-400 mb-3">2. Define Your Goal</h2>
              <div className="space-y-4">
                <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., 'Master Machine Learning for Interviews'" className="w-full bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>

            {/* Custom Plan Details */}
            {isCustomPlan && (
              <div>
                <h2 className="text-lg font-semibold text-indigo-400 mb-3">3. Enter Custom Details</h2>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2"><Clock size={14}/> Daily Study Hours</label>
                    <input type="number" min="1" max="16" step="0.5" value={dailyHours} onChange={e => setDailyHours(parseFloat(e.target.value))} className="w-full bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <form onSubmit={handleAddSubject} className="space-y-3">
                    <p className="text-sm font-medium">Add Subjects & Topics</p>
                    <input type="text" value={currentSubjectName} onChange={e => setCurrentSubjectName(e.target.value)} placeholder="Subject Name (e.g., Data Structures)" className="w-full bg-gray-700 border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    <textarea value={currentTopics} onChange={e => setCurrentTopics(e.target.value)} placeholder="Topics (one per line)&#10;Arrays&#10;Linked Lists&#10;Trees" rows={4} className="w-full bg-gray-700 border-gray-600 text-white rounded-lg resize-none focus:ring-indigo-500 focus:border-indigo-500" />
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition"><Plus size={16}/> Add Subject</button>
                  </form>
                   {subjects.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-medium">Your Custom Syllabus:</p>
                        {subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <details>
                                <summary className="cursor-pointer font-semibold text-sm">{subject.name} <span className="text-xs text-gray-400">({subject.topics.length} topics)</span></summary>
                                <ul className="list-disc pl-6 mt-2 text-xs text-gray-300">
                                    {subject.topics.map((topic, i) => <li key={i}>{topic}</li>)}
                                </ul>
                            </details>
                            <button onClick={() => handleRemoveSubject(index)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
            
            {/* Generate Button */}
            <button onClick={handleSubmit} disabled={isLoading} className="w-full text-lg font-bold bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <><Sparkles size={20}/> Generate My AI Plan</>
              )}
            </button>

          </div>

          {/* --- RIGHT COLUMN: OUTPUT --- */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 min-h-[400px] flex flex-col">
            <h2 className="text-lg font-semibold text-indigo-400 p-4 border-b border-gray-700">Your Generated Plan</h2>
            <div className="p-4 flex-grow overflow-y-auto">
              {isLoading && <p className="text-center text-gray-400">Synapse AI is thinking...</p>}
              {error && <div className="text-red-400 bg-red-900/20 p-3 rounded-md text-sm"><p className="font-semibold">An error occurred:</p>{error}</div>}
              {!isLoading && !error && !plan && <p className="text-center text-gray-500">Your personalized study plan will appear here.</p>}
              
              {plan && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-indigo-500">
                    <h3 className="font-bold text-xl text-white">{plan.plan_title}</h3>
                    <p className="text-sm text-gray-300 mt-1 italic">{plan.summary}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="p-2">Day</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Topics to Study</th>
                          <th className="p-2 text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.schedule.map((day, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="p-2 font-semibold">{day.day}</td>
                            <td className="p-2 text-gray-400">{day.date}</td>
                            <td className="p-2">{day.topics_to_study}</td>
                            <td className="p-2 text-right font-mono">{day.time_allocation_hours.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

