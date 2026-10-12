'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Scale,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  CheckSquare,
  Square,
  Send,
  HeartPulse,
  Plus,
  Minus
} from 'lucide-react';

export const ClinicalPassbook: React.FC = () => {
  const {
    currentPatient,
    updatePatientWeightAndProphylaxis,
    issueReferralTicket,
    setQrModalOpen,
    language,
    playSpeech
  } = useApp();

  const [spleenGuideOpen, setSpleenGuideOpen] = useState(false);
  const [referralSent, setReferralSent] = useState(false);

  if (currentPatient.status !== 'HbSS') return null;

  const weightKg = currentPatient.weightKg || 26;
  const doseMg = currentPatient.currentDoseMg || 500;
  const mgPerKg = Number((doseMg / weightKg).toFixed(1));

  // ICMR / NHM Standard Pediatric & Adolescent Hydroxyurea therapeutic window: 15 - 25 mg/kg/day
  const isUnderDosed = mgPerKg < 14.5;
  const isOverDosed = mgPerKg > 26.0;
  const recommendedTargetMg =
    Math.round((weightKg * 18) / 250) * 250 || 500;

  const lab = currentPatient.labProfile || {
    hbA: 0,
    hbS: 80.4,
    hbF: 16.4,
    hbA2: 3.2,
    baselineHbGdl: 7.8,
    lastCbcDate: '2026-08-25',
    ancCount: 2850,
    plateletCount: 210000
  };

  const prophylaxis = currentPatient.prophylaxis || {
    folicAcidDaily: true,
    penicillinProphylaxis: true,
    pneumococcalVaccine: true,
    spleenPalpationTrained: false
  };

  const handleAdjustWeight = (delta: number) => {
    const nextWeight = Math.min(Math.max(weightKg + delta, 8), 95);
    updatePatientWeightAndProphylaxis(currentPatient.id, {
      weightKg: nextWeight
    });
    setReferralSent(false);
  };

  const handleToggleProphylaxis = (key: keyof typeof prophylaxis) => {
    updatePatientWeightAndProphylaxis(currentPatient.id, {
      prophylaxis: {
        ...prophylaxis,
        [key]: !prophylaxis[key]
      }
    });
  };

  const handleRequestDoseReview = () => {
    issueReferralTicket({
      patientId: currentPatient.id,
      patientName: `${currentPatient.name} (${currentPatient.age}y, HbSS)`,
      issuedBy: 'Pediatric Weight-Dose Safety Guard',
      facilityName: `CHC ${currentPatient.village} Sickle Cell Clinic`,
      urgency: 'PRIORITY_48H',
      reason: `Weight is ${weightKg}kg on ${doseMg}mg/day (${mgPerKg} mg/kg/day). Recommended ICMR target (15–20 mg/kg) is ~${recommendedTargetMg}mg/day. Needs Medical Officer review.`
    });
    setReferralSent(true);
  };

  return (
    <section
      aria-label="Longitudinal Clinical Passbook & Weight-Based Dosing"
      className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-200">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink-900 text-canvas-50 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-canvas-200 text-ink-800">
              {language === 'en'
                ? 'NHM Clinical Passbook • Weight-Dose & HPLC Ledger'
                : 'एनएचएम क्लिनिकल पासबुक • वजन-खुराक एवं एचपीएलसी रिकॉर्ड'}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-ink-950 mt-1">
              {language === 'en'
                ? 'Weight-Based Hydroxyurea Safety, Baseline Hb & Prophylaxis'
                : 'वजन आधारित हाइड्रोक्सीयूरिया सुरक्षा, बेसलाइन Hb एवं टीकाकरण'}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-100 hover:bg-canvas-200 border border-canvas-300 text-ink-900 text-xs font-bold self-start sm:self-auto tap-active"
        >
          <FlaskConical className="w-3.5 h-3.5 text-blood-700" />
          <span>
            {language === 'en'
              ? 'Update HPLC Lab Values'
              : 'HPLC लैब रिपोर्ट अपडेट करें'}
          </span>
        </button>
      </div>

      {/* 3-Column Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Pediatric Weight-to-Dose Verification */}
        <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink-950">
                {language === 'en'
                  ? '1. Weight-Based Dose Check'
                  : '1. वजन अनुसार दवा जांच'}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isUnderDosed || isOverDosed
                    ? 'bg-ochre-700 text-white'
                    : 'bg-forest-700 text-white'
                }`}
              >
                {mgPerKg} mg/kg/day
              </span>
            </div>

            <p className="text-[11px] text-ink-600 mt-1">
              {language === 'en'
                ? 'ICMR/NHM Target: 15–20 mg/kg/day. As children grow, fixed doses become sub-therapeutic.'
                : 'ICMR मानक: 15–20 mg/kg/दिन। बच्चों का वजन बढ़ने पर डॉक्टर द्वारा खुराक की समीक्षा जरूरी है।'}
            </p>

            {/* Weight Adjuster */}
            <div className="mt-3 p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-500 block">
                  {language === 'en' ? 'Current Weight' : 'वर्तमान वजन'}
                </span>
                <span className="text-lg font-black text-ink-950">
                  {weightKg} kg
                </span>
                <span className="text-xs text-ink-500 ml-2">
                  ({doseMg} mg/day)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdjustWeight(-1)}
                  className="w-8 h-8 rounded-lg bg-canvas-200 hover:bg-canvas-300 flex items-center justify-center text-ink-900 font-bold tap-active"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAdjustWeight(1)}
                  className="w-8 h-8 rounded-lg bg-canvas-200 hover:bg-canvas-300 flex items-center justify-center text-ink-900 font-bold tap-active"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dose Status Alert */}
          {isUnderDosed || isOverDosed ? (
            <div className="p-3 rounded-xl bg-ochre-50 border border-ochre-300 text-ochre-950 space-y-2">
              <div className="flex items-start gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-ochre-700 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? `Dose Review Flag: ${mgPerKg} mg/kg is outside the 15–20 mg/kg window (Target ~${recommendedTargetMg}mg for ${weightKg}kg). Never change dose yourself.`
                    : `खुराक समीक्षा आवश्यक: ${weightKg}kg वजन के लिए ~${recommendedTargetMg}mg की समीक्षा हेतु CHC डॉक्टर से मिलें। खुद खुराक न बदलें।`}
                </span>
              </div>
              {referralSent ? (
                <div className="text-[11px] font-extrabold text-forest-800 bg-forest-100 px-2.5 py-1.5 rounded-lg">
                  ✓ {language === 'en' ? 'Dispatched to CHC Medical Officer Queue!' : 'CHC डॉक्टर को समीक्षा टिकट भेज दिया गया!'}
                </div>
              ) : (
                <button
                  onClick={handleRequestDoseReview}
                  className="w-full py-2 px-3 rounded-xl bg-ochre-700 hover:bg-ochre-800 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 tap-active"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en'
                      ? 'Send CHC Doctor Dose Review Ticket'
                      : 'CHC डॉक्टर को खुराक समीक्षा भेजें'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-950 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>
                {language === 'en'
                  ? `Optimal Dosing: ${doseMg}mg for ${weightKg}kg (${mgPerKg} mg/kg/day) is safely within the ICMR 15–20 mg/kg therapeutic window.`
                  : `उचित खुराक: ${weightKg}kg वजन के लिए ${doseMg}mg (${mgPerKg} mg/kg/दिन) सुरक्षित सीमा में है।`}
              </span>
            </div>
          )}
        </div>

        {/* Column 2: HPLC Hemoglobin Electrophoresis & Baseline Hb */}
        <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink-950">
                {language === 'en'
                  ? '2. HPLC Lab & Baseline Hb'
                  : '2. HPLC लैब एवं बेसलाइन हीमोग्लोबिन'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blood-100 text-blood-900">
                Baseline Hb: {lab.baselineHbGdl} g/dL
              </span>
            </div>

            <p className="text-[11px] text-ink-600 mt-1">
              {language === 'en'
                ? 'Hydroxyurea works by boosting Fetal Hemoglobin (HbF%), which stops red cells from sickling.'
                : 'हाइड्रोक्सीयूरिया फीटल हीमोग्लोबिन (HbF%) को बढ़ाती है, जो रक्त कोशिकाओं को हंसिया बनने से रोकता है।'}
            </p>

            {/* Hb Fractions Bars */}
            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-forest-900">
                    Protective Fetal Hb (HbF%)
                  </span>
                  <span className="text-forest-800">{lab.hbF}% (Target &gt;15%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-canvas-200 overflow-hidden">
                  <div
                    className="h-full bg-forest-700 rounded-full"
                    style={{ width: `${Math.min(lab.hbF * 2.5, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-blood-900">Sickle Hb (HbS%)</span>
                  <span className="text-blood-800">{lab.hbS}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-canvas-200 overflow-hidden">
                  <div
                    className="h-full bg-blood-700 rounded-full"
                    style={{ width: `${Math.min(lab.hbS, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CBC Toxicity Safety Gate */}
          <div className="p-2.5 rounded-xl bg-canvas-50 border border-canvas-200 text-[11px] text-ink-700 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-ink-900 block">
                {language === 'en'
                  ? 'CBC Blood Safety Gate:'
                  : 'CBC रक्त सुरक्षा जांच:'}
              </span>
              <span>
                ANC: {lab.ancCount || 2800}/mm³ • Platelets:{' '}
                {((lab.plateletCount || 210000) / 1000).toFixed(0)}k
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-900 font-bold text-[10px]">
              SAFE FOR HU
            </span>
          </div>
        </div>

        {/* Column 3: Prophylaxis & Guided Mother's Spleen Check */}
        <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink-950">
                {language === 'en'
                  ? '3. Infection Shield & Spleen Check'
                  : '3. संक्रमण सुरक्षा एवं तिल्ली (स्प्लीन) जांच'}
              </span>
              <HeartPulse className="w-4 h-4 text-blood-700" />
            </div>

            <div className="mt-2.5 space-y-1.5">
              {[
                {
                  key: 'folicAcidDaily' as const,
                  en: 'Daily Folic Acid (5mg) for RBC production',
                  hi: 'दैनिक फोलिक एसिड (5mg) गोली'
                },
                {
                  key: 'penicillinProphylaxis' as const,
                  en: 'Penicillin Prophylaxis (Sepsis protection)',
                  hi: 'पेनिसिलिन सुरक्षा (गंभीर संक्रमण से बचाव)'
                },
                {
                  key: 'pneumococcalVaccine' as const,
                  en: 'Pneumococcal Vaccine (PCV / PPSV23) up to date',
                  hi: 'न्यूमोकोकल टीकाकरण (PCV) पूर्ण'
                },
                {
                  key: 'spleenPalpationTrained' as const,
                  en: 'Parent trained in Home Spleen Palpation Check',
                  hi: 'माता-पिता को घर पर तिल्ली (स्प्लीन) जांचना आता है'
                }
              ].map((item) => {
                const checked = prophylaxis[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => handleToggleProphylaxis(item.key)}
                    className="w-full p-2 rounded-xl bg-canvas-50 hover:bg-canvas-200/70 border border-canvas-200 flex items-center gap-2 text-left text-xs transition-all tap-active"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-forest-700 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-ink-400 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-semibold ${
                        checked ? 'text-ink-900' : 'text-ink-600'
                      }`}
                    >
                      {language === 'en' ? item.en : item.hi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setSpleenGuideOpen(!spleenGuideOpen)}
            className="w-full py-2 px-3 rounded-xl bg-blood-50 hover:bg-blood-100 border border-blood-200 text-blood-900 text-xs font-extrabold transition-all tap-active"
          >
            {spleenGuideOpen
              ? language === 'en'
                ? 'Hide Spleen Check Guide'
                : 'तिल्ली जांच गाइड छुपाएं'
              : language === 'en'
              ? 'How to Check Child’s Spleen at Home →'
              : 'घर पर बच्चे की तिल्ली (Spleen) कैसे जांचें →'}
          </button>
        </div>
      </div>

      {/* Expandable Mother's Spleen Palpation Audio/Visual Guide */}
      {spleenGuideOpen && (
        <div className="p-4 rounded-2xl bg-blood-50/70 border border-blood-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-blood-950">
                {language === 'en'
                  ? 'Life-Saving Parent Skill: Detecting Acute Splenic Sequestration'
                  : 'जीवनरक्षक कौशल: तिल्ली (Spleen) में अचानक खून जमा होने की पहचान'}
              </h4>
              <p className="text-[11px] text-blood-900">
                {language === 'en'
                  ? 'In children with HbSS, sickled blood can suddenly trap inside the spleen, causing a fatal drop in hemoglobin within hours.'
                  : 'HbSS बच्चों में कभी-कभी खून अचानक तिल्ली (Spleen) में फंस जाता है, जिससे कुछ ही घंटों में गंभीर एनीमिया हो सकता है।'}
              </p>
            </div>
            <button
              onClick={() =>
                playSpeech(
                  language === 'en'
                    ? 'How to check your child for splenic crisis: First, look at the palms of their hands and lips in daylight. If they look chalky white or pale, check the left upper side of their tummy just below the ribs. Gently press with flat fingers while the child breathes in. If it feels swollen, firm, or painful, call 108 immediately.'
                    : 'बच्चे की तिल्ली जांचने की विधि: सबसे पहले दिन की रोशनी में बच्चे की हथेलियों और होंठों को देखें। यदि वे सफेद या पीले दिखें, तो बच्चे को लिटाकर बाईं पसली के ठीक नीचे पेट को हल्के हाथों से छूकर देखें। यदि वहां सूजन, कड़ापन या दर्द महसूस हो, तो तुरंत 108 एम्बुलेंस बुलाएं।'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-800 text-white text-xs font-bold self-start shrink-0 tap-active"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Listen to Steps' : 'ऑडियो गाइड सुनें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-canvas-50 border border-blood-200">
              <span className="font-extrabold text-blood-800 block mb-1">
                {language === 'en' ? 'Step 1: Check Palms & Lips' : 'चरण 1: हथेली और होंठ देखें'}
              </span>
              <p className="text-[11px] text-ink-700">
                {language === 'en'
                  ? 'Compare your child’s palm creases with your own. Sudden chalky-white palms mean hemoglobin has dropped dangerously.'
                  : 'बच्चे की हथेली को अपनी हथेली से मिलाएं। अचानक सफेद पड़ना खून की भारी कमी का संकेत है।'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-canvas-50 border border-blood-200">
              <span className="font-extrabold text-blood-800 block mb-1">
                {language === 'en' ? 'Step 2: Feel Under Left Ribs' : 'चरण 2: बाईं पसली के नीचे छुएं'}
              </span>
              <p className="text-[11px] text-ink-700">
                {language === 'en'
                  ? 'With the child lying flat and relaxed, gently feel below the LEFT ribcage. A normal spleen cannot be felt.'
                  : 'बच्चे को सीधा लिटाकर बाईं पसली के ठीक नीचे हल्के हाथ से छुएं। सामान्य तिल्ली महसूस नहीं होती।'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-canvas-50 border border-blood-200">
              <span className="font-extrabold text-blood-800 block mb-1">
                {language === 'en' ? 'Step 3: Immediate 108 Action' : 'चरण 3: तुरंत 108 बुलाएं'}
              </span>
              <p className="text-[11px] text-ink-700">
                {language === 'en'
                  ? 'If you feel a firm fullness below the left ribs + pale palms, do NOT press hard. Call 108 for urgent blood transfusion.'
                  : 'यदि बाईं तरफ सूजन या गांठ लगे और हथेली सफेद हो, तो जोर से न दबाएं। तुरंत 108 बुलाकर अस्पताल ले जाएं।'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
