// app/use-ai/page.js
'use client';
import '../../styles/globals.css';

import { useState, useRef, useEffect } from 'react';

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return; 
        const userInput = input;
        setChatHistory(prev => [...prev, { role: 'user', content: userInput }]);
        setInput(''); 
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/run-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiTask: 'doubt-solving', 
                    query: userInput
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'error', content: data.error || 'An unknown error occurred.' }]);
            }
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'error', content: 'Failed to connect to the server.' }]);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-2">
                    AI Career Counselor
                </h1>
                <p className="text-lg text-gray-600">Start a conversation to explore your career path.</p>
            </div>
            
            <div ref={chatContainerRef} className="flex-grow bg-white border border-gray-200 rounded-xl shadow-inner p-6 mb-4 overflow-y-auto">
                {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div 
                            className={`max-w-lg p-4 rounded-2xl ${
                                message.role === 'user' 
                                    ? 'bg-[#20BEFF] text-white' 
                                    : message.role === 'ai'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
                           <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-4 focus:ring-[#20BEFF]/50 transition"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex-shrink-0 bg-[#20BEFF] text-white p-3 rounded-full hover:bg-blue-600 transition font-bold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </form>
        </div>
    );
}