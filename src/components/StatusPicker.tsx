'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CardStatus } from '@/lib/types';
import { QrCode, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatusPicker: React.FC = () => {
  const { selectedStatus, setSelectedStatus, language, setQrModalOpen } = useApp();

  const statuses: {
    id: CardStatus;
    code: string;
    labelEn: string;
    labelHi: string;
    colorClasses: string;
    borderActive: string;
    badgeBg: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'HbAA',
      code: 'HbAA',
      labelEn: 'Normal (Non-Carrier)',
      labelHi: 'सामान्य (नॉन-कैरियर)',
      colorClasses: 'bg-forest-50 text-forest-900 border-forest-200 hover:border-forest-300',
      borderActive: 'border-forest-600 ring-2 ring-forest-500/20 bg-forest-100/60',
      badgeBg: 'bg-forest-600 text-white',
      icon: <ShieldCheck className="w-4 h-4 text-forest-700" />
    },
    {
      id: 'HbAS',
      code: 'HbAS',
      labelEn: 'Carrier (Sickle Trait)',
      labelHi: 'वाहक (सिकल लक्षण)',
      colorClasses: 'bg-ochre-50 text-ochre-900 border-ochre-200 hover:border-ochre-300',
      borderActive: 'border-ochre-600 ring-2 ring-ochre-500/20 bg-ochre-100/60',
      badgeBg: 'bg-ochre-600 text-white',
      icon: <AlertTriangle className="w-4 h-4 text-ochre-700" />
    },
    {
      id: 'HbSS',
      code: 'HbSS',
      labelEn: 'Sickle Cell Disease',
      labelHi: 'सिकल सेल रोग (बीमारी)',
      colorClasses: 'bg-blood-50 text-blood-900 border-blood-200 hover:border-blood-300',
      borderActive: 'border-blood-600 ring-2 ring-blood-500/20 bg-blood-100/60',
      badgeBg: 'bg-blood-700 text-white',
      icon: <CheckCircle2 className="w-4 h-4 text-blood-700" />
    }
  ];

  return (
    <div className="bg-canvas-100 border border-canvas-200 rounded-2xl p-4 sm:p-5 shadow-gentle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
            {language === 'en' ? "Step 1 • Select Card Status" : "चरण 1 • जांच कार्ड का परिणाम चुनें"}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-ink-950">
            {language === 'en' ? "What does your card show?" : "आपके कार्ड पर क्या लिखा है?"}
          </h2>
        </div>

        {/* Scan physical QR code button */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-canvas-50 border border-canvas-300 hover:border-ink-400 text-ink-800 text-xs font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-blood-700" />
          <span>{language === 'en' ? "Scan Demo Card QR" : "डेमो कार्ड QR स्कैन करें"}</span>
        </button>
      </div>

      {/* 3 large tactile options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statuses.map((item) => {
          const isSelected = selectedStatus === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedStatus(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative tap-active ${item.colorClasses} ${
                isSelected ? item.borderActive : 'shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-base tracking-tight">{item.code}</span>
                {item.icon}
              </div>
              <p className="text-xs font-semibold">
                {language === 'en' ? item.labelEn : item.labelHi}
              </p>
              {isSelected && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
                  {language === 'en' ? "Active View" : "सक्रिय दृश्य"}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
