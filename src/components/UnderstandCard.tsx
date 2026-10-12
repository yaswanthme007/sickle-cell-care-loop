'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { STATUS_EXPLANATIONS } from '@/lib/constants';
import { Volume2, VolumeX, ShieldAlert, CheckCircle, Info, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const UnderstandCard: React.FC = () => {
  const { selectedStatus, language, isAudioPlaying, playSpeech, stopSpeech } = useApp();
  const content = STATUS_EXPLANATIONS[selectedStatus][language];

  const handleAudioToggle = () => {
    if (isAudioPlaying) {
      stopSpeech();
    } else {
      playSpeech(content.audioScript);
    }
  };

  const getAccent = () => {
    switch (selectedStatus) {
      case 'HbAA':
        return {
          badge: 'bg-forest-100 text-forest-800 border-forest-300',
          title: 'text-forest-950',
          indicator: 'bg-forest-600',
        };
      case 'HbAS':
        return {
          badge: 'bg-ochre-100 text-ochre-800 border-ochre-300',
          title: 'text-ochre-950',
          indicator: 'bg-ochre-600',
        };
      case 'HbSS':
        return {
          badge: 'bg-blood-100 text-blood-900 border-blood-300',
          title: 'text-blood-950',
          indicator: 'bg-blood-700',
        };
    }
  };

  const accent = getAccent();

  return (
    <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card transition-smooth">
      {/* Top Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${accent.badge}`}>
              {selectedStatus}
            </span>
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              {language === 'en' ? "Pillar 1 • Understand Your Status" : "स्तंभ 1 • अपनी रिपोर्ट को समझें"}
            </span>
          </div>
          <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight ${accent.title}`}>
            {content.title}
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-medium mt-0.5">
            {content.tagline}
          </p>
        </div>

        {/* Audio Readout Button (Low-literacy accessibility) */}
        <button
          onClick={handleAudioToggle}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm tap-active self-start sm:self-auto ${
            isAudioPlaying
              ? 'bg-blood-700 text-white animate-pulse'
              : 'bg-canvas-200/80 hover:bg-canvas-300 text-ink-800 border border-canvas-300'
          }`}
        >
          {isAudioPlaying ? (
            <>
              <VolumeX className="w-4 h-4 text-white" />
              <span>{language === 'en' ? "Stop Voice" : "आवाज रोकें"}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-blood-800" />
              <span>{language === 'en' ? "Listen in Hindi/English" : "आवाज में सुनें"}</span>
            </>
          )}
        </button>
      </div>

      {/* Main explanation content */}
      <div className="space-y-4">
        {/* Core summary card */}
        <div className="p-4 rounded-2xl bg-canvas-100/80 border border-canvas-200 text-ink-900 text-sm leading-relaxed">
          <p className="font-semibold text-ink-950 mb-1">
            {language === 'en' ? "What does this mean for your body?" : "आपके शरीर के लिए इसका क्या अर्थ है?"}
          </p>
          <p className="text-ink-700 text-xs sm:text-sm">{content.healthMeaning}</p>
        </div>

        {/* Marriage and genetic inheritance facts */}
        <div className="p-4 rounded-2xl bg-canvas-100/80 border border-canvas-200 text-ink-900 text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-1 text-ink-950 font-bold">
            <Heart className="w-4 h-4 text-blood-700" />
            <span>{language === 'en' ? "Marriage & Children (Genetic Facts)" : "विवाह और बच्चे (आनुवंशिक नियम)"}</span>
          </div>
          <p className="text-ink-700 text-xs sm:text-sm">{content.marriageGuidance}</p>
        </div>

        {/* Action checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
            {language === 'en' ? "Key Guidance For You:" : "आपके लिए जरूरी निर्देश:"}
          </h4>
          <ul className="space-y-2">
            {content.actionItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-canvas-100/50 border border-canvas-200/60 text-xs sm:text-sm text-ink-800"
              >
                <CheckCircle className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
