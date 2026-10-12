'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Users,
  HeartPulse,
  MapPin,
  Cloud,
  CloudOff,
  QrCode
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    toggleLanguage,
    userRole,
    setUserRole,
    selectedStatus,
    isOnboarded,
    resetToOnboarding,
    isOfflineMode,
    setIsOfflineMode,
    syncQueue,
    setErHandoverModalOpen
  } = useApp();

  const unsyncedCount = syncQueue.filter((q) => !q.synced).length;

  return (
    <header className="sticky top-0 z-40 bg-canvas-50/95 backdrop-blur-md border-b border-canvas-200">
      {/* Top micro-bar with mission context & live offline-first toggle */}
      <div className="bg-ink-900 text-canvas-100 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-forest-400 animate-pulse" />
            <span className="font-medium tracking-wide">
              {language === 'en'
                ? 'National Sickle Cell Elimination Mission • Shahdol Pilot'
                : 'राष्ट्रीय सिकल सेल उन्मूलन मिशन • शहडोल पायलट परियोजना'}
            </span>
            <span className="hidden sm:inline text-ink-400">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-ink-300">
              <MapPin className="w-3 h-3 text-blood-400" />
              Madhya Pradesh
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            {/* Interactive Offline Village Mode Toggle */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              title="Toggle Offline Village Queue Simulation"
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold transition-all ${
                isOfflineMode
                  ? 'bg-ochre-600 text-white'
                  : 'bg-ink-800 hover:bg-ink-700 text-forest-300 border border-ink-700'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <CloudOff className="w-3 h-3" />
                  <span>
                    {language === 'en'
                      ? `Offline Village Mode (${unsyncedCount} Queued)`
                      : `ऑफ़लाइन ग्राम मोड (${unsyncedCount} कतार में)`}
                  </span>
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3 text-forest-400" />
                  <span>
                    {language === 'en'
                      ? 'Hybrid Cloud + Offline Sync'
                      : 'हाइब्रिड क्लाउड सिंक'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <button
          onClick={() => resetToOnboarding(1)}
          className="flex items-center gap-3 text-left group"
          title="Return to Guided Onboarding"
        >
          <div className="w-10 h-10 rounded-xl bg-blood-800 text-canvas-50 flex items-center justify-center font-bold text-lg shadow-sm border border-blood-700 group-hover:scale-105 transition-transform">
            SC
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-ink-950 tracking-tight leading-tight">
              {language === 'en' ? 'After the Card' : 'आफ्टर द कार्ड'}
            </h1>
            <p className="text-xs text-ink-500 font-medium hidden sm:block">
              {language === 'en'
                ? 'Sickle Cell Post-Screening Care Loop'
                : 'सिकल सेल निरंतर देखभाल प्रणाली'}
            </p>
          </div>
        </button>

        {/* Action Controls: Instant Role Switcher, ER Pass & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isOnboarded && (
            <>
              {/* Instant Closed-Loop Role Switcher */}
              <div className="flex items-center bg-canvas-200 p-1 rounded-xl border border-canvas-300">
                <button
                  onClick={() => setUserRole('patient')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    userRole === 'patient'
                      ? 'bg-canvas-50 text-ink-950 shadow-sm'
                      : 'text-ink-600 hover:text-ink-950'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5 text-blood-700" />
                  <span>
                    {language === 'en'
                      ? `Patient (${selectedStatus})`
                      : `मरीज (${selectedStatus})`}
                  </span>
                </button>

                <button
                  onClick={() => setUserRole('asha')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    userRole !== 'patient'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-ink-600 hover:text-ink-950'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'ASHA / CHC Portal' : 'आशा / CHC पोर्टल'}
                  </span>
                </button>
              </div>

              {selectedStatus === 'HbSS' && userRole === 'patient' && (
                <button
                  onClick={() => setErHandoverModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-50 hover:bg-blood-100 border border-blood-200 text-blood-900 text-xs font-extrabold transition-all tap-active"
                >
                  <QrCode className="w-3.5 h-3.5 text-blood-700" />
                  <span>{language === 'en' ? 'ER Pass' : 'ER पास'}</span>
                </button>
              )}
            </>
          )}

          {/* Language Toggle: English Default / Hindi */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-canvas-300 bg-canvas-100 hover:bg-canvas-200 text-ink-800 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-ink-600" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
