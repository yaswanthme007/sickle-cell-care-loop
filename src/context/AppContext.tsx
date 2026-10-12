'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CardStatus,
  Language,
  UserRole,
  PatientProfile,
  AdherenceDay,
  TriageResult,
  HomeVisitRecord,
  ReferralTicket,
  SyncQueueItem,
  EnvironmentalData,
  LabElectrophoresisProfile
} from '@/lib/types';
import {
  SYNTHETIC_PATIENTS,
  SYNTHETIC_VISITS,
  SYNTHETIC_REFERRALS
} from '@/lib/constants';
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
  selectPatientById: (patientId: string) => void;
  adherenceHistory: AdherenceDay[];
  logTodayDose: (status: 'TAKEN' | 'MISSED') => void;
  logHydration: (deltaGlasses: number) => void;
  updatePatientWeightAndProphylaxis: (
    patientId: string,
    updates: Partial<Pick<PatientProfile, 'weightKg' | 'currentDoseMg' | 'prophylaxis'>>
  ) => void;
  updatePatientLabProfile: (
    patientId: string,
    labProfile: LabElectrophoresisProfile,
    inferredStatus?: CardStatus
  ) => void;
  registerNewPatientCard: (params: {
    name: string;
    age: number;
    weightKg: number;
    bloodGroup: string;
    village: string;
    status: CardStatus;
    labProfile?: LabElectrophoresisProfile;
  }) => PatientProfile;
  refillPatientStock: (patientId: string, pillsAdded?: number) => void;
  referrals: ReferralTicket[];
  issueReferralTicket: (params: {
    patientId: string;
    patientName: string;
    issuedBy: string;
    facilityName: string;
    urgency: 'ROUTINE' | 'PRIORITY_48H' | 'EMERGENCY_IMMEDIATE';
    reason: string;
  }) => void;
  acknowledgeReferral: (
    referralId: string,
    newDoseMg?: number,
    doctorNotes?: string
  ) => void;
  emergencyModalOpen: boolean;
  emergencyResult: TriageResult | null;
  triggerEmergencyModal: (result: TriageResult) => void;
  closeEmergencyModal: () => void;
  erHandoverModalOpen: boolean;
  setErHandoverModalOpen: (open: boolean) => void;
  isAudioPlaying: boolean;
  playSpeech: (text: string) => void;
  stopSpeech: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  homeVisits: HomeVisitRecord[];
  completeHomeVisit: (visitId: string, notes: string, refillStock?: boolean) => void;
  allPatients: PatientProfile[];
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  careRecipient: 'child' | 'self';
  setCareRecipient: (val: 'child' | 'self') => void;
  resetToOnboarding: (step?: number) => void;
  // Offline-first & Real-time telemetry
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  syncQueue: SyncQueueItem[];
  flushSyncQueue: () => Promise<void>;
  environmentalData: EnvironmentalData;
  refreshEnvironment: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ENV: EnvironmentalData = {
  location: 'Burhar, Shahdol, MP (23.30°N, 81.36°E)',
  temperatureC: 34.2,
  humidityPercent: 38,
  heatIndexC: 36.1,
  diurnalSwingC: 11.4,
  weatherCondition: 'High Diurnal Temperature Swing',
  isLiveApi: false,
  fetchedAt: new Date().toISOString()
};

