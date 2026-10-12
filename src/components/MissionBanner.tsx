'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, MapPin, Award, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

export const MissionBanner: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-canvas-100 border border-canvas-200/90 shadow-gentle">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blood-800 text-white tracking-wide">
              UnivaBio 2026
            </span>
            <span className="text-xs font-bold text-ink-600">
              {language === 'en' ? "Theme: AI for Human Health" : "थीम: मानव स्वास्थ्य हेतु एआई"}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-ink-950">
            {language === 'en'
              ? "India screened 6+ crore people. We solve what happens the day after."
              : "भारत ने 6 करोड़ से अधिक लोगों की जांच की। हम उसके अगले दिन की देखभाल सुनिश्चित करते हैं।"}
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-3xl leading-relaxed">
            {language === 'en'
              ? "Bridging the documented post-screening attrition gap (Dave et al., 2019; Bhopal Pediatric Study, 2022) with plain-language genetic clarity, daily adherence loops, and deterministic frontline triage for frontline ASHA workers in Madhya Pradesh."
              : "जांच के बाद इलाज छूटने की समस्या को हल करना — आसान भाषा में आनुवंशिक जानकारी, दैनिक दवा ट्रैकिंग और मध्य प्रदेश में आशा कार्यकर्ताओं के लिए स्पष्ट प्राथमिक देखभाल।"}
          </p>
        </div>

        {/* 3 Pillar Summary Badges */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-canvas-50 border border-canvas-200 text-center">
            <span className="block text-[10px] uppercase font-bold text-ink-500">Pillar 1</span>
            <span className="text-xs font-bold text-ink-900">
              {language === 'en' ? "Understand" : "समझें"}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-canvas-50 border border-canvas-200 text-center">
            <span className="block text-[10px] uppercase font-bold text-ink-500">Pillar 2</span>
            <span className="text-xs font-bold text-ink-900">
              {language === 'en' ? "Stay in Care" : "देखभाल"}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-canvas-50 border border-canvas-200 text-center">
            <span className="block text-[10px] uppercase font-bold text-ink-500">Pillar 3</span>
            <span className="text-xs font-bold text-ink-900">
              {language === 'en' ? "Act Early" : "त्वरित सहायता"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
