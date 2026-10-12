'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CardStatus } from '@/lib/types';
import {
  X,
  QrCode,
  Scan,
  Check,
  Camera,
  FlaskConical,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

type ScannerTab = 'qr' | 'hplc' | 'enroll';

export const MockQrScanner: React.FC = () => {
  const {
    qrModalOpen,
    setQrModalOpen,
    selectPatientById,
    allPatients,
    currentPatient,
    updatePatientLabProfile,
    registerNewPatientCard,
    language,
    isOnboarded,
    setOnboardingStep
  } = useApp();

  const [activeTab, setActiveTab] = useState<ScannerTab>('qr');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // HPLC Lab Decoder state
  const [hbA, setHbA] = useState<number>(currentPatient.labProfile?.hbA ?? 0);
  const [hbS, setHbS] = useState<number>(currentPatient.labProfile?.hbS ?? 80.4);
  const [hbF, setHbF] = useState<number>(currentPatient.labProfile?.hbF ?? 16.4);
  const [hbA2, setHbA2] = useState<number>(currentPatient.labProfile?.hbA2 ?? 3.2);
  const [baselineHb, setBaselineHb] = useState<number>(
    currentPatient.labProfile?.baselineHbGdl ?? 7.8
  );

  // New Patient Enrollment state
  const [newName, setNewName] = useState<string>('');
  const [newAge, setNewAge] = useState<number>(12);
  const [newWeight, setNewWeight] = useState<number>(28);
  const [newBloodGroup, setNewBloodGroup] = useState<string>('B+');
  const [newVillage, setNewVillage] = useState<string>('Burhar');
  const [newStatus, setNewStatus] = useState<CardStatus>('HbSS');

  useEffect(() => {
    if (!qrModalOpen && cameraActive) {
      stopCamera();
    }
  }, [qrModalOpen, cameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setCameraError(
        language === 'en'
          ? 'Camera permission unavailable in this browser window. Use instant digital card verification below.'
          : 'कैमरा अनुमति उपलब्ध नहीं है। नीचे दिए गए डिजिटल कार्ड सत्यापन का उपयोग करें।'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  if (!qrModalOpen) return null;

  const handleScanPatientCard = (patientId: string) => {
    setScanningId(patientId);
    setTimeout(() => {
      selectPatientById(patientId);
      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        setScanningId(null);
        stopCamera();
        setQrModalOpen(false);
        if (!isOnboarded) {
          setOnboardingStep(3);
        }
      }, 650);
    }, 700);
  };

  // Deterministic HPLC Hematology Classification
  const classifyHplc = (): {
    status: CardStatus;
    clinicalNote: string;
    isBetaThalCompound: boolean;
  } => {
    if (hbS >= 50 && hbA < 10) {
      const isCompound = hbA2 > 3.8;
      return {
        status: 'HbSS',
        isBetaThalCompound: isCompound,
        clinicalNote: isCompound
          ? `HbS (${hbS}%) + Elevated HbA2 (${hbA2}% > 3.8%) indicates Sickle-Beta Thalassemia Compound Disease. Managed under HbSS Disease Care Loop.`
          : `Homozygous Sickle Cell Disease (HbSS) confirmed. Protective Fetal Hb (HbF) is ${hbF}%.`
      };
    }
    if (hbS >= 20 && hbA >= 45) {
      return {
        status: 'HbAS',
        isBetaThalCompound: false,
        clinicalNote: `Sickle Cell Trait Carrier (HbAS) confirmed (HbA ${hbA}% > HbS ${hbS}%). Healthy carrier — NO Hydroxyurea required.`
      };
    }
    return {
      status: 'HbAA',
      isBetaThalCompound: false,
      clinicalNote: `Normal Adult Hemoglobin (HbAA) pattern (HbA ${hbA}%). Non-carrier.`
    };
  };

  const hplcInterpretation = classifyHplc();

  const handleApplyHplcLab = () => {
    updatePatientLabProfile(
      currentPatient.id,
      {
        hbA,
        hbS,
        hbF,
        hbA2,
        baselineHbGdl: baselineHb,
        lastCbcDate: new Date().toISOString().split('T')[0],
        ancCount: 2850,
        plateletCount: 210000
      },
      hplcInterpretation.status
    );
    setQrModalOpen(false);
    if (!isOnboarded) {
      setOnboardingStep(3);
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewPatientCard({
      name: newName || 'Sunil Baiga',
      age: newAge,
      weightKg: newWeight,
      bloodGroup: newBloodGroup,
      village: newVillage,
      status: newStatus
    });
    setQrModalOpen(false);
    if (!isOnboarded) {
      setOnboardingStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-canvas-50 border border-canvas-300 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            setQrModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-canvas-200/80 hover:bg-canvas-300 text-ink-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blood-800 text-white flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5 text-canvas-100" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-ink-950">
              {language === 'en'
                ? 'NSCAEM Card Scanner, HPLC Lab Decoder & Enrollment'
                : 'मिशन कार्ड स्कैनर, HPLC लैब डिकोडर एवं पंजीकरण'}
            </h3>
            <p className="text-xs text-ink-500">
              {language === 'en'
                ? 'Scan QR, decode hospital electrophoresis values, or enroll a patient'
                : 'QR स्कैन करें, अस्पताल की लैब रिपोर्ट जांचें या नया कार्ड जोड़ें'}
            </p>
          </div>
        </div>

        {/* 3-Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-canvas-200 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr'
                ? 'bg-canvas-50 text-ink-950 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-blood-700" />
            <span>{language === 'en' ? '1. Card / QR' : '1. कार्ड स्कैन'}</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('hplc');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'hplc'
                ? 'bg-canvas-50 text-ink-950 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-ochre-700" />
            <span>{language === 'en' ? '2. HPLC Lab' : '2. लैब रिपोर्ट'}</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('enroll');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'enroll'
                ? 'bg-canvas-50 text-ink-950 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'en' ? '3. New Patient' : '3. नया पंजीकरण'}</span>
          </button>
        </div>

        {/* TAB 1: QR & Camera Scanner */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl bg-ink-900 border-2 border-dashed border-ink-700 flex flex-col items-center justify-center p-4 overflow-hidden">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
              ) : null}

              {scanningId ? (
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ y: -40 }}
                    animate={{ y: 40 }}
                    transition={{ repeat: Infinity, duration: 1.0, repeatType: 'reverse' }}
                    className="w-48 h-0.5 bg-blood-400 mx-auto shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                  />
                  <p className="text-canvas-100 text-xs font-semibold mt-4 bg-ink-950/80 px-3 py-1 rounded-full">
                    {language === 'en'
                      ? 'Decoding NSCAEM Card Signature...'
                      : 'डिजिटल कार्ड पढ़ा जा रहा है...'}
                  </p>
                </div>
              ) : scanSuccess ? (
                <div className="relative z-10 text-center text-forest-400 bg-ink-950/80 p-4 rounded-2xl">
                  <Check className="w-10 h-10 mx-auto mb-1 animate-bounce" />
                  <p className="text-xs font-bold text-canvas-100">
                    {language === 'en'
                      ? 'Card Verified & Profile Loaded!'
                      : 'कार्ड सत्यापित हुआ!'}
                  </p>
                </div>
              ) : (
                <div className="relative z-10 text-center text-ink-300 space-y-2">
                  <QrCode className="w-9 h-9 mx-auto opacity-80 text-canvas-100" />
                  <p className="text-xs font-medium text-canvas-200 max-w-xs">
                    {language === 'en'
                      ? 'Use live camera or tap any Shahdol Mission Card below to load full clinical history'
                      : 'लाइव कैमरा चालू करें या नीचे दिए गए किसी भी कार्ड को चुनें'}
                  </p>
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-700 hover:bg-blood-800 text-white text-xs font-bold tap-active"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {language === 'en' ? 'Open Camera Viewfinder' : 'कैमरा चालू करें'}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-800 text-white text-xs font-bold"
                    >
                      <span>{language === 'en' ? 'Stop Camera' : 'कैमरा बंद करें'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-[11px] text-ochre-800 bg-ochre-50 border border-ochre-200 p-2.5 rounded-xl">
                {cameraError}
              </p>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                {language === 'en'
                  ? 'Registered Shahdol Cohort Cards:'
                  : 'शहडोल पंजीकृत मिशन कार्ड:'}
              </p>
              {allPatients.map((pt) => {
                const badgeClass =
                  pt.status === 'HbSS'
                    ? 'bg-blood-700 text-white'
                    : pt.status === 'HbAS'
                    ? 'bg-ochre-700 text-white'
                    : 'bg-forest-700 text-white';

                return (
                  <button
                    key={pt.id}
                    onClick={() => handleScanPatientCard(pt.id)}
                    className="w-full p-3 rounded-xl border border-canvas-300 bg-canvas-100 hover:bg-canvas-200 text-left flex items-center justify-between transition-all tap-active"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeClass}`}>
                          {pt.status}
                        </span>
                        <span className="text-xs font-extrabold text-ink-950">
                          {pt.name} ({pt.age}y, {pt.weightKg}kg)
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        ID: {pt.id} • {pt.village} • Baseline Hb:{' '}
                        {pt.labProfile?.baselineHbGdl || 8.0} g/dL
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-blood-800">
                      {language === 'en' ? 'Load →' : 'चुनें →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Real HPLC Electrophoresis Lab Slip Decoder */}
        {activeTab === 'hplc' && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-canvas-100 border border-canvas-200 text-xs text-ink-700">
              <span className="font-extrabold text-ink-950 block mb-1">
                {language === 'en'
                  ? 'Hospital HPLC / Hemoglobin Electrophoresis Interpreter'
                  : 'अस्पताल HPLC हीमोग्लोबिन इलेक्ट्रोफोरेसिस जांच'}
              </span>
              <p className="text-[11px]">
                {language === 'en'
                  ? 'Enter fractions from a hospital lab slip or load a clinical preset to automatically classify genotype & Sickle-Beta Thalassemia edge cases:'
                  : 'अस्पताल की लैब पर्ची से HbA, HbS, HbF और HbA2 प्रतिशत दर्ज करें:'}
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setHbA(0);
                    setHbS(80.4);
                    setHbF(16.4);
                    setHbA2(3.2);
                    setBaselineHb(7.8);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blood-100 text-blood-900 font-bold text-[11px]"
                >
                  Preset: HbSS Disease
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHbA(4.2);
                    setHbS(72.5);
                    setHbF(17.8);
                    setHbA2(5.5);
                    setBaselineHb(8.1);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blood-200 text-blood-950 font-bold text-[11px]"
                >
                  Preset: HbS-β Thalassemia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHbA(58.2);
                    setHbS(38.1);
                    setHbF(0.9);
                    setHbA2(2.8);
                    setBaselineHb(12.2);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-ochre-100 text-ochre-900 font-bold text-[11px]"
                >
                  Preset: HbAS Carrier
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">HbS % (Sickle)</span>
                <input
                  type="number"
                  step="0.1"
                  value={hbS}
                  onChange={(e) => setHbS(Number(e.target.value))}
                  className="w-full mt-1 font-black text-sm bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">
                  HbF % (Protective Fetal)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={hbF}
                  onChange={(e) => setHbF(Number(e.target.value))}
                  className="w-full mt-1 font-black text-sm bg-transparent text-forest-800 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">HbA % (Normal)</span>
                <input
                  type="number"
                  step="0.1"
                  value={hbA}
                  onChange={(e) => setHbA(Number(e.target.value))}
                  className="w-full mt-1 font-black text-sm bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">
                  HbA2 % (&gt;3.8% = β-Thal)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={hbA2}
                  onChange={(e) => setHbA2(Number(e.target.value))}
                  className="w-full mt-1 font-black text-sm bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300 col-span-2 sm:col-span-2">
                <span className="text-[10px] font-bold text-ink-500 block">
                  Steady-State Baseline Hemoglobin (g/dL)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={baselineHb}
                  onChange={(e) => setBaselineHb(Number(e.target.value))}
                  className="w-full mt-1 font-black text-sm bg-transparent text-blood-800 focus:outline-none"
                />
              </label>
            </div>

            {/* Live Classification Result */}
            <div className="p-3.5 rounded-2xl bg-blood-50/70 border border-blood-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blood-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blood-700" />
                  Inferred Clinical Genotype: {hplcInterpretation.status}
                </span>
                {hplcInterpretation.isBetaThalCompound && (
                  <span className="px-2 py-0.5 rounded bg-blood-800 text-white text-[10px] font-extrabold">
                    HbS-β Thalassemia Flag
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-800">{hplcInterpretation.clinicalNote}</p>
            </div>

            <button
              type="button"
              onClick={handleApplyHplcLab}
              className="w-full py-3 rounded-2xl bg-blood-800 hover:bg-blood-900 text-white font-extrabold text-xs shadow-sm tap-active"
            >
              {language === 'en'
                ? `Apply HPLC Lab Profile to ${currentPatient.name} →`
                : `${currentPatient.name} की प्रोफाइल में लैब डेटा सेव करें →`}
            </button>
          </div>
        )}

        {/* TAB 3: Enroll New Patient / Custom Card */}
        {activeTab === 'enroll' && (
          <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">
                  {language === 'en' ? 'Patient Full Name' : 'मरीज का पूरा नाम'}
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Baiga"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 font-bold text-xs bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">
                  {language === 'en' ? 'Status Printed on Card' : 'कार्ड स्टेटस'}
                </span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CardStatus)}
                  className="w-full mt-1 font-extrabold text-xs bg-transparent text-ink-950 focus:outline-none"
                >
                  <option value="HbSS">HbSS — Sickle Cell Disease (Red)</option>
                  <option value="HbAS">HbAS — Carrier Trait (Yellow)</option>
                  <option value="HbAA">HbAA — Normal (Green)</option>
                </select>
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">Age (Years)</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={newAge}
                  onChange={(e) => setNewAge(Number(e.target.value))}
                  className="w-full mt-1 font-bold text-xs bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">
                  Weight (kg) — Auto-calculates HU dose
                </span>
                <input
                  type="number"
                  min={5}
                  max={110}
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full mt-1 font-bold text-xs bg-transparent text-ink-950 focus:outline-none"
                />
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">Village (Shahdol)</span>
                <select
                  value={newVillage}
                  onChange={(e) => setNewVillage(e.target.value)}
                  className="w-full mt-1 font-bold text-xs bg-transparent text-ink-950 focus:outline-none"
                >
                  <option value="Burhar">Burhar</option>
                  <option value="Jaisinghnagar">Jaisinghnagar</option>
                  <option value="Sohagpur">Sohagpur</option>
                </select>
              </label>

              <label className="p-2.5 rounded-xl bg-canvas-100 border border-canvas-300">
                <span className="text-[10px] font-bold text-ink-500 block">Blood Group</span>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value)}
                  className="w-full mt-1 font-bold text-xs bg-transparent text-ink-950 focus:outline-none"
                >
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs shadow-sm tap-active"
            >
              {language === 'en'
                ? 'Enroll Patient into Live Shahdol Care Loop →'
                : 'नया मरीज केयर लूप में पंजीकृत करें →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
