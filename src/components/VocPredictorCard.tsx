'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { computeVocBiophysicalPrediction } from '@/lib/vocPredictor';
import {
  ThermometerSun,
  Droplets,
  ShieldAlert,
  Sparkles,
  Plus,
  Minus,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Activity
} from 'lucide-react';

export const VocPredictorCard: React.FC = () => {
  const {
    currentPatient,
    environmentalData,
    logHydration,
    language,
    playSpeech,
    isAudioPlaying,
    refreshEnvironment
  } = useApp();

  if (currentPatient.status !== 'HbSS') return null;

  const prediction = computeVocBiophysicalPrediction(
    currentPatient,
    environmentalData
  );

  const targetGlasses = currentPatient.hydrationTargetGlasses || 8;
  const loggedGlasses = currentPatient.hydrationLoggedToday || 0;

  const bandColors =
    prediction.riskBand === 'HIGH_PRODROME'
      ? {
          badge: 'bg-blood-800 text-white',
          border: 'border-blood-300 bg-blood-50/50',
          bar: 'bg-blood-700',
          text: 'text-blood-950'
        }
      : prediction.riskBand === 'MODERATE_VIGILANCE'
      ? {
          badge: 'bg-ochre-700 text-white',
          border: 'border-ochre-300 bg-ochre-50/50',
          bar: 'bg-ochre-600',
          text: 'text-ochre-950'
        }
      : {
          badge: 'bg-forest-700 text-white',
          border: 'border-forest-300 bg-forest-50/50',
          bar: 'bg-forest-700',
          text: 'text-forest-950'
        };

  return (
    <section
      aria-label="48-Hour Vaso-Occlusive Crisis Biophysical Predictor"
      className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-200">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blood-800 text-canvas-50 flex items-center justify-center shrink-0 shadow-sm">
            <ThermometerSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blood-100 text-blood-900 border border-blood-200">
                {language === 'en'
                  ? 'Biophysical VOC Early-Warning Engine'
                  : 'बायोफिजिकल दर्द-संकट पूर्व-चेतावनी प्रणाली'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-canvas-200 text-ink-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-pulse" />
                {environmentalData.isLiveApi
                  ? language === 'en'
                    ? 'Live Shahdol Telemetry'
                    : 'शहडोल लाइव मौसम डेटा'
                  : language === 'en'
                  ? 'Village Telemetry Active'
                  : 'स्थानीय मौसम डेटा'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-ink-950 mt-1">
              {language === 'en'
                ? '48-Hour Sickling Crisis Prevention & Hydration Loop'
                : '48-घंटे सिकलिंग संकट बचाव एवं जल-संतुलन चक्र'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() =>
              playSpeech(
                language === 'en'
                  ? `${prediction.headlineEn}. ${prediction.explanationEn}`
                  : `${prediction.headlineHi}. ${prediction.explanationHi}`
              )
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all tap-active ${
              isAudioPlaying
                ? 'bg-blood-800 text-white border-blood-900'
                : 'bg-canvas-100 hover:bg-canvas-200 text-ink-800 border-canvas-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Hear Forecast' : 'पूर्वानुमान सुनें'}</span>
          </button>

          <button
            onClick={() => refreshEnvironment()}
            title="Refresh Shahdol Weather Telemetry"
            className="p-2 rounded-xl bg-canvas-100 hover:bg-canvas-200 border border-canvas-300 text-ink-700 transition-all tap-active"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Forecast Banner */}
      <div className={`p-4 rounded-2xl border ${bandColors.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold self-start ${bandColors.badge}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {language === 'en' ? prediction.headlineEn : prediction.headlineHi}
          </span>
          <span className="text-xs font-bold text-ink-600">
            {environmentalData.location} • {environmentalData.temperatureC.toFixed(1)}°C (Δ{' '}
            {environmentalData.diurnalSwingC.toFixed(1)}°C)
          </span>
        </div>
        <p className={`text-xs sm:text-sm font-medium leading-relaxed ${bandColors.text}`}>
          {language === 'en' ? prediction.explanationEn : prediction.explanationHi}
        </p>
      </div>

      {/* Two-Column Interactive Section: Hydration Logger + Biophysical Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 6 cols: Interactive Daily Anti-Sickling Hydration Tracker */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-canvas-100 border border-canvas-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blood-700" />
                <h4 className="text-xs sm:text-sm font-extrabold text-ink-950">
                  {language === 'en'
                    ? 'Intracellular Hydration Shield'
                    : 'दैनिक जल-संतुलन (हाइड्रेशन) सुरक्षा'}
                </h4>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-canvas-200 text-ink-900">
                {loggedGlasses} / {targetGlasses}{' '}
                {language === 'en' ? 'Glasses' : 'गिलास'}
              </span>
            </div>
            <p className="text-[11px] text-ink-600 mt-1">
              {language === 'en'
                ? 'Why it matters: Dehydration concentrates HbS inside red blood cells, speeding up sickling 30×. Log each glass of water/ORS today:'
                : 'पानी की कमी से लाल रक्त कोशिकाएं तुरंत सिकुड़ने लगती हैं। आज पिया गया प्रत्येक गिलास पानी दर्ज करें:'}
            </p>

            {/* Visual Water Glasses Grid */}
            <div className="grid grid-cols-8 gap-1.5 mt-3">
              {Array.from({ length: targetGlasses }).map((_, idx) => {
                const filled = idx < loggedGlasses;
                return (
                  <button
                    key={idx}
                    onClick={() => logHydration(filled ? -1 : 1)}
                    title={
                      language === 'en'
                        ? `Glass ${idx + 1}`
                        : `गिलास ${idx + 1}`
                    }
                    className={`h-10 rounded-xl border flex flex-col items-center justify-center transition-all tap-active ${
                      filled
                        ? 'bg-forest-700 border-forest-800 text-white shadow-sm'
                        : 'bg-canvas-50 border-canvas-300 text-ink-400 hover:border-ink-500'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold mt-0.5">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-canvas-200">
            <button
              onClick={() => logHydration(-1)}
              disabled={loggedGlasses <= 0}
              className="px-3 py-2 rounded-xl border border-canvas-300 bg-canvas-50 hover:bg-canvas-200 disabled:opacity-40 text-ink-800 text-xs font-bold inline-flex items-center gap-1 tap-active"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Remove' : 'घटाएं'}</span>
            </button>

            <button
              onClick={() => logHydration(1)}
              className="flex-1 py-2 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-sm tap-active"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Log +1 Glass of Water / ORS Now'
                  : '+1 गिलास पानी / ORS दर्ज करें'}
              </span>
            </button>
          </div>
        </div>

        {/* Right 6 cols: 4 Biophysical Risk Drivers Breakdown */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-ink-950 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blood-700" />
              {language === 'en'
                ? 'Biophysical Polymerization Drivers'
                : 'सिकलिंग जोखिम के 4 जैविक कारण'}
            </span>
            <span className="text-[11px] font-bold text-ink-500">
              {language === 'en' ? 'Score Impact' : 'प्रभाव'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Driver 1: Thermal Stress */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-ink-800 mb-1">
                <span>
                  {language === 'en'
                    ? `1. Shahdol Thermal / Diurnal Stress (${environmentalData.temperatureC.toFixed(1)}°C)`
                    : `1. शहडोल तापमान एवं दिन-रात अंतर (${environmentalData.temperatureC.toFixed(1)}°C)`}
                </span>
                <span className="font-bold">{prediction.thermalStressContribution}/25 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                <div
                  className="h-full bg-ochre-600 rounded-full transition-all duration-300"
                  style={{ width: `${(prediction.thermalStressContribution / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Driver 2: Cellular Dehydration */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-ink-800 mb-1">
                <span>
                  {language === 'en'
                    ? `2. Cellular Dehydration Deficit (${loggedGlasses}/${targetGlasses} glasses)`
                    : `2. कोशिका निर्जलीकरण (${loggedGlasses}/${targetGlasses} गिलास)`}
                </span>
                <span className="font-bold">{prediction.dehydrationContribution}/30 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                <div
                  className="h-full bg-blood-700 rounded-full transition-all duration-300"
                  style={{ width: `${(prediction.dehydrationContribution / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Driver 3: HbF & Hydroxyurea */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-ink-800 mb-1">
                <span>
                  {language === 'en'
                    ? `3. Hydroxyurea & Fetal Hb Protection (HbF: ${
                        currentPatient.labProfile?.hbF ?? 16.4
                      }%)`
                    : `3. हाइड्रोक्सीयूरिया एवं HbF सुरक्षा (HbF: ${
                        currentPatient.labProfile?.hbF ?? 16.4
                      }%)`}
                </span>
                <span className="font-bold">{prediction.adherenceHbFContribution}/25 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                <div
                  className="h-full bg-blood-800 rounded-full transition-all duration-300"
                  style={{ width: `${(prediction.adherenceHbFContribution / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Driver 4: Prodrome */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-ink-800 mb-1">
                <span>
                  {language === 'en'
                    ? '4. Early Prodromal Micro-Symptoms'
                    : '4. पूर्व-संकट शुरुआती लक्षण'}
                </span>
                <span className="font-bold">{prediction.symptomProdromeContribution}/20 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden">
                <div
                  className="h-full bg-ochre-700 rounded-full transition-all duration-300"
                  style={{ width: `${(prediction.symptomProdromeContribution / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Micro-Interventions */}
      <div className="p-3.5 rounded-2xl bg-canvas-100 border border-canvas-200">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-600 block mb-2">
          {language === 'en'
            ? 'Recommended 48-Hour Crisis Prevention Steps:'
            : 'अगले 48 घंटों के लिए संकट बचाव के कदम:'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(language === 'en'
            ? prediction.preventativeActionsEn
            : prediction.preventativeActionsHi
          ).map((act, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-ink-800 bg-canvas-50 p-2.5 rounded-xl border border-canvas-200"
            >
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
