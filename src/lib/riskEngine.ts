import { AdherenceDay, RiskBreakdown } from './types';

export function calculateHeuristicRiskScore(params: {
  adherenceHistory: AdherenceDay[];
  nextFollowupDate: string; // ISO date YYYY-MM-DD
  warningSymptomsCount?: number;
  remainingPillsStock?: number;
  hydrationLoggedToday?: number;
  hydrationTargetGlasses?: number;
}): RiskBreakdown {
  const {
    adherenceHistory,
    nextFollowupDate,
    warningSymptomsCount = 0,
    remainingPillsStock,
    hydrationLoggedToday,
    hydrationTargetGlasses = 8
  } = params;

  // 1. Count explicit missed vs unlogged in recent 7 days
  let missedDosesCount = 0;
  let unloggedDaysCount = 0;

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

  // 3. Medication blister stock penalty (if HbSS patient has <= 5 days of pills left)
  let lowStockPenalty = 0;
  if (typeof remainingPillsStock === 'number') {
    if (remainingPillsStock === 0) {
      lowStockPenalty = 25;
    } else if (remainingPillsStock <= 5) {
      lowStockPenalty = 12;
    }
  }

  // 4. Dehydration flag
  const dehydrationFlag =
    typeof hydrationLoggedToday === 'number' &&
    hydrationLoggedToday < Math.ceil(hydrationTargetGlasses * 0.5);
  const dehydrationPenalty = dehydrationFlag ? 8 : 0;

  // 5. Heuristic weights (Explainable model)
  const missedPenalty = missedDosesCount * 15;
  const unloggedPenalty = unloggedDaysCount * 5;
  const followupPenalty = Math.min(daysOverdue * 3, 30);
  const symptomPenalty = warningSymptomsCount * 20;

  let totalScore =
    missedPenalty +
    unloggedPenalty +
    followupPenalty +
    symptomPenalty +
    lowStockPenalty +
    dehydrationPenalty;
  totalScore = Math.min(Math.max(totalScore, 5), 100); // Clamped between 5 and 100

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (totalScore >= 60) {
    level = 'HIGH';
  } else if (totalScore >= 30) {
    level = 'MEDIUM';
  }

  let primaryRiskReason = "On-track with adherence, stock, and scheduled appointments.";
  if (typeof remainingPillsStock === 'number' && remainingPillsStock === 0) {
    primaryRiskReason = `Stock exhausted (0 Hydroxyurea tablets left) + ${missedDosesCount} missed doses and ${daysOverdue}d overdue follow-up.`;
  } else if (daysOverdue > 10 && missedDosesCount >= 2) {
    primaryRiskReason = `Clinical follow-up overdue by ${daysOverdue} days with ${missedDosesCount} missed Hydroxyurea logs.`;
  } else if (typeof remainingPillsStock === 'number' && remainingPillsStock <= 5 && missedDosesCount >= 1) {
    primaryRiskReason = `Low medicine stock (${remainingPillsStock} days left) + ${missedDosesCount} missed doses & ${daysOverdue}d overdue checkup.`;
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
    lowStockPenalty,
    dehydrationFlag,
    primaryRiskReason
  };
}
