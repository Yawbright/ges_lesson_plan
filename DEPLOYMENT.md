# First Version Deployment

This app deploys as three production pieces:

1. Supabase database, auth, and Edge Functions
2. Parser service on Render
3. Expo web app as a static site

## 1. Preflight

Run these from the project root:

```powershell
npm install
npm.cmd run typecheck
npm.cmd run verify:refactor
```

Create a production `.env` locally before building the web app:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xzgflafcenfnwiqexxuf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not put server secrets in the Expo hosting provider. Server secrets belong in Supabase or Render only.

## 2. Supabase

Apply database migrations:

```powershell
npx supabase link --project-ref xzgflafcenfnwiqexxuf
npx supabase db push
```

The latest admin migrations include:

- `0015_admin_overview_metrics.sql`: moves admin dashboard totals into one SQL aggregate RPC.
- `0016_admin_performance_indexes.sql`: adds indexes for admin report pagination and dashboard metrics.
- `0017_teaching_notes.sql`: adds saved teaching-note versions, the teaching-notes credit kind, and updated admin metrics.

Set production function secrets:

```powershell
npx supabase secrets set ANTHROPIC_API_KEY
npx supabase secrets set PAYSTACK_SECRET_KEY
npx supabase secrets set PAYSTACK_CALLBACK_URL=https://your-web-app-domain/credits
npx supabase secrets set PARSER_BACKEND=render
npx supabase secrets set PARSER_RENDER_SERVICE_URL=https://your-render-parser-url.onrender.com
npx supabase secrets set PARSER_SERVICE_URL=https://your-render-parser-url.onrender.com
npx supabase secrets set DEV_CREDIT_GRANT_SECRET
```

Deploy all Edge Functions:

```powershell
npx supabase functions deploy generate-lesson-plan
npx supabase functions deploy generate-teaching-notes
npx supabase functions deploy generate-scheme
npx supabase functions deploy initialize-credit-purchase
npx supabase functions deploy verify-credit-purchase
npx supabase functions deploy paystack-webhook
npx supabase functions deploy parse-uploaded-scheme
npx supabase functions deploy dev-grant-credits
npx supabase functions deploy referral-dashboard
npx supabase functions deploy apply-referral
npx supabase functions deploy validate-referral-code
npx supabase functions deploy log-app-error
npx supabase functions deploy admin-tools
```

Admin dashboard notes:

- `admin-tools` is the only admin API Edge Function.
- The overview cards use `admin_overview_metrics`, so run `npx supabase db push` before deploying or testing the latest admin dashboard.
- Teaching notes use the `teaching_notes_generation` feature credit cost, which defaults to 1 credit and can be edited in Admin > Settings.
- Users, payments, referrals, usage, credits, and logs use server-side pagination. Use the in-app Load more buttons for older records.
- For local Edge Function validation, install Deno and run `deno check supabase/functions/admin-tools/index.ts` after dependencies can be fetched.

Teaching notes image notes:

- `ANTHROPIC_API_KEY` is required for teaching-note generation.
- For now, Claude produces comprehensive notes, structured diagrams/charts/tables, curated-image suggestions, and image prompts/placeholders.
- Real AI image file generation is intentionally disabled for v1 and can be activated later with a dedicated image provider.

Invitation-only signup notes:

- Run `npx supabase db push` before testing new signups.
- The founder invitation code is `KHERKHELLY`.
- Migration `0007_founder_referral_code.sql` maps that code to `sesorkelly@gmail.com`. That founder account must exist before the migration can create the code.
- Migration `0008_enforce_invitation_signup.sql` blocks new Auth users unless signup metadata contains a valid invitation code.

If `KHERKHELLY` says it was not found, run this in the Supabase SQL editor after confirming your founder account exists:

```sql
do $$
declare
  v_founder_user_id uuid;
begin
  select id
  into v_founder_user_id
  from auth.users
  where lower(email) = 'sesorkelly@gmail.com'
  limit 1;

  if v_founder_user_id is null then
    raise exception 'Founder account not found';
  end if;

  delete from public.referral_codes
  where upper(code) = 'KHERKHELLY'
    and user_id <> v_founder_user_id;

  insert into public.referral_codes (user_id, code)
  values (v_founder_user_id, 'KHERKHELLY')
  on conflict (user_id) do update
  set code = excluded.code,
      updated_at = now();
end;
$$;
```

In Supabase Auth settings:

- Set the production Site URL to your web app URL.
- Add your local development URL as an additional redirect URL if needed.
- Decide whether email confirmation is enabled for launch.
- Email confirmation links should use your production Site URL, for example:

