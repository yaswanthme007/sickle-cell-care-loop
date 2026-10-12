import { CardStatus, Language } from './types';

export interface SafetyInterceptResult {
  intercepted: boolean;
  reason?: 'SYMPTOM_DETECTED' | 'DOSE_MODIFICATION';
  redirectAction?: 'OPEN_SYMPTOM_CHECKER' | 'SHOW_DOSE_WARNING';
  safeResponseEn?: string;
  safeResponseHi?: string;
}

const SYMPTOM_KEYWORDS = [
  'fever', 'pain', 'chest', 'breathe', 'breathing', 'weakness', 'stroke',
  'headache', 'dizzy', 'swelling', 'vomit', 'emergency', 'hospital', 'pale',
  'बुखार', 'दर्द', 'सीने', 'सांस', 'कमजोरी', 'सिरदर्द', 'सूजन', 'बेहोश', 'अस्पताल'
];

const DOSE_CHANGE_KEYWORDS = [
  'stop medicine', 'stop hydroxyurea', 'change dose', 'increase dose',
  'reduce dose', 'double dose', 'skip medicine', 'half tablet',
  'दवा बंद', 'खुराक कम', 'खुराक बढ़ा', 'गोली बंद'
];

/**
 * Strips any potential PII (phone numbers, 10-digit numbers, card IDs, emails)
 * before any text leaves for an external LLM API.
 */
export function scrubPII(input: string): string {
  return input
    // Strip Indian phone numbers (+91, 10 digits)
    .replace(/(\+91[\-\s]?)?[6-9]\d{9}/g, '[REDACTED_PHONE]')
    // Strip Mission Card IDs like MP-SHD-101
    .replace(/[A-Z]{2}-[A-Z]{3}-\d+/gi, '[REDACTED_ID]')
    // Strip any sequence of 6+ digits (Aadhaar/Health IDs)
    .replace(/\b\d{6,12}\b/g, '[REDACTED_NUMBER]')
    // Strip email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .trim();
}

/**
 * Deterministic Safety Gate:
 * Never allow the LLM to evaluate emergency symptoms or advise medication changes.
 */
export function evaluateQuerySafety(query: string): SafetyInterceptResult {
  const lower = query.toLowerCase();

  for (const kw of SYMPTOM_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        intercepted: true,
        reason: 'SYMPTOM_DETECTED',
        redirectAction: 'OPEN_SYMPTOM_CHECKER',
        safeResponseEn:
          "Safety Rule Triggered: Because your question mentions physical symptoms (like pain, fever, or breathing), our AI does not evaluate this. Please use the rule-based Crisis Warning Sign Checker on this screen or call 108 immediately if urgent.",
        safeResponseHi:
          "सुरक्षा नियम लागू: आपके प्रश्न में शारीरिक लक्षण (जैसे दर्द, बुखार या सांस की तकलीफ) का उल्लेख है। एआई इसका निर्णय नहीं लेता है। कृपया स्क्रीन पर दिए गए 'संकट पूर्व चेतावनी जांच' (Symptom Checker) का उपयोग करें या गंभीर स्थिति में तुरंत 108 पर कॉल करें।"
      };
    }
  }

  for (const kw of DOSE_CHANGE_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        intercepted: true,
        reason: 'DOSE_MODIFICATION',
        redirectAction: 'SHOW_DOSE_WARNING',
        safeResponseEn:
          "Clinical Safety Rule: Never start, stop, or change your Hydroxyurea dose on your own. Only your medical officer at the Community Health Centre or District Hospital can adjust your dosage after checking your blood counts.",
        safeResponseHi:
          "चिकित्सीय सुरक्षा नियम: अपनी हाइड्रोक्सीयूरिया दवा की खुराक कभी भी अपने आप बंद या कम-ज्यादा न करें। केवल सरकारी अस्पताल के डॉक्टर ही आपकी खून की जांच के बाद खुराक बदल सकते हैं।"
      };
    }
  }

  return { intercepted: false };
}

/**
 * Pre-verified offline/fallback educational answers for common status & marriage questions
 * Ensures 100% reliability during live demos even without internet or API credits.
 */
