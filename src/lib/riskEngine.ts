import { AdherenceDay, RiskBreakdown } from './types';

export function calculateHeuristicRiskScore(params: {
  adherenceHistory: AdherenceDay[];
  nextFollowupDate: string; // ISO date YYYY-MM-DD
  warningSymptomsCount?: number;
}): RiskBreakdown {
  const { adherenceHistory, nextFollowupDate, warningSymptomsCount = 0 } = params;

  // 1. Count explicit missed vs unlogged in recent 7 days
  let missedDosesCount = 0;
  let unloggedDaysCount = 0;

  // Take up to last 7 recorded entries
  const recent7 = adherenceHistory.slice(-7);
  for (const day of recent7) {
    if (day.status === 'MISSED') {
      missedDosesCount++;
    } else if (day.status === 'UNLOGGED') {
      unloggedDaysCount++;
    }
  }

  // 2. Compute overdue days for clinical follow-up
  const today = new Date();
  const followup = new Date(nextFollowupDate);
  const diffTime = today.getTime() - followup.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysOverdue = diffDays > 0 ? diffDays : 0;

  // 3. Heuristic weights (Explainable model)
  // Weight formula:
  // Explicit Missed: 15 pts each
  // Unlogged days: 5 pts each
  // Followup overdue: 3 pts per day overdue
  // Warning symptoms: 20 pts each
  const missedPenalty = missedDosesCount * 15;
  const unloggedPenalty = unloggedDaysCount * 5;
  const followupPenalty = Math.min(daysOverdue * 3, 30);
  const symptomPenalty = warningSymptomsCount * 20;

  let totalScore = missedPenalty + unloggedPenalty + followupPenalty + symptomPenalty;
  totalScore = Math.min(Math.max(totalScore, 5), 100); // Clamped between 5 and 100

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (totalScore >= 60) {
    level = 'HIGH';
  } else if (totalScore >= 30) {
    level = 'MEDIUM';
  }

  let primaryRiskReason = "On-track with adherence and scheduled appointments.";
  if (daysOverdue > 10 && missedDosesCount >= 2) {
    primaryRiskReason = `Clinical follow-up overdue by ${daysOverdue} days with ${missedDosesCount} missed Hydroxyurea logs.`;
  } else if (daysOverdue > 7) {
    primaryRiskReason = `Overdue for health centre clinical checkup by ${daysOverdue} days.`;
  } else if (missedDosesCount >= 3) {
    primaryRiskReason = `Frequent non-adherence: ${missedDosesCount} missed doses in the past 7 days.`;
  } else if (warningSymptomsCount > 0) {
    primaryRiskReason = `Reported pre-crisis warning symptoms (joint pain/fatigue).`;
  } else if (unloggedDaysCount >= 4) {
    primaryRiskReason = `App inactive: ${unloggedDaysCount} unlogged days in the past week.`;
  }

  return {
    score: totalScore,
    level,
    missedDosesCount,
    unloggedDaysCount,
    daysOverdueFollowup: daysOverdue,
    warningSymptomsCount,
    primaryRiskReason
  };
}
