'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { STATUS_EXPLANATIONS } from '@/lib/constants';
import { CardStatus } from '@/lib/types';
import {
  HeartPulse,
  Users,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Pill,
  PhoneCall,
  HeartHandshake,
  UserCheck,
  Baby,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingFlow: React.FC = () => {
  const {
    language,
    userRole,
    setUserRole,
    selectedStatus,
    setSelectedStatus,
    onboardingStep,
    setOnboardingStep,
    setIsOnboarded,
    careRecipient,
    setCareRecipient,
    setQrModalOpen,
    isAudioPlaying,
    playSpeech,
    stopSpeech,
    homeVisits,
    allPatients
  } = useApp();

  const statusContent = STATUS_EXPLANATIONS[selectedStatus][language];

  const handleSelectRole = (role: 'patient' | 'asha') => {
    setUserRole(role);
    setOnboardingStep(2);
  };

  const handleChooseCardAndContinue = (status: CardStatus) => {
    setSelectedStatus(status);
    if (status !== 'HbSS') {
      setCareRecipient('self');
    }
    setOnboardingStep(3);
  };

  const handleFinishOnboarding = () => {
    stopSpeech();
    setIsOnboarded(true);
  };

  const statusCards: {
    id: CardStatus;
    titleEn: string;
    titleHi: string;
    subEn: string;
    subHi: string;
    bandClass: string;
    cardClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'HbSS',
      titleEn: 'Sickle Cell Disease (HbSS)',
      titleHi: 'सिकल सेल रोग — बीमारी (HbSS)',
      subEn: 'Red/Pink Status Card • Needs daily care, hydration & follow-up',
      subHi: 'लाल/गुलाबी कार्ड • नियमित देखभाल, पानी और डॉक्टरी जांच आवश्यक',
      bandClass: 'bg-blood-700',
      cardClass: 'border-blood-300 bg-blood-50/60 hover:bg-blood-100/50',
      badgeClass: 'bg-blood-800 text-white'
    },
    {
      id: 'HbAS',
      titleEn: 'Sickle Cell Trait / Carrier (HbAS)',
      titleHi: 'सिकल सेल वाहक / कैरियर (HbAS)',
      subEn: 'Yellow Status Card • Healthy carrier, no medicine needed',
      subHi: 'पीला कार्ड • आप स्वस्थ वाहक हैं, किसी दवा की जरूरत नहीं',
      bandClass: 'bg-ochre-500',
      cardClass: 'border-ochre-300 bg-ochre-50/60 hover:bg-ochre-100/50',
      badgeClass: 'bg-ochre-700 text-white'
    },
    {
      id: 'HbAA',
      titleEn: 'Normal Hemoglobin (HbAA)',
      titleHi: 'सामान्य हीमोग्लोबिन (HbAA)',
      subEn: 'Green/White Status Card • Normal blood cells, non-carrier',
      subHi: 'हरा/सफेद कार्ड • सामान्य रक्त कोशिकाएं, कोई जोखिम नहीं',
      bandClass: 'bg-forest-600',
      cardClass: 'border-forest-300 bg-forest-50/60 hover:bg-forest-100/50',
      badgeClass: 'bg-forest-700 text-white'
    }
  ];

  const totalSteps = userRole === 'asha' ? 2 : 3;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      {/* Step Progress Indicator */}
      <div className="mb-6 flex items-center justify-between bg-canvas-100 border border-canvas-200 rounded-2xl px-4 py-3 shadow-gentle">
        <div className="flex items-center gap-2 sm:gap-3">
          {[1, 2, ...(userRole === 'patient' ? [3] : [])].map((s) => {
            const active = onboardingStep === s;
            const completed = onboardingStep > s;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => s < onboardingStep && setOnboardingStep(s)}
                  disabled={s >= onboardingStep}
                  className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center transition-all ${
                    active
                      ? 'bg-blood-800 text-white ring-4 ring-blood-800/15'
                      : completed
                      ? 'bg-forest-700 text-white cursor-pointer'
                      : 'bg-canvas-200 text-ink-500'
                  }`}
                >
                  {completed ? '✓' : s}
                </button>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    active ? 'text-ink-950' : 'text-ink-500'
                  }`}
                >
                  {s === 1
                    ? language === 'en'
                      ? 'Select Role'
                      : 'भूमिका चुनें'
                    : s === 2
                    ? userRole === 'patient'
                      ? language === 'en'
                        ? 'Enter Status Card'
                        : 'कार्ड चुनें'
                      : language === 'en'
                      ? 'Verify Sector'
                      : 'क्षेत्र चुनें'
                    : language === 'en'
                    ? 'Understand & Enter'
                    : 'समझें और प्रवेश करें'}
                </span>
                {s < totalSteps && <span className="text-canvas-300 font-bold">→</span>}
              </div>
            );
          })}
        </div>

        <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">
          {language === 'en'
            ? `Step ${onboardingStep} of ${totalSteps}`
            : `चरण ${onboardingStep} / ${totalSteps}`}
        </span>
      </div>

      {/* Animated Onboarding Steps */}
      <AnimatePresence mode="wait">
        {/* STEP 1: WELCOME & ROLE SELECTION */}
        {onboardingStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="bg-canvas-50 border border-canvas-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-blood-700" />
                <span>
                  {language === 'en'
                    ? 'National Sickle Cell Mission • Madhya Pradesh Pilot'
                    : 'राष्ट्रीय सिकल सेल मिशन • मध्य प्रदेश पायलट'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight leading-tight">
                {language === 'en'
                  ? 'A status card is not care. Let’s set up your post-screening loop.'
                  : 'केवल जांच कार्ड इलाज नहीं है। आइए आपकी देखभाल प्रणाली शुरू करें।'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-2xl">
                {language === 'en'
                  ? 'Over 6 crore people in India have been screened, but families often leave the screening camp unsure what their card means or how to stay in care. Tell us who is using the app today so we can tailor your experience before entering the dashboard.'
                  : 'भारत में 6 करोड़ से अधिक लोगों की जांच हो चुकी है, लेकिन कई परिवार यह नहीं समझ पाते कि उनके कार्ड का क्या अर्थ है। डैशबोर्ड में जाने से पहले अपनी भूमिका चुनें ताकि हम सही जानकारी दिखा सकें।'}
              </p>
            </div>

            {/* Two Primary Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Role A: Patient / Family / Carrier */}
              <button
                onClick={() => handleSelectRole('patient')}
                className="group p-6 rounded-3xl border-2 border-canvas-200 hover:border-blood-700 bg-canvas-100/70 hover:bg-blood-50/40 text-left transition-all tap-active flex flex-col justify-between shadow-gentle hover:shadow-card"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blood-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blood-800">
                      {language === 'en' ? 'For Families, Patients & Youth' : 'मरीज, माता-पिता और युवाओं के लिए'}
                    </span>
                    <h3 className="text-lg font-extrabold text-ink-950 mt-0.5">
                      {language === 'en'
                        ? 'I Have a Sickle Cell Status Card'
                        : 'मेरे पास सिकल सेल जांच कार्ड है'}
                    </h3>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                      {language === 'en'
                        ? 'Understand your HbAA, HbAS, or HbSS card in plain language (with voice), log daily Hydroxyurea if prescribed, or check warning signs.'
                        : 'अपने HbAA, HbAS या HbSS कार्ड का अर्थ सरल भाषा और आवाज में समझें, दैनिक दवा दर्ज करें और आपातकालीन लक्षणों की जांच करें।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-canvas-200 flex items-center justify-between text-xs font-extrabold text-blood-800">
                  <span>
                    {language === 'en' ? 'Start Family Onboarding' : 'परिवार ऑनबोर्डिंग शुरू करें'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Role B: ASHA Health Worker */}
              <button
                onClick={() => handleSelectRole('asha')}
                className="group p-6 rounded-3xl border-2 border-canvas-200 hover:border-forest-700 bg-canvas-100/70 hover:bg-forest-50/40 text-left transition-all tap-active flex flex-col justify-between shadow-gentle hover:shadow-card"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest-800">
                      {language === 'en' ? 'For Frontline Workers (ASHA / ANM)' : 'आशा दीदी और स्वास्थ्य कार्यकर्ताओं के लिए'}
                    </span>
                    <h3 className="text-lg font-extrabold text-ink-950 mt-0.5">
                      {language === 'en'
                        ? 'I Am a Community Health Worker'
                        : 'मैं आशा / स्वास्थ्य कार्यकर्ता हूँ'}
                    </h3>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                      {language === 'en'
                        ? 'View your village cohort in Shahdol, see who is slipping out of care via transparent risk scores, and log home visits.'
                        : 'शहडोल के गांवों की मरीज सूची देखें, ड्रॉपआउट जोखिम वाले मरीजों की पहचान करें और गृह भेंट दर्ज करें।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-canvas-200 flex items-center justify-between text-xs font-extrabold text-forest-800">
                  <span>
                    {language === 'en' ? 'Select ASHA Sector' : 'आशा क्षेत्र चुनें'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2A: PATIENT CARD IDENTIFICATION */}
        {onboardingStep === 2 && userRole === 'patient' && (
          <motion.div
            key="step-2-patient"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="bg-canvas-50 border border-canvas-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-200">
              <div>
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Back to role selection' : 'वापस जाएं'}</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                  {language === 'en'
                    ? 'What status is printed on your card?'
                    : 'आपके जांच कार्ड पर कौन-सा परिणाम लिखा है?'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
                  {language === 'en'
                    ? 'Tap your card color/code below, or scan a sample Mission QR card.'
                    : 'नीचे अपने कार्ड का रंग/कोड चुनें या डेमो QR कार्ड स्कैन करें।'}
                </p>
              </div>

              <button
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-950 text-white text-xs font-bold shadow-sm tap-active shrink-0 self-start sm:self-auto"
              >
                <QrCode className="w-4 h-4 text-ochre-400" />
                <span>{language === 'en' ? 'Scan Card QR Instead' : 'कार्ड QR स्कैन करें'}</span>
              </button>
            </div>

            {/* Who is this card for? (Parent/Child vs Self) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                {language === 'en' ? '1. Who is this card for?' : '1. यह कार्ड किसके लिए है?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCareRecipient('child')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all tap-active ${
                    careRecipient === 'child'
                      ? 'bg-canvas-100 border-ink-900 ring-2 ring-ink-900/10'
                      : 'bg-canvas-100/50 border-canvas-200 hover:border-canvas-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-ochre-100 text-ochre-800 flex items-center justify-center shrink-0">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-950 block">
                      {language === 'en'
                        ? 'For My Child (Parent / Guardian)'
                        : 'मेरे बच्चे के लिए (माता-पिता / अभिभावक)'}
                    </span>
                    <span className="text-[11px] text-ink-500">
                      {language === 'en'
                        ? 'Demo profile: Ramesh Kol (Age 11, Guardian: Sunita Kol)'
                        : 'डेमो प्रोफाइल: रमेश कोल (11 वर्ष, अभिभावक: सुनीता कोल)'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCareRecipient('self')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all tap-active ${
                    careRecipient === 'self'
                      ? 'bg-canvas-100 border-ink-900 ring-2 ring-ink-900/10'
                      : 'bg-canvas-100/50 border-canvas-200 hover:border-canvas-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-950 block">
                      {language === 'en'
                        ? 'For Myself (Adult / Young Person)'
                        : 'मेरे स्वयं के लिए (वयस्क / युवा)'}
                    </span>
                    <span className="text-[11px] text-ink-500">
                      {language === 'en'
                        ? 'Includes pre-marital & genetic inheritance clarity'
                        : 'विवाह-पूर्व एवं आनुवंशिक परामर्श जानकारी सहित'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3 Tactile Status Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                {language === 'en'
                  ? '2. Tap Your Card Result to See What It Means:'
                  : '2. कार्ड का अर्थ समझने के लिए परिणाम चुनें:'}
              </label>
              <div className="grid grid-cols-1 gap-3.5">
                {statusCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleChooseCardAndContinue(card.id)}
                    className={`group rounded-2xl border-2 overflow-hidden text-left transition-all tap-active shadow-sm hover:shadow-md ${card.cardClass}`}
                  >
                    <div className={`h-2 w-full ${card.bandClass}`} />
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${card.badgeClass}`}>
                            {card.id}
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-ink-950">
                            {language === 'en' ? card.titleEn : card.titleHi}
                          </span>
                        </div>
                        <p className="text-xs text-ink-700 font-medium">
                          {language === 'en' ? card.subEn : card.subHi}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-900 bg-canvas-50/90 px-3.5 py-2 rounded-xl border border-canvas-300 group-hover:translate-x-1 transition-transform self-start sm:self-center shrink-0">
                        <span>{language === 'en' ? 'Explain This Card' : 'इस कार्ड को समझें'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PRE-DASHBOARD CLARITY BRIEFING (Understand before entering dashboard!) */}
        {onboardingStep === 3 && userRole === 'patient' && (
          <motion.div
            key="step-3-briefing"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="bg-canvas-50 border border-canvas-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-200">
              <div>
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Change card status' : 'कार्ड बदलें'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black text-white ${
                      selectedStatus === 'HbSS'
                        ? 'bg-blood-700'
                        : selectedStatus === 'HbAS'
                        ? 'bg-ochre-600'
                        : 'bg-forest-700'
                    }`}
                  >
                    {selectedStatus}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                    {statusContent.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-ink-600 mt-1">{statusContent.tagline}</p>
              </div>

              {/* Voice Readout Button */}
              <button
                onClick={() =>
                  isAudioPlaying ? stopSpeech() : playSpeech(statusContent.audioScript)
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all tap-active self-start sm:self-auto ${
                  isAudioPlaying
                    ? 'bg-blood-700 text-white animate-pulse'
                    : 'bg-canvas-200 hover:bg-canvas-300 text-ink-900 border border-canvas-300'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>{language === 'en' ? 'Stop Voice' : 'आवाज रोकें'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-blood-800" />
                    <span>
                      {language === 'en' ? 'Listen to Summary' : 'आवाज में समझाइश सुनें'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Plain-Language Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                  {language === 'en' ? 'What This Means for Health' : 'स्वास्थ्य के लिए इसका अर्थ'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.healthMeaning}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                  {language === 'en' ? 'Marriage & Future Children' : 'विवाह और बच्चों के लिए नियम'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.marriageGuidance}
                </p>
              </div>
            </div>

            {/* What Your Personalized Dashboard Contains (Explaining the Status Branching) */}
            <div className="p-5 rounded-2xl bg-canvas-100/70 border border-canvas-300 space-y-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-ink-950 uppercase tracking-wide">
                {language === 'en'
                  ? `How We Prepared Your ${selectedStatus} Care Loop Dashboard:`
                  : `आपके ${selectedStatus} कार्ड के अनुसार डैशबोर्ड में क्या शामिल है:`}
              </h3>

              {selectedStatus === 'HbSS' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <Pill className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en' ? 'Daily Hydroxyurea Log' : 'दैनिक हाइड्रोक्सीयूरिया ट्रैकर'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? 'Separates Taken, Missed, and Unlogged days.'
                          : 'ली गई, छूटी और बिना दर्ज दवा का अलग हिसाब।'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <PhoneCall className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en' ? 'Direct 108 Crisis Triage' : 'तत्काल 108 संकट जांच'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? 'Rule-based check for stroke, fever & chest pain.'
                          : 'स्ट्रोक, बुखार और सीने के दर्द की नियम-आधारित जांच।'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en' ? 'ASHA Follow-Up Link' : 'आशा दीदी संपर्क'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? 'Connected to Kavita Devi (Burhar CHC).'
                          : 'कविता देवी (बुढ़ार स्वास्थ्य केंद्र) से जुड़ा हुआ।'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedStatus === 'HbAS' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-ochre-50 border border-ochre-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-ochre-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ochre-950 block">
                        {language === 'en'
                          ? 'No Medicine Tracker Needed'
                          : 'दवा ट्रैकर की आवश्यकता नहीं'}
                      </span>
                      <span className="text-[11px] text-ochre-900">
                        {language === 'en'
                          ? 'Carriers do not take Hydroxyurea. We removed medication logs for you.'
                          : 'वाहकों को हाइड्रोक्सीयूरिया नहीं दी जाती, इसलिए दवा ट्रैकर हटा दिया गया है।'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en'
                          ? '1-in-4 Genetic Inheritance Guide'
                          : '4 में से 1 आनुवंशिक संभावना गाइड'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? 'Clear pre-marital partner screening & counseling guide.'
                          : 'विवाह-पूर्व साथी की जांच और परामर्श की स्पष्ट जानकारी।'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedStatus === 'HbAA' && (
                <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 flex items-start gap-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-forest-950 block">
                      {language === 'en'
                        ? 'Reassurance & Family Health Education Only'
                        : 'आश्वस्ति एवं पारिवारिक स्वास्थ्य शिक्षा'}
                    </span>
                    <span className="text-[11px] text-forest-800">
                      {language === 'en'
                        ? 'No daily medicine or crisis triage needed. Access voice-enabled Q&A anytime.'
                        : 'किसी दवा या आपातकालीन ट्रैकिंग की आवश्यकता नहीं।'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enter Dashboard Button */}
            <button
              onClick={handleFinishOnboarding}
              className="w-full py-4 rounded-2xl bg-blood-800 hover:bg-blood-900 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card transition-all tap-active"
            >
              <span>
                {language === 'en'
                  ? `Enter My ${selectedStatus} Care Loop Dashboard`
                  : `मेरे ${selectedStatus} देखभाल डैशबोर्ड में प्रवेश करें`}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STEP 2B: ASHA WORKER SECTOR BRIEFING */}
        {onboardingStep === 2 && userRole === 'asha' && (
          <motion.div
            key="step-2-asha"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="bg-canvas-50 border border-canvas-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
          >
            <div>
              <button
                onClick={() => setOnboardingStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Back to role selection' : 'वापस जाएं'}</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                {language === 'en'
                  ? 'Frontline Health Worker Briefing — Shahdol District'
                  : 'आशा कार्यकर्ता क्षेत्रीय विवरण — जिला शहडोल'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                {language === 'en'
                  ? 'Review today’s cohort alerts before opening the field roster.'
                  : 'मरीजों की सूची खोलने से पहले आज की प्राथमिकताओं की समीक्षा करें।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-blood-50 border border-blood-200">
                <span className="text-2xl font-black text-blood-800">
                  {homeVisits.filter((v) => v.status === 'PENDING').length}
                </span>
                <p className="text-xs font-bold text-blood-950 mt-1">
                  {language === 'en' ? 'High-Priority Home Visits' : 'अति-आवश्यक गृह भेंट'}
                </p>
                <p className="text-[11px] text-blood-800 mt-0.5">
                  {language === 'en'
                    ? 'Patients overdue for CHC checkup or missing doses'
                    : 'अस्पताल जांच में देरी या छूटी हुई खुराक वाले मरीज'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200">
                <span className="text-2xl font-black text-ink-950">{allPatients.length}</span>
                <p className="text-xs font-bold text-ink-900 mt-1">
                  {language === 'en' ? 'Total Village Cohort' : 'कुल पंजीकृत ग्रामीण मरीज'}
                </p>
                <p className="text-[11px] text-ink-600 mt-0.5">
                  {language === 'en'
                    ? 'Burhar, Jaisinghnagar & Sohagpur blocks'
                    : 'बुढ़ार, जयसिंहनगर और सोहागपुर विकासखंड'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200">
                <span className="text-2xl font-black text-forest-800">100%</span>
                <p className="text-xs font-bold text-forest-950 mt-1">
                  {language === 'en' ? 'Explainable Risk Scores' : 'पारदर्शी जोखिम स्कोर'}
                </p>
                <p className="text-[11px] text-forest-800 mt-0.5">
                  {language === 'en'
                    ? 'Every flag shows exact missed doses & overdue days'
                    : 'प्रत्येक अलर्ट का स्पष्ट कारण दिखाया जाता है'}
                </p>
              </div>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card transition-all tap-active"
            >
              <span>
                {language === 'en'
                  ? 'Open ASHA Cohort & Visit Dashboard'
                  : 'आशा डैशबोर्ड और कार्य सूची खोलें'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
