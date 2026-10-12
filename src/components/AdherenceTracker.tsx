'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Package,
  FileText
} from 'lucide-react';

export const AdherenceTracker: React.FC = () => {
  const {
    adherenceHistory,
    logTodayDose,
    language,
    currentPatient,
    referrals
  } = useApp();
  const [, setJustLogged] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = adherenceHistory.find((d) => d.date === todayStr);

  const handleLog = (status: 'TAKEN' | 'MISSED') => {
    logTodayDose(status);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  const takenCount = adherenceHistory.filter((d) => d.status === 'TAKEN').length;
  const stockLeft = currentPatient.remainingPillsStock ?? 12;
  const isLowStock = stockLeft <= 5;

  const patientReferrals = referrals.filter(
    (r) => r.patientId === currentPatient.id
  );

  // Check if follow-up is overdue
  const isOverdue =
    new Date(currentPatient.nextFollowupDate).getTime() < Date.now();

  return (
    <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-5">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blood-100 text-blood-900 border border-blood-200">
              HbSS Care Loop
            </span>
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              {language === 'en' ? 'Pillar 2 • Stay in Care' : 'स्तंभ 2 • नियमित देखभाल'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-ink-950 tracking-tight">
            {language === 'en'
              ? 'Daily Hydroxyurea & Blister Stock Tracker'
              : 'दैनिक हाइड्रोक्सीयूरिया एवं दवा स्टॉक ट्रैकर'}
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
            {language === 'en'
              ? `Prescribed: ${currentPatient.currentDoseMg || 500}mg daily (for ${
                  currentPatient.weightKg || 26
                }kg weight)`
              : `निर्धारित खुराक: ${currentPatient.currentDoseMg || 500}mg प्रतिदिन (${
                  currentPatient.weightKg || 26
                }kg वजन हेतु)`}
          </p>
        </div>

        {/* Adherence Streak + Stock Badge */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ochre-50 border border-ochre-200 text-ochre-900">
            <Flame className="w-4 h-4 text-ochre-600" />
            <span className="text-xs font-bold">
              {language === 'en'
                ? `${takenCount}/7 Taken`
                : `${takenCount}/7 खुराक`}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${
              isLowStock
                ? 'bg-blood-50 border-blood-300 text-blood-900'
                : 'bg-forest-50 border-forest-200 text-forest-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? `${stockLeft}d Stock Left`
                : `${stockLeft} दिन की दवा शेष`}
            </span>
          </div>
        </div>
      </div>

      {/* Low Blister Stock Alert Banner */}
      {isLowStock && (
        <div className="p-3 rounded-2xl bg-blood-50/80 border border-blood-200 flex items-start gap-2.5 text-xs text-blood-950">
          <AlertTriangle className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold">
              {language === 'en'
                ? `Low Blister Strip Alert (${stockLeft} days remaining): `
                : `दवा समाप्त होने की चेतावनी (${stockLeft} दिन शेष): `}
            </span>
            <span>
              {language === 'en'
                ? `Your assigned ASHA (${currentPatient.ashaAssigned}) has been notified to deliver a 30-day refill or schedule your CHC visit.`
                : `आपकी आशा कार्यकर्ता (${currentPatient.ashaAssigned}) को 30-दिन का नया दवा पैक पहुंचाने की सूचना भेज दी गई है।`}
            </span>
          </div>
        </div>
      )}

      {/* Safety Notice: Dosage strictness */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas-100 border border-canvas-200/80 text-[11px] sm:text-xs text-ink-700">
        <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <span>
          {language === 'en'
            ? 'Clinical Safety: Never alter, skip, or increase your dose without direct instructions from your clinic doctor.'
            : 'सुरक्षा निर्देश: डॉक्टर की सलाह के बिना अपनी खुराक में कोई बदलाव न करें और न ही दवा बंद करें।'}
        </span>
      </div>

      {/* Today's Action Banner */}
      <div className="p-4 rounded-2xl bg-canvas-100/70 border border-canvas-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-blood-700" />
            {language === 'en'
              ? `Today's Medicine (${currentPatient.currentDoseMg || 500}mg)`
              : `आज की दवा (${currentPatient.currentDoseMg || 500}mg)`}
          </span>
          <span className="text-[11px] font-medium text-ink-500">{todayStr}</span>
        </div>

        {todayEntry ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-50 border border-canvas-300">
            <div className="flex items-center gap-2">
              {todayEntry.status === 'TAKEN' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-forest-700" />
                  <div>
                    <span className="text-xs font-bold text-forest-900">
                      {language === 'en'
                        ? 'Dose Taken Today (Synced to ASHA)'
                        : 'आज की दवा ले ली गई है (आशा पोर्टल में दर्ज)'}
                    </span>
                    <p className="text-[11px] text-ink-500">
                      {language === 'en'
                        ? 'Keeps protective Fetal Hemoglobin (HbF%) high!'
                        : 'सुरक्षात्मक फीटल हीमोग्लोबिन (HbF%) बनाए रखने में सहायक!'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-blood-700" />
                  <div>
                    <span className="text-xs font-bold text-blood-900">
                      {language === 'en'
                        ? 'Logged as Missed'
                        : 'आज की दवा छूट गई'}
                    </span>
                    <p className="text-[11px] text-ink-500">
                      {language === 'en'
                        ? 'Flagged for gentle ASHA follow-up'
                        : 'आशा दीदी के रिकॉर्ड में दर्ज'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() =>
                handleLog(todayEntry.status === 'TAKEN' ? 'MISSED' : 'TAKEN')
              }
              className="text-[11px] font-semibold text-ink-600 hover:text-ink-900 underline"
            >
              {language === 'en' ? 'Change' : 'बदलें'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLog('TAKEN')}
              className="p-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all tap-active shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Dose Taken' : 'दवा ले ली'}</span>
            </button>

            <button
              onClick={() => handleLog('MISSED')}
              className="p-3.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-800 font-bold text-xs flex items-center justify-center gap-2 transition-all tap-active border border-canvas-300"
            >
              <XCircle className="w-4 h-4 text-blood-700" />
              <span>{language === 'en' ? 'Missed Today' : 'दवा छूट गई'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 7-Day Adherence Timeline with Clear Differentiation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">
            {language === 'en' ? 'Past 7 Days History:' : 'पिछले 7 दिनों का रिकॉर्ड:'}
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-ink-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-forest-600" />
              {language === 'en' ? 'Taken' : 'ली गई'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blood-600" />
              {language === 'en' ? 'Missed' : 'छूटी'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-ink-300" />
              {language === 'en' ? 'No Log' : 'बिना दर्ज'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {adherenceHistory.slice(-7).map((day, idx) => {
            const isTaken = day.status === 'TAKEN';
            const isMissed = day.status === 'MISSED';
            const isUnlogged = day.status === 'UNLOGGED';

            let bgClass = 'bg-canvas-200/60 border-canvas-300 text-ink-500';
            if (isTaken) bgClass = 'bg-forest-100 border-forest-300 text-forest-900';
            if (isMissed) bgClass = 'bg-blood-100 border-blood-300 text-blood-900';

            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${bgClass}`}
              >
                <span className="text-[10px] font-bold">
                  {new Date(day.date).toLocaleDateString(
                    language === 'hi' ? 'hi-IN' : 'en-US',
                    {
                      weekday: 'narrow'
                    }
                  )}
                </span>
                <span className="text-[10px] text-ink-500 mt-0.5">
                  {new Date(day.date).getDate()}
                </span>
                <div className="mt-1.5">
                  {isTaken && <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />}
                  {isMissed && <XCircle className="w-3.5 h-3.5 text-blood-700" />}
                  {isUnlogged && (
                    <span className="w-2 h-0.5 bg-ink-400 block my-1 rounded" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Appointment Follow-up Reminder */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
          isOverdue
            ? 'bg-ochre-50/70 border-ochre-200'
            : 'bg-forest-50/70 border-forest-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar
            className={`w-4 h-4 shrink-0 ${
              isOverdue ? 'text-ochre-800' : 'text-forest-800'
            }`}
          />
          <div>
            <span
              className={`text-xs font-bold ${
                isOverdue ? 'text-ochre-950' : 'text-forest-950'
              }`}
            >
              {language === 'en'
                ? 'Next Clinical Follow-up Due:'
                : 'अगली अस्पताल जांच तिथि:'}
            </span>
            <p
              className={`text-[11px] ${
                isOverdue ? 'text-ochre-900' : 'text-forest-900'
              }`}
            >
              {currentPatient.nextFollowupDate} • CHC {currentPatient.village} / District
              Hospital Shahdol
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
            isOverdue
              ? 'bg-ochre-200 text-ochre-900'
              : 'bg-forest-200 text-forest-900'
          }`}
        >
          {isOverdue
            ? language === 'en'
              ? 'Overdue'
              : 'विलंबित'
            : language === 'en'
            ? 'Scheduled'
            : 'निर्धारित'}
        </span>
      </div>

      {/* Active CHC Referral Tickets for this Patient */}
      {patientReferrals.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-canvas-100 border border-canvas-300 space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blood-700" />
            {language === 'en'
              ? 'Official CHC Referral & Doctor Orders:'
              : 'आधिकारिक CHC रेफरल एवं डॉक्टर निर्देश:'}
          </span>
          {patientReferrals.slice(0, 2).map((ref) => (
            <div
              key={ref.id}
              className="p-2.5 rounded-xl bg-canvas-50 border border-canvas-200 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-ink-950">
                  {ref.id} • {ref.facilityName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    ref.status === 'ACKNOWLEDGED_BY_DOCTOR'
                      ? 'bg-forest-100 text-forest-900'
                      : 'bg-ochre-100 text-ochre-900'
                  }`}
                >
                  {ref.status === 'ACKNOWLEDGED_BY_DOCTOR'
                    ? 'DOCTOR REVIEWED'
                    : ref.urgency}
                </span>
              </div>
              <p className="text-[11px] text-ink-700">{ref.reason}</p>
              {ref.doctorNotes && (
                <p className="text-[11px] font-bold text-forest-900 bg-forest-50 p-1.5 rounded-lg border border-forest-200">
                  Dr. Rajesh Verma (CHC): {ref.doctorNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
