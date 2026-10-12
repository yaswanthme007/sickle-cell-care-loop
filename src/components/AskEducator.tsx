'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AskEducator: React.FC = () => {
  const { selectedStatus, language, playSpeech } = useApp();
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [response, setResponse] = useState<{
    answer: string;
    safetyIntercepted: boolean;
    source: string;
    piiScrubbed?: boolean;
  } | null>(null);

  const quickPrompts =
    language === 'en'
      ? [
          'What does my card mean for marriage & children?',
          'How much water & what diet helps?',
          selectedStatus === 'HbAS'
            ? 'Why do carriers not take Hydroxyurea?'
            : 'Can I stop or change my medicine dose?',
          'I have high fever and chest pain' // Demonstrates deterministic safety intercept!
        ]
      : [
          'विवाह और बच्चों के लिए मेरे कार्ड का क्या अर्थ है?',
          'कितना पानी और कैसा आहार लेना चाहिए?',
          selectedStatus === 'HbAS'
            ? 'वाहक को हाइड्रोक्सीयूरिया क्यों नहीं लेनी चाहिए?'
            : 'क्या मैं अपनी दवा की खुराक बदल सकता हूँ?',
          'मुझे तेज बुखार और सीने में दर्द है' // Demonstrates deterministic safety intercept!
        ];

  const submitQuestion = async (textToSubmit: string) => {
    const trimmed = textToSubmit.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          status: selectedStatus,
          language
        })
      });
      const data = await res.json();
      if (data.answer) {
        setResponse(data);
      }
    } catch (err) {
      console.error('Failed to fetch educator answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Use browser SpeechRecognition if available, else simulate Whisper-large-v3-turbo endpoint
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as unknown as Record<string, unknown>).SpeechRecognition ||
          (window as unknown as Record<string, unknown>).webkitSpeechRecognition
        : null;

    if (SpeechRecognition && typeof SpeechRecognition === 'function') {
      try {
        const recognition = new (SpeechRecognition as new () => {
          lang: string;
          interimResults: boolean;
          onstart: () => void;
          onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
        })();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const spoken = event.results[0][0].transcript;
          setIsListening(false);
          submitQuestion(spoken);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch {
        // Fallback below
      }
    }

    // Fallback: Simulate voice recording sent to /api/transcribe (Whisper on Groq)
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const sampleSpoken =
        language === 'hi'
          ? 'विवाह और बच्चों के लिए मेरे कार्ड का क्या अर्थ है?'
          : 'What does my card mean for marriage and children?';
      submitQuestion(sampleSpoken);
    }, 1200);
  };

  return (
    <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-canvas-200 text-ink-800 border border-canvas-300">
              {language === 'en' ? 'Guarded Status Educator' : 'सुरक्षित स्वास्थ्य मार्गदर्शक'}
            </span>
            <span className="text-[11px] font-semibold text-forest-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              {language === 'en' ? 'Zero-PII • Triage Guarded' : 'गोपनीयता सुरक्षित'}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-ink-950 tracking-tight">
            {language === 'en'
              ? 'Ask About Your Status Card (Voice or Text)'
              : 'अपने कार्ड के बारे में पूछें (बोलकर या लिखकर)'}
          </h3>
          <p className="text-xs text-ink-600">
            {language === 'en'
              ? 'Answers plain-language questions on card meaning & inheritance. Symptom or dose questions are automatically intercepted by clinical safety rules.'
              : 'कार्ड के अर्थ और आनुवंशिक नियम सरल भाषा में समझें। लक्षण या दवा बदलने के प्रश्नों को सुरक्षा नियम द्वारा स्वतः रोक दिया जाता है।'}
          </p>
        </div>
      </div>

      {/* Quick Preset Chips */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 block mb-2">
          {language === 'en' ? 'Tap a question or test safety guardrails:' : 'प्रश्न चुनें या सुरक्षा नियम परखें:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => submitQuestion(prompt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all tap-active ${
                idx === 3
                  ? 'bg-blood-50/70 border-blood-200 text-blood-900 hover:bg-blood-100'
                  : 'bg-canvas-100 border-canvas-300 text-ink-800 hover:bg-canvas-200'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row with Voice Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all tap-active ${
            isListening
              ? 'bg-blood-700 text-white border-blood-800 animate-pulse'
              : 'bg-canvas-100 hover:bg-canvas-200 text-ink-800 border-canvas-300'
          }`}
          title="Speak question"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blood-700" />}
          <span className="hidden sm:inline">
            {isListening
              ? language === 'en'
                ? 'Listening...'
                : 'सुन रहा है...'
              : language === 'en'
              ? 'Voice'
              : 'बोलें'}
          </span>
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitQuestion(query)}
          placeholder={
            language === 'en'
              ? 'Ask a question about your status card...'
              : 'अपने जांच कार्ड के बारे में प्रश्न लिखें...'
          }
          className="flex-1 px-4 py-3 rounded-2xl bg-canvas-100 border border-canvas-300 text-xs sm:text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-800"
        />

        <button
          type="button"
          onClick={() => submitQuestion(query)}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-ink-900 hover:bg-ink-950 text-canvas-50 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all tap-active disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? '...' : language === 'en' ? 'Ask' : 'पूछें'}</span>
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            response.safetyIntercepted
              ? 'bg-blood-50 border-blood-300 text-blood-950'
              : 'bg-canvas-100/90 border-canvas-300 text-ink-900'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {response.safetyIntercepted ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blood-700 text-white uppercase">
                  <ShieldAlert className="w-3 h-3" />
                  {language === 'en' ? 'Deterministic Safety Rule Intercept' : 'सुरक्षा नियम द्वारा अवरुद्ध'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-forest-100 text-forest-900 border border-forest-300">
                  <ShieldCheck className="w-3 h-3 text-forest-700" />
                  {language === 'en' ? 'Verified Educational Guidance' : 'सत्यापित शैक्षिक जानकारी'}
                </span>
              )}
            </div>

            <button
              onClick={() => playSpeech(response.answer)}
              className="inline-flex items-center gap-1 text-xs font-bold text-ink-700 hover:text-ink-950 bg-canvas-50 px-2.5 py-1 rounded-lg border border-canvas-300"
            >
              <Volume2 className="w-3.5 h-3.5 text-blood-700" />
              <span>{language === 'en' ? 'Listen' : 'सुनें'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed">{response.answer}</p>
        </div>
      )}
    </div>
  );
};
