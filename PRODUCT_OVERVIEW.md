# Ahaan Eye — "Impact an Eye Every Day"
## Product Overview for Product Management

**Prepared:** August 2026 · **Repo:** `seevam/ahaaneyeproject` · **Status:** v1 private beta in development

---

## 1. What the product is (one paragraph)

Ahaan Eye is a mobile app that helps patients — and the family members who care for them — follow complex eye-drop medication schedules. Eye-drop regimens (glaucoma, post-surgical care, chronic dry eye) are uniquely hard to follow: multiple drops per day, a required minimum gap between different drops, and real clinical consequences for missed doses. The app removes that cognitive burden by generating conflict-free schedules automatically, firing loud alarm-style reminders that work even when the phone is locked, tracking every dose as Taken / Snoozed / Skipped / Missed, and turning that history into adherence reports a patient can share with their doctor.

**The core insight:** the bottleneck in eye care is not medicine — it's behaviour. Adherence rates globally sit below 50%. This app attacks that directly.

---

## 2. Who it's for

| User | Need |
|---|---|
| **Patients** with ongoing eye conditions (primary) | Never miss a timed drop; no mental math about spacing |
| **Caregivers / family members** (secondary) | Manage medication for a parent or spouse from one account, with multiple patient profiles |
| **Doctors / clinics** (tertiary, future) | Adherence visibility between appointments |

The design principles reflect the audience: large tap targets for imperfect hands, supportive (never shaming) language around missed doses, and full support for **English, Hindi, and Tamil** with device-locale auto-detection — the initial market is India (phone auth defaults to +91).

---

## 3. The killer feature: conflict-free scheduling

This is the differentiator versus generic pill-reminder apps. Ophthalmology guidance requires a **minimum 5-minute gap between different eye drops** (otherwise the second drop washes out the first). Patients on 3–4 drops several times a day cannot realistically plan this themselves.

The app has a **scheduling engine** (built and shared between mobile and API) that supports four modes:

1. **Fixed interval** — "every 2 hours between 08:00 and 20:00" → 7 instances/day
2. **Count-based** — "5 times, 10 minutes apart, starting 09:00"
3. **Specific times** — user picks exact times
4. **Custom** — advanced cron-style expression (power users)

A **conflict-resolution engine** then checks every generated instance against the patient's other reminders and shifts colliding ones forward by the minimum gap (preserving order). If a schedule is genuinely impossible, it tells the user why in plain language rather than silently failing. Users see a **preview** of resolved times before saving (`POST /reminders/preview`). Timezone/DST handling is built in: schedules are stored in the patient's IANA timezone, instances in UTC.

---

## 4. What is actually built today (v1)

### Mobile app (Expo / React Native — iOS & Android from one codebase)

| Area | Status | Detail |
|---|---|---|
| **Auth** | ✅ Built | Name + phone signup, phone login. No OTP, no password — intentional friction-removal for the private beta. JWT valid 90 days. Guest mode exists for read-only content. |
| **Onboarding** | ✅ Built | 3 steps: create first patient profile → optionally add first prescription → notification permission request with explanation. |
| **Today tab** | ✅ Built | Home screen showing today's doses and their status. |
| **Reminders tab** | ✅ Built | List + full creation flow (medication, dosage, scheduling mode, days of week, snooze settings, sound/vibration). |
| **Alarm screen** | ✅ Built | Full-screen alarm with medication name/dosage and Taken / Snooze / Skip actions. Uses Notifee with Android full-screen intent, alarm-category notifications that survive Doze mode and show on the lock screen. Snooze respects a configurable limit (default 3 × 10 min). No action within 30 min → Missed. |
| **Reports** | ✅ Built | Adherence report per patient (lives inside the Profile tab). |
| **Profile** | ✅ Built | Patient management, language switcher. |
| **Stories tab** | 🔨 Built, hidden | Full stories feed + detail screens exist in code but the tab is hidden (`href: null`) for v1. Flip one line to enable in v2. |
| **i18n** | ✅ Built | English, Hindi, Tamil — full translation files, auto-detected on first launch. |

### Backend API (Node.js / Express / PostgreSQL / Redis)

REST API under `/api/v1` covering: auth (register / login / me), patient CRUD, reminder schedule CRUD + preview, reminder instances with a date-range query, per-instance actions (taken/snooze/skip), adherence reports, stories (with guest access), and device/push-token registration.

### Database schema — built ahead of the UI

