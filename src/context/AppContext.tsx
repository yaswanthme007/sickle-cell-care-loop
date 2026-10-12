'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CardStatus,
  Language,
  UserRole,
  PatientProfile,
  AdherenceDay,
  TriageResult,
  HomeVisitRecord,
  DoseStatus
} from '@/lib/types';
import { SYNTHETIC_PATIENTS, SYNTHETIC_VISITS } from '@/lib/constants';
import { speechService } from '@/lib/speechService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedStatus: CardStatus;
  setSelectedStatus: (status: CardStatus) => void;
  currentPatient: PatientProfile;
  setCurrentPatient: (patient: PatientProfile) => void;
  adherenceHistory: AdherenceDay[];
  logTodayDose: (status: 'TAKEN' | 'MISSED') => void;
  emergencyModalOpen: boolean;
  emergencyResult: TriageResult | null;
  triggerEmergencyModal: (result: TriageResult) => void;
  closeEmergencyModal: () => void;
  isAudioPlaying: boolean;
  playSpeech: (text: string) => void;
  stopSpeech: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  homeVisits: HomeVisitRecord[];
  completeHomeVisit: (visitId: string, notes: string) => void;
  allPatients: PatientProfile[];
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  careRecipient: 'child' | 'self';
  setCareRecipient: (val: 'child' | 'self') => void;
  resetToOnboarding: (step?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial 7-day adherence for the active patient (Ramesh Kol, HbSS)
const INITIAL_ADHERENCE: AdherenceDay[] = [
  { date: "2026-09-29", status: "TAKEN" },
  { date: "2026-09-30", status: "TAKEN" },
  { date: "2026-10-01", status: "MISSED", notes: "Felt nauseous in morning" },
  { date: "2026-10-02", status: "TAKEN" },
  { date: "2026-10-03", status: "UNLOGGED" },
  { date: "2026-10-04", status: "MISSED", notes: "Ran out of strip" },
  { date: "2026-10-05", status: "UNLOGGED" },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // English is the strict default as requested by user
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>('HbSS');
  const [allPatients, setAllPatients] = useState<PatientProfile[]>(SYNTHETIC_PATIENTS);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(SYNTHETIC_PATIENTS[0]);
  const [adherenceHistory, setAdherenceHistory] = useState<AdherenceDay[]>(INITIAL_ADHERENCE);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [emergencyResult, setEmergencyResult] = useState<TriageResult | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [homeVisits, setHomeVisits] = useState<HomeVisitRecord[]>(SYNTHETIC_VISITS);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [careRecipient, setCareRecipient] = useState<'child' | 'self'>('child');

  const resetToOnboarding = (step: number = 1) => {
    speechService.stop();
    setIsAudioPlaying(false);
    setOnboardingStep(step);
    setIsOnboarded(false);
  };

  // Sync selected status changes to patient
  useEffect(() => {
    const matched = allPatients.find(p => p.status === selectedStatus);
    if (matched) {
      setCurrentPatient(matched);
    }
  }, [selectedStatus, allPatients]);

  const toggleLanguage = () => {
    speechService.stop();
    setIsAudioPlaying(false);
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const logTodayDose = (status: 'TAKEN' | 'MISSED') => {
    const todayStr = new Date().toISOString().split('T')[0];
    setAdherenceHistory((prev) => {
      const filtered = prev.filter((d) => d.date !== todayStr);
      const updated: AdherenceDay = {
        date: todayStr,
        status,
        notes: status === 'TAKEN' ? 'Logged by patient/parent' : 'Marked missed by patient'
      };
      const next = [...filtered, updated];
      if (typeof window !== 'undefined') {
        localStorage.setItem('sickle_adherence_offline_queue', JSON.stringify(next));
      }
      return next;
    });
  };

  const triggerEmergencyModal = (result: TriageResult) => {
    setEmergencyResult(result);
    setEmergencyModalOpen(true);
    // Background alert simulation to ASHA
    const newVisit: HomeVisitRecord = {
      id: `EMERGENCY-${Date.now()}`,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      ashaName: currentPatient.ashaAssigned,
      riskLevel: 'HIGH',
      reason: `Patient logged emergency triage alert: ${result.detectedFlags.join(', ')}`,
      status: 'PENDING'
    };
    setHomeVisits(prev => [newVisit, ...prev]);
  };

  const closeEmergencyModal = () => {
    setEmergencyModalOpen(false);
  };

  const playSpeech = (text: string) => {
    if (isAudioPlaying) {
      speechService.stop();
      setIsAudioPlaying(false);
      return;
    }

    const started = speechService.speak(
      text,
      language,
      () => setIsAudioPlaying(false),
      () => setIsAudioPlaying(false)
    );

    if (started) {
      setIsAudioPlaying(true);
    }
  };

  const stopSpeech = () => {
    speechService.stop();
    setIsAudioPlaying(false);
  };

  const completeHomeVisit = (visitId: string, notes: string) => {
    setHomeVisits(prev =>
      prev.map(v =>
        v.id === visitId
          ? { ...v, status: 'COMPLETED', notes, completedAt: new Date().toISOString() }
          : v
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        userRole,
        setUserRole,
        selectedStatus,
        setSelectedStatus,
        currentPatient,
        setCurrentPatient,
        adherenceHistory,
        logTodayDose,
        emergencyModalOpen,
        emergencyResult,
        triggerEmergencyModal,
        closeEmergencyModal,
        isAudioPlaying,
        playSpeech,
        stopSpeech,
        qrModalOpen,
        setQrModalOpen,
        homeVisits,
        completeHomeVisit,
        allPatients,
        isOnboarded,
        setIsOnboarded,
        onboardingStep,
        setOnboardingStep,
        careRecipient,
        setCareRecipient,
        resetToOnboarding
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
