export type CardStatus = 'HbAA' | 'HbAS' | 'HbSS';

export type Language = 'en' | 'hi';

export type UserRole = 'patient' | 'asha';

export type DoseStatus = 'TAKEN' | 'MISSED' | 'UNLOGGED';

export type TriageSeverity = 'NORMAL' | 'WARNING' | 'EMERGENCY';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
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
  mildJointPain: boolean;
  fatigue: boolean;
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

export interface RiskBreakdown {
  score: number; // 0 to 100
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  missedDosesCount: number;
  unloggedDaysCount: number;
  daysOverdueFollowup: number;
  warningSymptomsCount: number;
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
  notes?: string;
  completedAt?: string;
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