The Postgres schema already models more than the UI exposes, which de-risks v2: **medication database** (canonical names, synonyms, brand names, images, verified flag), **prescriptions** (with source-image and parsed-text fields ready for future OCR), **appointments**, **stories + per-language translations**, **donations** (amount, frequency, provider, receipt), **tips**, and **devices**. Adding these features later is mostly UI + endpoint work, not migration work.

---

## 5. What is *not* built yet (so nobody is surprised)

- **Donations** — schema exists; no payment gateway integrated, no UI.
- **Appointments** — schema exists; no UI.
- **Medication database / prescriptions** — schema exists; reminder creation currently uses free-text medication names.
- **Admin portal** — no content-management UI for stories/tips/medications yet; content goes in via the database.
- **Caregiver push alerts, doctor sharing, offline sync queue** — specced in the PRD, not implemented.
- **OTP verification** — deliberately out for the beta; must be revisited before public launch (anyone who knows a phone number can log into that account).
- **Push notifications from the server** — reminders currently fire as *local* notifications scheduled on-device; the device/push-token plumbing exists but no server-side push service is wired up.

---

## 6. Current engineering caveat worth knowing

The team develops in **Expo Go** (Expo's instant-preview app) for speed, but the app's most important feature — reliable lock-screen alarms via Notifee — **requires a real native build ("development build" / EAS build)**. Expo Go cannot run the native alarm module, so the codebase stubs several native modules when running there. Consequence for planning: *the alarm experience can only be truly validated on a development build*, and there is an ongoing dependency-upgrade effort to keep the Expo SDK toolchain healthy. Alarm reliability is the product's non-negotiable, so device testing on real builds should be part of every release cycle.

---

## 7. Tech stack (for context in discussions)

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 54, React Native 0.81, Expo Router, NativeWind (Tailwind), Zustand + TanStack Query |
| Alarms | Notifee (full-screen, Doze-surviving Android alarms) |
| API | Node.js, Express, TypeScript, Drizzle ORM |
| Data | PostgreSQL 16, Redis 7 |
| Auth | Custom JWT (migrated off Clerk) |
| i18n | i18next (en / hi / ta) |
| Structure | npm monorepo: `apps/mobile`, `apps/api`, `packages/shared` (shared types + validation used by both) |

---

## 8. Success metrics (from the PRD)

| Goal | Metric | Target |
|---|---|---|
| Reduce missed doses | % of reminders marked Taken | ≥ 80% in active users |
| Caretaker adoption | % of accounts with ≥ 2 patient profiles | ≥ 30% within 90 days |
| Engagement | DAU/MAU | ≥ 40% |
| Content engagement | Stories opened per user per week | ≥ 2 |
| Donation conversion | % of logged-in users who donate | ≥ 5% |

---

## 9. Roadmap (condensed from the v2 strategic PRD)

**Phase 1 — Foundation (now):** core scheduling, alarms, reports, content, donations. Alarm reliability is non-negotiable.

**Phase 2 — Intelligence & caregivers:** prescription OCR + AI parsing, symptom/side-effect journal, caregiver dashboard mode (traffic-light adherence per patient), smart schedule optimiser, refill reminders, Apple Watch.

**Phase 3 — Clinical ecosystem:** consent-gated read-only doctor web portal, remote patient monitoring alerts, HL7 FHIR integration with EHRs, grounded AI eye-care Q&A assistant, moderated community forum.

**Phase 4 — Platform & scale:** white-label/institutional licensing, clinical-trial-grade audit trails, connected (Bluetooth) drop bottles, SMS/USSD fallback for low-connectivity markets.

**Business model (future):** freemium — free tier (1 patient, 3 medications), Premium ~£3.99/mo (unlimited patients, journal, doctor sharing, PDF reports), per-seat Clinic tier. A self-certified Patient Access Programme grants free Premium — access over enforcement.

---

## 10. Open product decisions

1. OTP / phone verification strategy before public launch.
2. Payment gateway for donations (Stripe? Razorpay for India?).
3. Server push infrastructure (FCM/APNs directly vs. a service) for caregiver alerts.
4. Clinical advisory board for tip content and the future AI assistant.
5. Regulatory classification per market (EU MDR / US FDA SaMD) — affects what the AI assistant may say.
6. Priority languages beyond en/hi/ta.
7. Admin portal: build vs. use a headless CMS for stories/tips/medication DB.

---

## 11. Where to look for more

- `README.md` — setup, API route reference, troubleshooting
- `eyecare app PRD.md` — full functional spec (v1) + strategic expansion (v2), acceptance criteria, QA test cases
- `SETUP.md` — from-scratch environment setup
- `apps/api/src/db/schema.ts` — the authoritative data model
- `apps/mobile/src/utils/scheduling/` — the scheduling + conflict-resolution engine
