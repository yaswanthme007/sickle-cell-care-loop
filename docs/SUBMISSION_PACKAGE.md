# UnivaBio 2026 — Submission Package: After the Card

**Project Title:** After the Card: Sickle Cell Post-Screening Care Loop  
**Theme:** AI for Human Health (Detect Earlier • Understand Better • Live More Easily)  
**Pilot Setting:** Shahdol & Bhopal, Madhya Pradesh  

---

## 1. One-Page Executive Summary

### The Problem
India's National Sickle Cell Anaemia Elimination Mission has screened **over 6.04 crore people**, identifying **2.16+ lakh patients** and **16.7+ lakh carriers**. Yet a status card is not care:
1. **Treatment Dropout:** ~25% of patients drop out of follow-up (Dave et al., 2019), and pediatric non-adherence to Hydroxyurea in Bhopal is driven by improper follow-up (64.5%) and low awareness (54.8%) (JCDR, 2022).
2. **Misunderstood Status Cards:** Most carriers (`HbAS`) either mistakenly fear they have an active disease or do not realize that carrier × carrier marriage carries a 1-in-4 per-pregnancy risk of `HbSS` disease.
3. **Missed Early Warnings:** Families miss early crisis and stroke signs at home until an emergency escalates.

### Our Solution: The Post-Screening Care Loop
A mobile-first, bilingual (**English default + Hindi toggle**) Progressive Web App linking **Families** and **Frontline Health Workers (ASHAs)** across three pillars:
* **Pillar 1 — Understand:** Color-coded status card selector (`HbAA`, `HbAS`, `HbSS`) + simulated QR scanner with clinician-verified plain-language explanations, voice readout, and guarded Q&A.
* **Pillar 2 — Stay in Care:** Status-branched flows — `HbSS` patients log daily Hydroxyurea (`TAKEN` vs `MISSED` vs `UNLOGGED` silent days) while `HbAS` carriers receive only genetic inheritance facts and counseling referrals (never a medication tracker).
* **Pillar 3 — Act Early:** Deterministic, guideline-based symptom checker (including stroke signs, acute chest tightness, high fever $>101^\circ\text{F}$, and severe pain) that triggers an **immediate non-blocking Call 108 emergency alert** while sending a secondary notification to the assigned ASHA.

---

## 2. Demo Video Script (2 Minutes 30 Seconds)

* **0:00 – 0:25 | The Hook:**
  * *"India solved finding sickle cell—over 6 crore people screened since the mission launched in Shahdol, Madhya Pradesh. Nobody solved what happens the day after a family receives that card."*
* **0:25 – 1:00 | Family App & Status Branching (`HbAS` vs `HbSS`):**
  * Show the **English Default** view, then click **"Scan Demo Card QR"** to scan **Pooja Baiga (`HbAS` Carrier)**.
  * Highlight that `HbAS` shows **no Hydroxyurea tracker**—only clear 1-in-4 genetic facts and pre-marital counseling guidance.
  * Toggle to **Hindi (हिंदी)** and click **Listen** to play the voice narration.
* **1:00 – 1:40 | `HbSS` Disease Flow & Deterministic Safety Guardrails:**
  * Switch to **Ramesh Kol (`HbSS` Disease)**. Log today's Hydroxyurea dose and point out how the 7-day calendar separates **Taken**, **Missed**, and **No Log** days.
  * In the **Ask Educator** box, tap *"I have high fever and chest pain"* — show the **Deterministic Safety Rule Intercept** blocking the LLM.
  * In the **Crisis Warning Sign Check**, select *Sudden Weakness (Stroke Sign)* or *Chest Tightness* and click Evaluate — show the **immediate full-screen Call 108 modal** (does not wait for the ASHA).
* **1:40 – 2:15 | ASHA Health Worker Portal:**
  * Switch to **ASHA Portal**. Show the Shahdol village filter, the **Transparent Heuristic Risk Score** breakdown (*15 days overdue + 4 missed logs*), and click **Mark Visit Completed** to log field notes.
* **2:15 – 2:30 | Honest Limitations & Roadmap:**
  * Close with our privacy guarantees (Supabase RLS, Zero-PII to Groq) and next rollout phase in **Odia for Odisha**.

---

## 3. Limitations & Clinical Honesty Slide Content

1. **Heuristic Risk Score Disclosure:** The ASHA dropout risk score (0–100) is an **explainable operational heuristic** designed to help frontline workers prioritize home visits—it is **not** a clinically validated diagnostic or prognostic score.
2. **Synthetic Demo Cohort:** All patient profiles (`Ramesh Kol`, `Pooja Baiga`, `Arjun Gond`) are synthetic representations modeled on Shahdol/Bhopal epidemiology; zero real patient PII is stored or transmitted.
3. **Device TTS & Offline Scope:** Browser speech synthesis quality depends on installed Android voice packs (written text is always shown alongside audio). Offline mode queues adherence logs locally in `localStorage` for synchronization when connectivity returns.
4. **Scope & Next Phase:** Current scope covers `HbAA`, `HbAS`, and `HbSS` in English and Hindi. Variants such as Sickle Beta-Thalassemia (`HbS-β`) and **Odia language support for Odisha** are scheduled for Phase 2 field validation.
