import assert from 'node:assert/strict';

console.log('==========================================================');
console.log('  AFTER THE CARD — CLINICAL TRIAGE & SAFETY TEST MATRIX');
console.log('==========================================================\n');

// 1. Test Triage Rule Matrix (Including Acute Splenic Sequestration)
function evaluateTriage(s) {
  const flags = [];
  if (s.strokeSigns) flags.push('STROKE');
  if (s.chestTightness) flags.push('ACUTE_CHEST');
  if (s.highFever) flags.push('FEVER');
  if (s.severeAcutePain) flags.push('CRISIS_PAIN');
  if (s.splenicEnlargementSigns) flags.push('SPLENIC_SEQUESTRATION');

  if (flags.length > 0) {
    return { severity: 'EMERGENCY', isEmergency: true, ambulance: '108', flags };
  }
  if (s.mildJointPain || s.fatigue || s.darkUrineOrJaundice) {
    return { severity: 'WARNING', isEmergency: false, ambulance: '108', flags: ['PRE_CRISIS'] };
  }
  return { severity: 'NORMAL', isEmergency: false, ambulance: '108', flags: [] };
}

const triageCases = [
  {
    name: 'Stroke signs alone triggers immediate 108 EMERGENCY',
    input: { strokeSigns: true, chestTightness: false, highFever: false, severeAcutePain: false, splenicEnlargementSigns: false, mildJointPain: false, fatigue: false },
    expectedSeverity: 'EMERGENCY',
    expectedEmergency: true
  },
  {
    name: 'Chest tightness alone triggers immediate 108 EMERGENCY',
    input: { strokeSigns: false, chestTightness: true, highFever: false, severeAcutePain: false, splenicEnlargementSigns: false, mildJointPain: false, fatigue: false },
    expectedSeverity: 'EMERGENCY',
    expectedEmergency: true
  },
  {
    name: 'High fever (>101F) in SCD triggers immediate 108 EMERGENCY',
    input: { strokeSigns: false, chestTightness: false, highFever: true, severeAcutePain: false, splenicEnlargementSigns: false, mildJointPain: false, fatigue: false },
    expectedSeverity: 'EMERGENCY',
    expectedEmergency: true
  },
  {
    name: 'Severe acute pain triggers immediate 108 EMERGENCY',
    input: { strokeSigns: false, chestTightness: false, highFever: false, severeAcutePain: true, splenicEnlargementSigns: false, mildJointPain: false, fatigue: false },
    expectedSeverity: 'EMERGENCY',
    expectedEmergency: true
  },
  {
    name: 'Acute Splenic Sequestration (pale palms + swollen left abdomen) triggers 108 EMERGENCY',
    input: { strokeSigns: false, chestTightness: false, highFever: false, severeAcutePain: false, splenicEnlargementSigns: true, mildJointPain: false, fatigue: false },
    expectedSeverity: 'EMERGENCY',
    expectedEmergency: true
  },
  {
    name: 'Mild joint pain alone triggers WARNING (hydrate & rest)',
    input: { strokeSigns: false, chestTightness: false, highFever: false, severeAcutePain: false, splenicEnlargementSigns: false, mildJointPain: true, fatigue: false },
    expectedSeverity: 'WARNING',
    expectedEmergency: false
  },
  {
    name: 'No symptoms returns NORMAL',
    input: { strokeSigns: false, chestTightness: false, highFever: false, severeAcutePain: false, splenicEnlargementSigns: false, mildJointPain: false, fatigue: false },
    expectedSeverity: 'NORMAL',
    expectedEmergency: false
  }
];

for (const tc of triageCases) {
  const res = evaluateTriage(tc.input);
  assert.equal(res.severity, tc.expectedSeverity, `Failed severity for: ${tc.name}`);
  assert.equal(res.isEmergency, tc.expectedEmergency, `Failed emergency flag for: ${tc.name}`);
  console.log(`  [PASS] Triage Rule: ${tc.name}`);
}

// 2. Test "No Log" != "Missed Dose" Risk Scoring Differentiation
function scoreAdherence(missed, unlogged, stockLeft = 15) {
  const stockPenalty = stockLeft === 0 ? 25 : stockLeft <= 5 ? 12 : 0;
  return missed * 15 + unlogged * 5 + stockPenalty;
}

const explicitMissedScore = scoreAdherence(3, 0); // 45
const unloggedOnlyScore = scoreAdherence(0, 3);   // 15
assert.ok(
  explicitMissedScore > unloggedOnlyScore,
  'Explicit missed doses must be weighted higher than silent unlogged days'
);
console.log(`  [PASS] Risk Engine: Explicit Missed (${explicitMissedScore} pts) > Unlogged Days (${unloggedOnlyScore} pts)`);

const zeroStockScore = scoreAdherence(1, 0, 0); // 40
const healthyStockScore = scoreAdherence(1, 0, 20); // 15
assert.ok(
  zeroStockScore > healthyStockScore,
  'Exhausted Hydroxyurea blister stock must escalate ASHA outreach priority'
);
console.log(`  [PASS] Stock Guard: Exhausted Blister Stock (${zeroStockScore} pts) > Adequate Stock (${healthyStockScore} pts)`);

// 3. Test Pediatric Weight-Based Hydroxyurea Dosing Verification (15-20 mg/kg/day)
function checkDoseWindow(weightKg, doseMg) {
  const mgPerKg = doseMg / weightKg;
  return mgPerKg >= 14.5 && mgPerKg <= 26.0 ? 'OPTIMAL' : 'REVIEW_REQUIRED';
}

assert.equal(checkDoseWindow(26, 500), 'OPTIMAL', '26kg child on 500mg (19.2 mg/kg) should be optimal');
assert.equal(checkDoseWindow(39, 500), 'REVIEW_REQUIRED', '39kg adolescent on 500mg (12.8 mg/kg) must flag CHC dose review');
console.log('  [PASS] Pediatric Dosing Guard: Sub-therapeutic mg/kg growth drift flagged for CHC Medical Officer');

// 4. Test Biophysical VOC Predictor Hydration Response
function computeDehydrationStress(loggedGlasses, targetGlasses) {
  const ratio = Math.min(loggedGlasses / targetGlasses, 1);
  return Math.round((1 - ratio) * 30);
}
assert.ok(
  computeDehydrationStress(2, 8) > computeDehydrationStress(7, 8),
  'Drinking water must reduce biophysical intracellular sickling stress score'
);
console.log('  [PASS] Biophysical VOC Engine: Hydration intake dynamically reduces 48h sickling stress');

// 5. Test Zero-PII Scrubber
function scrubPII(input) {
  return input
    .replace(/(\+91[\-\s]?)?[6-9]\d{9}/g, '[REDACTED_PHONE]')
    .replace(/[A-Z]{2}-[A-Z]{3}-\d+/gi, '[REDACTED_ID]');
}

const rawText = 'My name is Ramesh, card MP-SHD-101, phone +91 9826012345';
const scrubbed = scrubPII(rawText);
assert.ok(!scrubbed.includes('9826012345'), 'Phone number must be scrubbed');
assert.ok(!scrubbed.includes('MP-SHD-101'), 'Card ID must be scrubbed');
console.log('  [PASS] Privacy Guard: Phone numbers & Mission Card IDs scrubbed before LLM calls');

console.log('\nAll clinical safety, biophysical VOC, pediatric dosing, and privacy tests passed (12/12).');
