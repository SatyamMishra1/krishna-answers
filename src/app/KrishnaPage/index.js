'use client'
import React, { useState, useRef } from 'react';

const KrishnaPage = () => {
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    const recognitionRef = useRef(null);
    const [sanskritAnswer, setSanskritAnswer] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchRandomShlok = async () => {
        const chapter = Math.floor(Math.random() * 18) + 1; // 1 to 18
        const verse = Math.floor(Math.random() * 15) + 1; // Safe default max

        const res = await fetch(`https://vedicscriptures.github.io/slok/${chapter}/${verse}`);

        const data = await res.json();
        if (!data) {
            setAnswer("पुन: प्रयास करें...")
            return;
        }
        return {
            shlok: data?.slok,
            meaning: (data?.chinmay?.hc?.includes("No") || !data?.chinmay?.hc) ? data?.tej?.ht : data?.chinmay?.hc || '',
            chapter,
            verse,
        };
    };

    const handleAnswerClick = async () => {
        setProblem("")
        setLoading(true);
        const selected = await fetchRandomShlok();
        setLoading(false)
        if (!selected) {
            return;
        }
        setAnswer(selected?.meaning);
        setSanskritAnswer(selected?.shlok)
        speakText(selected?.meaning);
    };

    const handleVoiceInput = () => {
        const SpeechRecognition =
            typeof window !== 'undefined' &&
            (window.SpeechRecognition || window.webkitSpeechRecognition);

        if (!SpeechRecognition) {
            alert('आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता।');
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'hi-IN';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 5;
            // recognitionRef.current.continuous = true; // 🔁 Helps handle pauses

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setProblem((prev) => prev + ' ' + transcript);
            };

            recognitionRef.current.onend = () => {
                // Optional: Restart to keep listening through longer pauses
                recognitionRef.current?.start();
            };
        }

        recognitionRef.current.start();
    };

    const speakText = (text) => {
        if (typeof window === 'undefined') return;

        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'hi-IN';

        // Pick a Hindi voice if available
        const voices = synth.getVoices();
        const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
        if (hindiVoice) utter.voice = hindiVoice;

        synth.speak(utter);
    };

    return (
        <main className="w-full h-full min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-100 to-pink-100">
            <h1 className="text-3xl font-bold mb-4">कृष्ण से पूछें 🕉️</h1>

            <textarea
                placeholder="अपनी समस्या लिखें या बोलें...किंतु याद रखें कृष्ण सब कुछ जानते हैं 🕉️"
                value={problem}
                onChange={(e) => {
                    setProblem(e.target.value); setAnswer("");
                    setSanskritAnswer("")
                    speakText("");
                }}
                rows={4}
                className="w-full max-w-md p-4 border border-gray-300 rounded-md resize-none focus:outline-none"
            />

            <div className="flex gap-4 mt-2">
                <button
                    onClick={handleVoiceInput}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                >
                    🎤 बोलें
                </button>

                <button
                    onClick={handleAnswerClick}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
                    disabled={!problem}
                >
                    कृष्ण का उत्तर
                </button>
            </div>
            {loading ? "कृपया उत्तर और सही समय की प्रतीक्षा करें..." : ""}
            {answer && (
                <div className="mt-6 p-4 max-w-md text-center bg-white shadow rounded border">
                    <p className="text-lg italic">"{answer}"</p>
                </div>
            )}

            {sanskritAnswer && (
                <div className="mt-6 p-4 max-w-md text-center bg-white shadow rounded border">
                    <p className="text-lg italic">"{sanskritAnswer}"</p>
                </div>
            )}
            <footer className="absolute bottom-5 text-[11px] text-gray-500 text-center w-full">
            © 2025 • Created by Satyam Mishra
            </footer>
        </main>
    );
}

export default KrishnaPage;
