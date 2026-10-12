-- ============================================================================
-- AFTER THE CARD: SICKLE CELL POST-SCREENING CARE LOOP
-- Supabase PostgreSQL Schema + Row Level Security (RLS) Policies
-- Pilot Region: Shahdol & Bhopal, Madhya Pradesh
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Patients & ASHA Frontline Workers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_card_id TEXT UNIQUE NOT NULL, -- e.g. 'MP-SHD-101'
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'asha', 'admin')) NOT NULL DEFAULT 'patient',
  status_card TEXT CHECK (status_card IN ('HbAA', 'HbAS', 'HbSS')),
  age INT,
  is_minor BOOLEAN DEFAULT FALSE,
  guardian_name TEXT,
  phone_number TEXT,
  village TEXT NOT NULL DEFAULT 'Shahdol',
  district TEXT NOT NULL DEFAULT 'Shahdol, MP',
  assigned_asha_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_dose_mg INT, -- Prescribed Hydroxyurea (HbSS only)
  next_followup_date DATE,
  last_clinic_visit DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADHERENCE LOGS TABLE (Strictly for HbSS patients)
-- Separates 'TAKEN', 'MISSED', and 'UNLOGGED' states
CREATE TABLE IF NOT EXISTS public.adherence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  logged_date DATE NOT NULL,
  status TEXT CHECK (status IN ('TAKEN', 'MISSED', 'UNLOGGED')) NOT NULL,
  notes TEXT,
  synced_from_offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, logged_date)
);

-- 3. SYMPTOM LOGS TABLE (Deterministic Triage Audit Trail)
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  stroke_signs BOOLEAN DEFAULT FALSE,
  chest_tightness BOOLEAN DEFAULT FALSE,
  high_fever BOOLEAN DEFAULT FALSE,
  severe_acute_pain BOOLEAN DEFAULT FALSE,
  mild_joint_pain BOOLEAN DEFAULT FALSE,
  fatigue BOOLEAN DEFAULT FALSE,
  triage_severity TEXT CHECK (triage_severity IN ('NORMAL', 'WARNING', 'EMERGENCY')) NOT NULL,
  detected_flags JSONB DEFAULT '[]'::jsonb
);

-- 4. HOME VISITS & ALERTS TABLE (ASHA Action Queue)
CREATE TABLE IF NOT EXISTS public.home_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  asha_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'COMPLETED')) NOT NULL DEFAULT 'PENDING',
  visit_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_visits ENABLE ROW LEVEL SECURITY;

-- Profiles: Patients see only their own profile; ASHAs see patients assigned to them
CREATE POLICY "Patients view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "ASHAs view assigned patients"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles asha
      WHERE asha.auth_user_id = auth.uid()
        AND asha.role = 'asha'
        AND (public.profiles.assigned_asha_id = asha.id OR public.profiles.village = asha.village)
    )
  );

-- Adherence Logs: Patients manage own logs; ASHAs read assigned patients' logs
CREATE POLICY "Patients manage own adherence logs"
  ON public.adherence_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.adherence_logs.patient_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ASHAs view assigned patient adherence logs"
  ON public.adherence_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profiles asha ON p.assigned_asha_id = asha.id
      WHERE p.id = public.adherence_logs.patient_id
        AND asha.auth_user_id = auth.uid()
    )
  );

-- Symptom Logs: Patients insert/view own symptom checks; ASHAs view assigned patients
CREATE POLICY "Patients manage own symptom logs"
  ON public.symptom_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.symptom_logs.patient_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ASHAs view assigned symptom logs"
  ON public.symptom_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profiles asha ON p.assigned_asha_id = asha.id
      WHERE p.id = public.symptom_logs.patient_id
        AND asha.auth_user_id = auth.uid()
    )
  );

-- Home Visits: ASHAs view and update visits assigned to them
CREATE POLICY "ASHAs manage assigned home visits"
  ON public.home_visits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles asha
      WHERE asha.id = public.home_visits.asha_id
        AND asha.auth_user_id = auth.uid()
    )
  );
