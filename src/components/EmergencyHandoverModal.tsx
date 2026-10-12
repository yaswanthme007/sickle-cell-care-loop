'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  PhoneCall,
  Printer,
  ShieldAlert,
  Droplet,
  Activity,
  FileCheck2,
  Volume2
} from 'lucide-react';

/**
 * Generates a deterministic 15x15 visual QR matrix from the patient's clinical handover string
 * so it renders crisp offline SVG modules without external network dependencies.
 */
function generateDeterministicMatrix(seedStr: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Finder patterns in 3 corners (5x5 outer, 3x3 inner)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r >= 1 && r <= 3 && c >= 1 && c <= 3 && (r === 2 && c === 2);
        grid[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 5);
  drawFinder(size - 5, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const bitIdx = (r * size + c) % 31;
      const charCode = seedStr.charCodeAt((r * size + c) % seedStr.length) || 7;
      grid[r][c] = ((hash >> bitIdx) ^ charCode) % 2 === 0;
    }
  }

  return grid;
}

export const EmergencyHandoverModal: React.FC = () => {
  const {
    erHandoverModalOpen,
    setErHandoverModalOpen,
    currentPatient,
    emergencyResult,
    language,
    playSpeech
  } = useApp();

  if (!erHandoverModalOpen) return null;

  const lab = currentPatient.labProfile || {
    hbA: 0,
    hbS: 80.4,
    hbF: 16.4,
    hbA2: 3.2,
    baselineHbGdl: 7.8,
    lastCbcDate: '2026-08-25',
    ancCount: 2850,
    plateletCount: 210000
  };

  const qrPayload = JSON.stringify({
    id: currentPatient.id,
    name: currentPatient.name,
    genotype: currentPatient.status,
    bloodGroup: currentPatient.bloodGroup || 'B+',
    weightKg: currentPatient.weightKg || 26,
    baselineHb: `${lab.baselineHbGdl}g/dL`,
    hbF: `${lab.hbF}%`,
    huDose: `${currentPatient.currentDoseMg || 500}mg`,
    asha: currentPatient.ashaAssigned
  });

  const qrMatrix = generateDeterministicMatrix(qrPayload);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-canvas-50 border-2 border-blood-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-auto space-y-4">
        {/* Top Emergency Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-canvas-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blood-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blood-100 text-blood-900 border border-blood-300">
                {language === 'en'
                  ? '2 AM Casualty / ER Physician Handover Pass'
                  : 'आपातकालीन डॉक्टर हैंडओवर कार्ड (ER Pass)'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-ink-950 mt-0.5">
                {currentPatient.name} • {currentPatient.status} ({currentPatient.age}y,{' '}
                {currentPatient.weightKg || 26}kg)
              </h3>
            </div>
          </div>

          <button
            onClick={() => setErHandoverModalOpen(false)}
            className="p-2 rounded-full bg-canvas-200 hover:bg-canvas-300 text-ink-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Critical Vitals & Baseline Metrics Grid for ER Doctor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-blood-50 border border-blood-200">
            <span className="text-[10px] font-extrabold uppercase text-blood-800 block">
              {language === 'en' ? 'Genotype & Blood' : 'जीनोटाइप एवं रक्त समूह'}
            </span>
            <span className="text-lg font-black text-blood-950">
              {currentPatient.status} • {currentPatient.bloodGroup || 'B+'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ochre-50 border border-ochre-200">
            <span className="text-[10px] font-extrabold uppercase text-ochre-900 block">
              {language === 'en' ? 'Steady Baseline Hb' : 'सामान्य बेसलाइन Hb'}
            </span>
            <span className="text-lg font-black text-ochre-950">
              {lab.baselineHbGdl} g/dL
            </span>
            <span className="text-[10px] text-ochre-800 block font-semibold">
              Alert if &lt; {(lab.baselineHbGdl - 2).toFixed(1)} g/dL
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-forest-50 border border-forest-200">
            <span className="text-[10px] font-extrabold uppercase text-forest-900 block">
              {language === 'en' ? 'Hydroxyurea Dose' : 'हाइड्रोक्सीयूरिया खुराक'}
            </span>
            <span className="text-lg font-black text-forest-950">
              {currentPatient.currentDoseMg || 500} mg/d
            </span>
            <span className="text-[10px] text-forest-800 block font-semibold">
              HbF: {lab.hbF}% • HbS: {lab.hbS}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-canvas-100 border border-canvas-300">
            <span className="text-[10px] font-extrabold uppercase text-ink-600 block">
              {language === 'en' ? 'Weight & Mission ID' : 'वजन एवं कार्ड आईडी'}
            </span>
            <span className="text-lg font-black text-ink-950">
              {currentPatient.weightKg || 26} kg
            </span>
            <span className="text-[10px] text-ink-600 block font-bold">
              {currentPatient.id}
            </span>
          </div>
        </div>

        {/* Active Red Flags if triggered */}
        {emergencyResult && emergencyResult.detectedFlags.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-blood-900 text-white space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blood-200">
              ACTIVE TRIAGE RED FLAGS REPORTED BY FAMILY:
            </span>
            <ul className="text-xs font-bold list-disc list-inside space-y-0.5">
              {emergencyResult.detectedFlags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* QR Code + Casualty Physician Protocol Box */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-canvas-100 p-4 rounded-2xl border border-canvas-200">
          {/* SVG QR Code */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-canvas-300 shadow-sm">
            <svg
              viewBox="0 0 15 15"
              className="w-28 h-28"
              shapeRendering="crispEdges"
              aria-label="Clinical Handover QR Code"
            >
              {qrMatrix.map((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={cIdx}
                      y={rIdx}
                      width={1}
                      height={1}
                      fill="#1C1917"
                    />
                  ) : null
                )
              )}
            </svg>
            <span className="text-[10px] font-extrabold text-ink-700 mt-2">
              NSCAEM ER-QR • {currentPatient.id}
            </span>
          </div>

          {/* Casualty Medical Officer Standing Orders */}
          <div className="sm:col-span-8 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-ink-950">
              <FileCheck2 className="w-4 h-4 text-blood-700" />
              <span>
                {language === 'en'
                  ? 'NHM / ICMR Casualty Protocol for Duty Medical Officer:'
                  : 'ड्यूटी मेडिकल ऑफिसर (डॉक्टर) के लिए आपातकालीन प्रोटोकॉल:'}
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-ink-700 font-medium">
              <li>
                <strong>Rapid Analgesia (&lt;30 min):</strong> Initiate weight-based analgesia for{' '}
                {currentPatient.weightKg || 26}kg; avoid pethidine.
              </li>
              <li>
                <strong>Compare Hb with Baseline ({lab.baselineHbGdl} g/dL):</strong> A drop &gt;2
                g/dL below {lab.baselineHbGdl} g/dL indicates acute splenic sequestration or
                aplastic crisis.
              </li>
              <li>
                <strong>Hydration & Oxygen:</strong> Oral/IV 5% Dextrose-1/2 NS at 1–1.5×
                maintenance; avoid fluid overload (Acute Chest Syndrome risk). Keep SpO₂ &gt;95%.
              </li>
              <li>
                <strong>Empiric Antibiotics if Febrile (&gt;101°F):</strong> Administer IV
                Ceftriaxone immediately (functional asplenia sepsis risk).
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                playSpeech(
                  `Emergency Medical Handover for ${currentPatient.name}, age ${
                    currentPatient.age
                  }, weight ${currentPatient.weightKg || 26} kilograms. Confirmed ${
                    currentPatient.status
                  } Sickle Cell Disease. Blood group ${
                    currentPatient.bloodGroup || 'B positive'
                  }. Steady state baseline hemoglobin is ${
                    lab.baselineHbGdl
                  } grams per deciliter. Fetal hemoglobin is ${
                    lab.hbF
                  } percent. Currently prescribed ${
                    currentPatient.currentDoseMg || 500
                  } milligrams of Hydroxyurea daily.`
                )
              }
              className="px-3.5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-900 text-xs font-extrabold inline-flex items-center gap-1.5 tap-active"
            >
              <Volume2 className="w-4 h-4 text-blood-700" />
              <span>
                {language === 'en'
                  ? 'Speak Summary to Doctor'
                  : 'डॉक्टर के लिए ऑडियो सारांश'}
              </span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-canvas-200 hover:bg-canvas-300 text-ink-900 text-xs font-extrabold inline-flex items-center gap-1.5 tap-active"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'en' ? 'Print ER Slip' : 'प्रिंट करें'}</span>
            </button>
          </div>

          <a
            href="tel:108"
            className="px-5 py-2.5 rounded-xl bg-blood-800 hover:bg-blood-900 text-white text-xs font-black inline-flex items-center gap-2 shadow-sm tap-active"
          >
            <PhoneCall className="w-4 h-4" />
            <span>
              {language === 'en' ? 'Dial 108 Ambulance' : '108 एम्बुलेंस कॉल करें'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
