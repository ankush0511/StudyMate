'use client';
// Updated MindMapFlashcardsContent component

import * as htmlToImage from 'html-to-image';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import '../../styles/globals.css';
import { FaBookOpen, FaDownload, FaFilePdf, FaKeyboard, FaPencilAlt } from 'react-icons/fa';

const Tree = dynamic(() => import('react-d3-tree').then((mod) => mod.Tree), {
  ssr: false,
});

function transformJsonToD3TreeFormat(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') return null;
  const rootKey = Object.keys(jsonData)[0];
  const rootValue = jsonData[rootKey];

  const buildNode = (name, childrenObj) => {
    const node = { name };
    if (childrenObj && typeof childrenObj === 'object' && Object.keys(childrenObj).length > 0) {
      node.children = Object.entries(childrenObj).map(([childName, childValue]) => buildNode(childName, childValue));
    }
    return node;
  };

  return buildNode(rootKey, rootValue);
}

const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => (
    <g>
        <circle r={12} fill={nodeDatum.children ? '#20BEFF' : '#8c9eff'} onClick={toggleNode} />
        <text fill="#333" stroke="none" x={20} y={-5} className="font-semibold text-sm">
            {nodeDatum.name}
        </text>
    </g>
);



export default function MindMapFlashcardsContent() {
    const mindMapContainerRef = useRef(null);
    
    const [inputMethod, setInputMethod] = useState('topic');
    const [topicName, setTopicName] = useState('');
    const [plainTextInput, setPlainTextInput] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [mindMapRawJson, setMindMapRawJson] = useState(null);
    const [mindMapTreeData, setMindMapTreeData] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [flippedCardIndices, setFlippedCardIndices] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        if (mindMapRawJson) {
            const transformedData = transformJsonToD3TreeFormat(mindMapRawJson);
            setMindMapTreeData(transformedData);
        } else {
            setMindMapTreeData(null);
        }
    }, [mindMapRawJson]);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMindMapRawJson(null);
        setFlashcards([]);
        setError('');
        setFlippedCardIndices(new Set());

        let requestBody = {
            aiTask: 'flashcards_mindmap',
            query: {
                inputMethod,
                topicName,
                plainTextContent: plainTextInput,
                fileContent: null,
                fileName: null,
                fileType: null,
            }
        };

        const processAndSend = async () => {
             try {
                const res = await fetch('/api/run-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                const data = await res.json();
                if (res.ok) {
                    setMindMapRawJson(data.response.mindMapImage || null);
                    setFlashcards(data.response.flashcards || []);
                } else {
                    setError(data.error || 'Unknown API error.');
                }
            } catch (err) {
                setError('Network or server error: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (inputMethod === 'pdf' && pdfFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                requestBody.query.fileContent = btoa(event.target.result);
                requestBody.query.fileName = pdfFile.name;
                requestBody.query.fileType = 'application/pdf';
                processAndSend();
            };
            reader.onerror = (err) => {
                 setError('Error reading PDF file: ' + err.message);
                 setLoading(false);
            }
            reader.readAsBinaryString(pdfFile);
        } else {
            processAndSend();
        }
    };

    const handleCardFlip = (index) => {
        const newFlipped = new Set(flippedCardIndices);
        if (newFlipped.has(index)) {
            newFlipped.delete(index);
        } else {
            newFlipped.add(index);
        }
        setFlippedCardIndices(newFlipped);
    };


    const handleDownloadPNG = () => {
        if (!mindMapContainerRef.current) {
            alert("Mind map container not found.");
            return;
        }

        htmlToImage.toPng(mindMapContainerRef.current, { 

            backgroundColor: '#f9fafb' 
        })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'mindmap.png';
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => {
            console.error('oops, something went wrong!', err);
            alert("Could not generate PNG. See console for details.");
        });
    };


    return (
        <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">AI Study Assistant</h1>
                <p className="text-xl text-gray-600">Generate interactive mind maps and flashcards from any source.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800">1. Choose Your Input</h2>
                        <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 rounded-lg p-1">
                             <button type="button" onClick={() => setInputMethod('topic')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'topic' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}><FaPencilAlt className="mr-2"/>Topic</button>
                             <button type="button" onClick={() => setInputMethod('plain_text')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'plain_text' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}><FaKeyboard className="mr-2"/>Text</button>
                             <button type="button" onClick={() => setInputMethod('pdf')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'pdf' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}><FaFilePdf className="mr-2"/>PDF</button>
                        </div>

                        {inputMethod === 'topic' && <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="e.g., Quantum Mechanics" className="w-full p-3 border border-gray-300 rounded-lg" />}
                        {inputMethod === 'plain_text' && <textarea value={plainTextInput} onChange={(e) => setPlainTextInput(e.target.value)} placeholder="Paste your notes here..." rows="8" className="w-full p-3 border border-gray-300 rounded-lg resize-y" />}
                        {inputMethod === 'pdf' && <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>}

                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400">
                             {loading ? 'Generating...' : 'Generate Study Materials'}
                        </button>
                         {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</div>}
                    </form>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold text-gray-800 flex items-center"><FaBookOpen className="mr-3 text-blue-500"/>Mind Map</h2>
                             <button onClick={handleDownloadPNG} disabled={!mindMapTreeData} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <FaDownload className="mr-2" />
                                Download PNG
                             </button>
                        </div>
                         <div ref={mindMapContainerRef} className="w-full h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
                            {loading && !mindMapTreeData && <p>Generating...</p>}
                            {!loading && !mindMapTreeData && <p className="text-gray-500">Your mind map will appear here.</p>}
                            {mindMapTreeData && <Tree data={mindMapTreeData} orientation="vertical" pathFunc="step" separation={{ siblings: 1.5, nonSiblings: 2 }} translate={{x: 350, y: 50}} renderCustomNodeElement={renderCustomNodeElement} />}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Flashcards</h2>
                        {loading && flashcards.length === 0 && <p>Generating...</p>}
                        {!loading && flashcards.length === 0 && <p className="text-gray-500">Your flashcards will appear here.</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 perspective">
                             {flashcards.map((card, index) => (
                                <div key={index} className="flip-card h-56" onClick={() => handleCardFlip(index)}>
                                    <div className={`flip-card-inner ${flippedCardIndices.has(index) ? 'is-flipped' : ''}`}>
                                        <div className="flip-card-front">
                                            <h3 className="text-lg font-bold">{card.question}</h3>
                                        </div>
                                        <div className="flip-card-back">
                                            <p>{card.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

