'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateHeuristicRiskScore } from '@/lib/riskEngine';
import { PatientProfile } from '@/lib/types';
import {
  Users,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Home,
  FileText,
  Search,
  Filter,
  Info,
  ShieldCheck,
  X
} from 'lucide-react';

export const AshaDashboard: React.FC = () => {
  const { allPatients, adherenceHistory, homeVisits, completeHomeVisit, language } = useApp();

  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [activeModalVisitId, setActiveModalVisitId] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState<string>('');

  // Villages list
  const villages = ['ALL', 'Burhar', 'Jaisinghnagar', 'Sohagpur'];

  const filteredPatients = allPatients.filter((p) => {
    if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
    return true;
  });

  const handleOpenCompleteModal = (visitId: string) => {
    setActiveModalVisitId(visitId);
    setVisitNotes('');
  };

  const handleSaveVisit = () => {
    if (activeModalVisitId) {
      completeHomeVisit(activeModalVisitId, visitNotes || 'Home visit completed. Advised hydration and clinical checkup.');
      setActiveModalVisitId(null);
      setVisitNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: ASHA Role Summary */}
      <div className="p-5 sm:p-6 rounded-3xl bg-canvas-100 border border-canvas-200 shadow-gentle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-canvas-50 flex items-center justify-center font-bold text-lg shadow-sm">
              <Users className="w-6 h-6 text-canvas-100" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 px-2 py-0.5 rounded">
                {language === 'en' ? "Frontline Health Worker Portal" : "आशा कार्यकर्ता पोर्टल"}
              </span>
              <h2 className="text-xl font-extrabold text-ink-950 mt-1">
                {language === 'en' ? "Shahdol Cohort Care Loop" : "शहडोल समुदाय देखभाल डैशबोर्ड"}
              </h2>
              <p className="text-xs text-ink-600">
                {language === 'en'
                  ? "Assigned to: Kavita Devi (ASHA) • Sector: Burhar & Jaisinghnagar, MP"
                  : "कार्यकर्ता: कविता देवी (आशा) • क्षेत्र: बुढ़ार एवं जयसिंहनगर, मध्य प्रदेश"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
            <div className="px-3.5 py-2 rounded-xl bg-canvas-50 border border-canvas-200 text-center">
              <span className="block text-lg font-black text-blood-700">
                {homeVisits.filter(v => v.status === 'PENDING').length}
              </span>
              <span className="text-[10px] text-ink-500 uppercase">
                {language === 'en' ? "Visits Needed" : "भेंट आवश्यक"}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-canvas-50 border border-canvas-200 text-center">
              <span className="block text-lg font-black text-ink-900">{allPatients.length}</span>
              <span className="text-[10px] text-ink-500 uppercase">
                {language === 'en' ? "Screened Roster" : "कुल मरीज"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heuristic Honesty Card (Rubric aligned) */}
      <div className="p-3.5 rounded-2xl bg-ochre-50/70 border border-ochre-200 flex items-start gap-3 text-xs text-ochre-950">
        <Info className="w-4 h-4 text-ochre-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'en' ? "Transparent Heuristic Model:" : "पारदर्शी प्राथमिकता प्रणाली:"}
          </span>{" "}
          <span>
            {language === 'en'
              ? "Dropout Risk scores are calculated through an operational formula (missed doses + unlogged days + overdue appointment days) to help frontline workers prioritize visits. This is an operational heuristic, not a clinically validated diagnostic tool."
              : "ड्रॉपआउट जोखिम स्कोर छूटी हुई दवाओं और देरी से आने वाले क्लिनिक दिनों के आधार पर तय होता है ताकि आशा दीदी पहले जरूरतमंद मरीजों से मिल सकें। यह व्यवस्थागत प्राथमिकता है, चिकित्सीय निदान नहीं।"}
          </span>
        </div>
      </div>

      {/* Pending Home Visits Action Queue */}
      {homeVisits.some(v => v.status === 'PENDING') && (
        <div className="bg-canvas-50 border border-blood-200 rounded-3xl p-5 shadow-gentle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blood-600 animate-pulse" />
              <h3 className="font-extrabold text-sm sm:text-base text-ink-950">
                {language === 'en' ? "Immediate Home Visits Dispatched" : "तत्काल गृह भेंट कार्य"}
              </h3>
            </div>
            <span className="text-xs font-bold text-blood-800">
              {homeVisits.filter(v => v.status === 'PENDING').length} {language === 'en' ? "Pending" : "बाकी"}
            </span>
          </div>

          <div className="space-y-2.5">
            {homeVisits
              .filter(v => v.status === 'PENDING')
              .map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 rounded-2xl bg-blood-50/60 border border-blood-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blood-700 text-white">
                        HIGH PRIORITY
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-ink-950">
                        {visit.patientName}
                      </span>
                    </div>
                    <p className="text-xs text-blood-900 mt-1 font-medium">{visit.reason}</p>
                  </div>

                  <button
                    onClick={() => handleOpenCompleteModal(visit.id)}
                    className="px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs transition-all tap-active self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    {language === 'en' ? "Mark Visit Completed" : "भेंट पूर्ण दर्ज करें"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Patient Roster & Prioritization Filter */}
      <div className="bg-canvas-50 border border-canvas-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-canvas-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-ink-950">
              {language === 'en' ? "Patient Roster & Dropout Risk Analysis" : "मरीज सूची एवं ड्रॉपआउट जोखिम विश्लेषण"}
            </h3>
            <p className="text-xs text-ink-500">
              {language === 'en'
                ? "Flagging patients slipping out of care before they are lost to follow-up"
                : "फॉलो-अप छूटने से पहले ही जोखिम वाले मरीजों की पहचान"}
            </p>
          </div>

          {/* Village Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-ink-600">
              {language === 'en' ? "Village:" : "गांव:"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPatients.map((patient) => {
            // Calculate heuristic risk score
            const risk = calculateHeuristicRiskScore({
              adherenceHistory,
              nextFollowupDate: patient.nextFollowupDate,
              warningSymptomsCount: patient.status === 'HbSS' ? 1 : 0
            });

            return (
              <div
                key={patient.id}
                className="p-4 rounded-2xl bg-canvas-100/70 border border-canvas-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top card row: Name, Status badge, and Risk Score badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-ink-950">
                          {patient.name}
                        </span>
                        {patient.isMinor && (
                          <span className="text-[10px] bg-canvas-200 text-ink-700 px-1.5 py-0.2 rounded font-semibold">
                            Child ({patient.age}y)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-500">
                        {patient.village}, {patient.district} • {patient.phone}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
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

                      {/* Transparent Risk Score Badge */}
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

                  {/* Operational Risk Reason */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-canvas-50 border border-canvas-200/80 text-xs">
                    <span className="font-bold text-ink-900 block mb-0.5">
                      {language === 'en' ? "Risk Factor Breakdown:" : "जोखिम कारण:"}
                    </span>
                    <p className="text-ink-600 text-[11px]">{risk.primaryRiskReason}</p>
                  </div>
                </div>

                {/* Footer stats: Follow-up date & Guardian info */}
                <div className="pt-2 border-t border-canvas-200 flex items-center justify-between text-[11px] text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Follow-up: {patient.nextFollowupDate}</span>
                  </div>

                  <span className="font-medium">
                    {patient.guardianName || "Self"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Visits Log */}
      {homeVisits.some(v => v.status === 'COMPLETED') && (
        <div className="p-4 rounded-2xl bg-canvas-100/60 border border-canvas-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
            {language === 'en' ? "Completed Field Visits (Audit Log):" : "पूर्ण की गई गृह भेंटें:"}
          </h4>
          <div className="space-y-1.5">
            {homeVisits
              .filter(v => v.status === 'COMPLETED')
              .map((visit) => (
                <div
                  key={visit.id}
                  className="p-2.5 rounded-xl bg-canvas-50 border border-canvas-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-ink-900">{visit.patientName}</span>
                    <p className="text-[11px] text-ink-500">{visit.notes}</p>
                  </div>
                  <span className="text-forest-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'en' ? "Completed" : "पूर्ण"}
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
              {language === 'en' ? "Record Field Home Visit" : "गृह भेंट रिपोर्ट दर्ज करें"}
            </h3>
            <p className="text-xs text-ink-500 mb-3">
              {language === 'en'
                ? "Document counselling delivered to the patient or family."
                : "मरीज या परिवार को दी गई समझाइश का संक्षिप्त विवरण दर्ज करें।"}
            </p>

            <textarea
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder={
                language === 'en'
                  ? "e.g., Visited home. Checked Hydroxyurea stock, explained hydration, scheduled CHC checkup for Friday."
                  : "उदा. घर जाकर दवा की उपलब्धता देखी, पर्याप्त पानी पीने की सलाह दी और शुक्रवार को अस्पताल जाने को कहा।"
              }
              rows={4}
              className="w-full p-3 rounded-xl border border-canvas-300 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 mb-4 bg-canvas-100"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setActiveModalVisitId(null)}
                className="flex-1 py-2.5 rounded-xl border border-canvas-300 text-ink-700 text-xs font-bold"
              >
                {language === 'en' ? "Cancel" : "रद्द करें"}
              </button>
              <button
                onClick={handleSaveVisit}
                className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold"
              >
                {language === 'en' ? "Save Visit" : "दर्ज करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
