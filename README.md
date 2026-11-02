# MediSlot - Smart Hospital Appointment System

A full-stack web app for hospital appointments: doctor availability calendars with conflict-free slot booking, patient registration, department-wise doctor listing, prescriptions with PDF download, email confirmations and 24h reminders, plus a **Symptom Checker** that recommends the right department (and flags emergencies).

**Stack:** Next.js 15 (App Router) - Prisma - PostgreSQL - NextAuth - Nodemailer - PDFKit - Zod

## Features
- Doctor availability calendar (weekly windows, configurable slot length) with real-time slot booking
- Double-booking is impossible: server-side slot validation plus a database unique constraint on (doctor, time)
- Role-based access: Patient, Doctor, Admin (NextAuth credentials + bcrypt)
- Patient dashboard with upcoming bookings, past visits and health history
- Doctors write prescriptions; patients download them as PDF
- Confirmation email on booking and reminder email 24h before (hourly cron)
- Department-wise doctor listing
- Symptom Checker: rule-based decision tree, instant, no API cost, with emergency red-flag handling
- Admin panel with counts and recent bookings

## Run locally
```bash
npm install
cp .env.example .env        # fill DATABASE_URL, NEXTAUTH_SECRET (SMTP optional)
npx prisma db push          # creates tables
npm run db:seed             # demo departments, doctors, admin, patient
npm run dev                 # http://localhost:3000
```
Demo logins (password `Password@123`): `admin@medislot.test`, `patient@medislot.test`, `doctor1@medislot.test` ... `doctor9@medislot.test`

If SMTP is not configured, emails are skipped and logged to the console, so everything else still works.

## How it works
| Part | File |
|---|---|
| Data model | `prisma/schema.prisma` |
| Slot generation + conflict detection | `lib/slots.ts`, `app/api/appointments/route.ts` |
| Auth + roles | `lib/auth.ts` |
| Symptom decision tree | `lib/symptoms.ts`, `app/symptom-checker/page.tsx` |
| Prescription PDF | `app/api/prescriptions/[appointmentId]/pdf/route.ts` |
| Reminder emails | `app/api/cron/reminders/route.ts` (`vercel.json` runs it hourly) |

## API
- `GET /api/doctors?department=Cardiology`
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD`
- `POST /api/appointments` `{doctorId, date, time, reason}`
- `GET /api/appointments`, `DELETE /api/appointments/:id`
- `POST /api/prescriptions` (doctor only), `GET /api/prescriptions/:appointmentId/pdf`

## Deploy
Push to GitHub, import on Vercel, add a Postgres database (Neon or Supabase), set the env vars from `.env.example`, run `npx prisma db push` and `npm run db:seed` once.

## Roadmap
LLM-powered symptom triage, video consultations, SMS reminders, multi-hospital support.

> The symptom checker is guidance only and not a medical diagnosis.
