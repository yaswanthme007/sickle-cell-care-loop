'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Globe, Users, HeartPulse, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const {
    language,
    toggleLanguage,
    userRole,
    selectedStatus,
    isOnboarded,
    resetToOnboarding
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-canvas-50/90 backdrop-blur-md border-b border-canvas-200">
      {/* Top micro-bar with mission context */}
      <div className="bg-ink-900 text-canvas-100 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-forest-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              {language === 'en'
                ? "National Sickle Cell Elimination Mission • Shahdol Pilot"
                : "राष्ट्रीय सिकल सेल उन्मूलन मिशन • शहडोल पायलट परियोजना"}
            </span>
            <span className="hidden sm:inline text-ink-400">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-ink-300">
              <MapPin className="w-3 h-3 text-blood-400" />
              Madhya Pradesh
            </span>
          </div>
          <div className="flex items-center gap-3 text-ink-300 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-400" />
              {language === 'en' ? "Offline Ready" : "ऑफ़लाइन तैयार"}
            </span>
            <span className="hidden md:inline text-ink-400">•</span>
            <span className="hidden md:inline text-ochre-300">
              {language === 'en' ? "Next: Odia Rollout" : "अगला चरण: ओड़िया"}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <button
          onClick={() => resetToOnboarding(1)}
          className="flex items-center gap-3 text-left group"
          title="Return to Welcome Screen"
        >
          <div className="w-10 h-10 rounded-xl bg-blood-800 text-canvas-50 flex items-center justify-center font-bold text-lg shadow-sm border border-blood-700 group-hover:scale-105 transition-transform">
            SC
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-ink-950 tracking-tight leading-tight">
              {language === 'en' ? "After the Card" : "आफ्टर द कार्ड"}
            </h1>
            <p className="text-xs text-ink-500 font-medium">
              {language === 'en' ? "Sickle Cell Post-Screening Care Loop" : "सिकल सेल निरंतर देखभाल प्रणाली"}
            </p>
          </div>
        </button>

        {/* Action Controls: Active Session Badge & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isOnboarded && (
            <div className="flex items-center gap-2">
              {userRole === 'patient' ? (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas-100 border border-canvas-300 text-xs font-bold text-ink-900">
                  <HeartPulse className="w-3.5 h-3.5 text-blood-700" />
                  <span>
                    {language === 'en' ? `Card: ${selectedStatus}` : `कार्ड: ${selectedStatus}`}
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-200 text-xs font-bold text-forest-900">
                  <Users className="w-3.5 h-3.5 text-forest-700" />
                  <span>{language === 'en' ? "ASHA Portal" : "आशा पोर्टल"}</span>
                </div>
              )}

              <button
                onClick={() => resetToOnboarding(1)}
                className="px-3 py-1.5 rounded-xl bg-canvas-200/90 hover:bg-canvas-300 text-ink-900 text-xs font-bold border border-canvas-300 transition-all tap-active"
              >
                {language === 'en' ? "Switch Card / Role" : "कार्ड / भूमिका बदलें"}
              </button>
            </div>
          )}

          {/* Language Toggle: English Default / Hindi */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-canvas-300 bg-canvas-100 hover:bg-canvas-200 text-ink-800 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-ink-600" />
            <span>{language === 'en' ? "हिंदी" : "English"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
