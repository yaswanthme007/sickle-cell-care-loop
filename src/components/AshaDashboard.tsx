'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateHeuristicRiskScore } from '@/lib/riskEngine';
import {
  Users,
  Calendar,
  CheckCircle2,
  Info,
  X,
  Package,
  Stethoscope,
  Send,
  Cloud,
  CloudOff,
  Eye,
  Pill
} from 'lucide-react';

export const AshaDashboard: React.FC = () => {
  const {
    allPatients,
    homeVisits,
    completeHomeVisit,
    refillPatientStock,
    referrals,
    issueReferralTicket,
    acknowledgeReferral,
    selectPatientById,
    setUserRole,
    setErHandoverModalOpen,
    syncQueue,
    isOfflineMode,
    language
  } = useApp();

  const [portalSubView, setPortalSubView] = useState<'asha' | 'doctor'>('asha');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [activeModalVisitId, setActiveModalVisitId] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState<string>('');
  const [deliverRefillOnVisit, setDeliverRefillOnVisit] = useState<boolean>(true);

  const villages = ['ALL', 'Burhar', 'Jaisinghnagar', 'Sohagpur'];

  const filteredPatients = allPatients.filter((p) => {
    if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
    return true;
  });

  const handleOpenCompleteModal = (visitId: string) => {
    setActiveModalVisitId(visitId);
    setVisitNotes('');
    setDeliverRefillOnVisit(true);
  };

  const handleSaveVisit = () => {
    if (activeModalVisitId) {
      completeHomeVisit(
        activeModalVisitId,
        visitNotes ||
          'Home visit completed. Verified hydration, checked spleen & delivered 30-day Hydroxyurea blister pack.',
        deliverRefillOnVisit
      );
      setActiveModalVisitId(null);
      setVisitNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: ASHA & CHC Medical Officer Role Switcher */}
      <div className="p-5 sm:p-6 rounded-3xl bg-canvas-100 border border-canvas-200 shadow-gentle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl text-canvas-50 flex items-center justify-center font-bold text-lg shadow-sm ${
                portalSubView === 'asha' ? 'bg-forest-800' : 'bg-blood-800'
              }`}
            >
              {portalSubView === 'asha' ? (
                <Users className="w-6 h-6 text-canvas-100" />
              ) : (
                <Stethoscope className="w-6 h-6 text-canvas-100" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 px-2 py-0.5 rounded">
                  {portalSubView === 'asha'
                    ? language === 'en'
                      ? 'Pillar 4 • Frontline ASHA Worker Portal'
                      : 'स्तंभ 4 • आशा कार्यकर्ता पोर्टल'
                    : language === 'en'
                    ? 'CHC Medical Officer Clinical Triage'
                    : 'सामुदायिक स्वास्थ्य केंद्र (CHC) चिकित्सा अधिकारी'}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                    isOfflineMode
                      ? 'bg-ochre-100 text-ochre-900 border border-ochre-300'
                      : 'bg-forest-100 text-forest-900 border border-forest-200'
                  }`}
                >
                  {isOfflineMode ? (
                    <>
                      <CloudOff className="w-3 h-3" />
                      {language === 'en'
                        ? 'Offline Village Queue Active'
                        : 'ऑफलाइन ग्राम मोड'}
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3 h-3" />
                      {language === 'en'
                        ? 'Real-Time Sync Active'
                        : 'रियल-टाइम सिंक चालू'}
                    </>
                  )}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-ink-950 mt-1">
                {portalSubView === 'asha'
                  ? language === 'en'
                    ? 'Shahdol Cohort Outreach & Stock Loop'
                    : 'शहडोल समुदाय देखभाल एवं दवा वितरण डैशबोर्ड'
                  : language === 'en'
                  ? 'CHC Burhar & Sohagpur Nodal Sickle Cell Clinic'
                  : 'CHC बुढ़ार एवं सोहागपुर नोडल सिकल सेल क्लिनिक'}
              </h2>
              <p className="text-xs text-ink-600">
                {portalSubView === 'asha'
                  ? language === 'en'
                    ? 'Assigned to: Kavita Devi (Senior ASHA) • Sector: Burhar, Jaisinghnagar & Sohagpur'
                    : 'कार्यकर्ता: कविता देवी (वरिष्ठ आशा) • क्षेत्र: बुढ़ार, जयसिंहनगर एवं सोहागपुर'
                  : language === 'en'
                  ? 'Duty Medical Officer: Dr. Rajesh Verma (MBBS) • Weight-Dose Review & Referral Queue'
                  : 'चिकित्सा अधिकारी: डॉ. राजेश वर्मा (MBBS) • खुराक समीक्षा एवं रेफरल प्रबंधन'}
              </p>
            </div>
          </div>

          {/* Sub-View Switcher (ASHA Field vs CHC Doctor) */}
          <div className="flex items-center gap-1.5 bg-canvas-200 p-1.5 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setPortalSubView('asha')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                portalSubView === 'asha'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-ink-700 hover:text-ink-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ASHA Field View' : 'आशा फील्ड व्यू'}</span>
            </button>
            <button
              onClick={() => setPortalSubView('doctor')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                portalSubView === 'doctor'
                  ? 'bg-blood-800 text-white shadow-sm'
                  : 'text-ink-700 hover:text-ink-950'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'CHC Doctor Queue' : 'CHC डॉक्टर व्यू'} (
                {referrals.filter((r) => r.status === 'OPEN').length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CHC MEDICAL OFFICER VIEW */}
      {portalSubView === 'doctor' && (
        <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-200">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-ink-950">
                {language === 'en'
                  ? 'Incoming CHC Referrals & Weight-Based Dose Reviews'
                  : 'प्राप्त CHC रेफरल एवं वजन-आधारित खुराक समीक्षा'}
              </h3>
              <p className="text-xs text-ink-500">
                {language === 'en'
                  ? 'Approving a dose adjustment immediately updates the patient’s Daily Hydroxyurea Tracker & replenishes 30d stock.'
                  : 'खुराक स्वीकृत करने पर मरीज के ऐप में तुरंत नई खुराक और 30-दिन का स्टॉक अपडेट हो जाता है।'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-blood-100 text-blood-900 font-extrabold text-xs">
              {referrals.filter((r) => r.status === 'OPEN').length} Open Tickets
            </span>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => {
              const pt = allPatients.find((p) => p.id === ref.patientId);
              const recommendedMg = pt
                ? Math.round((pt.weightKg * 18) / 250) * 250 || 500
                : 750;

              return (
                <div
                  key={ref.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    ref.status === 'OPEN'
                      ? 'bg-blood-50/40 border-blood-200'
                      : 'bg-canvas-100 border-canvas-200 opacity-85'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          ref.urgency === 'EMERGENCY_IMMEDIATE'
                            ? 'bg-blood-800 text-white'
                            : ref.urgency === 'PRIORITY_48H'
                            ? 'bg-ochre-700 text-white'
                            : 'bg-forest-700 text-white'
                        }`}
                      >
                        {ref.urgency}
                      </span>
                      <span className="font-extrabold text-sm text-ink-950">
                        {ref.id} • {ref.patientName}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        Issued by: {ref.issuedBy}
                      </span>
                    </div>
                    <p className="text-xs text-ink-800 font-medium">{ref.reason}</p>
                    {pt && (
                      <p className="text-[11px] text-ink-600">
                        Lab Baseline Hb: {pt.labProfile?.baselineHbGdl || 7.8} g/dL • HbF:{' '}
                        {pt.labProfile?.hbF || 16}% • ANC: {pt.labProfile?.ancCount || 2850}/mm³ •
                        Current Weight: {pt.weightKg}kg (Current Dose: {pt.currentDoseMg}mg)
                      </p>
                    )}
                    {ref.doctorNotes && (
                      <p className="text-xs font-bold text-forest-800 bg-forest-50 p-2 rounded-xl border border-forest-200 mt-1">
                        ✓ {ref.doctorNotes}
                      </p>
                    )}
                  </div>

                  {ref.status === 'OPEN' ? (
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <button
                        onClick={() =>
                          acknowledgeReferral(
                            ref.id,
                            recommendedMg,
                            `Approved ${recommendedMg}mg/day Hydroxyurea (18mg/kg for ${
                              pt?.weightKg || 39
                            }kg) + Dispensed 30-day blister strip.`
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-blood-800 hover:bg-blood-900 text-white text-xs font-extrabold shadow-sm tap-active"
                      >
                        {language === 'en'
                          ? `Approve ${recommendedMg}mg/d & +30d Refill`
                          : `${recommendedMg}mg खुराक एवं 30-दिन दवा स्वीकृत करें`}
                      </button>
                      <button
                        onClick={() =>
                          acknowledgeReferral(
                            ref.id,
                            undefined,
                            'Reviewed at CHC clinic. Continue current dose & hydration.'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-800 text-[11px] font-bold tap-active"
                      >
                        {language === 'en'
                          ? 'Acknowledge (Keep Current Dose)'
                          : 'समीक्षा पूर्ण (वर्तमान खुराक जारी)'}
                      </button>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-forest-100 text-forest-900 font-extrabold text-xs self-start sm:self-auto shrink-0">
                      ✓ Completed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heuristic Honesty Card */}
      <div className="p-3.5 rounded-2xl bg-ochre-50/70 border border-ochre-200 flex items-start gap-3 text-xs text-ochre-950">
        <Info className="w-4 h-4 text-ochre-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'en'
              ? 'Transparent Per-Patient Heuristic Model:'
              : 'पारदर्शी प्रति-मरीज प्राथमिकता प्रणाली:'}
          </span>{' '}
          <span>
            {language === 'en'
              ? 'Each patient’s Dropout & Crisis Risk Score (0–100) is computed individually from their own 7-day missed doses, unlogged days, remaining blister pill stock, hydration deficit, and overdue CHC follow-up days.'
              : 'प्रत्येक मरीज का जोखिम स्कोर (0–100) उनकी स्वयं की छूटी हुई दवाओं, बचे हुए दवा स्टॉक, पानी की कमी और अस्पताल जांच की देरी के आधार पर अलग-अलग निकाला जाता है।'}
          </span>
        </div>
      </div>

      {/* Pending Home Visits Action Queue */}
      {homeVisits.some((v) => v.status === 'PENDING') && (
        <div className="bg-canvas-50 border border-blood-200 rounded-3xl p-5 shadow-gentle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blood-600 animate-pulse" />
              <h3 className="font-extrabold text-sm sm:text-base text-ink-950">
                {language === 'en'
                  ? 'Immediate Home Visits Dispatched'
                  : 'तत्काल गृह भेंट कार्य सूची'}
              </h3>
            </div>
            <span className="text-xs font-bold text-blood-800">
              {homeVisits.filter((v) => v.status === 'PENDING').length}{' '}
              {language === 'en' ? 'Pending' : 'बाकी'}
            </span>
          </div>

          <div className="space-y-2.5">
            {homeVisits
              .filter((v) => v.status === 'PENDING')
              .map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 rounded-2xl bg-blood-50/60 border border-blood-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blood-700 text-white">
                        {visit.interventionType || 'HIGH PRIORITY'}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-ink-950">
                        {visit.patientName}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        • ASHA: {visit.ashaName}
                      </span>
                    </div>
                    <p className="text-xs text-blood-900 mt-1 font-medium">
                      {visit.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenCompleteModal(visit.id)}
                    className="px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs transition-all tap-active self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    {language === 'en'
                      ? 'Record Visit & Deliver Stock'
                      : 'भेंट एवं दवा वितरण दर्ज करें'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Patient Roster & Per-Patient Prioritization Filter */}
      <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-canvas-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-ink-950">
              {language === 'en'
                ? 'Patient Roster & Closed-Loop Field Actions'
                : 'मरीज सूची एवं क्लोज्ड-लूप फील्ड कार्रवाई'}
            </h3>
            <p className="text-xs text-ink-500">
              {language === 'en'
                ? 'Refill blister stock, dispatch CHC referrals, or inspect any patient’s live passbook'
                : 'यहीं से दवा का स्टॉक रिफिल करें, CHC रेफरल भेजें या मरीज का कार्ड खोलें'}
            </p>
          </div>

          {/* Village Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-ink-600">
              {language === 'en' ? 'Village:' : 'गांव:'}
            </span>
            <div className="flex gap-1 bg-canvas-200 p-1 rounded-xl">
              {villages.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVillage(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedVillage === v
                      ? 'bg-canvas-50 text-ink-950 shadow-sm'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            // FIXED: Uses each patient's own adherenceHistory, pill stock, hydration, and warning count!
            const risk = calculateHeuristicRiskScore({
              adherenceHistory: patient.adherenceHistory || [],
              nextFollowupDate: patient.nextFollowupDate,
              warningSymptomsCount: patient.activeWarningCount || 0,
              remainingPillsStock: patient.remainingPillsStock,
              hydrationLoggedToday: patient.hydrationLoggedToday,
              hydrationTargetGlasses: patient.hydrationTargetGlasses
            });

            return (
              <div
                key={patient.id}
                className="p-4 rounded-2xl bg-canvas-100/80 border border-canvas-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-ink-950">
                          {patient.name}
                        </span>
                        <span className="text-[10px] bg-canvas-200 text-ink-700 px-1.5 py-0.5 rounded font-bold">
                          {patient.age}y • {patient.weightKg}kg • {patient.bloodGroup}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {patient.id} • {patient.village}, {patient.district} • ASHA:{' '}
                        {patient.ashaAssigned}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          patient.status === 'HbSS'
                            ? 'bg-blood-100 text-blood-900 border border-blood-200'
                            : patient.status === 'HbAS'
                            ? 'bg-ochre-100 text-ochre-900 border border-ochre-200'
                            : 'bg-forest-100 text-forest-900 border border-forest-200'
                        }`}
                      >
                        {patient.status}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          risk.level === 'HIGH'
                            ? 'bg-blood-700 text-white'
                            : risk.level === 'MEDIUM'
                            ? 'bg-ochre-600 text-white'
                            : 'bg-forest-700 text-white'
                        }`}
                      >
                        {risk.score}/100 Risk
                      </span>
                    </div>
                  </div>

                  {/* Clinical Telemetry Chips for HbSS */}
                  {patient.status === 'HbSS' && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          (patient.remainingPillsStock ?? 10) <= 5
                            ? 'bg-blood-50 border-blood-300 text-blood-900'
                            : 'bg-canvas-50 border-canvas-300 text-ink-800'
                        }`}
                      >
                        Stock: {patient.remainingPillsStock ?? 10}d left
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-canvas-50 border border-canvas-300 text-ink-800">
                        Dose: {patient.currentDoseMg}mg (
                        {((patient.currentDoseMg || 500) / patient.weightKg).toFixed(1)}{' '}
                        mg/kg)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-canvas-50 border border-canvas-300 text-forest-900">
                        HbF: {patient.labProfile?.hbF ?? 16.4}% • Base Hb:{' '}
                        {patient.labProfile?.baselineHbGdl ?? 7.8}g/dL
                      </span>
                    </div>
                  )}

                  {/* Operational Risk Reason */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-canvas-50 border border-canvas-200/80 text-xs">
                    <span className="font-bold text-ink-900 block mb-0.5">
                      {language === 'en' ? 'Risk Factor Breakdown:' : 'जोखिम कारण:'}
                    </span>
                    <p className="text-ink-600 text-[11px]">{risk.primaryRiskReason}</p>
                  </div>
                </div>

                {/* Actionable Closed-Loop Field Buttons */}
                <div className="pt-2.5 border-t border-canvas-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Follow-up: {patient.nextFollowupDate}
                    </span>
                    <span>{patient.guardianName || 'Adult Self'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {patient.status === 'HbSS' && (
                      <button
                        onClick={() => refillPatientStock(patient.id, 30)}
                        className="px-2.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-[11px] font-extrabold inline-flex items-center gap-1 tap-active"
                      >
                        <Pill className="w-3 h-3" />
                        <span>
                          {language === 'en'
                            ? '+30d Blister Refill'
                            : '+30 दिन दवा दें'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        issueReferralTicket({
                          patientId: patient.id,
                          patientName: `${patient.name} (${patient.age}y, ${patient.status})`,
                          issuedBy: `${patient.ashaAssigned}`,
                          facilityName: `CHC ${patient.village} Sickle Cell Clinic`,
                          urgency: risk.level === 'HIGH' ? 'PRIORITY_48H' : 'ROUTINE',
                          reason: `Field ASHA Referral: ${risk.primaryRiskReason}`
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-ochre-600 hover:bg-ochre-700 text-white text-[11px] font-extrabold inline-flex items-center gap-1 tap-active"
                    >
                      <Send className="w-3 h-3" />
                      <span>
                        {language === 'en' ? 'Refer to CHC' : 'CHC रेफर करें'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        selectPatientById(patient.id);
                        setUserRole('patient');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-900 text-[11px] font-bold inline-flex items-center gap-1 tap-active ml-auto"
                    >
                      <Eye className="w-3 h-3" />
                      <span>
                        {language === 'en' ? 'Open Passbook' : 'पासबुक खोलें'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Offline/Cloud Sync Ledger */}
      {syncQueue.length > 0 && (
        <div className="p-4 rounded-2xl bg-canvas-100 border border-canvas-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink-600">
              {language === 'en'
                ? 'Live Closed-Loop Event & Offline Sync Ledger:'
                : 'रियल-टाइम सिंक एवं फील्ड गतिविधि लॉग:'}
            </h4>
            <span className="text-[11px] font-bold text-ink-500">
              {syncQueue.filter((q) => !q.synced).length} Pending Upload •{' '}
              {syncQueue.filter((q) => q.synced).length} Synced
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {syncQueue.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-canvas-50 border border-canvas-200 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-ink-800">{item.summary}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
                    item.synced
                      ? 'bg-forest-100 text-forest-900'
                      : 'bg-ochre-100 text-ochre-900'
                  }`}
                >
                  {item.synced ? 'CLOUD SYNCED' : 'QUEUED OFFLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark Visit Completed Modal */}
      {activeModalVisitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-canvas-50 border border-canvas-300 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModalVisitId(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-canvas-200 text-ink-700"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-ink-950 mb-1">
              {language === 'en'
                ? 'Record Field Home Visit & Intervention'
                : 'गृह भेंट एवं दवा वितरण दर्ज करें'}
            </h3>
            <p className="text-xs text-ink-500 mb-3">
              {language === 'en'
                ? 'Document counseling and whether a 30-day Hydroxyurea blister pack was delivered.'
                : 'मरीज या परिवार को दी गई समझाइश और दवा वितरण का विवरण दर्ज करें।'}
            </p>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-forest-50 border border-forest-200 text-xs font-bold text-forest-950 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliverRefillOnVisit}
                onChange={(e) => setDeliverRefillOnVisit(e.target.checked)}
                className="rounded text-forest-700"
              />
              <Package className="w-4 h-4 text-forest-700" />
              <span>
                {language === 'en'
                  ? 'Delivered +30 Days Hydroxyurea Blister Strip Refill'
                  : '+30 दिन का हाइड्रोक्सीयूरिया दवा पैक दिया गया'}
              </span>
            </label>

            <textarea
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'e.g., Visited home in Burhar. Delivered 30-day Hydroxyurea strip, trained mother on spleen check, scheduled CHC checkup.'
                  : 'उदा. घर जाकर 30 दिन की दवा दी, पर्याप्त पानी पीने की सलाह दी और तिल्ली जांच सिखाई।'
              }
              rows={3}
              className="w-full p-3 rounded-xl border border-canvas-300 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 mb-4 bg-canvas-100"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setActiveModalVisitId(null)}
                className="flex-1 py-2.5 rounded-xl border border-canvas-300 text-ink-700 text-xs font-bold"
              >
                {language === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                onClick={handleSaveVisit}
                className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold"
              >
                {language === 'en' ? 'Complete & Sync' : 'दर्ज करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
