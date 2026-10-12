'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { UnderstandCard } from '@/components/UnderstandCard';
import { AdherenceTracker } from '@/components/AdherenceTracker';
import { SymptomChecker } from '@/components/SymptomChecker';
import { CarrierCounseling } from '@/components/CarrierCounseling';
import { AshaDashboard } from '@/components/AshaDashboard';
import { EmergencyModal } from '@/components/EmergencyModal';
import { MockQrScanner } from '@/components/MockQrScanner';
import { MissionBanner } from '@/components/MissionBanner';
import { AskEducator } from '@/components/AskEducator';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { VocPredictorCard } from '@/components/VocPredictorCard';
import { ClinicalPassbook } from '@/components/ClinicalPassbook';
import { EmergencyHandoverModal } from '@/components/EmergencyHandoverModal';
import {
  CheckCircle2,
  QrCode,
  RefreshCw,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function Home() {
  const {
    userRole,
    selectedStatus,
    language,
    isOnboarded,
    currentPatient,
    allPatients,
    selectPatientById,
    resetToOnboarding,
    setQrModalOpen,
    setErHandoverModalOpen
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-50 selection:bg-blood-100 selection:text-blood-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {!isOnboarded ? (
            <motion.div
              key="onboarding-flow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <OnboardingFlow />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-flow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Mission Context Header inside Dashboard */}
              <MissionBanner />

              {userRole === 'patient' ? (
                <div className="space-y-6">
                  {/* Active Patient Profile & Card Header Bar */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-canvas-100 border border-canvas-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-gentle">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center text-white shadow-sm shrink-0 ${
                          selectedStatus === 'HbSS'
                            ? 'bg-blood-800'
                            : selectedStatus === 'HbAS'
                            ? 'bg-ochre-700'
                            : 'bg-forest-700'
                        }`}
                      >
                        {selectedStatus}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-extrabold text-ink-950">
                            {currentPatient.name}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md bg-canvas-200 text-ink-700 text-[11px] font-bold">
                            ID: {currentPatient.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-canvas-200 text-ink-800 text-[11px] font-bold">
                            {currentPatient.age}y • {currentPatient.weightKg}kg •{' '}
                            {currentPatient.bloodGroup}
                          </span>
                          {currentPatient.labProfile && (
                            <span className="px-2 py-0.5 rounded-md bg-blood-100 text-blood-900 text-[11px] font-extrabold">
                              Baseline Hb: {currentPatient.labProfile.baselineHbGdl} g/dL • HbF:{' '}
                              {currentPatient.labProfile.hbF}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blood-700" />
                          <span>
                            {currentPatient.village}, {currentPatient.district} • ASHA:{' '}
                            {currentPatient.ashaAssigned}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Patient Selector + Scanner + ER Handover Pass */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      <select
                        aria-label="Switch Active Patient Profile"
                        value={currentPatient.id}
                        onChange={(e) => selectPatientById(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-canvas-50 border border-canvas-300 text-ink-900 text-xs font-bold focus:outline-none"
                      >
                        {allPatients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.status} • {p.village})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setQrModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-50 border border-canvas-300 hover:border-ink-400 text-ink-800 text-xs font-bold transition-all tap-active"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blood-700" />
                        <span>
                          {language === 'en'
                            ? 'Scan Card / HPLC Lab'
                            : 'कार्ड / लैब स्कैन'}
                        </span>
                      </button>

                      {selectedStatus === 'HbSS' && (
                        <button
                          onClick={() => setErHandoverModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blood-800 hover:bg-blood-900 text-white text-xs font-extrabold transition-all tap-active shadow-sm"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>
                            {language === 'en'
                              ? '2 AM ER Handover Pass'
                              : 'आपातकालीन डॉक्टर पास'}
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => resetToOnboarding(2)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-900 text-xs font-bold transition-all tap-active"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>
                          {language === 'en' ? 'Guided Setup' : 'गाइडेड सेटअप'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Branching Experience According to Status Card */}
                  {selectedStatus === 'HbSS' && (
                    <div className="space-y-6">
                      {/* Novel Module 1: 48h Biophysical VOC Crisis Predictor & Hydration Loop */}
                      <VocPredictorCard />

                      {/* Pillar 1: Understand Your Card */}
                      <UnderstandCard />

                      {/* Pillars 2 & 3: Daily Hydroxyurea + Stock Tracker & Deterministic Crisis Triage */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <AdherenceTracker />
                        <SymptomChecker />
                      </div>

                      {/* Novel Module 3: Pediatric Weight-Based Dosing, HPLC Lab & Spleen Check Passbook */}
                      <ClinicalPassbook />
                    </div>
                  )}

                  {selectedStatus === 'HbAS' && (
                    <div className="space-y-6">
                      <UnderstandCard />
                      <CarrierCounseling />
                    </div>
                  )}

                  {selectedStatus === 'HbAA' && (
                    <div className="space-y-6">
                      <UnderstandCard />
                      <div className="p-6 rounded-3xl bg-forest-50/70 border border-forest-200 text-forest-950 flex items-start gap-4 shadow-gentle">
                        <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base">
                            {language === 'en'
                              ? 'Reassurance: Normal Hemoglobin Confirmed'
                              : 'आश्वस्ति: सामान्य हीमोग्लोबिन की पुष्टि'}
                          </h4>
                          <p className="text-xs sm:text-sm text-forest-800 mt-1 leading-relaxed">
                            {language === 'en'
                              ? 'You do not have sickle cell anemia, nor do you carry the trait. No specialized care loop is needed. Keep your official card safe with your family records.'
                              : 'आपको सिकल सेल बीमारी नहीं है और आप इसके वाहक भी नहीं हैं। किसी विशेष दवा या उपचार की आवश्यकता नहीं है। अपना कार्ड परिवार के दस्तावेजों के साथ सुरक्षित रखें।'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guarded Status Educator */}
                  <AskEducator />
                </div>
              ) : (
                <AshaDashboard />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <EmergencyModal />
      <EmergencyHandoverModal />
      <MockQrScanner />

      {/* Footer */}
      <footer className="mt-12 border-t border-canvas-200 bg-canvas-100 py-6 px-4 text-center text-xs text-ink-500">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-medium text-ink-700">
            {language === 'en'
              ? 'Sickle Cell Post-Screening Care Loop • Built for UnivaBio 2026'
              : 'सिकल सेल पोस्ट-स्क्रीनिंग केयर लूप • यूनीवाबायो 2026'}
          </p>
          <p className="text-[11px] text-ink-400">
            {language === 'en'
              ? 'Field Pilot: Shahdol & Bhopal, MP • Clinical guidelines adapted from National Sickle Cell Anaemia Elimination Mission (NSCAEM) • Odia language expansion planned for Odisha cohort.'
              : 'क्षेत्रीय पायलट: शहडोल एवं भोपाल, म.प्र. • राष्ट्रीय सिकल सेल एनीमिया उन्मूलन मिशन दिशा-निर्देशों पर आधारित • ओडिशा के लिए ओड़िया भाषा का विस्तार आगामी चरण में प्रस्तावित।'}
          </p>
        </div>
      </footer>
    </div>
  );
}
