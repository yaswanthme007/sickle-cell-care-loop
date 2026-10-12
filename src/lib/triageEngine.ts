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

  if (symptoms.splenicEnlargementSigns) {
    flags.push(
      lang === 'en'
        ? "Acute Splenic Sequestration Risk: Sudden pale palms/lips or swollen left upper abdomen"
        : "तिल्ली (स्प्लीन) बढ़ना / गंभीर एनीमिया खतरा: अचानक हथेलियां सफेद पड़ना या बाईं तरफ पेट फूलना"
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
          ? "Call 108 Ambulance immediately or proceed to District Hospital Shahdol / Nearest CHC. Show your 2 AM Emergency Handover Pass to the casualty doctor."
          : "तुरंत 108 एम्बुलेंस बुलाएं या जिला अस्पताल शहडोल / नजदीकी सामुदायिक स्वास्थ्य केंद्र जाएं। आपातकालीन डॉक्टर को अपना हैंडओवर पास दिखाएं।",
      ambulanceContact: "108",
      isEmergency: true,
      detectedFlags: flags
    };
  }

  if (symptoms.mildJointPain || symptoms.fatigue || symptoms.darkUrineOrJaundice) {
    const warningFlags = [];
    if (symptoms.mildJointPain) {
      warningFlags.push(
        lang === 'en' ? "Mild joint or limb discomfort (Early VOC prodrome)" : "हल्का जोड़ों का दर्द (संकट के शुरुआती लक्षण)"
      );
    }
    if (symptoms.fatigue) {
      warningFlags.push(
        lang === 'en' ? "Noticeable fatigue / weakness" : "अत्यधिक थकान या कमजोरी"
      );
    }
    if (symptoms.darkUrineOrJaundice) {
      warningFlags.push(
        lang === 'en'
          ? "Dark cola-colored urine or yellow eyes (Dehydration / Hemolysis warning)"
          : "गहरे रंग का पेशाब या आंखों में पीलापन (पानी की कमी / हीमोलिसिस चेतावनी)"
      );
    }

    return {
      severity: 'WARNING',
      emergencyTitle:
        lang === 'en'
          ? "Pre-Crisis Prodrome Warning: Hydrate & Rest Immediately"
          : "पूर्व-संकट चेतावनी: तुरंत पानी पिएं और आराम करें",
      actionRequired:
        lang === 'en'
          ? "Drink 3 to 4 glasses of clean water (or ORS) immediately. Rest in a warm room. If pain intensifies or fever develops within 2 hours, notify your ASHA and visit the CHC."
          : "तुरंत 3 से 4 गिलास साफ पानी या ओआरएस (ORS) पिएं। गर्म कमरे में आराम करें। यदि 2 घंटे में दर्द बढ़ता है या बुखार आता है, तो आशा दीदी को बताएं और अस्पताल जाएं।",
      ambulanceContact: "108",
      isEmergency: false,
      detectedFlags: warningFlags
    };
  }

  return {
    severity: 'NORMAL',
    emergencyTitle:
      lang === 'en' ? "Stable: No Acute Crisis Signs" : "स्थिर: कोई गंभीर लक्षण नहीं",
    actionRequired:
      lang === 'en'
        ? "Continue daily hydration (8+ glasses) and regular prescribed Hydroxyurea as scheduled."
        : "नियमित रूप से भरपूर पानी (8+ गिलास) पिएं और डॉक्टर द्वारा दी गई हाइड्रोक्सीयूरिया समय पर लें।",
    ambulanceContact: "108",
    isEmergency: false,
    detectedFlags: []
  };
}