```text
https://your-netlify-site.netlify.app
```

If confirmation emails open `http://localhost:3000`, the Supabase Auth Site URL is still pointing to localhost.
- For password reset, make sure this redirect URL is allowed:

```text
https://your-web-app-domain/sign-in?reset=1
```

## 3. Paystack

Use live keys for production.

Set the webhook URL in Paystack:

```text
https://xzgflafcenfnwiqexxuf.supabase.co/functions/v1/paystack-webhook
```

Run one small live payment test before public launch.

## 4. Parser Service Backend

The parser service can run on either Render or Google Cloud Run. The Expo app does not call the parser directly in production. Upload parsing goes:

```text
Expo app -> Supabase Edge Function -> active parser backend
```

This keeps credit deduction and auth inside Supabase.

### Backend Secrets

Supabase uses these secrets:

```env
PARSER_BACKEND=render
PARSER_SERVICE_URL=https://active-parser-url
PARSER_RENDER_SERVICE_URL=https://your-render-parser-url.onrender.com
PARSER_CLOUD_RUN_SERVICE_URL=https://your-cloud-run-parser-url.run.app
```

`PARSER_SERVICE_URL` is the active fallback URL. `PARSER_BACKEND` can be:

```text
render
cloud-run
active
```

### Switch Backend

Render:

```powershell
npm run parser:switch -- -Provider render -Url https://your-render-parser-url.onrender.com
npx supabase functions deploy parse-uploaded-scheme
```

Cloud Run:

```powershell
npm run parser:switch -- -Provider cloud-run -Url https://your-cloud-run-parser-url.run.app
npx supabase functions deploy parse-uploaded-scheme
```

If only `PARSER_BACKEND` changes and both backend URL secrets already exist, you can run:

```powershell
npm run parser:switch -- -Provider render
```

or:

```powershell
npm run parser:switch -- -Provider cloud-run
```

### Render

The repo has `render.yaml` and `parser-service/Dockerfile`.

In Render:

1. Create a Blueprint or Web Service from this repo.
2. Use the Docker service defined in `render.yaml`.
3. Add this secret:

```env
ANTHROPIC_API_KEY=<set this in Render, not in the repo>
```

After Render deploys, open:

```text
https://your-render-parser-url.onrender.com/health
```

Then copy the Render URL into Supabase:

```powershell
npm run parser:switch -- -Provider render -Url https://your-render-parser-url.onrender.com
```

### Cloud Run

Build and deploy the same Docker service to Cloud Run:

```powershell
gcloud run deploy ghana-lesson-planner-parser `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars PARSER_SERVICE_PORT=8080,LOCAL_AI_MODEL=claude-sonnet-4-5 `
  --set-secrets ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest
```

After deploy, open:

```text
https://your-cloud-run-parser-url.run.app/health
```

Then switch Supabase to Cloud Run:

```powershell
npm run parser:switch -- -Provider cloud-run -Url https://your-cloud-run-parser-url.run.app
```

## 5. Build the Web App

Build static web files:

```powershell
npm.cmd run build:web
```

The output folder is `dist`.

Deploy `dist` to a static host such as Netlify, Vercel, Render Static Site, or Cloudflare Pages.

Recommended static host settings:

```text
Build command: npm run build:web
Publish directory: dist
```

For Netlify, these settings are already captured in `netlify.toml`, so Netlify should detect them automatically after you connect the repo.

Routing notes:

- Netlify uses `public/_redirects`, which is copied into `dist` during export.
- Vercel uses `vercel.json`.
- These files make direct links and browser refreshes work for app routes such as `/generate`, `/profile`, and referral sign-up links.

Environment variables for the static host:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xzgflafcenfnwiqexxuf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. Launch Smoke Test

After the site is deployed:

1. Sign up with a new email.
2. Confirm the email if confirmation is enabled.
3. Sign in.
4. Save teacher details and class size.
5. Generate or parse a scheme.
6. Generate one lesson plan.
7. Generate `All` lessons for a week.
8. Export PDF and confirm each lesson starts on a new page.
9. Buy credits with Paystack live test.
10. Check referral code loads and copy/share works.

## 7. Production Notes

- Keep `DEV_CREDIT_GRANT_SECRET` private. Remove or rotate it if it is ever exposed.
- Do not commit `.env`.
- The static web app only receives `EXPO_PUBLIC_*` values.
- Supabase Edge Functions are responsible for Anthropic, Paystack, credit deduction, and referral rewards.
