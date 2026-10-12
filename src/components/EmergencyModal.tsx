'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PhoneCall, ShieldAlert, AlertTriangle, ArrowRight, X, Building2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmergencyModal: React.FC = () => {
  const { emergencyModalOpen, closeEmergencyModal, emergencyResult, language, currentPatient } = useApp();

  if (!emergencyModalOpen || !emergencyResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-canvas-50 border-2 border-blood-600 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-emergency-pulse">
        {/* Top Emergency Banner */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blood-700 text-white flex items-center justify-center shrink-0 shadow-lg">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blood-700 bg-blood-100 px-2 py-0.5 rounded">
                {language === 'en' ? "Emergency Medical Protocol" : "आपातकालीन चिकित्सा नियम"}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-blood-950 leading-tight mt-0.5">
                {emergencyResult.emergencyTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={closeEmergencyModal}
            className="p-2 rounded-full bg-canvas-200 text-ink-600 hover:text-ink-950 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Direct Instruction: DO NOT WAIT FOR ASHA */}
        <div className="p-4 rounded-2xl bg-blood-50 border border-blood-200 text-blood-950 mb-4">
          <p className="font-extrabold text-sm sm:text-base leading-snug">
            {emergencyResult.actionRequired}
          </p>
          <p className="text-xs text-blood-800 mt-2 font-medium">
            {language === 'en'
              ? "Critical: Do not wait for home visits. These symptoms require urgent hospital assessment with oxygen, IV hydration, or transfusion facilities."
              : "महत्वपूर्ण: घर पर किसी के आने का इंतजार न करें। इन लक्षणों में तुरंत अस्पताल में ऑक्सीजन या ड्रिप की जरूरत हो सकती है।"}
          </p>
        </div>

        {/* Detected Red Flags */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
            {language === 'en' ? "Detected Critical Flags:" : "पहचाने गए गंभीर लक्षण:"}
          </p>
          <ul className="space-y-1.5">
            {emergencyResult.detectedFlags.map((flag, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs font-bold text-blood-900 bg-blood-100/60 p-2 rounded-xl border border-blood-200/50"
              >
                <AlertTriangle className="w-4 h-4 text-blood-700 shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary Call 108 Action Button */}
        <div className="space-y-2.5">
          <a
            href="tel:108"
            className="w-full py-4 rounded-2xl bg-blood-700 hover:bg-blood-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <PhoneCall className="w-5 h-5 text-canvas-100 animate-bounce" />
            <span>{language === 'en' ? "Call 108 Ambulance Directly" : "सीधे 108 एम्बुलेंस पर कॉल करें"}</span>
          </a>

          {/* Secondary Facility Info */}
          <div className="p-3 rounded-xl bg-canvas-100 border border-canvas-200 flex items-center justify-between text-xs text-ink-700">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-ink-600" />
              <span>
                {language === 'en'
                  ? "Nearest Facility: District Hospital Shahdol / CHC Burhar"
                  : "नजदीकी केंद्र: जिला चिकित्सालय शहडोल / सी.एच.सी. बुढ़ार"}
              </span>
            </div>
            <span className="font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded text-[10px]">
              24×7
            </span>
          </div>

          {/* Secondary background notification indicator */}
          <p className="text-center text-[11px] text-ink-500 pt-1">
            {language === 'en'
              ? `A secondary emergency alert has been queued to ${currentPatient.ashaAssigned} for follow-up.`
              : `एक द्वितीयक आपातकालीन अलर्ट आपकी आशा कार्यकर्ता (${currentPatient.ashaAssigned}) को भी भेज दिया गया है।`}
          </p>
        </div>
      </div>
    </div>
  );
};
