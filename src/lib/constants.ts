import { CardStatus, Language, StatusContent, PatientProfile, HomeVisitRecord } from './types';

export const STATUS_EXPLANATIONS: Record<CardStatus, Record<Language, StatusContent>> = {
  HbAA: {
    en: {
      title: "HbAA — Normal Hemoglobin",
      tagline: "Healthy Blood Cells • Non-Carrier",
      description: "Your screening card indicates standard red blood cells (HbAA). You do not carry the sickle cell gene alteration.",
      healthMeaning: "Your body produces normal disc-shaped red blood cells that move smoothly through blood vessels. You do not have sickle cell anemia and will not experience sickling pain crises.",
      marriageGuidance: "You do not carry the sickle cell trait. Regardless of your partner's status, your biological children cannot develop Sickle Cell Disease (HbSS), though they may inherit carrier status if your partner is a carrier.",
      actionItems: [
        "No medical treatments or medications needed for sickle cell.",
        "Maintain routine balanced nutrition and general health checks.",
        "Keep your card safe as part of your family medical record."
      ],
      audioScript: "Your screening card shows HbAA, which means normal hemoglobin. You do not have sickle cell disease and you are not a carrier. Your red blood cells flow normally. No special treatment is needed."
    },
    hi: {
      title: "HbAA — सामान्य हीमोग्लोबिन (सामान्य स्थिति)",
      tagline: "स्वस्थ रक्त कोशिकाएं • सामान्य जांच परिणाम",
      description: "आपकी जांच रिपोर्ट सामान्य है (HbAA)। आपके रक्त में सिकल सेल का कोई जीन या लक्षण नहीं है।",
      healthMeaning: "आपके शरीर में सामान्य गोल रक्त कोशिकाएं बनती हैं जो रक्त वाहिकाओं में आसानी से बहती हैं। आपको सिकल सेल बीमारी नहीं है और न ही दर्द का कोई दौरा पड़ेगा।",
      marriageGuidance: "आप सिकल सेल के वाहक (कैरियर) नहीं हैं। आपके बच्चे को सिकल सेल की गंभीर बीमारी (HbSS) नहीं हो सकती, भले ही आपके जीवनसाथी का स्टेटस कुछ भी हो।",
      actionItems: [
        "सिकल सेल के लिए किसी दवाई या उपचार की आवश्यकता नहीं है।",
        "संतुलित आहार लें और सामान्य स्वास्थ्य का ध्यान रखें।",
        "जांच कार्ड को अपने परिवार के स्वास्थ्य रिकॉर्ड में संभाल कर रखें।"
      ],
      audioScript: "आपका जांच कार्ड HbAA दर्शाता है, यानी सामान्य हीमोग्लोबिन। आपको सिकल सेल की बीमारी नहीं है और आप वाहक भी नहीं हैं। आपको किसी विशेष दवा की आवश्यकता नहीं है।"
    }
  },
  HbAS: {
    en: {
      title: "HbAS — Sickle Cell Trait (Carrier)",
      tagline: "Carrier Status • Not a Disease • Healthy Individual",
      description: "You carry one copy of the sickle cell gene and one normal gene. You are a carrier, which is NOT the same as having Sickle Cell Disease.",
      healthMeaning: "Carriers live normal, active, healthy lives without pain crises. You do NOT need Hydroxyurea or blood transfusions. However, understanding your genetic inheritance is essential when planning a family.",
      marriageGuidance: "Inheritance Fact: If two carriers (HbAS × HbAS) have a child together, there is a 25% (1 in 4) chance with each pregnancy that the child inherits Sickle Cell Disease (HbSS), a 50% chance of being a carrier (HbAS), and a 25% chance of being normal (HbAA).",
      actionItems: [
        "Do NOT take Hydroxyurea — this medication is only for diagnosed disease (HbSS).",
        "Consult a certified genetic counselor or primary health centre before marriage/family planning.",
        "Encourage your prospective partner to get screened at the nearest Community Health Centre.",
        "Stay hydrated during intense endurance exercise or high-altitude travel."
      ],
      audioScript: "Your status is HbAS, which means you are a carrier. You are completely healthy and you do not have the disease. You do not need Hydroxyurea medicine. If two carriers marry, there is a 1 in 4 chance that their child may have the disease. Please consult a genetic counselor at your health center before marriage."
    },
    hi: {
      title: "HbAS — सिकल सेल लक्षण (कैरियर / वाहक)",
      tagline: "आप केवल वाहक हैं • यह बीमारी नहीं है • आप पूर्णतः स्वस्थ हैं",
      description: "आपके पास एक सामान्य जीन और एक सिकल जीन है। आप 'कैरियर' (वाहक) हैं। वाहक होना सिकल सेल बीमारी होना नहीं है।",
      healthMeaning: "कैरियर व्यक्ति सामान्य और स्वस्थ जीवन जीते हैं। आपको दर्द के दौरे नहीं पड़ते। आपको हाइड्रोक्सीयूरिया (Hydroxyurea) या रक्त चढ़ाने की कोई आवश्यकता नहीं है।",
      marriageGuidance: "आनुवंशिक नियम: यदि दो सिकल वाहक (HbAS और HbAS) आपस में विवाह करते हैं, तो प्रत्येक गर्भधारण में बच्चे को गंभीर सिकल सेल रोग (HbSS) होने की 25% (4 में से 1) संभावना होती है।",
      actionItems: [
        "हाइड्रोक्सीयूरिया दवा बिल्कुल न लें — यह केवल HbSS बीमारी के मरीजों के लिए होती है।",
        "विवाह या परिवार नियोजन से पहले नजदीकी स्वास्थ्य केंद्र में जेनेटिक काउंसलिंग (परामर्श) लें।",
        "अपने भावी जीवनसाथी की सिकल सेल जांच अवश्य करवाएं।",
        "अत्यधिक थकाने वाले व्यायाम या निर्जलीकरण (पानी की कमी) से बचें।"
      ],
      audioScript: "आपकी जांच रिपोर्ट HbAS है, यानी आप सिकल सेल के वाहक या कैरियर हैं। आप पूरी तरह स्वस्थ हैं और आपको बीमारी नहीं है। आपको हाइड्रोक्सीयूरिया दवा की जरूरत नहीं है। विवाह से पहले अपने स्वास्थ्य केंद्र पर जेनेटिक परामर्श लें।"
    }
  },
  HbSS: {
    en: {
      title: "HbSS — Sickle Cell Disease",
      tagline: "Active Condition • Continuous Care & Protection Required",
      description: "You have inherited the sickle cell gene from both parents. Red blood cells can stiffen into a crescent shape under stress, causing anemia and pain.",
      healthMeaning: "With regular medical care, daily prescribed Hydroxyurea, plenty of water, and early symptom monitoring, people with HbSS can lead full and active lives. Regular clinical checkups protect your organs.",
      marriageGuidance: "All of your biological children will inherit at least one sickle gene from you. Pre-marital counseling and partner screening are strongly advised to understand genetic risks for your future children.",
      actionItems: [
        "Take prescribed Hydroxyurea daily at the exact dosage instructed by your doctor.",
        "Never start, stop, or adjust medication doses on your own — always consult your medical officer.",
        "Drink plenty of clean water every day to prevent red blood cells from clumping.",
        "Watch for warning signs: chest tightness, high fever (>101°F), sudden weakness, or severe pain require immediate medical evaluation (Call 108)."
      ],
      audioScript: "Your card shows HbSS, which means Sickle Cell Disease. With daily prescribed Hydroxyurea and plenty of water, you can stay healthy. Never change your medicine dose on your own. If you have fever, chest pain, or sudden weakness, go to the hospital or call 108 immediately."
    },
    hi: {
      title: "HbSS — सिकल सेल रोग (बीमारी)",
      tagline: "नियमित देखभाल और सुरक्षित जीवन चक्र की आवश्यकता",
      description: "आपको माता-पिता दोनों से सिकल जीन मिला है। तनाव या पानी की कमी से रक्त कोशिकाएं हंसिया (सिकल) के आकार की हो सकती हैं, जिससे खून की कमी और दर्द होता है।",
      healthMeaning: "नियमित चिकित्सीय देखरेख, डॉक्टर द्वारा दी गई हाइड्रोक्सीयूरिया (Hydroxyurea) की दैनिक खुराक, पर्याप्त पानी पीने और समय पर जांच से आप सामान्य और सक्रिय जीवन जी सकते हैं।",
      marriageGuidance: "आपके बच्चों में आपसे एक सिकल जीन अवश्य जाएगा। परिवार नियोजन और विवाह से पहले स्वास्थ्य केंद्र पर जेनेटिक काउंसलिंग अवश्य लें।",
      actionItems: [
        "डॉक्टर द्वारा निर्धारित हाइड्रोक्सीयूरिया की सही खुराक रोजाना नियमित रूप से लें।",
        "दवा को अपने आप कभी बंद या कम-ज्यादा न करें — हमेशा डॉक्टर की सलाह लें।",
        "प्रतिदिन भरपूर पानी पिएं ताकि खून का बहाव सुचारू रहे।",
        "चेतावनी के लक्षण: सीने में दर्द, तेज बुखार (>101°F), अचानक कमजोरी या तेज दर्द होने पर तुरंत अस्पताल जाएं या 108 पर कॉल करें।"
      ],
      audioScript: "आपकी रिपोर्ट HbSS है, यानी सिकल सेल रोग। डॉक्टर की दी गई हाइड्रोक्सीयूरिया रोजाना लेने और भरपूर पानी पीने से आप स्वस्थ रह सकते हैं। अपनी दवा कभी खुद न बदलें। तेज बुखार या सीने में दर्द होने पर तुरंत 108 पर कॉल करें या अस्पताल जाएं।"
    }
  }
};

