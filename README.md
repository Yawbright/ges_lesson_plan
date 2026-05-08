# Ghana Lesson Planner

AI-powered lesson plan + scheme of work generator for Ghanaian teachers, built with **Expo (React Native + TypeScript)**, **Supabase**, and **Anthropic Claude**.

## Features

- Sign in / sign up (Supabase email auth).
- Credit wallet with Paystack checkout before cloud AI generation.
- Generate a full lesson plan from just **Subject + Class + Week** (and optional notes).
- Render plans in the standard Ghanaian table-style layout (header block, curriculum fields, 3-phase delivery table).
- Upload a termly **Scheme of Learning** (PDF) as reference for the AI.
- Generate a 12-week **Scheme of Work** for any subject / class / term.
- Library of saved plans (per teacher, RLS-protected).

## Stack

| Layer    | Tech                                                          |
| -------- | ------------------------------------------------------------- |
| App      | Expo SDK 51, Expo Router 3, TypeScript, React Native 0.74     |
| Auth/DB  | Supabase (email auth, Postgres, Row-Level Security, Storage)  |
| AI       | Anthropic Claude, called from Supabase Edge Functions (Deno)  |

The Anthropic API key **never leaves the server** — it is stored as a Supabase function secret.

## Project layout

```
app/                       Expo Router screens
  (auth)/sign-in.tsx
  (tabs)/generate.tsx      Subject + Class + Week prompt form
  (tabs)/library.tsx       Saved lesson plans
  (tabs)/schemes.tsx       Upload & generate schemes
  (tabs)/profile.tsx
src/
  components/              Button, Field, LessonPlanTable
  lib/                     supabase, ai (edge-function client), auth hook
  theme/colors.ts
  types/                   LessonPlan, SchemeOfLearning
supabase/
  migrations/0001_init.sql Schema + RLS + storage bucket
  functions/
    _shared/claude.ts      Anthropic caller
    generate-lesson-plan/  Edge function
    generate-scheme/       Edge function
```

## Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure environment

Copy [.env.example](.env.example) to `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Provision Supabase

```powershell
# one-time
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

# apply schema, RLS, storage bucket
supabase db push

# set the Anthropic key (server-only)
npx supabase secrets set ANTHROPIC_API_KEY
npx supabase secrets set PAYSTACK_SECRET_KEY
supabase secrets set PARSER_SERVICE_URL=https://your-parser-service-url
npx supabase secrets set DEV_CREDIT_GRANT_SECRET

# optional: where Paystack sends users after checkout
supabase secrets set PAYSTACK_CALLBACK_URL=http://localhost:8081

# deploy edge functions
supabase functions deploy generate-lesson-plan
supabase functions deploy generate-scheme
supabase functions deploy initialize-credit-purchase
supabase functions deploy verify-credit-purchase
supabase functions deploy paystack-webhook
supabase functions deploy parse-uploaded-scheme
supabase functions deploy dev-grant-credits
supabase functions deploy referral-dashboard
supabase functions deploy apply-referral
```

For production Paystack reliability, add this webhook URL in the Paystack dashboard:

```
https://<your-project-ref>.supabase.co/functions/v1/paystack-webhook
```

Developer-only test credits can be granted with:

```powershell
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/dev-grant-credits `
  -H "Content-Type: application/json" `
  -H "x-dev-credit-secret: <DEV_CREDIT_GRANT_SECRET>" `
  -d "{\"email\":\"teacher@example.com\",\"amount\":25}"
```

### 4. Run the app

```powershell
npm start
```

Press `a` for Android, `i` for iOS, or `w` for web.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the first production deployment checklist.

## Next steps

- Upload the **official lesson plan template** (image / PDF / Word) so we can align `LessonPlanTable.tsx` and the Claude system prompt to its exact field layout, ordering, and styling.
- Wire `generate.tsx` to **persist** results into `lesson_plans` and navigate to `/lesson/[id]`.
- Add **PDF parsing** of uploaded Schemes of Learning (e.g. via a separate edge function using `pdf-parse`) so the AI can ground each lesson on the right week.
- Localisation toggle (English ↔ Ghanaian languages once teaching languages are confirmed).
- Print / export to PDF (via `expo-print`).
