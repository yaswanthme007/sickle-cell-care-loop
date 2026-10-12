import {
  EnvironmentalData,
  PatientProfile,
  VocPredictionResult
} from './types';

/**
 * Biophysical Vaso-Occlusive Crisis (VOC) 48-Hour Early-Warning Engine
 *
 * Models the four key physiological drivers of HbS polymerization in microvascular beds:
 * 1. Thermal Stress & Diurnal Swing (Heat-induced insensible fluid loss or cold-induced vasoconstriction)
 * 2. Cellular Dehydration (Increased MCHC shortens HbS delay time exponentially)
 * 3. Hydroxyurea Adherence & Protective Fetal Hemoglobin (HbF%)
 * 4. Prodromal Micro-vascular Symptoms
 */
export function computeVocBiophysicalPrediction(
  patient: PatientProfile,
  env: EnvironmentalData
): VocPredictionResult {
  // 1. Thermal Stress Contribution (Max 25 pts)
  let thermalStress = 5;
  if (env.heatIndexC >= 37 || env.temperatureC >= 36) {
    thermalStress = 22; // High evaporative dehydration risk in MP tribal belt
  } else if (env.temperatureC <= 17 || env.diurnalSwingC >= 12) {
    thermalStress = 20; // Peripheral vasoconstriction slows capillary transit time
  } else if (env.heatIndexC >= 33 || env.diurnalSwingC >= 9) {
    thermalStress = 12;
  }

  // 2. Hydration / Cellular MCHC Contribution (Max 30 pts)
  const target = Math.max(patient.hydrationTargetGlasses || 8, 4);
  const logged = patient.hydrationLoggedToday || 0;
  const hydrationRatio = Math.min(logged / target, 1);
  const dehydrationContribution = Math.round((1 - hydrationRatio) * 30);

  // 3. Hydroxyurea Adherence & HbF% Protection Contribution (Max 25 pts)
  const recent7 = patient.adherenceHistory.slice(-7);
  const missedCount = recent7.filter((d) => d.status === 'MISSED').length;
  const unloggedCount = recent7.filter((d) => d.status === 'UNLOGGED').length;
  const hbF = patient.labProfile?.hbF ?? 15.0;

  let adherenceHbFContribution = missedCount * 6 + unloggedCount * 2;
  // Protective HbF bonus: HbF > 20% strongly inhibits HbS polymerization
  if (hbF >= 20) {
    adherenceHbFContribution = Math.max(0, adherenceHbFContribution - 8);
  } else if (hbF < 12) {
    adherenceHbFContribution += 8;
  }
  adherenceHbFContribution = Math.min(adherenceHbFContribution, 25);

  // 4. Prodromal Micro-Symptom Contribution (Max 20 pts)
  const symptomProdromeContribution = Math.min(
    (patient.activeWarningCount || 0) * 12,
    20
  );

  const vocRiskScore = Math.min(
    Math.max(
      thermalStress +
        dehydrationContribution +
        adherenceHbFContribution +
        symptomProdromeContribution,
      6
    ),
    98
  );

  let riskBand: 'LOW_PROTECTED' | 'MODERATE_VIGILANCE' | 'HIGH_PRODROME' =
    'LOW_PROTECTED';
  if (vocRiskScore >= 60) {
    riskBand = 'HIGH_PRODROME';
  } else if (vocRiskScore >= 32) {
    riskBand = 'MODERATE_VIGILANCE';
  }

  const glassesRemaining = Math.max(0, target - logged);

  const headlineEn =
    riskBand === 'HIGH_PRODROME'
      ? `Elevated 48h Crisis Risk (${vocRiskScore}/100) — Immediate Hydration & Thermal Protection Needed`
      : riskBand === 'MODERATE_VIGILANCE'
      ? `Moderate 48h Sickling Stress (${vocRiskScore}/100) — Drink ${glassesRemaining} More Glasses Today`
      : `Low 48h Crisis Risk (${vocRiskScore}/100) — Cells Well-Hydrated & Protected`;

  const headlineHi =
    riskBand === 'HIGH_PRODROME'
      ? `अगले 48 घंटों में दर्द संकट का उच्च जोखिम (${vocRiskScore}/100) — तुरंत पानी और बचाव आवश्यक`
      : riskBand === 'MODERATE_VIGILANCE'
      ? `मध्यम सिकलिंग तनाव (${vocRiskScore}/100) — आज ${glassesRemaining} गिलास पानी और पिएं`
      : `कम संकट जोखिम (${vocRiskScore}/100) — रक्त कोशिकाएं सुरक्षित और हाइड्रेटेड हैं`;

  const explanationEn = `Shahdol ambient temp is ${env.temperatureC.toFixed(
    1
  )}°C (${env.diurnalSwingC.toFixed(
    1
  )}°C day-night swing). With ${logged}/${target} glasses of water logged today, ${missedCount} missed Hydroxyurea doses, and protective HbF at ${hbF.toFixed(
    1
  )}%, microvascular sickling stress is ${
    riskBand === 'HIGH_PRODROME'
      ? 'high'
      : riskBand === 'MODERATE_VIGILANCE'
      ? 'moderate'
      : 'well-controlled'
  }.`;

  const explanationHi = `शहडोल का तापमान ${env.temperatureC.toFixed(
    1
  )}°C है (दिन-रात का अंतर ${env.diurnalSwingC.toFixed(
    1
  )}°C)। आज ${logged}/${target} गिलास पानी, ${missedCount} छूटी हुई दवा और ${hbF.toFixed(
    1
  )}% सुरक्षात्मक HbF के आधार पर रक्त कोशिकाओं पर तनाव ${
    riskBand === 'HIGH_PRODROME'
      ? 'अधिक है'
      : riskBand === 'MODERATE_VIGILANCE'
      ? 'मध्यम है'
      : 'नियंत्रण में है'
  }।`;

  const preventativeActionsEn: string[] = [];
  const preventativeActionsHi: string[] = [];

  if (glassesRemaining > 0) {
    preventativeActionsEn.push(
      `Drink 2 glasses of clean water right now (${glassesRemaining} glasses left to hit today's ${target}-glass anti-sickling target).`
    );
    preventativeActionsHi.push(
      `अभी तुरंत 2 गिलास साफ पानी पिएं (आज के ${target} गिलास लक्ष्य के लिए ${glassesRemaining} गिलास बाकी हैं)।`
    );
  }

  if (env.temperatureC >= 34) {
    preventativeActionsEn.push(
      `High heat alert (${env.temperatureC.toFixed(
        1
      )}°C): Avoid midday outdoor sun (12 PM – 4 PM) and take 1 glass of ORS to prevent red cell dehydration.`
    );
    preventativeActionsHi.push(
      `तेज गर्मी चेतावनी (${env.temperatureC.toFixed(
        1
      )}°C): दोपहर 12 से 4 बजे धूप में न निकलें और कोशिकाओं को सूखने से बचाने के लिए 1 गिलास ORS लें।`
    );
  } else if (env.diurnalSwingC >= 10 || env.temperatureC <= 20) {
    preventativeActionsEn.push(
      `Day-to-night temperature drop (${env.diurnalSwingC.toFixed(
        1
      )}°C swing): Wear warm layers in the evening/morning so blood vessels don't constrict.`
    );
    preventativeActionsHi.push(
      `दिन-रात के तापमान में ${env.diurnalSwingC.toFixed(
        1
      )}°C का अंतर: शाम और सुबह गर्म कपड़े पहनें ताकि ठंड से नसें न सिकुड़ें।`
    );
  }

  if (missedCount > 0) {
    preventativeActionsEn.push(
      `Take today's ${patient.currentDoseMg || 500}mg Hydroxyurea dose on time to keep protective Fetal Hemoglobin (HbF: ${hbF}%) elevated.`
    );
    preventativeActionsHi.push(
      `सुरक्षात्मक फीटल हीमोग्लोबिन (HbF: ${hbF}%) बनाए रखने के लिए आज की ${patient.currentDoseMg || 500}mg हाइड्रोक्सीयूरिया समय पर लें।`
    );
  }

  return {
    vocRiskScore,
    riskBand,
    thermalStressContribution: thermalStress,
    dehydrationContribution,
    adherenceHbFContribution,
    symptomProdromeContribution,
    headlineEn,
    headlineHi,
    explanationEn,
    explanationHi,
    preventativeActionsEn,
    preventativeActionsHi
  };
}