export const SYNTHETIC_PATIENTS: PatientProfile[] = [
  {
    id: "MP-SHD-101",
    name: "Ramesh Kol",
    age: 11,
    isMinor: true,
    guardianName: "Sunita Kol (Mother)",
    status: "HbSS",
    village: "Burhar",
    district: "Shahdol, MP",
    phone: "+91 98260 XXXXX",
    ashaAssigned: "Kavita Devi (ASHA)",
    nextFollowupDate: "2026-09-28", // Overdue by 7 days
    lastClinicVisit: "2026-08-25",
    currentDoseMg: 500
  },
  {
    id: "MP-SHD-102",
    name: "Pooja Baiga",
    age: 24,
    isMinor: false,
    status: "HbAS",
    village: "Jaisinghnagar",
    district: "Shahdol, MP",
    phone: "+91 97520 XXXXX",
    ashaAssigned: "Kavita Devi (ASHA)",
    nextFollowupDate: "2026-10-20",
    lastClinicVisit: "2026-09-15"
  },
  {
    id: "MP-SHD-103",
    name: "Arjun Gond",
    age: 16,
    isMinor: true,
    guardianName: "Mangal Gond (Father)",
    status: "HbSS",
    village: "Sohagpur",
    district: "Shahdol, MP",
    phone: "+91 94250 XXXXX",
    ashaAssigned: "Radha Yadav (ASHA)",
    nextFollowupDate: "2026-09-20", // Overdue by 15 days
    lastClinicVisit: "2026-08-10",
    currentDoseMg: 750
  },
  {
    id: "MP-SHD-104",
    name: "Geeta Maravi",
    age: 19,
    isMinor: false,
    status: "HbSS",
    village: "Burhar",
    district: "Shahdol, MP",
    phone: "+91 98930 XXXXX",
    ashaAssigned: "Kavita Devi (ASHA)",
    nextFollowupDate: "2026-10-12",
    lastClinicVisit: "2026-09-28",
    currentDoseMg: 500
  },
  {
    id: "MP-SHD-105",
    name: "Vikram Dhurve",
    age: 28,
    isMinor: false,
    status: "HbAA",
    village: "Jaisinghnagar",
    district: "Shahdol, MP",
    phone: "+91 99770 XXXXX",
    ashaAssigned: "Radha Yadav (ASHA)",
    nextFollowupDate: "2027-01-15",
    lastClinicVisit: "2026-09-02"
  }
];

export const SYNTHETIC_VISITS: HomeVisitRecord[] = [
  {
    id: "VISIT-01",
    patientId: "MP-SHD-103",
    patientName: "Arjun Gond",
    ashaName: "Radha Yadav",
    riskLevel: "HIGH",
    reason: "15 days overdue for clinical follow-up + 4 missed Hydroxyurea logs",
    status: "PENDING"
  },
  {
    id: "VISIT-02",
    patientId: "MP-SHD-101",
    patientName: "Ramesh Kol",
    ashaName: "Kavita Devi",
    riskLevel: "HIGH",
    reason: "Reported minor joint pain & 3 unlogged days this week",
    status: "PENDING"
  }
];
