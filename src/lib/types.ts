export type CardStatus = 'HbAA' | 'HbAS' | 'HbSS';

export type Language = 'en' | 'hi';

export type UserRole = 'patient' | 'asha' | 'doctor';

export type DoseStatus = 'TAKEN' | 'MISSED' | 'UNLOGGED';

export type TriageSeverity = 'NORMAL' | 'WARNING' | 'EMERGENCY';

export interface LabElectrophoresisProfile {
  hbA: number; // % Normal adult hemoglobin
  hbS: number; // % Sickle hemoglobin
  hbF: number; // % Fetal hemoglobin (protective against sickling)
  hbA2: number; // % Minor adult hemoglobin (>3.5% suggests Beta-Thal trait)
  baselineHbGdl: number; // Baseline Hemoglobin in g/dL (e.g. 7.8 g/dL)
  lastCbcDate: string; // ISO date
  ancCount?: number; // Absolute Neutrophil Count (/mm3) - safety check > 1500
  plateletCount?: number; // (/mm3) - safety check > 80000
}

export interface ProphylaxisChecklist {
  folicAcidDaily: boolean; // 5mg daily
  penicillinProphylaxis: boolean; // Twice daily for under-5 / splenectomy
  pneumococcalVaccine: boolean; // PCV / PPSV23
  spleenPalpationTrained: boolean; // Parent trained to check left upper abdomen
}

export interface ReferralTicket {
  id: string;
  patientId: string;
  patientName: string;
  issuedBy: string;
  facilityName: string; // e.g. 'CHC Burhar Sickle Cell Clinic'
  urgency: 'ROUTINE' | 'PRIORITY_48H' | 'EMERGENCY_IMMEDIATE';
  reason: string;
  createdAt: string;
  status: 'OPEN' | 'ACKNOWLEDGED_BY_DOCTOR';
  doctorNotes?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  weightKg: number;
  bloodGroup: string;
  isMinor: boolean;
  guardianName?: string;
  status: CardStatus;
  village: string;
  district: string;
  phone: string;
  ashaAssigned: string;
  nextFollowupDate: string; // ISO date
  lastClinicVisit: string; // ISO date
  currentDoseMg?: number; // e.g. 500mg (for HbSS only)
  remainingPillsStock?: number; // Days of Hydroxyurea left at home
  hydrationTargetGlasses: number; // e.g. 8 glasses/day
  hydrationLoggedToday: number; // Glasses logged today
  adherenceHistory: AdherenceDay[]; // Per-patient 7-day adherence log
  labProfile?: LabElectrophoresisProfile;
  prophylaxis?: ProphylaxisChecklist;
  activeWarningCount?: number;
}

export interface AdherenceDay {
  date: string; // YYYY-MM-DD
  status: DoseStatus;
  notes?: string;
}

export interface SymptomEvaluation {
  chestTightness: boolean;
  strokeSigns: boolean; // Sudden weakness, severe headache, speech difficulty
  highFever: boolean; // Temp > 101 F
  severeAcutePain: boolean; // Crisis pain
  splenicEnlargementSigns?: boolean; // Sudden pale palms + swollen left tummy
  mildJointPain: boolean;
  fatigue: boolean;
  darkUrineOrJaundice?: boolean; // Hemolysis / dehydration sign
  timestamp: string;
}

export interface TriageResult {
  severity: TriageSeverity;
  emergencyTitle: string;
  actionRequired: string;
  ambulanceContact: string; // '108'
  isEmergency: boolean;
  detectedFlags: string[];
}

export interface EnvironmentalData {
  location: string;
  temperatureC: number;
  humidityPercent: number;
  heatIndexC: number;
  diurnalSwingC: number; // Day-to-night temperature drop
  weatherCondition: string;
  isLiveApi: boolean;
  fetchedAt: string;
}

export interface VocPredictionResult {
  vocRiskScore: number; // 0 to 100 biophysical crisis risk in next 48h
  riskBand: 'LOW_PROTECTED' | 'MODERATE_VIGILANCE' | 'HIGH_PRODROME';
  thermalStressContribution: number;
  dehydrationContribution: number;
  adherenceHbFContribution: number;
  symptomProdromeContribution: number;
  headlineEn: string;
  headlineHi: string;
  explanationEn: string;
  explanationHi: string;
  preventativeActionsEn: string[];
  preventativeActionsHi: string[];
}

export interface RiskBreakdown {
  score: number; // 0 to 100
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  missedDosesCount: number;
  unloggedDaysCount: number;
  daysOverdueFollowup: number;
  warningSymptomsCount: number;
  lowStockPenalty: number;
  dehydrationFlag: boolean;
  primaryRiskReason: string;
}

export interface HomeVisitRecord {
  id: string;
  patientId: string;
  patientName: string;
  ashaName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  status: 'PENDING' | 'COMPLETED';
  interventionType?: 'COUNSELING' | 'STOCK_REFILL' | 'CHC_REFERRAL' | 'EMERGENCY_DISPATCH';
  notes?: string;
  completedAt?: string;
}

export interface SyncQueueItem {
  id: string;
  actionType:
    | 'LOG_DOSE'
    | 'LOG_HYDRATION'
    | 'EMERGENCY_ALERT'
    | 'COMPLETE_VISIT'
    | 'REFILL_STOCK'
    | 'ISSUE_REFERRAL'
    | 'REGISTER_PATIENT'
    | 'UPDATE_LABS';
  summary: string;
  timestamp: string;
  synced: boolean;
}

export interface StatusContent {
  title: string;
  tagline: string;
  description: string;
  healthMeaning: string;
  marriageGuidance: string;
  actionItems: string[];
  audioScript: string;
}
