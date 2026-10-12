'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CardStatus } from '@/lib/types';
import {
  AlertCircle,
  HeartHandshake,
  Volume2,
  Ticket,
  CheckCircle2,
  Users
} from 'lucide-react';

type PartnerChoice = CardStatus | 'UNSCREENED';

export const CarrierCounseling: React.FC = () => {
  const {
    language,
    currentPatient,
    playSpeech,
    issueReferralTicket
  } = useApp();

  const [partnerStatus, setPartnerStatus] = useState<PartnerChoice>('HbAS');
  const [voucherIssued, setVoucherIssued] = useState<boolean>(false);

  // Calculate Punnett outcomes for HbAS (User) x Partner
  const getInheritanceOutcomes = (partner: PartnerChoice) => {
    if (partner === 'HbAA') {
      return {
        normalPct: 50,
        carrierPct: 50,
        diseasePct: 0,
        summaryEn:
          'Safe Reassurance (0% Disease Risk): When an HbAS carrier marries an HbAA (Normal Green Card) partner, NO child will ever develop Sickle Cell Disease (HbSS). Each pregnancy has a 50% chance of HbAA (Normal) and 50% chance of HbAS (Healthy Carrier).',
        summaryHi:
          'पूर्ण सुरक्षा (0% बीमारी जोखिम): जब एक HbAS वाहक का विवाह HbAA (सामान्य हरा कार्ड) साथी से होता है, तो किसी भी बच्चे को सिकल सेल बीमारी (HbSS) नहीं होगी। 50% सामान्य (HbAA) और 50% स्वस्थ वाहक (HbAS) की संभावना होती है।'
      };
    }

    if (partner === 'HbAS') {
      return {
        normalPct: 25,
        carrierPct: 50,
        diseasePct: 25,
        summaryEn:
          '1-in-4 Genetic Attention (25% Disease Risk): When two HbAS carriers marry, each pregnancy has an independent 25% (1 in 4) chance of Sickle Cell Disease (HbSS), 50% chance of Healthy Carrier (HbAS), and 25% chance of Normal (HbAA). Consult a CHC genetic counselor for prenatal options.',
        summaryHi:
          '4 में से 1 संभावना (25% बीमारी जोखिम): जब दो HbAS वाहक विवाह करते हैं, तो प्रत्येक गर्भधारण में बच्चे को गंभीर सिकल सेल रोग (HbSS) होने की 25% (4 में से 1) संभावना होती है। विवाह या गर्भधारण से पूर्व CHC जेनेटिक काउंसलर से मिलें।'
      };
    }

    if (partner === 'HbSS') {
      return {
        normalPct: 0,
        carrierPct: 50,
        diseasePct: 50,
        summaryEn:
          'High Genetic Attention (50% Disease Risk): When an HbAS carrier marries a partner with HbSS (Sickle Cell Disease), each pregnancy has a 50% (2 in 4) chance of Sickle Cell Disease (HbSS) and 50% chance of Healthy Carrier (HbAS). Dedicated genetic counseling at District Hospital is strongly recommended.',
        summaryHi:
          'उच्च आनुवंशिक ध्यान (50% बीमारी जोखिम): जब एक HbAS वाहक का विवाह HbSS (सिकल सेल रोग) साथी से होता है, तो प्रत्येक गर्भधारण में 50% बीमारी (HbSS) और 50% वाहक (HbAS) की संभावना होती है।'
      };
    }

    return {
      normalPct: 0,
      carrierPct: 0,
      diseasePct: 0,
      summaryEn:
        'Partner Not Screened Yet: Because you are an HbAS carrier, knowing your prospective partner’s card status is essential. A free 10-minute solubility & HPLC blood test at your nearest Community Health Centre (CHC) gives complete clarity before marriage.',
      summaryHi:
        'साथी की जांच अभी नहीं हुई है: चूंकि आप HbAS वाहक हैं, इसलिए विवाह से पहले अपने भावी साथी का कार्ड स्टेटस जानना अत्यंत आवश्यक है। नजदीकी स्वास्थ्य केंद्र (CHC) पर 10 मिनट में निःशुल्क जांच करवाएं।'
    };
  };

  const outcome = getInheritanceOutcomes(partnerStatus);

  const handleGenerateVoucher = () => {
    issueReferralTicket({
      patientId: currentPatient.id,
      patientName: `${currentPatient.name} — Partner Pre-Marital Screening Voucher`,
      issuedBy: 'NSCAEM Genetic Counseling Module',
      facilityName: `CHC ${currentPatient.village} Sickle Cell Nodal Lab`,
      urgency: 'ROUTINE',
      reason: `Free Pre-Marital Partner HPLC/Solubility Screening requested by ${currentPatient.name} (HbAS Carrier).`
    });
    setVoucherIssued(true);
  };

  return (
    <div className="bg-canvas-50 border border-ochre-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
      {/* Prominent Safety Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-ochre-50 border border-ochre-200 text-ochre-950">
        <AlertCircle className="w-5 h-5 text-ochre-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">
            {language === 'en'
              ? 'Important Clinical Guardrail: Carriers Do NOT Need Hydroxyurea'
              : 'महत्वपूर्ण सुरक्षा नियम: वाहक (कैरियर) को हाइड्रोक्सीयूरिया की जरूरत नहीं है'}
          </h4>
          <p className="text-xs text-ochre-900 mt-0.5 leading-relaxed">
            {language === 'en'
              ? 'Hydroxyurea medication is exclusively prescribed for individuals with Sickle Cell Disease (HbSS). As an HbAS carrier, you are completely healthy, do not experience sickling pain crises, and do not require daily medication logs.'
              : 'हाइड्रोक्सीयूरिया दवा केवल सिकल सेल बीमारी (HbSS) के मरीजों के लिए होती है। वाहक (HbAS) व्यक्ति पूरी तरह स्वस्थ होते हैं और उन्हें कोई दैनिक दवा लेने की आवश्यकता नहीं है।'}
          </p>
        </div>
      </div>

      {/* Interactive Partner Genotype Simulator */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-canvas-200">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-ochre-100 text-ochre-900">
              {language === 'en'
                ? 'Interactive Pre-Marital Punnett Simulator'
                : 'इंटरएक्टिव विवाह-पूर्व आनुवंशिक सिम्युलेटर'}
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-ink-950 mt-1">
              {language === 'en'
                ? 'Simulate Child Inheritance by Partner’s Card Status'
                : 'भावी जीवनसाथी के कार्ड के अनुसार बच्चों में संभावना जानें'}
            </h4>
          </div>

          <button
            onClick={() =>
              playSpeech(
                language === 'en' ? outcome.summaryEn : outcome.summaryHi
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-100 hover:bg-canvas-200 border border-canvas-300 text-ink-900 text-xs font-bold self-start sm:self-auto tap-active"
          >
            <Volume2 className="w-3.5 h-3.5 text-ochre-700" />
            <span>
              {language === 'en' ? 'Hear Explanation' : 'समझाइश सुनें'}
            </span>
          </button>
        </div>

        {/* Partner Status Selector Buttons */}
        <div>
          <label className="block text-xs font-bold text-ink-600 mb-2">
            {language === 'en'
              ? 'Your Card is HbAS (Yellow Carrier). Tap Your Prospective Partner’s Card:'
              : 'आपका कार्ड HbAS (पीला वाहक) है। अपने भावी साथी का कार्ड चुनें:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                id: 'HbAA' as const,
                labelEn: 'Partner: HbAA (Green)',
                labelHi: 'साथी: HbAA (हरा)',
                subEn: 'Normal Non-Carrier',
                subHi: 'सामान्य (गैर-वाहक)',
                activeClass: 'bg-forest-700 text-white border-forest-800'
              },
              {
                id: 'HbAS' as const,
                labelEn: 'Partner: HbAS (Yellow)',
                labelHi: 'साथी: HbAS (पीला)',
                subEn: 'Carrier Trait',
                subHi: 'वाहक (कैरियर)',
                activeClass: 'bg-ochre-600 text-white border-ochre-700'
              },
              {
                id: 'HbSS' as const,
                labelEn: 'Partner: HbSS (Red)',
                labelHi: 'साथी: HbSS (लाल)',
                subEn: 'Sickle Cell Disease',
                subHi: 'सिकल सेल रोग',
                activeClass: 'bg-blood-800 text-white border-blood-900'
              },
              {
                id: 'UNSCREENED' as const,
                labelEn: 'Not Screened Yet',
                labelHi: 'जांच नहीं हुई',
                subEn: 'Get Free CHC Test',
                subHi: 'मुफ्त CHC जांच',
                activeClass: 'bg-ink-900 text-white border-ink-950'
              }
            ].map((opt) => {
              const active = partnerStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPartnerStatus(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition-all tap-active ${
                    active
                      ? `${opt.activeClass} shadow-sm`
                      : 'bg-canvas-100 border-canvas-300 text-ink-900 hover:bg-canvas-200'
                  }`}
                >
                  <span className="text-xs font-extrabold block">
                    {language === 'en' ? opt.labelEn : opt.labelHi}
                  </span>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      active ? 'opacity-90' : 'text-ink-500'
                    }`}
                  >
                    {language === 'en' ? opt.subEn : opt.subHi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Outcome Probability Cards */}
        {partnerStatus !== 'UNSCREENED' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-center">
              <span className="text-2xl font-black text-forest-800">
                {outcome.normalPct}%
              </span>
              <p className="text-xs font-extrabold text-forest-950 mt-0.5">
                {outcome.normalPct / 25} in 4 Chance
              </p>
              <p className="text-[11px] text-forest-700 mt-1 font-medium">
                {language === 'en'
                  ? 'Normal Hemoglobin (HbAA — Green Card)'
                  : 'सामान्य हीमोग्लोबिन (HbAA — हरा कार्ड)'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ochre-50 border border-ochre-200 text-center">
              <span className="text-2xl font-black text-ochre-800">
                {outcome.carrierPct}%
              </span>
              <p className="text-xs font-extrabold text-ochre-950 mt-0.5">
                {outcome.carrierPct / 25} in 4 Chance
              </p>
              <p className="text-[11px] text-ochre-700 mt-1 font-medium">
                {language === 'en'
                  ? 'Healthy Carrier Like You (HbAS — Yellow Card)'
                  : 'स्वस्थ वाहक (HbAS — पीला कार्ड)'}
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border text-center ${
                outcome.diseasePct === 0
                  ? 'bg-forest-50/60 border-forest-200'
                  : 'bg-blood-50 border-blood-200'
              }`}
            >
              <span
                className={`text-2xl font-black ${
                  outcome.diseasePct === 0 ? 'text-forest-800' : 'text-blood-800'
                }`}
              >
                {outcome.diseasePct}%
              </span>
              <p
                className={`text-xs font-extrabold mt-0.5 ${
                  outcome.diseasePct === 0 ? 'text-forest-950' : 'text-blood-950'
                }`}
              >
                {outcome.diseasePct / 25} in 4 Chance
              </p>
              <p
                className={`text-[11px] mt-1 font-medium ${
                  outcome.diseasePct === 0 ? 'text-forest-700' : 'text-blood-700'
                }`}
              >
                {language === 'en'
                  ? 'Sickle Cell Disease (HbSS — Red Card)'
                  : 'सिकल सेल बीमारी (HbSS — लाल कार्ड)'}
              </p>
            </div>
          </div>
        ) : null}

        {/* Detailed Genetic Counseling Box */}
        <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-ochre-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-xs sm:text-sm text-ink-950">
                {language === 'en'
                  ? `Genetic Counseling Summary (HbAS × ${partnerStatus})`
                  : `आनुवंशिक परामर्श सारांश (HbAS × ${partnerStatus})`}
              </h5>
              <p className="text-xs text-ink-700 mt-1 leading-relaxed">
                {language === 'en' ? outcome.summaryEn : outcome.summaryHi}
              </p>
            </div>
          </div>

          {voucherIssued ? (
            <div className="px-3.5 py-2.5 rounded-xl bg-forest-100 border border-forest-300 text-forest-900 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-forest-700" />
              <span>
                {language === 'en'
                  ? 'Free CHC Partner Voucher Sent!'
                  : 'मुफ्त साथी जांच वाउचर जारी!'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleGenerateVoucher}
              className="px-4 py-2.5 rounded-xl bg-ochre-700 hover:bg-ochre-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 shadow-sm tap-active"
            >
              <Ticket className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Issue Free Partner CHC Screening Voucher'
                  : 'भावी साथी के लिए मुफ्त CHC जांच वाउचर बनाएं'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
