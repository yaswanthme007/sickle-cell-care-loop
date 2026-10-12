'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CardStatus } from '@/lib/types';
import { X, QrCode, Scan, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MockQrScanner: React.FC = () => {
  const { qrModalOpen, setQrModalOpen, setSelectedStatus, language, isOnboarded, setOnboardingStep } = useApp();
  const [scanningStatus, setScanningStatus] = useState<CardStatus | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  if (!qrModalOpen) return null;

  const demoCards: {
    status: CardStatus;
    name: string;
    id: string;
    color: string;
    badge: string;
  }[] = [
    {
      status: 'HbSS',
      name: 'Ramesh Kol (Age 11)',
      id: 'MP-SHD-101',
      color: 'border-blood-300 bg-blood-50/50 hover:bg-blood-100/50',
      badge: 'bg-blood-700 text-white'
    },
    {
      status: 'HbAS',
      name: 'Pooja Baiga (Age 24)',
      id: 'MP-SHD-102',
      color: 'border-ochre-300 bg-ochre-50/50 hover:bg-ochre-100/50',
      badge: 'bg-ochre-700 text-white'
    },
    {
      status: 'HbAA',
      name: 'Vikram Dhurve (Age 28)',
      id: 'MP-SHD-105',
      color: 'border-forest-300 bg-forest-50/50 hover:bg-forest-100/50',
      badge: 'bg-forest-700 text-white'
    }
  ];

  const handleSimulateScan = (status: CardStatus) => {
    setScanningStatus(status);
    setTimeout(() => {
      setSelectedStatus(status);
      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        setScanningStatus(null);
        setQrModalOpen(false);
        if (!isOnboarded) {
          setOnboardingStep(3);
        }
      }, 700);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm">
      <div className="bg-canvas-50 border border-canvas-300 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setQrModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-canvas-200/80 hover:bg-canvas-300 text-ink-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blood-800 text-white flex items-center justify-center">
            <Scan className="w-5 h-5 text-canvas-100" />
          </div>
          <div>
            <h3 className="font-bold text-base text-ink-950">
              {language === 'en' ? "Simulate Status Card Scan" : "सिकल सेल स्टेटस कार्ड स्कैन"}
            </h3>
            <p className="text-xs text-ink-500">
              {language === 'en'
                ? "National Sickle Cell Mission digital QR decoder"
                : "राष्ट्रीय मिशन डिजिटल क्यूआर कोड सत्यापन"}
            </p>
          </div>
        </div>

        {/* Viewfinder simulator */}
        <div className="relative aspect-video rounded-2xl bg-ink-900 border-2 border-dashed border-ink-700 flex flex-col items-center justify-center p-4 mb-4 overflow-hidden">
          {scanningStatus ? (
            <div className="text-center">
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 50 }}
                transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
                className="w-44 h-0.5 bg-blood-400 mx-auto shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              />
              <p className="text-canvas-100 text-xs font-semibold mt-4">
                {language === 'en' ? "Reading digital signature..." : "डिजिटल सिग्नेचर पढ़ा जा रहा है..."}
              </p>
            </div>
          ) : scanSuccess ? (
            <div className="text-center text-forest-400">
              <Check className="w-10 h-10 mx-auto mb-1 animate-bounce" />
              <p className="text-xs font-bold text-canvas-100">
                {language === 'en' ? "Card Verified!" : "कार्ड सत्यापित हुआ!"}
              </p>
            </div>
          ) : (
            <div className="text-center text-ink-400">
              <QrCode className="w-10 h-10 mx-auto mb-2 opacity-60 text-canvas-200" />
              <p className="text-xs font-medium text-ink-300">
                {language === 'en'
                  ? "Select a sample government card below to simulate instant scan"
                  : "त्वरित स्कैन के लिए नीचे दिए गए कार्ड पर क्लिक करें"}
              </p>
            </div>
          )}
        </div>

        {/* Demo cards roster */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
            {language === 'en' ? "Sample Mission Cards (Madhya Pradesh):" : "मध्य प्रदेश पायलट नमूना कार्ड:"}
          </p>

          {demoCards.map((card) => (
            <button
              key={card.status}
              onClick={() => handleSimulateScan(card.status)}
              disabled={!!scanningStatus}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all tap-active ${card.color} ${
                scanningStatus === card.status ? 'ring-2 ring-blood-500' : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${card.badge}`}>
                    {card.status}
                  </span>
                  <span className="text-xs font-bold text-ink-900">{card.name}</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-0.5">ID: {card.id} • Shahdol District</p>
              </div>

              <span className="text-xs font-semibold text-blood-800 hover:underline">
                {language === 'en' ? "Scan Card →" : "स्कैन करें →"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
