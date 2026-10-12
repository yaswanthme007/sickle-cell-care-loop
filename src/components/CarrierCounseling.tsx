'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertCircle, HelpCircle, HeartHandshake, Shield, Sparkles } from 'lucide-react';

export const CarrierCounseling: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="bg-canvas-50 border border-ochre-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
      {/* Prominent Safety Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-ochre-50 border border-ochre-200 text-ochre-950">
        <AlertCircle className="w-5 h-5 text-ochre-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">
            {language === 'en'
              ? "Important: Carriers Do NOT Need Hydroxyurea"
              : "महत्वपूर्ण: वाहक (कैरियर) को हाइड्रोक्सीयूरिया की जरूरत नहीं है"}
          </h4>
          <p className="text-xs text-ochre-900 mt-0.5 leading-relaxed">
            {language === 'en'
              ? "Hydroxyurea medication is exclusively prescribed for individuals with Sickle Cell Disease (HbSS). As an HbAS carrier, you are completely healthy and do not require daily medication logs."
              : "हाइड्रोक्सीयूरिया दवा केवल सिकल सेल बीमारी (HbSS) के मरीजों के लिए होती है। वाहक (HbAS) व्यक्ति पूरी तरह स्वस्थ होते हैं और उन्हें कोई दैनिक दवा लेने या दर्ज करने की आवश्यकता नहीं है।"}
          </p>
        </div>
      </div>

      {/* Genetic Inheritance Calculator / Visual Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-ink-950">
            {language === 'en'
              ? "Inheritance Facts (If Both Partners Are Carriers)"
              : "आनुवंशिक नियम (यदि दोनों साथी सिकल वाहक हों)"}
          </h4>
          <span className="text-[11px] font-semibold text-ochre-800 bg-ochre-100 px-2 py-0.5 rounded-full">
            HbAS × HbAS
          </span>
        </div>

        <p className="text-xs text-ink-600 mb-3">
          {language === 'en'
            ? "When two carriers plan a pregnancy, each pregnancy has independent genetic probabilities:"
            : "जब दो वाहक साथी गर्भधारण की योजना बनाते हैं, तो प्रत्येक गर्भधारण में यह स्वतंत्र संभावना होती है:"}
        </p>

        {/* 3 Outcome Probability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 text-center">
            <span className="text-xl font-black text-forest-800">25%</span>
            <p className="text-xs font-bold text-forest-950 mt-0.5">1 in 4 Chance</p>
            <p className="text-[11px] text-forest-700 mt-1">
              {language === 'en' ? "Normal Hemoglobin (HbAA)" : "सामान्य हीमोग्लोबिन (HbAA)"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-ochre-50 border border-ochre-200 text-center">
            <span className="text-xl font-black text-ochre-800">50%</span>
            <p className="text-xs font-bold text-ochre-950 mt-0.5">2 in 4 Chance</p>
            <p className="text-[11px] text-ochre-700 mt-1">
              {language === 'en' ? "Carrier Like You (HbAS)" : "आपकी तरह वाहक (HbAS)"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blood-50 border border-blood-200 text-center">
            <span className="text-xl font-black text-blood-800">25%</span>
            <p className="text-xs font-bold text-blood-950 mt-0.5">1 in 4 Chance</p>
            <p className="text-[11px] text-blood-700 mt-1">
              {language === 'en' ? "Sickle Cell Disease (HbSS)" : "सिकल सेल बीमारी (HbSS)"}
            </p>
          </div>
        </div>
      </div>

      {/* Non-directive premarital counseling referral */}
      <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-ink-700 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-xs sm:text-sm text-ink-950">
            {language === 'en'
              ? "Pre-Marital Screening & Professional Counseling"
              : "विवाह-पूर्व जांच एवं पेशेवर आनुवंशिक परामर्श"}
          </h5>
          <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
            {language === 'en'
              ? "We provide genetic facts so you can make informed choices. If you are considering marriage, encourage your partner to get a screening card at the Community Health Centre (CHC) and speak with a genetic counselor."
              : "हम आपको केवल सही आनुवंशिक तथ्य प्रदान करते हैं ताकि आप सही निर्णय ले सकें। विवाह से पूर्व अपने भावी साथी की जांच करवाएं और नजदीकी स्वास्थ्य केंद्र पर जेनेटिक काउंसलर से संपर्क करें।"}
          </p>
        </div>
      </div>
    </div>
  );
};
