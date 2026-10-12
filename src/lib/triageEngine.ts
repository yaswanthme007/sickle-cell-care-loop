import { SymptomEvaluation, TriageResult, Language } from './types';

export function evaluateSymptoms(
  symptoms: SymptomEvaluation,
  lang: Language = 'en'
): TriageResult {
  const flags: string[] = [];

  if (symptoms.strokeSigns) {
    flags.push(
      lang === 'en'
        ? "Stroke Warning: Sudden weakness, headache, or speech difficulty"
        : "स्ट्रोक चेतावनी: अचानक कमजोरी, सिरदर्द या बोलने में कठिनाई"
    );
  }

  if (symptoms.chestTightness) {
    flags.push(
      lang === 'en'
        ? "Acute Chest Syndrome Risk: Chest tightness or breathing discomfort"
        : "एक्यूट चेस्ट सिंड्रोम खतरा: सीने में दर्द या सांस लेने में परेशानी"
    );
  }

  if (symptoms.highFever) {
    flags.push(
      lang === 'en'
        ? "Urgent Infection Risk: High Fever (>101°F / 38.3°C)"
        : "गंभीर संक्रमण का खतरा: तेज बुखार (>101°F)"
    );
  }

  if (symptoms.severeAcutePain) {
    flags.push(
      lang === 'en'
        ? "Severe Vaso-Occlusive Pain Crisis"
        : "गंभीर वैसो-ओक्लूसिव दर्द संकट"
    );
  }

  const isEmergency = flags.length > 0;

  if (isEmergency) {
    return {
      severity: 'EMERGENCY',
      emergencyTitle:
        lang === 'en'
          ? "CRITICAL WARNING: IMMEDIATE HOSPITAL CARE REQUIRED"
          : "गंभीर चेतावनी: तुरंत अस्पताल जाने की आवश्यकता है",
      actionRequired:
        lang === 'en'
          ? "Call 108 Ambulance immediately or proceed to District Hospital Shahdol / Nearest CHC. Do not wait for home visits."
          : "तुरंत 108 एम्बुलेंस बुलाएं या जिला अस्पताल शहडोल / नजदीकी सामुदायिक स्वास्थ्य केंद्र जाएं। घर पर रुक कर इंतजार न करें।",
      ambulanceContact: "108",
      isEmergency: true,
      detectedFlags: flags
    };
  }

  if (symptoms.mildJointPain || symptoms.fatigue) {
    const warningFlags = [];
    if (symptoms.mildJointPain) {
      warningFlags.push(
        lang === 'en' ? "Mild joint or limb discomfort" : "हल्का जोड़ों का दर्द"
      );
    }
    if (symptoms.fatigue) {
      warningFlags.push(
        lang === 'en' ? "Noticeable fatigue / weakness" : "अत्यधिक थकान या कमजोरी"
      );
    }

    return {
      severity: 'WARNING',
      emergencyTitle:
        lang === 'en'
          ? "Pre-Crisis Warning: Rest & Hydrate"
          : "पूर्व-संकट चेतावनी: आराम करें और पानी पिएं",
      actionRequired:
        lang === 'en'
          ? "Drink 3 to 4 glasses of clean water immediately. Rest in a warm environment. If pain intensifies within 2 hours, notify your ASHA and visit the clinic."
          : "तुरंत 3 से 4 गिलास साफ पानी पिएं। गर्म जगह पर आराम करें। यदि 2 घंटे में दर्द बढ़ता है, तो तुरंत आशा दीदी को बताएं और अस्पताल जाएं।",
      ambulanceContact: "108",
      isEmergency: false,
      detectedFlags: warningFlags
    };
  }

  return {
    severity: 'NORMAL',
    emergencyTitle:
      lang === 'en' ? "Stable: No Acute Symptoms" : "स्थिर: कोई गंभीर लक्षण नहीं",
    actionRequired:
      lang === 'en'
        ? "Continue daily hydration and regular prescribed Hydroxyurea as scheduled."
        : "नियमित रूप से भरपूर पानी पिएं और डॉक्टर द्वारा दी गई हाइड्रोक्सीयूरिया समय पर लें।",
    ambulanceContact: "108",
    isEmergency: false,
    detectedFlags: []
  };
}
