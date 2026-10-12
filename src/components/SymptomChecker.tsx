'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SymptomEvaluation } from '@/lib/types';
import { evaluateSymptoms } from '@/lib/triageEngine';
import {
  AlertCircle,
  ShieldAlert,
  Activity,
  HeartCrack,
  Thermometer,
  Brain,
  HeartPulse,
  Droplets,
  QrCode
} from 'lucide-react';

export const SymptomChecker: React.FC = () => {
  const { language, triggerEmergencyModal, setErHandoverModalOpen } = useApp();

  const [symptoms, setSymptoms] = useState<SymptomEvaluation>({
    strokeSigns: false,
    chestTightness: false,
    highFever: false,
    severeAcutePain: false,
    splenicEnlargementSigns: false,
    mildJointPain: false,
    fatigue: false,
    darkUrineOrJaundice: false,
    timestamp: new Date().toISOString()
  });

  const [evaluatedResult, setEvaluatedResult] = useState<ReturnType<
    typeof evaluateSymptoms
  > | null>(null);

  const toggleSymptom = (key: keyof Omit<SymptomEvaluation, 'timestamp'>) => {
    setSymptoms((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEvaluate = () => {
    const result = evaluateSymptoms(symptoms, language);
    setEvaluatedResult(result);
    if (result.isEmergency) {
      triggerEmergencyModal(result);
    }
  };

  const items: {
    key: keyof Omit<SymptomEvaluation, 'timestamp'>;
    titleEn: string;
    titleHi: string;
    descEn: string;
    descHi: string;
    isCritical: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'strokeSigns',
      titleEn: 'Sudden Weakness or Speech Trouble',
      titleHi: 'अचानक कमजोरी या बोलने में लड़खड़ाहट',
      descEn: 'Face droop, arm weakness, or severe sudden headache (Stroke Signs)',
      descHi: 'चेहरे का लटकना, हाथ में कमजोरी या अचानक तेज सिरदर्द',
      isCritical: true,
      icon: <Brain className="w-4 h-4 text-blood-700" />
    },
    {
      key: 'chestTightness',
      titleEn: 'Chest Pain or Breathing Difficulty',
      titleHi: 'सीने में दर्द या सांस लेने में तकलीफ',
      descEn: 'Rapid shallow breathing, cough, or sharp chest tightness (ACS Risk)',
      descHi: 'तेज सांस चलना, खांसी या सीने में तेज जकड़न',
      isCritical: true,
      icon: <HeartCrack className="w-4 h-4 text-blood-700" />
    },
    {
      key: 'highFever',
      titleEn: 'High Fever (>101°F / 38.3°C)',
      titleHi: 'तेज बुखार (>101°F)',
      descEn: 'Functional asplenia makes bacterial sepsis a rapid emergency',
      descHi: 'सिकल सेल मरीजों में बुखार तेजी से गंभीर रूप ले सकता है',
      isCritical: true,
      icon: <Thermometer className="w-4 h-4 text-blood-700" />
    },
    {
      key: 'splenicEnlargementSigns',
      titleEn: 'Chalky Pale Palms + Swollen Left Tummy',
      titleHi: 'हथेलियां सफेद पड़ना या बाईं तरफ पेट फूलना',
      descEn: 'Acute Splenic Sequestration warning (sudden blood trapping in spleen)',
      descHi: 'तिल्ली (स्प्लीन) में अचानक खून जमा होने का गंभीर खतरा',
      isCritical: true,
      icon: <HeartPulse className="w-4 h-4 text-blood-700" />
    },
    {
      key: 'severeAcutePain',
      titleEn: 'Severe Acute Pain Crisis',
      titleHi: 'असहनीय तेज दर्द का दौरा (क्राइसिस)',
      descEn: 'Severe pain in back, legs, chest, or abdomen not relieved by fluids',
      descHi: 'पीठ, पैरों या पेट में बहुत तेज दर्द जो पानी पीने से ठीक न हो',
      isCritical: true,
      icon: <Activity className="w-4 h-4 text-blood-700" />
    },
    {
      key: 'mildJointPain',
      titleEn: 'Mild Joint or Hand-Foot Swelling',
      titleHi: 'हल्का जोड़ों का दर्द या हाथ-पैर में सूजन',
      descEn: 'Early warning sign of microvascular sickling (Dactylitis / Prodrome)',
      descHi: 'सिकल दर्द का शुरुआती संकेत',
      isCritical: false,
      icon: <AlertCircle className="w-4 h-4 text-ochre-700" />
    },
    {
      key: 'darkUrineOrJaundice',
      titleEn: 'Dark Cola-Colored Urine or Yellow Eyes',
      titleHi: 'गहरे रंग का पेशाब या आंखों में पीलापन',
      descEn: 'Sign of red cell breakdown (hemolysis) or severe dehydration',
      descHi: 'रक्त कोशिकाओं के टूटने या पानी की भारी कमी का संकेत',
      isCritical: false,
      icon: <Droplets className="w-4 h-4 text-ochre-700" />
    },
    {
      key: 'fatigue',
      titleEn: 'Noticeable Fatigue or Low Energy',
      titleHi: 'अत्यधिक थकान या कमजोरी',
      descEn: 'Sign of dropping hemoglobin below steady-state baseline',
      descHi: 'खून की कमी (एनीमिया) बढ़ने का संकेत',
      isCritical: false,
      icon: <AlertCircle className="w-4 h-4 text-ochre-700" />
    }
  ];

  return (
    <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blood-100 text-blood-900 border border-blood-200">
              100% Deterministic Rules
            </span>
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              {language === 'en' ? 'Pillar 3 • Act Early' : 'स्तंभ 3 • त्वरित सहायता'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-ink-950 tracking-tight">
            {language === 'en'
              ? 'Crisis & Splenic Warning Sign Check'
              : 'संकट एवं तिल्ली (स्प्लीन) चेतावनी जांच'}
          </h3>
          <p className="text-xs sm:text-sm text-ink-600">
            {language === 'en'
              ? 'Zero-LLM deterministic ICMR triage. Dispatches immediate 108 & ASHA alerts.'
              : 'बिना एआई के 100% सटीक सरकारी नियम। गंभीर लक्षण पर तुरंत 108 व आशा अलर्ट।'}
          </p>
        </div>

        <button
          onClick={() => setErHandoverModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blood-50 hover:bg-blood-100 border border-blood-200 text-blood-900 text-xs font-extrabold self-start sm:self-auto shrink-0 tap-active"
        >
          <QrCode className="w-3.5 h-3.5 text-blood-700" />
          <span>
            {language === 'en' ? '2 AM ER Handover Pass' : 'आपातकालीन डॉक्टर पास'}
          </span>
        </button>
      </div>

      {/* Symptom Checkbox List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item) => {
          const isChecked = !!symptoms[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleSymptom(item.key)}
              className={`p-3 rounded-2xl border text-left transition-all tap-active flex items-start gap-2.5 ${
                isChecked
                  ? item.isCritical
                    ? 'bg-blood-50 border-blood-500 ring-1 ring-blood-500/20'
                    : 'bg-ochre-50 border-ochre-500 ring-1 ring-ochre-500/20'
                  : 'bg-canvas-100/60 border-canvas-200 hover:border-canvas-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-ink-900">
                    {language === 'en' ? item.titleEn : item.titleHi}
                  </span>
                  {item.isCritical && (
                    <span className="text-[9px] uppercase font-extrabold text-blood-700 bg-blood-100 px-1.5 py-0.2 rounded shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-600 mt-0.5">
                  {language === 'en' ? item.descEn : item.descHi}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Evaluation Action Button */}
      <button
        onClick={handleEvaluate}
        className="w-full py-3.5 rounded-xl bg-blood-800 hover:bg-blood-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all tap-active"
      >
        <ShieldAlert className="w-4 h-4 text-blood-200" />
        <span>
          {language === 'en'
            ? 'Evaluate Current Symptoms (Deterministic Triage)'
            : 'लक्षणों की तुरंत जांच करें'}
        </span>
      </button>

      {/* Stable or Warning result card */}
      {evaluatedResult && !evaluatedResult.isEmergency && (
        <div
          className={`p-4 rounded-2xl border ${
            evaluatedResult.severity === 'WARNING'
              ? 'bg-ochre-50 border-ochre-300 text-ochre-950'
              : 'bg-forest-50 border-forest-300 text-forest-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>{evaluatedResult.emergencyTitle}</span>
          </div>
          <p className="text-xs leading-relaxed">{evaluatedResult.actionRequired}</p>
        </div>
      )}
    </div>
  );
};
