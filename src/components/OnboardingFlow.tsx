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
  Sparkles,
  Scale,
  Droplets,
  UserPlus
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
    allPatients,
    currentPatient,
    selectPatientById,
    registerNewPatientCard,
    referrals
  } = useApp();

  const [autoNarrate, setAutoNarrate] = useState<boolean>(false);
  const [showCardHelp, setShowCardHelp] = useState<boolean>(false);

  // Real Patient Intake Mode: 'cohort' (pick existing Shahdol registry card) vs 'custom' (register your own real card)
  const [intakeMode, setIntakeMode] = useState<'cohort' | 'custom'>('cohort');
  const [customName, setCustomName] = useState<string>('');
  const [customAge, setCustomAge] = useState<number>(11);
  const [customWeight, setCustomWeight] = useState<number>(26);
  const [customBloodGroup, setCustomBloodGroup] = useState<string>('B+');
  const [customVillage, setCustomVillage] = useState<string>('Burhar');
  const [customBaselineHb, setCustomBaselineHb] = useState<number>(7.8);
  const [customHbF, setCustomHbF] = useState<number>(16.4);

  const statusContent = STATUS_EXPLANATIONS[selectedStatus][language];

  // Auto-calculated ICMR clinical parameters for live preview
  const previewWeight =
    intakeMode === 'custom' ? customWeight : currentPatient.weightKg || 26;
  const previewAge =
    intakeMode === 'custom' ? customAge : currentPatient.age || 11;
  const previewName =
    intakeMode === 'custom'
      ? customName.trim() || (language === 'en' ? 'Your Patient Name' : 'मरीज का नाम')
      : currentPatient.name;
  const previewVillage =
    intakeMode === 'custom' ? customVillage : currentPatient.village;
  const previewBlood =
    intakeMode === 'custom' ? customBloodGroup : currentPatient.bloodGroup || 'B+';
  const calculatedTargetDoseMg =
    Math.round((previewWeight * 18) / 250) * 250 || 500;
  const calculatedWaterGlasses = previewAge < 12 ? 8 : 10;

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
            ? '“Namaste. Receiving a Sickle Cell Status Card at a camp is only the first step. I am here to walk you through what your card means, calculate your child’s hydration & weight-based care plan, and connect you with CHC Burhar. First, choose your role below.”'
            : '“नमस्ते। शिविर में सिकल सेल कार्ड मिलना केवल पहला कदम है। मैं आपको सरल भाषा में आपके कार्ड का अर्थ समझाने और आपकी देखभाल शुरू करने में मदद करूंगी। सबसे पहले नीचे अपनी भूमिका चुनें।”',
        voiceScript:
          language === 'en'
            ? 'Namaste. Receiving a Sickle Cell Status Card is only the first step. I am Kavita, your community health guide. Please select whether you are a family member with a status card, or a frontline health worker.'
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
            ? '“Match the color band on your physical government card—Red (HbSS), Yellow (HbAS), or Green (HbAA). You can either load a verified patient from our Shahdol Registry or enter your own name, weight, and lab values to generate a live digital passbook.”'
            : '“अपने सरकारी कार्ड पर छपे रंग को मिलाएं—लाल (HbSS), पीला (HbAS), या हरा (HbAA)। आप शहडोल रजिस्ट्री से कार्ड चुन सकते हैं या अपना स्वयं का नाम, वजन और लैब विवरण दर्ज कर सकते हैं।”',
        voiceScript:
          language === 'en'
            ? 'Match the color band on your card: Red HbSS, Yellow HbAS, or Green HbAA. You can pick a patient from the Shahdol Registry or enter your own name and weight to configure your live care passbook.'
            : 'अपने कार्ड पर छपे रंग या कोड को देखें: लाल HbSS, पीला HbAS, या हरा HbAA। नीचे अपना कार्ड चुनें या अपना नाम और वजन दर्ज करें।'
      };
    }

    if (onboardingStep === 2 && userRole !== 'patient') {
      return {
        name: language === 'en' ? 'District Mission Coordinator' : 'जिला मिशन समन्वयक',
        role:
          language === 'en'
            ? 'National Sickle Cell Mission • Shahdol District Unit'
            : 'राष्ट्रीय सिकल सेल मिशन • शहडोल जिला इकाई',
        badgeColor: 'bg-forest-800 text-white',
        message:
          language === 'en'
            ? '“Welcome back to the Shahdol Sector Command. Today your cohort has active blister-pack stock alerts and weight-based Hydroxyurea dose reviews waiting in the queue.”'
            : '“शहडोल सेक्टर कमांड में आपका स्वागत है। आज आपके क्षेत्र में दवा रिफिल अलर्ट और वजन आधारित खुराक समीक्षा लंबित हैं।”',
        voiceScript:
          language === 'en'
            ? 'Welcome back. Your sector has priority home visits and CHC dose review tickets waiting today. Review your briefing below and open the field dashboard.'
            : 'स्वागत है। आज आपके क्षेत्र में आवश्यक गृह भेंट और रेफरल टिकट हैं। नीचे विवरण देखकर डैशबोर्ड खोलें।'
      };
    }

    return {
      name:
        language === 'en'
          ? 'Dr. Rajesh Verma & Kavita Devi'
          : 'डॉ. राजेश वर्मा एवं कविता देवी',
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
            ? `“We have configured the HbSS Care Loop for ${previewName} (${previewWeight}kg). With daily Hydroxyurea, ${calculatedWaterGlasses} glasses of water, and our 48-hour crisis predictor, your family can prevent over 80% of pain crises.”`
            : `“हमने ${previewName} (${previewWeight}kg) के लिए HbSS केयर लूप तैयार कर दिया है। नियमित दवा, ${calculatedWaterGlasses} गिलास पानी और समय पर पहचान से 80% से अधिक दर्द के दौरों को रोका जा सकता है।”`
          : selectedStatus === 'HbAS'
          ? language === 'en'
            ? '“Reassurance first: HbAS means you are a healthy carrier—you do NOT have Sickle Cell Disease and you never need Hydroxyurea medicine. We have customized your dashboard for partner screening & 1-in-4 genetic inheritance clarity.”'
            : '“सबसे पहले निश्चिंत रहें: HbAS का अर्थ है कि आप एक स्वस्थ वाहक (कैरियर) हैं—आपको बीमारी नहीं है और आपको किसी दवा की आवश्यकता नहीं है।”'
          : language === 'en'
          ? '“Good news: Your HbAA card confirms completely normal hemoglobin. Neither you nor your biological children are at risk of Sickle Cell Disease.”'
          : '“अच्छी खबर: आपका HbAA कार्ड पूरी तरह सामान्य हीमोग्लोबिन की पुष्टि करता है। आपको किसी विशेष उपचार की आवश्यकता नहीं है।”',
      voiceScript: statusContent.audioScript
    };
  };

  const guide = getGuidePersona();

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

  const handleChooseCardStatus = (status: CardStatus) => {
    stopSpeech();
    setSelectedStatus(status);
    if (status !== 'HbSS') {
      setCareRecipient('self');
    }
  };

  const handleProceedToStep3 = () => {
    stopSpeech();
    if (intakeMode === 'custom') {
      registerNewPatientCard({
        name: customName.trim() || 'Aarav Baiga',
        age: customAge,
        weightKg: customWeight,
        bloodGroup: customBloodGroup,
        village: customVillage,
        status: selectedStatus,
        labProfile:
          selectedStatus === 'HbSS'
            ? {
                hbA: 0,
                hbS: Number((100 - customHbF - 3.2).toFixed(1)),
                hbF: customHbF,
                hbA2: 3.2,
                baselineHbGdl: customBaselineHb,
                lastCbcDate: new Date().toISOString().split('T')[0],
                ancCount: 2800,
                plateletCount: 215000
              }
            : undefined
      });
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
                        ? '2. Card & Intake'
                        : '2. कार्ड एवं विवरण'
                      : language === 'en'
                      ? '2. Sector Briefing'
                      : '2. क्षेत्र विवरण'
                    : language === 'en'
                    ? '3. Care Passbook'
                    : '3. डिजिटल पासबुक'}
                </span>
                {s < totalSteps && (
                  <span className="text-canvas-300 font-bold">→</span>
                )}
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
            <div
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm ${guide.badgeColor}`}
            >
              <Stethoscope className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">
                GUIDE
              </span>
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
                  ? 'Over 6 crore people in India have been screened, but families often leave the screening camp unsure what their card means or how to prevent painful crises. Choose your role below to begin.'
                  : 'भारत में 6 करोड़ से अधिक लोगों की जांच हो चुकी है, लेकिन कई परिवार यह नहीं समझ पाते कि उनके कार्ड का क्या अर्थ है। नीचे अपनी भूमिका चुनें।'}
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
                      {language === 'en'
                        ? 'For Families, Patients & Youth'
                        : 'मरीज, माता-पिता और युवाओं के लिए'}
                    </span>
                    <h3 className="text-lg font-extrabold text-ink-950 mt-0.5">
                      {language === 'en'
                        ? 'I Have a Sickle Cell Status Card'
                        : 'मेरे पास सिकल सेल जांच कार्ड है'}
                    </h3>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                      {language === 'en'
                        ? 'Match your physical HbSS, HbAS, or HbAA card, enter your weight & lab values, or scan your hospital HPLC report to activate your care loop.'
                        : 'अपना HbSS, HbAS या HbAA कार्ड चुनें, वजन और लैब विवरण दर्ज करें, और अपनी व्यक्तिगत देखभाल पासबुक शुरू करें।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-canvas-200 flex items-center justify-between text-xs font-extrabold text-blood-800">
                  <span>
                    {language === 'en'
                      ? 'Begin Guided Family Setup'
                      : 'परिवार सेटअप शुरू करें'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Role B: ASHA Health Worker & CHC Medical Officer */}
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
                      {language === 'en'
                        ? 'For Frontline Workers (ASHA / CHC Doctor)'
                        : 'आशा दीदी और स्वास्थ्य केंद्र डॉक्टर के लिए'}
                    </span>
                    <h3 className="text-lg font-extrabold text-ink-950 mt-0.5">
                      {language === 'en'
                        ? 'I Am a Health Worker / Medical Officer'
                        : 'मैं आशा कार्यकर्ता / चिकित्सा अधिकारी हूँ'}
                    </h3>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                      {language === 'en'
                        ? 'Prioritize village home visits via explainable risk scores, refill 30-day Hydroxyurea blister stock, and approve CHC weight-based dose reviews.'
                        : 'शहडोल के गांवों की मरीज सूची देखें, 30-दिन का दवा स्टॉक रिफिल करें और CHC खुराक समीक्षा स्वीकृत करें।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-canvas-200 flex items-center justify-between text-xs font-extrabold text-forest-800">
                  <span>
                    {language === 'en'
                      ? 'Open ASHA & CHC Clinical Portal'
                      : 'आशा एवं डॉक्टर पोर्टल खोलें'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2A: REAL PATIENT CARD MATCHING & CLINICAL INTAKE */}
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
                  <span>
                    {language === 'en' ? 'Back to role selection' : 'वापस जाएं'}
                  </span>
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                  {language === 'en'
                    ? 'Configure Your Physical Card & Clinical Baseline'
                    : 'अपना सिकल सेल कार्ड एवं स्वास्थ्य विवरण चुनें'}
                </h2>
                <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
                  {language === 'en'
                    ? 'Match your card color below and either pick a Shahdol Registry profile or enter your own details.'
                    : 'नीचे अपने कार्ड का रंग चुनें और पंजीकृत मरीज चुनें या अपना स्वयं का नाम और वजन दर्ज करें।'}
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
                    {language === 'en'
                      ? 'Where to look on my card?'
                      : 'कार्ड पर कहाँ देखें?'}
                  </span>
                </button>

                <button
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-950 text-white text-xs font-bold shadow-sm tap-active shrink-0"
                >
                  <QrCode className="w-4 h-4 text-ochre-400" />
                  <span>
                    {language === 'en'
                      ? 'Scan QR / HPLC Lab'
                      : 'QR / लैब रिपोर्ट स्कैन'}
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive Visual Guide */}
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
                    ? 'On the front of your National Sickle Cell Mission card, look at the colored bar or the punch-hole boxes on the bottom edge:'
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

            {/* 1. Select Status Printed on Card */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                {language === 'en'
                  ? '1. Tap the Color / Genotype Printed on Your Card:'
                  : '1. अपने कार्ड पर छपा रंग या कोड चुनें:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statusCards.map((card) => {
                  const isSelected = selectedStatus === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleChooseCardStatus(card.id)}
                      className={`rounded-2xl border-2 overflow-hidden text-left transition-all tap-active ${
                        isSelected
                          ? 'ring-2 ring-ink-950 border-ink-950 shadow-md'
                          : card.cardClass
                      }`}
                    >
                      <div className={`h-2.5 w-full ${card.bandClass}`} />
                      <div className="p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-black ${card.badgeClass}`}
                          >
                            {card.id}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-extrabold text-ink-950">
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-ink-950 pt-1">
                          {language === 'en' ? card.titleEn : card.titleHi}
                        </p>
                        <p className="text-[11px] text-ink-600">
                          {language === 'en' ? card.subEn : card.subHi}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Choose Between Verified Shahdol Cohort Profile OR Enter Your Own Real Details */}
            <div className="p-4 sm:p-5 rounded-3xl bg-canvas-100 border border-canvas-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-canvas-200">
                <div>
                  <span className="text-xs font-extrabold text-ink-950 block">
                    {language === 'en'
                      ? '2. Connect Patient Record & Clinical Baseline'
                      : '2. मरीज प्रोफाइल एवं क्लिनिकल विवरण जोड़ें'}
                  </span>
                  <span className="text-[11px] text-ink-500">
                    {language === 'en'
                      ? 'Select from the Shahdol District Registry or enter your own family member’s details:'
                      : 'शहडोल रजिस्ट्री से चुनें या अपने परिवार के सदस्य का वास्तविक विवरण दर्ज करें:'}
                  </span>
                </div>

                <div className="flex gap-1.5 bg-canvas-200 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIntakeMode('cohort')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      intakeMode === 'cohort'
                        ? 'bg-canvas-50 text-ink-950 shadow-sm'
                        : 'text-ink-600 hover:text-ink-950'
                    }`}
                  >
                    {language === 'en' ? 'Shahdol Registry' : 'शहडोल रजिस्ट्री'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeMode('custom')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                      intakeMode === 'custom'
                        ? 'bg-blood-800 text-white shadow-sm'
                        : 'text-ink-600 hover:text-ink-950'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en'
                        ? 'Enter My Own Details'
                        : 'अपना विवरण दर्ज करें'}
                    </span>
                  </button>
                </div>
              </div>

              {intakeMode === 'cohort' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allPatients
                    .filter((p) => p.status === selectedStatus)
                    .map((pt) => {
                      const active = currentPatient.id === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => {
                            selectPatientById(pt.id);
                            setCareRecipient(pt.isMinor ? 'child' : 'self');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all tap-active ${
                            active
                              ? 'bg-canvas-50 border-ink-950 ring-2 ring-ink-950/10 shadow-sm'
                              : 'bg-canvas-50/60 border-canvas-300 hover:border-ink-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-ink-950">
                              {pt.name} ({pt.age}y, {pt.weightKg}kg)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-canvas-200 text-ink-800">
                              {pt.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-600 mt-1">
                            Village: {pt.village} • Blood: {pt.bloodGroup} • Baseline Hb:{' '}
                            {pt.labProfile?.baselineHbGdl || 8.0} g/dL
                          </p>
                          {pt.status === 'HbSS' && (
                            <p className="text-[11px] font-bold text-blood-800 mt-1">
                              Prescribed HU: {pt.currentDoseMg}mg/d (
                              {((pt.currentDoseMg || 500) / pt.weightKg).toFixed(1)} mg/kg) •
                              Stock: {pt.remainingPillsStock}d left
                            </p>
                          )}
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                    <span className="text-[10px] font-bold text-ink-500 block">
                      {language === 'en' ? 'Patient Full Name' : 'मरीज का पूरा नाम'}
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Singh"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full mt-1 font-extrabold text-sm bg-transparent text-ink-950 focus:outline-none"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                    <span className="text-[10px] font-bold text-ink-500 block">
                      {language === 'en' ? 'Age (Years)' : 'उम्र (वर्ष)'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={customAge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomAge(val);
                        setCareRecipient(val < 18 ? 'child' : 'self');
                      }}
                      className="w-full mt-1 font-extrabold text-sm bg-transparent text-ink-950 focus:outline-none"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                    <span className="text-[10px] font-bold text-ink-500 block">
                      {language === 'en'
                        ? 'Weight (kg) — For Dose/Water'
                        : 'वजन (kg) — खुराक गणना हेतु'}
                    </span>
                    <input
                      type="number"
                      min={5}
                      max={110}
                      value={customWeight}
                      onChange={(e) => setCustomWeight(Number(e.target.value))}
                      className="w-full mt-1 font-extrabold text-sm bg-transparent text-blood-800 focus:outline-none"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                    <span className="text-[10px] font-bold text-ink-500 block">
                      {language === 'en' ? 'Village / Sector' : 'गांव / क्षेत्र'}
                    </span>
                    <select
                      value={customVillage}
                      onChange={(e) => setCustomVillage(e.target.value)}
                      className="w-full mt-1 font-extrabold text-sm bg-transparent text-ink-950 focus:outline-none"
                    >
                      <option value="Burhar">Burhar</option>
                      <option value="Jaisinghnagar">Jaisinghnagar</option>
                      <option value="Sohagpur">Sohagpur</option>
                    </select>
                  </label>

                  <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                    <span className="text-[10px] font-bold text-ink-500 block">
                      {language === 'en' ? 'Blood Group' : 'रक्त समूह'}
                    </span>
                    <select
                      value={customBloodGroup}
                      onChange={(e) => setCustomBloodGroup(e.target.value)}
                      className="w-full mt-1 font-extrabold text-sm bg-transparent text-ink-950 focus:outline-none"
                    >
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </label>

                  {selectedStatus === 'HbSS' && (
                    <label className="p-3 rounded-xl bg-canvas-50 border border-canvas-300">
                      <span className="text-[10px] font-bold text-ink-500 block">
                        {language === 'en'
                          ? 'Baseline Hb (g/dL) & HbF%'
                          : 'बेसलाइन हीमोग्लोबिन (g/dL)'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.1"
                          value={customBaselineHb}
                          onChange={(e) => setCustomBaselineHb(Number(e.target.value))}
                          className="w-1/2 font-extrabold text-sm bg-transparent text-blood-800 focus:outline-none"
                          title="Baseline Hb g/dL"
                        />
                        <span className="text-ink-400">|</span>
                        <input
                          type="number"
                          step="0.1"
                          value={customHbF}
                          onChange={(e) => setCustomHbF(Number(e.target.value))}
                          className="w-1/2 font-extrabold text-sm bg-transparent text-forest-800 focus:outline-none"
                          title="HbF %"
                        />
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* Live Auto-Calculated Clinical Preview Strip */}
              <div className="p-3.5 rounded-2xl bg-canvas-50 border border-canvas-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center text-white shrink-0 ${
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
                    <span className="text-xs font-extrabold text-ink-950 block">
                      {previewName} ({previewAge}y • {previewWeight}kg • {previewBlood}) —{' '}
                      {previewVillage}, MP
                    </span>
                    <span className="text-[11px] text-ink-600 flex flex-wrap items-center gap-3 mt-0.5">
                      {selectedStatus === 'HbSS' ? (
                        <>
                          <span className="inline-flex items-center gap-1 font-bold text-blood-800">
                            <Scale className="w-3 h-3" />
                            ICMR Target HU: ~{calculatedTargetDoseMg}mg/day (18 mg/kg)
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-forest-800">
                            <Droplets className="w-3 h-3" />
                            Anti-Sickling Water Target: {calculatedWaterGlasses} Glasses/day
                          </span>
                        </>
                      ) : selectedStatus === 'HbAS' ? (
                        <span className="font-bold text-ochre-800">
                          Healthy Carrier Profile • 0mg Medication • Partner Genetics Enabled
                        </span>
                      ) : (
                        <span className="font-bold text-forest-800">
                          Normal Hemoglobin Confirmed • No Medication Required
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="px-5 py-3 rounded-2xl bg-blood-800 hover:bg-blood-900 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-sm tap-active shrink-0"
                >
                  <span>
                    {language === 'en'
                      ? 'Generate Care Passbook →'
                      : 'देखभाल पासबुक बनाएं →'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PRE-DASHBOARD CLARITY BRIEFING */}
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
                  <span>
                    {language === 'en'
                      ? 'Back to card & weight configuration'
                      : 'वापस कार्ड विवरण पर जाएं'}
                  </span>
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
                    {currentPatient.name} — {statusContent.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-ink-600 mt-1">
                  ID: {currentPatient.id} • {currentPatient.age}y, {currentPatient.weightKg}kg •{' '}
                  {currentPatient.village}, {currentPatient.district}
                </p>
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
                      {language === 'en'
                        ? 'Listen to Summary'
                        : 'आवाज में समझाइश सुनें'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Plain-Language Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                  {language === 'en'
                    ? '1. What This Means for Health'
                    : '1. स्वास्थ्य के लिए इसका अर्थ'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.healthMeaning}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                  {language === 'en'
                    ? '2. Marriage & Future Children'
                    : '2. विवाह और बच्चों के लिए नियम'}
                </span>
                <p className="text-xs sm:text-sm text-ink-900 leading-relaxed">
                  {statusContent.marriageGuidance}
                </p>
              </div>
            </div>

            {/* Configured Clinical Modules Summary */}
            <div className="p-5 rounded-2xl bg-canvas-100/70 border border-canvas-300 space-y-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-ink-950 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>
                  {language === 'en'
                    ? `3. Active Modules Configured for ${currentPatient.name}:`
                    : `3. ${currentPatient.name} के लिए तैयार किए गए मॉड्यूल:`}
                </span>
              </h3>

              {selectedStatus === 'HbSS' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <Droplets className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en'
                          ? '48h VOC Crisis Predictor'
                          : '48-घंटे दर्द संकट पूर्वानुमान'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? `Live Shahdol weather + ${currentPatient.hydrationTargetGlasses} glasses/day hydration shield.`
                          : `शहडोल मौसम डेटा + ${currentPatient.hydrationTargetGlasses} गिलास/दिन जल लक्ष्य।`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <Pill className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en'
                          ? `Weight-Based HU (${currentPatient.currentDoseMg || 500}mg)`
                          : `वजन-आधारित दवा (${currentPatient.currentDoseMg || 500}mg)`}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? `Tracks Taken/Missed/Unlogged + Blister stock (${currentPatient.remainingPillsStock ?? 10}d left).`
                          : `ली गई/छूटी दवा एवं बचा हुआ स्टॉक (${currentPatient.remainingPillsStock ?? 10} दिन)।`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <PhoneCall className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en'
                          ? '2 AM ER Pass & Spleen Check'
                          : 'आपातकालीन ER पास एवं तिल्ली जांच'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? `Baseline Hb (${currentPatient.labProfile?.baselineHbGdl || 7.8} g/dL) QR pass for CHC doctors.`
                          : `डॉक्टरों के लिए बेसलाइन Hb (${currentPatient.labProfile?.baselineHbGdl || 7.8} g/dL) QR कार्ड।`}
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
                          ? 'Carriers do not take Hydroxyurea. Medication logs are disabled for safety.'
                          : 'वाहकों को हाइड्रोक्सीयूरिया नहीं दी जाती, इसलिए दवा ट्रैकर हटा दिया गया है।'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-50 border border-canvas-200 flex items-start gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink-950 block">
                        {language === 'en'
                          ? 'Interactive Partner Genotype Simulator'
                          : 'इंटरएक्टिव पार्टनर जेनेटिक सिम्युलेटर'}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {language === 'en'
                          ? 'Simulate HbAA, HbAS, or HbSS partner combinations & print free CHC screening voucher.'
                          : 'विवाह-पूर्व साथी के कार्ड संयोजन की गणना और मुफ्त जांच वाउचर।'}
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
                  ? `Launch ${currentPatient.name}'s ${selectedStatus} Care Loop Dashboard`
                  : `${currentPatient.name} के ${selectedStatus} देखभाल डैशबोर्ड में प्रवेश करें`}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STEP 2B: ASHA WORKER & CHC DOCTOR SECTOR BRIEFING */}
        {onboardingStep === 2 && userRole !== 'patient' && (
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
                <span>
                  {language === 'en' ? 'Back to role selection' : 'वापस जाएं'}
                </span>
              </button>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                {language === 'en'
                  ? 'Frontline ASHA & CHC Medical Officer Briefing — Shahdol'
                  : 'आशा एवं स्वास्थ्य केंद्र डॉक्टर ब्रीफिंग — जिला शहडोल'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                {language === 'en'
                  ? 'Review today’s live village outreach & CHC referral queue before opening the portal.'
                  : 'पोर्टल खोलने से पहले आज की गृह भेंट और CHC रेफरल प्राथमिकताओं की समीक्षा करें।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-blood-50 border border-blood-200">
                <span className="text-2xl font-black text-blood-800">
                  {homeVisits.filter((v) => v.status === 'PENDING').length}
                </span>
                <p className="text-xs font-bold text-blood-950 mt-1">
                  {language === 'en'
                    ? 'Pending Village Home Visits'
                    : 'लंबित ग्रामीण गृह भेंट'}
                </p>
                <p className="text-[11px] text-blood-800 mt-0.5">
                  {language === 'en'
                    ? 'Includes low Hydroxyurea blister stock & overdue checkups'
                    : 'कम दवा स्टॉक और विलंबित जांच वाले मरीज'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ochre-50 border border-ochre-200">
                <span className="text-2xl font-black text-ochre-800">
                  {referrals.filter((r) => r.status === 'OPEN').length}
                </span>
                <p className="text-xs font-bold text-ochre-950 mt-1">
                  {language === 'en'
                    ? 'Open CHC Doctor Dose Reviews'
                    : 'खुराक समीक्षा रेफरल टिकट'}
                </p>
                <p className="text-[11px] text-ochre-800 mt-0.5">
                  {language === 'en'
                    ? 'Pediatric weight-to-dose growth adjustments awaiting approval'
                    : 'बच्चों के वजन के अनुसार खुराक बढ़ाने की समीक्षा'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200">
                <span className="text-2xl font-black text-forest-800">
                  {allPatients.length}
                </span>
                <p className="text-xs font-bold text-forest-950 mt-1">
                  {language === 'en'
                    ? 'Active Shahdol Cohort Roster'
                    : 'कुल पंजीकृत ग्रामीण मरीज'}
                </p>
                <p className="text-[11px] text-forest-800 mt-0.5">
                  {language === 'en'
                    ? 'Burhar, Jaisinghnagar & Sohagpur blocks'
                    : 'बुढ़ार, जयसिंहनगर और सोहागपुर विकासखंड'}
                </p>
              </div>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card transition-all tap-active"
            >
              <span>
                {language === 'en'
                  ? 'Open ASHA Outreach & CHC Doctor Portal'
                  : 'आशा एवं CHC डॉक्टर पोर्टल खोलें'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