const STORAGE_KEY = 'sickle_care_loop_v2_state';
const BROADCAST_CHANNEL_NAME = 'sickle_care_loop_realtime_channel';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>('HbSS');
  const [allPatients, setAllPatients] = useState<PatientProfile[]>(SYNTHETIC_PATIENTS);
  const [currentPatientId, setCurrentPatientId] = useState<string>(SYNTHETIC_PATIENTS[0].id);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [emergencyResult, setEmergencyResult] = useState<TriageResult | null>(null);
  const [erHandoverModalOpen, setErHandoverModalOpen] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [homeVisits, setHomeVisits] = useState<HomeVisitRecord[]>(SYNTHETIC_VISITS);
  const [referrals, setReferrals] = useState<ReferralTicket[]>(SYNTHETIC_REFERRALS);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [careRecipient, setCareRecipient] = useState<'child' | 'self'>('child');

  // Offline-first & Environmental state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>(DEFAULT_ENV);

  const currentPatient =
    allPatients.find((p) => p.id === currentPatientId) || allPatients[0];

  const adherenceHistory = currentPatient.adherenceHistory || [];

  // Persist & Broadcast helper
  const persistAndBroadcast = useCallback(
    (
      nextPatients: PatientProfile[],
      nextVisits: HomeVisitRecord[],
      nextReferrals: ReferralTicket[],
      eventItem?: Omit<SyncQueueItem, 'id' | 'timestamp' | 'synced'>
    ) => {
      const newQueueItem: SyncQueueItem | undefined = eventItem
        ? {
            id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            actionType: eventItem.actionType,
            summary: eventItem.summary,
            timestamp: new Date().toISOString(),
            synced: !isOfflineMode
          }
        : undefined;

      setSyncQueue((prev) => {
        const updatedQueue = newQueueItem ? [newQueueItem, ...prev.slice(0, 24)] : prev;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                patients: nextPatients,
                visits: nextVisits,
                referrals: nextReferrals,
                syncQueue: updatedQueue
              })
            );
          } catch {
            // ignore storage quota errors
          }
        }
        return updatedQueue;
      });

      // Cross-tab instant broadcast so Patient View <-> ASHA View <-> CHC View stay in live sync
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.postMessage({
            patients: nextPatients,
            visits: nextVisits,
            referrals: nextReferrals
          });
          bc.close();
        } catch {
          // ignore broadcast errors
        }
      }

      // Sync to server / cloud when online
      if (!isOfflineMode) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patients: nextPatients,
            visits: nextVisits,
            referrals: nextReferrals,
            event: newQueueItem
          })
        }).catch(() => {
          // If network fails, mark as unsynced in queue
        });
      }
    },
    [isOfflineMode]
  );

  // Load persisted state & subscribe to cross-tab BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.patients) && parsed.patients.length > 0) {
          setAllPatients(parsed.patients);
        }
        if (Array.isArray(parsed.visits)) {
          setHomeVisits(parsed.visits);
        }
        if (Array.isArray(parsed.referrals)) {
          setReferrals(parsed.referrals);
        }
        if (Array.isArray(parsed.syncQueue)) {
          setSyncQueue(parsed.syncQueue);
        }
      }
    } catch {
      // ignore parse errors
    }

    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (ev) => {
        if (ev.data?.patients) setAllPatients(ev.data.patients);
        if (ev.data?.visits) setHomeVisits(ev.data.visits);
        if (ev.data?.referrals) setReferrals(ev.data.referrals);
      };
      return () => bc.close();
    }
  }, []);

  // Fetch live environmental weather telemetry for Shahdol, MP
  const refreshEnvironment = useCallback(async () => {
    if (isOfflineMode) return;
    try {
      const res = await fetch(
        `/api/environment?village=${encodeURIComponent(currentPatient.village)}`
      );
      if (res.ok) {
        const data: EnvironmentalData = await res.json();
        setEnvironmentalData(data);
      }
    } catch {
      // keep fallback telemetry
    }
  }, [currentPatient.village, isOfflineMode]);

  useEffect(() => {
    refreshEnvironment();
  }, [refreshEnvironment]);

  // Flush offline queue when switching from Offline Village Mode -> Online
  const flushSyncQueue = useCallback(async () => {
    const unsynced = syncQueue.filter((q) => !q.synced);
    if (unsynced.length === 0) return;

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patients: allPatients,
          visits: homeVisits,
          referrals,
          event: {
            id: `BATCH-${Date.now()}`,
            actionType: 'LOG_DOSE',
            summary: `Synced ${unsynced.length} queued offline village records to cloud`,
            timestamp: new Date().toISOString(),
            synced: true
          }
        })
      });

      setSyncQueue((prev) => prev.map((item) => ({ ...item, synced: true })));
    } catch {
      // remain queued
    }
  }, [syncQueue, allPatients, homeVisits, referrals]);

  useEffect(() => {
    if (!isOfflineMode) {
      flushSyncQueue();
    }
  }, [isOfflineMode, flushSyncQueue]);

  const resetToOnboarding = (step: number = 1) => {
    speechService.stop();
    setIsAudioPlaying(false);
    setOnboardingStep(step);
    setIsOnboarded(false);
  };

  // Sync selectedStatus changes to matching patient if currentPatient doesn't match
  const handleSetSelectedStatus = (status: CardStatus) => {
    setSelectedStatus(status);
    const current = allPatients.find((p) => p.id === currentPatientId);
    if (!current || current.status !== status) {
      const matched = allPatients.find((p) => p.status === status);
      if (matched) {
        setCurrentPatientId(matched.id);
      }
    }
  };

  const selectPatientById = (patientId: string) => {
    const found = allPatients.find((p) => p.id === patientId);
    if (found) {
      setCurrentPatientId(found.id);
      setSelectedStatus(found.status);
    }
  };

  const setCurrentPatient = (patient: PatientProfile) => {
    setCurrentPatientId(patient.id);
    setSelectedStatus(patient.status);
  };

  const toggleLanguage = () => {
    speechService.stop();
    setIsAudioPlaying(false);
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const logTodayDose = (status: 'TAKEN' | 'MISSED') => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedVisits = [...homeVisits];

    const nextPatients = allPatients.map((p) => {
      if (p.id !== currentPatient.id) return p;

      const filtered = p.adherenceHistory.filter((d) => d.date !== todayStr);
      const updatedEntry: AdherenceDay = {
        date: todayStr,
        status,
        notes:
          status === 'TAKEN'
            ? 'Verified daily dose logged'
            : 'Explicitly marked missed by family'
      };

      const prevToday = p.adherenceHistory.find((d) => d.date === todayStr);
      let nextStock = p.remainingPillsStock ?? 10;
      if (status === 'TAKEN' && prevToday?.status !== 'TAKEN' && nextStock > 0) {
        nextStock = nextStock - 1;
      }

      // Auto-trigger ASHA home visit if pill stock hits <= 3 days
      if (nextStock <= 3 && !updatedVisits.some((v) => v.patientId === p.id && v.status === 'PENDING' && v.interventionType === 'STOCK_REFILL')) {
        updatedVisits = [
          {
            id: `VISIT-STOCK-${Date.now()}`,
            patientId: p.id,
            patientName: p.name,
            ashaName: p.ashaAssigned,
            riskLevel: 'HIGH',
            reason: `Auto-Alert: Only ${nextStock} days of Hydroxyurea blister stock remaining at home.`,
            status: 'PENDING',
            interventionType: 'STOCK_REFILL'
          },
          ...updatedVisits
        ];
      }

      return {
        ...p,
        remainingPillsStock: nextStock,
        adherenceHistory: [...filtered, updatedEntry]
      };
    });

    setAllPatients(nextPatients);
    setHomeVisits(updatedVisits);
    persistAndBroadcast(nextPatients, updatedVisits, referrals, {
      actionType: 'LOG_DOSE',
      summary: `${currentPatient.name} logged Hydroxyurea (${currentPatient.currentDoseMg || 500}mg) as ${status}`
    });
  };

  const logHydration = (deltaGlasses: number) => {
    const nextPatients = allPatients.map((p) => {
      if (p.id !== currentPatient.id) return p;
      const nextCount = Math.min(
        Math.max((p.hydrationLoggedToday || 0) + deltaGlasses, 0),
        16
      );
      return {
        ...p,
        hydrationLoggedToday: nextCount
      };
    });

    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, homeVisits, referrals, {
      actionType: 'LOG_HYDRATION',
      summary: `${currentPatient.name} updated daily hydration intake`
    });
  };

  const updatePatientWeightAndProphylaxis = (
    patientId: string,
    updates: Partial<Pick<PatientProfile, 'weightKg' | 'currentDoseMg' | 'prophylaxis'>>
  ) => {
    const nextPatients = allPatients.map((p) =>
      p.id === patientId ? { ...p, ...updates } : p
    );
    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, homeVisits, referrals, {
      actionType: 'UPDATE_LABS',
      summary: `Updated clinical passbook (weight/prophylaxis) for ${patientId}`
    });
  };

  const updatePatientLabProfile = (
    patientId: string,
    labProfile: LabElectrophoresisProfile,
    inferredStatus?: CardStatus
  ) => {
    const nextPatients = allPatients.map((p) => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        status: inferredStatus || p.status,
        labProfile
      };
    });
    if (inferredStatus) {
      setSelectedStatus(inferredStatus);
    }
    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, homeVisits, referrals, {
      actionType: 'UPDATE_LABS',
      summary: `HPLC Electrophoresis lab report parsed for ${patientId} (HbS: ${labProfile.hbS}%, HbF: ${labProfile.hbF}%)`
    });
  };

  const registerNewPatientCard = (params: {
    name: string;
    age: number;
    weightKg: number;
    bloodGroup: string;
    village: string;
    status: CardStatus;
    labProfile?: LabElectrophoresisProfile;
  }): PatientProfile => {
    const newId = `MP-SHD-${Math.floor(200 + Math.random() * 799)}`;
    const recommendedDose =
      params.status === 'HbSS'
        ? Math.round((params.weightKg * 17.5) / 250) * 250 || 500
        : undefined;

    const newPatient: PatientProfile = {
      id: newId,
      name: params.name.trim() || 'New Cohort Patient',
      age: params.age,
      weightKg: params.weightKg,
      bloodGroup: params.bloodGroup || 'B+',
      isMinor: params.age < 18,
      guardianName: params.age < 18 ? 'Family Guardian' : undefined,
      status: params.status,
      village: params.village || 'Burhar',
      district: 'Shahdol, MP',
      phone: '+91 98260 XXXXX',
      ashaAssigned: 'Kavita Devi (ASHA)',
      nextFollowupDate: new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .split('T')[0],
      lastClinicVisit: new Date().toISOString().split('T')[0],
      currentDoseMg: recommendedDose,
      remainingPillsStock: params.status === 'HbSS' ? 30 : undefined,
      hydrationTargetGlasses: params.age < 12 ? 7 : 9,
      hydrationLoggedToday: 4,
      activeWarningCount: 0,
      adherenceHistory:
        params.status === 'HbSS'
          ? [
              {
                date: new Date().toISOString().split('T')[0],
                status: 'TAKEN',
                notes: 'Initial enrollment dose'
              }
            ]
          : [],
      labProfile:
        params.labProfile ||
        (params.status === 'HbSS'
          ? {
              hbA: 0,
              hbS: 79.5,
              hbF: 17.3,
              hbA2: 3.2,
              baselineHbGdl: 8.2,
              lastCbcDate: new Date().toISOString().split('T')[0],
              ancCount: 2700,
              plateletCount: 215000
            }
          : params.status === 'HbAS'
          ? {
              hbA: 57.5,
              hbS: 39.2,
              hbF: 0.8,
              hbA2: 2.5,
              baselineHbGdl: 12.4,
              lastCbcDate: new Date().toISOString().split('T')[0]
            }
          : {
              hbA: 96.5,
              hbS: 0,
              hbF: 0.8,
              hbA2: 2.7,
              baselineHbGdl: 13.8,
              lastCbcDate: new Date().toISOString().split('T')[0]
            }),
      prophylaxis:
        params.status === 'HbSS'
          ? {
              folicAcidDaily: true,
              penicillinProphylaxis: params.age < 6,
              pneumococcalVaccine: true,
              spleenPalpationTrained: false
            }
          : undefined
    };

    const nextPatients = [newPatient, ...allPatients];
    setAllPatients(nextPatients);
    setCurrentPatientId(newPatient.id);
    setSelectedStatus(newPatient.status);

    persistAndBroadcast(nextPatients, homeVisits, referrals, {
      actionType: 'REGISTER_PATIENT',
      summary: `Enrolled ${newPatient.name} (${newPatient.id}, ${newPatient.status}) into Shahdol Care Loop`
    });

    return newPatient;
  };

  const refillPatientStock = (patientId: string, pillsAdded: number = 30) => {
    const targetPatient = allPatients.find((p) => p.id === patientId);
    const nextPatients = allPatients.map((p) => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        remainingPillsStock: (p.remainingPillsStock || 0) + pillsAdded,
        nextFollowupDate: new Date(Date.now() + 28 * 86400000)
          .toISOString()
          .split('T')[0]
      };
    });

    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, homeVisits, referrals, {
      actionType: 'REFILL_STOCK',
      summary: `Dispensed +${pillsAdded} days Hydroxyurea blister pack to ${
        targetPatient?.name || patientId
      }`
    });
  };

  const issueReferralTicket = (params: {
    patientId: string;
    patientName: string;
    issuedBy: string;
    facilityName: string;
    urgency: 'ROUTINE' | 'PRIORITY_48H' | 'EMERGENCY_IMMEDIATE';
    reason: string;
  }) => {
    const newTicket: ReferralTicket = {
      id: `REF-SHD-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: params.patientId,
      patientName: params.patientName,
      issuedBy: params.issuedBy,
      facilityName: params.facilityName,
      urgency: params.urgency,
      reason: params.reason,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    };

    const nextReferrals = [newTicket, ...referrals];
    setReferrals(nextReferrals);
    persistAndBroadcast(allPatients, homeVisits, nextReferrals, {
      actionType: 'ISSUE_REFERRAL',
      summary: `Issued ${params.urgency} CHC referral (${newTicket.id}) for ${params.patientName}`
    });
  };

  const acknowledgeReferral = (
    referralId: string,
    newDoseMg?: number,
    doctorNotes?: string
  ) => {
    const targetRef = referrals.find((r) => r.id === referralId);
    const nextReferrals = referrals.map((r) =>
      r.id === referralId
        ? {
            ...r,
            status: 'ACKNOWLEDGED_BY_DOCTOR' as const,
            doctorNotes:
              doctorNotes ||
              (newDoseMg
                ? `Reviewed by CHC Medical Officer. Adjusted Hydroxyurea to ${newDoseMg}mg/day based on weight & CBC safety.`
                : 'Reviewed by CHC Medical Officer. Continue current regimen & hydration.')
          }
        : r
    );

    let nextPatients = [...allPatients];
    if (targetRef) {
      nextPatients = allPatients.map((p) => {
        if (p.id !== targetRef.patientId) return p;
        return {
          ...p,
          currentDoseMg: newDoseMg || p.currentDoseMg,
          remainingPillsStock: Math.max(p.remainingPillsStock || 0, 30),
          lastClinicVisit: new Date().toISOString().split('T')[0],
          nextFollowupDate: new Date(Date.now() + 30 * 86400000)
            .toISOString()
            .split('T')[0]
        };
      });
    }

    setReferrals(nextReferrals);
    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, homeVisits, nextReferrals, {
      actionType: 'ISSUE_REFERRAL',
      summary: `CHC Medical Officer completed referral ${referralId}${
        newDoseMg ? ` & updated dose to ${newDoseMg}mg` : ''
      }`
    });
  };

  const triggerEmergencyModal = (result: TriageResult) => {
    setEmergencyResult(result);
    setEmergencyModalOpen(true);

    const newVisit: HomeVisitRecord = {
      id: `EMERGENCY-${Date.now()}`,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      ashaName: currentPatient.ashaAssigned,
      riskLevel: 'HIGH',
      reason: `EMERGENCY 108 DISPATCH: ${result.detectedFlags.join(', ')}`,
      status: 'PENDING',
      interventionType: 'EMERGENCY_DISPATCH'
    };

    const newTicket: ReferralTicket = {
      id: `ER-SHD-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: currentPatient.id,
      patientName: `${currentPatient.name} (${currentPatient.age}y, ${currentPatient.status})`,
      issuedBy: 'Automated Crisis Triage Engine (108 Alert)',
      facilityName: 'District Hospital Shahdol / CHC Burhar Casualty',
      urgency: 'EMERGENCY_IMMEDIATE',
      reason: `Red Flag Triage: ${result.detectedFlags.join(' | ')} • Baseline Hb: ${
        currentPatient.labProfile?.baselineHbGdl || 7.8
      } g/dL`,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    };

    const nextVisits = [newVisit, ...homeVisits];
    const nextReferrals = [newTicket, ...referrals];

    setHomeVisits(nextVisits);
    setReferrals(nextReferrals);
    persistAndBroadcast(allPatients, nextVisits, nextReferrals, {
      actionType: 'EMERGENCY_ALERT',
      summary: `CRITICAL 108 Triage Alert triggered for ${currentPatient.name}`
    });
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

  const completeHomeVisit = (
    visitId: string,
    notes: string,
    refillStock: boolean = false
  ) => {
    const targetVisit = homeVisits.find((v) => v.id === visitId);
    const nextVisits = homeVisits.map((v) =>
      v.id === visitId
        ? {
            ...v,
            status: 'COMPLETED' as const,
            notes,
            completedAt: new Date().toISOString()
          }
        : v
    );

    let nextPatients = [...allPatients];
    if (refillStock && targetVisit) {
      nextPatients = allPatients.map((p) =>
        p.id === targetVisit.patientId
          ? {
              ...p,
              remainingPillsStock: (p.remainingPillsStock || 0) + 30
            }
          : p
      );
    }

    setHomeVisits(nextVisits);
    setAllPatients(nextPatients);
    persistAndBroadcast(nextPatients, nextVisits, referrals, {
      actionType: 'COMPLETE_VISIT',
      summary: `ASHA completed home visit for ${targetVisit?.patientName || visitId}${
        refillStock ? ' (+30d Hydroxyurea refill delivered)' : ''
      }`
    });
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
        setSelectedStatus: handleSetSelectedStatus,
        currentPatient,
        setCurrentPatient,
        selectPatientById,
        adherenceHistory,
        logTodayDose,
        logHydration,
        updatePatientWeightAndProphylaxis,
        updatePatientLabProfile,
        registerNewPatientCard,
        refillPatientStock,
        referrals,
        issueReferralTicket,
        acknowledgeReferral,
        emergencyModalOpen,
        emergencyResult,
        triggerEmergencyModal,
        closeEmergencyModal,
        erHandoverModalOpen,
        setErHandoverModalOpen,
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
        resetToOnboarding,
        isOfflineMode,
        setIsOfflineMode,
        syncQueue,
        flushSyncQueue,
        environmentalData,
        refreshEnvironment
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