export function getCuratedEducationalAnswer(
  query: string,
  status: CardStatus,
  lang: Language
): string {
  const lower = query.toLowerCase();

  // Marriage / child inheritance question
  if (
    lower.includes('marry') ||
    lower.includes('marriage') ||
    lower.includes('child') ||
    lower.includes('baby') ||
    lower.includes('शादी') ||
    lower.includes('विवाह') ||
    lower.includes('बच्चे')
  ) {
    if (status === 'HbAS') {
      return lang === 'en'
        ? "As a carrier (HbAS), you are healthy. If you marry someone with normal hemoglobin (HbAA), none of your children will have Sickle Cell Disease (0% disease risk). However, if two carriers (HbAS × HbAS) marry, there is a 1 in 4 (25%) chance in each pregnancy that the child will have Sickle Cell Disease (HbSS). Having your partner screened before marriage and visiting a genetic counselor helps you plan safely."
        : "एक वाहक (HbAS) के रूप में आप पूरी तरह स्वस्थ हैं। यदि आपका विवाह सामान्य रिपोर्ट (HbAA) वाले व्यक्ति से होता है, तो आपके किसी भी बच्चे को सिकल सेल बीमारी (HbSS) नहीं होगी। लेकिन यदि दो वाहक (HbAS × HbAS) विवाह करते हैं, तो प्रत्येक गर्भधारण में बच्चे को बीमारी होने की 25% (4 में से 1) संभावना होती है। विवाह से पहले साथी की जांच और जेनेटिक परामर्श अवश्य लें।";
    }
    if (status === 'HbSS') {
      return lang === 'en'
        ? "With HbSS, you pass one sickle gene to each child. If your partner has normal hemoglobin (HbAA), your children will be healthy carriers (HbAS) and will not have the disease. If your partner is a carrier (HbAS), there is a 50% chance per pregnancy of the child having HbSS. Partner screening and genetic counseling at your health centre are strongly advised."
        : "HbSS स्थिति में, आप अपने प्रत्येक बच्चे को एक सिकल जीन देते हैं। यदि आपके जीवनसाथी की रिपोर्ट सामान्य (HbAA) है, तो आपके सभी बच्चे स्वस्थ वाहक (HbAS) होंगे और उन्हें बीमारी नहीं होगी। विवाह से पूर्व जीवनसाथी की जांच और डॉक्टर से आनुवंशिक परामर्श अवश्य लें।";
    }
    return lang === 'en'
      ? "With normal hemoglobin (HbAA), you do not carry the sickle gene. Even if your partner is a carrier (HbAS), none of your children can develop Sickle Cell Disease (HbSS)."
      : "सामान्य हीमोग्लोबिन (HbAA) होने का अर्थ है कि आपमें सिकल जीन नहीं है। आपके किसी भी बच्चे को सिकल सेल की गंभीर बीमारी (HbSS) नहीं हो सकती।";
  }

  // Diet / Water / Daily life question
  if (
    lower.includes('water') ||
    lower.includes('food') ||
    lower.includes('diet') ||
    lower.includes('पानी') ||
    lower.includes('भोजन') ||
    lower.includes('खान')
  ) {
    return lang === 'en'
      ? "Staying well-hydrated is one of the best ways to protect your blood cells. Drink 8 to 10 glasses of clean water daily, eat nutritious home-cooked food rich in folate and iron as advised by your doctor, and avoid extreme cold or exhaustion."
      : "पर्याप्त पानी पीना रक्त कोशिकाओं को सुरक्षित रखने का सबसे अच्छा तरीका है। प्रतिदिन 8 से 10 गिलास साफ पानी पिएं, पौष्टिक घर का बना भोजन लें और अत्यधिक ठंड या थकान से बचें।";
  }

  // Default status education summary
  if (status === 'HbAS') {
    return lang === 'en'
      ? "Your HbAS card means you have Sickle Cell Trait (Carrier). You do NOT have the disease, you will not have pain crises, and you do NOT need Hydroxyurea medicine. Your main step is partner screening and genetic counseling before planning children."
      : "आपका HbAS कार्ड दर्शाता है कि आप केवल सिकल सेल के वाहक (कैरियर) हैं। आपको यह बीमारी नहीं है और आपको हाइड्रोक्सीयूरिया दवा की आवश्यकता नहीं है। बस परिवार नियोजन से पहले जीवनसाथी की जांच करवाएं।";
  }

  if (status === 'HbSS') {
    return lang === 'en'
      ? "Your HbSS card means Sickle Cell Disease. Taking your prescribed Hydroxyurea every day, drinking plenty of water, and attending regular checkups at your health centre reduce pain crises by over 80%."
      : "आपका HbSS कार्ड सिकल सेल रोग दर्शाता है। डॉक्टर द्वारा निर्धारित हाइड्रोक्सीयूरिया रोजाना लेने, भरपूर पानी पीने और समय पर जांच कराने से दर्द के दौरों को 80% से अधिक कम किया जा सकता है।";
  }

  return lang === 'en'
    ? "Your HbAA card confirms normal hemoglobin. You neither have Sickle Cell Disease nor carry the trait. No special medication or follow-up is required."
    : "आपका HbAA कार्ड सामान्य हीमोग्लोबिन की पुष्टि करता है। आपको सिकल सेल रोग नहीं है और न ही आप वाहक हैं। किसी विशेष उपचार की आवश्यकता नहीं है।";
}
