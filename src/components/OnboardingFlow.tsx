'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { STATUS_EXPLANATIONS } from '@/lib/constants';
import { CardStatus } from '@/lib/types';
import {
  HeartPulse,
  Users,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Pill,
  PhoneCall,
  HeartHandshake,
  UserCheck,
  Baby,
  MapPin,
  Stethoscope,
  HelpCircle,
  CheckCircle2,
  Sparkles
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

  const [autoNarrate, setAutoNarrate] = useState<boolean>(false);
  const [showCardHelp, setShowCardHelp] = useState<boolean>(false);

  const statusContent = STATUS_EXPLANATIONS[selectedStatus][language];

  // Contextual professional guide scripts for each step
  const getGuidePersona = () => {
    if (onboardingStep === 1) {
      return {
        name: language === 'en' ? 'Kavita Devi' : 'कविता देवी',
        role:
          language === 'en'
            ? 'Senior ASHA Community Guide • Shahdol Block, MP'
            : 'वरिष्ठ आशा स्वास्थ्य मार्गदर्शक • शहडोल, म.प्र.',
        badgeColor: 'bg-blood-800 text-white',
        message:
          language === 'en'
            ? '“Namaste. Receiving a Sickle Cell Status Card at a camp is only the first step. I am here to walk you through what your card means and set up your care loop. First, tell me whether you are joining as a family member or as a fellow health worker.”'
            : '“नमस्ते। शिविर में सिकल सेल कार्ड मिलना केवल पहला कदम है। मैं आपको सरल भाषा में आपके कार्ड का अर्थ समझाने और आपकी देखभाल शुरू करने में मदद करूंगी। सबसे पहले चुनें कि आप परिवार के सदस्य हैं या स्वास्थ्य कार्यकर्ता।”',
        voiceScript:
          language === 'en'
            ? 'Namaste. Receiving a Sickle Cell Status Card is only the first step. I am Kavita, your community health guide. Please select whether you have a status card for your family, or if you are a community health worker.'
            : 'नमस्ते। सिकल सेल कार्ड मिलना केवल पहला कदम है। मैं कविता हूँ, आपकी आशा मार्गदर्शक। कृपया चुनें कि आपके पास परिवार का जांच कार्ड है या आप स्वास्थ्य कार्यकर्ता हैं।'
      };
    }

    if (onboardingStep === 2 && userRole === 'patient') {
      return {
        name: language === 'en' ? 'Dr. Rajesh Verma, MBBS' : 'डॉ. राजेश वर्मा, एमबीबीएस',
        role:
          language === 'en'
            ? 'Medical Officer & Genetic Counselor • CHC Burhar, Shahdol'
            : 'चिकित्सा अधिकारी एवं जेनेटिक काउंसलर • सी.एच.सी. बुढ़ार',
        badgeColor: 'bg-ink-900 text-white',
        message:
          language === 'en'
            ? '“Look at the color band or the 4-letter code printed on your government card: Red (HbSS), Yellow (HbAS), or Green (HbAA). You don’t need to know medical terms—just tap the matching card below or scan the QR code, and I will explain everything before we open your dashboard.”'
            : '“अपने सरकारी कार्ड पर छपे रंग या 4 अक्षरों के कोड को देखें: लाल (HbSS), पीला (HbAS), या हरा (HbAA)। आपको डॉक्टरी शब्द जानने की जरूरत नहीं है—बस नीचे मिलते-जुलते कार्ड को चुनें या QR स्कैन करें, डैशबोर्ड खुलने से पहले मैं आपको सब कुछ स्पष्ट रूप से समझाऊंगा।”',
        voiceScript:
          language === 'en'
            ? 'Look at the color band or code on your card: Red HbSS, Yellow HbAS, or Green HbAA. Tap your card below or scan the QR code, and I will explain what it means before we open your dashboard.'
            : 'अपने कार्ड पर छपे रंग या कोड को देखें: लाल HbSS, पीला HbAS, या हरा HbAA। नीचे अपना कार्ड चुनें या क्यूआर स्कैन करें।'
      };
    }

    if (onboardingStep === 2 && userRole === 'asha') {
      return {
        name: language === 'en' ? 'District Mission Coordinator' : 'जिला मिशन समन्वयक',
        role:
          language === 'en'
            ? 'National Sickle Cell Mission • Shahdol District Unit'
            : 'राष्ट्रीय सिकल सेल मिशन • शहडोल जिला इकाई',
        badgeColor: 'bg-forest-800 text-white',
        message:
          language === 'en'
            ? '“Welcome back, Kavita Didi. Today your Burhar & Jaisinghnagar sector has 2 high-priority home visits flagged due to overdue CHC checkups and missed Hydroxyurea logs. Review your briefing below to open your field roster.”'
            : '“स्वागत है कविता दीदी। आज आपके बुढ़ार और जयसिंहनगर क्षेत्र में 2 अति-आवश्यक गृह भेंट चिन्हित हैं। अपनी कार्य सूची खोलने के लिए नीचे विवरण देखें।”',
        voiceScript:
          language === 'en'
            ? 'Welcome back Kavita Didi. Your sector has 2 high-priority home visits flagged today. Review your briefing below and open the field dashboard.'
            : 'स्वागत है कविता दीदी। आज आपके क्षेत्र में 2 आवश्यक गृह भेंट हैं। नीचे विवरण देखकर डैशबोर्ड खोलें।'
      };
    }

    return {
      name: language === 'en' ? 'Dr. Rajesh Verma & Kavita Devi' : 'डॉ. राजेश वर्मा एवं कविता देवी',
      role:
        language === 'en'
          ? 'Your Personalized Post-Screening Care Team'
          : 'आपकी व्यक्तिगत देखभाल एवं परामर्श टीम',
      badgeColor:
        selectedStatus === 'HbSS'
          ? 'bg-blood-800 text-white'
          : selectedStatus === 'HbAS'
          ? 'bg-ochre-700 text-white'
          : 'bg-forest-800 text-white',
      message:
        selectedStatus === 'HbSS'
          ? language === 'en'
            ? '“We have reviewed your HbSS card. With daily prescribed Hydroxyurea, plenty of water, and early warning checks, your family can prevent over 80% of pain crises. Read or listen to your summary below, then enter your Care Loop Dashboard.”'
            : '“हमने आपके HbSS कार्ड की समीक्षा की है। डॉक्टर द्वारा दी गई नियमित हाइड्रोक्सीयूरिया, भरपूर पानी और समय पर पहचान से 80% से अधिक दर्द के दौरों को रोका जा सकता है। नीचे सारांश सुनें और अपने डैशबोर्ड में प्रवेश करें।”'
          : selectedStatus === 'HbAS'
          ? language === 'en'
            ? '“Reassurance first: HbAS means you are a healthy carrier—you do NOT have Sickle Cell Disease and you never need Hydroxyurea medicine. We have customized your dashboard purely for genetic & pre-marital clarity.”'
            : '“सबसे पहले निश्चिंत रहें: HbAS का अर्थ है कि आप एक स्वस्थ वाहक (कैरियर) हैं—आपको बीमारी नहीं है और आपको किसी दवा की आवश्यकता नहीं है। हमने आपका डैशबोर्ड केवल आनुवंशिक और विवाह-पूर्व परामर्श के लिए तैयार किया है।”'
          : language === 'en'
          ? '“Good news: Your HbAA card confirms completely normal hemoglobin. Neither you nor your biological children are at risk of Sickle Cell Disease. Review your summary below.”'
          : '“अच्छी खबर: आपका HbAA कार्ड पूरी तरह सामान्य हीमोग्लोबिन की पुष्टि करता है। आपको किसी विशेष उपचार की आवश्यकता नहीं है।”',
      voiceScript: statusContent.audioScript
    };
  };

  const guide = getGuidePersona();

  // Trigger auto-narration when step changes if user enabled Auto-Guide Voice
  useEffect(() => {
    if (autoNarrate) {
      playSpeech(guide.voiceScript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingStep, selectedStatus, userRole, language, autoNarrate]);

  const handleSelectRole = (role: 'patient' | 'asha') => {
    stopSpeech();
    setUserRole(role);
    setOnboardingStep(2);
  };

  const handleChooseCardAndContinue = (status: CardStatus) => {
    stopSpeech();
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
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-4 space-y-5">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between bg-canvas-100 border border-canvas-200 rounded-2xl px-4 py-3 shadow-gentle">
        <div className="flex items-center gap-2 sm:gap-3">
          {[1, 2, ...(userRole === 'patient' ? [3] : [])].map((s) => {
            const active = onboardingStep === s;
            const completed = onboardingStep > s;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (s < onboardingStep) {
                      stopSpeech();
                      setOnboardingStep(s);
                    }
                  }}
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
                      ? '1. Select Role'
                      : '1. भूमिका चुनें'
                    : s === 2
                    ? userRole === 'patient'
                      ? language === 'en'
                        ? '2. Identify Card'
                        : '2. कार्ड पहचानें'
                      : language === 'en'
                      ? '2. Sector Briefing'
                      : '2. क्षेत्र विवरण'
                    : language === 'en'
                    ? '3. Care Briefing'
                    : '3. देखभाल सारांश'}
                </span>
                {s < totalSteps && <span className="text-canvas-300 font-bold">→</span>}
              </div>
            );
          })}
        </div>

        <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">
          {language === 'en'
            ? `Guided Step ${onboardingStep} of ${totalSteps}`
            : `चरण ${onboardingStep} / ${totalSteps}`}
        </span>
      </div>

      {/* PROFESSIONAL CLINICAL COMPANION GUIDE BANNER */}
      <motion.div
        key={`guide-${onboardingStep}-${userRole}-${selectedStatus}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl bg-canvas-100 border-2 border-canvas-300/90 p-4 sm:p-5 shadow-gentle relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Guide Avatar Badge */}
            <div
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm ${guide.badgeColor}`}
            >
              <Stethoscope className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">GUIDE</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-ink-950">
                  {guide.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-canvas-200 text-ink-700 text-[10px] font-bold border border-canvas-300">
                  {guide.role}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-ink-800 leading-relaxed font-medium italic">
                {guide.message}
              </p>
            </div>
          </div>

          {/* Voice Guide Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() =>
                isAudioPlaying ? stopSpeech() : playSpeech(guide.voiceScript)
              }
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all tap-active shadow-sm ${
                isAudioPlaying
                  ? 'bg-blood-700 text-white animate-pulse'
                  : 'bg-canvas-50 hover:bg-canvas-200 text-ink-900 border border-canvas-300'
              }`}
            >
              {isAudioPlaying ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Stop Guide' : 'रोकें'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blood-700" />
                  <span>{language === 'en' ? 'Hear Guide' : 'गाइड सुनें'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextVal = !autoNarrate;
                setAutoNarrate(nextVal);
                if (nextVal) {
                  playSpeech(guide.voiceScript);
                } else {
                  stopSpeech();
                }
              }}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all tap-active ${
                autoNarrate
                  ? 'bg-forest-700 text-white border-forest-800'
                  : 'bg-canvas-200/70 text-ink-600 border-canvas-300 hover:text-ink-900'
              }`}
              title="Automatically read each step aloud"
            >
              {language === 'en'
                ? `Auto-Voice: ${autoNarrate ? 'ON' : 'OFF'}`
                : `ऑटो-आवाज: ${autoNarrate ? 'चालू' : 'बंद'}`}
            </button>
          </div>
        </div>
      </motion.div>

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
                  ? 'Over 6 crore people in India have been screened, but families often leave the screening camp unsure what their card means or how to stay in care. Choose your role below so Kavita Didi and Dr. Verma can tailor your care loop.'
                  : 'भारत में 6 करोड़ से अधिक लोगों की जांच हो चुकी है, लेकिन कई परिवार यह नहीं समझ पाते कि उनके कार्ड का क्या अर्थ है। नीचे अपनी भूमिका चुनें ताकि हम आपके लिए सही डैशबोर्ड तैयार कर सकें।'}
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
                        ? 'Guided by Dr. Verma: Understand your HbAA, HbAS, or HbSS card in plain language, log daily Hydroxyurea if prescribed, or check warning signs.'
                        : 'डॉ. वर्मा के मार्गदर्शन में अपने HbAA, HbAS या HbSS कार्ड का अर्थ समझें, दैनिक दवा दर्ज करें और लक्षणों की जांच करें।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-canvas-200 flex items-center justify-between text-xs font-extrabold text-blood-800">
                  <span>
                    {language === 'en' ? 'Begin Guided Family Setup' : 'परिवार सेटअप शुरू करें'}
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
                    {language === 'en' ? 'Open ASHA Sector Briefing' : 'आशा क्षेत्र विवरण खोलें'}
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

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowCardHelp(!showCardHelp)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-canvas-100 hover:bg-canvas-200 border border-canvas-300 text-ink-800 text-xs font-bold transition-all tap-active"
                >
                  <HelpCircle className="w-4 h-4 text-ochre-700" />
                  <span>
                    {language === 'en' ? 'Where to look on my card?' : 'कार्ड पर कहाँ देखें?'}
                  </span>
                </button>

                <button
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-950 text-white text-xs font-bold shadow-sm tap-active shrink-0"
                >
                  <QrCode className="w-4 h-4 text-ochre-400" />
                  <span>{language === 'en' ? 'Scan Card QR' : 'कार्ड QR स्कैन करें'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Visual Guide: How to read a physical Indian Sickle Cell Status Card */}
            {showCardHelp && (
              <div className="p-4 rounded-2xl bg-ochre-50/80 border border-ochre-200 text-xs text-ochre-950 space-y-2 animate-in fade-in">
                <div className="font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ochre-700" />
                  <span>
                    {language === 'en'
                      ? 'Dr. Verma’s Tip: How to Read Your National Mission Card'
                      : 'डॉ. वर्मा की सलाह: अपना सरकारी सिकल सेल कार्ड कैसे पढ़ें'}
                  </span>
                </div>
                <p className="text-ochre-900 leading-relaxed">
                  {language === 'en'
                    ? 'On the front of your National Sickle Cell Mission card or GIPCI counseling card, look at the colored bar or the box labeled "HPLC / Solubility Result":'
                    : 'अपने राष्ट्रीय सिकल सेल मिशन कार्ड के सामने वाले हिस्से पर रंगीन पट्टी या "Result" बॉक्स देखें:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-canvas-50 border border-blood-200">
                    <span className="font-black text-blood-800">HbSS (Red / Pink)</span>
                    <p className="text-[11px] text-ink-600 mt-0.5">
                      {language === 'en'
                        ? 'Both genes affected — Sickle Cell Disease'
                        : 'दोनों जीन प्रभावित — सिकल सेल रोग'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-canvas-50 border border-ochre-200">
                    <span className="font-black text-ochre-800">HbAS (Yellow)</span>
                    <p className="text-[11px] text-ink-600 mt-0.5">
                      {language === 'en'
                        ? 'One gene affected — Healthy Carrier (Trait)'
                        : 'एक जीन प्रभावित — स्वस्थ वाहक (कैरियर)'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-canvas-50 border border-forest-200">
                    <span className="font-black text-forest-800">HbAA (Green / White)</span>
                    <p className="text-[11px] text-ink-600 mt-0.5">
                      {language === 'en'
                        ? 'No sickle gene — Normal Hemoglobin'
                        : 'कोई सिकल जीन नहीं — सामान्य हीमोग्लोबिन'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                  ? '2. Tap Your Card Result for Dr. Verma’s Explanation:'
                  : '2. डॉ. वर्मा की समझाइश के लिए अपना कार्ड चुनें:'}
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
                        <span>{language === 'en' ? 'Review With Guide' : 'गाइड के साथ समझें'}</span>
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
                  {language === 'en' ? '1. What This Means for Health' : '1. स्वास्थ्य के लिए इसका अर्थ'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.healthMeaning}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                  {language === 'en' ? '2. Marriage & Future Children' : '2. विवाह और बच्चों के लिए नियम'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.marriageGuidance}
                </p>
              </div>
            </div>

            {/* What Your Personalized Dashboard Contains (Explaining the Status Branching) */}
            <div className="p-5 rounded-2xl bg-canvas-100/70 border border-canvas-300 space-y-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-ink-950 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>
                  {language === 'en'
                    ? `3. How We Prepared Your ${selectedStatus} Care Loop Dashboard:`
                    : `3. आपके ${selectedStatus} कार्ड के अनुसार डैशबोर्ड में क्या शामिल है:`}
                </span>
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
