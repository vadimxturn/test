# Agency Client Platform

A Next.js 16 + Supabase agency client management platform.

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **TypeScript** — strict mode
- **Supabase** — Postgres, Auth, Row Level Security
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — accessible component library
- **Resend** — transactional email (Step 8)
- **Zod** — schema validation
- **React Hook Form** — form state management

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo>
cd agency-client-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from the same page
- `SUPABASE_SERVICE_ROLE_KEY` — from the same page (keep secret)
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

### 3. Run database migrations

Open the [Supabase SQL Editor](https://supabase.com/dashboard) and run the following files **in order**:

```
db/migrations/001_schema.sql   — tables, indexes, enums
db/migrations/002_rls.sql      — row level security policies + helper functions
db/migrations/003_triggers.sql — new-user profile trigger, role escalation guard
```

> Alternatively, if you have the Supabase CLI:
> ```bash
> supabase db push
> ```
> (You'll need to move the files into `supabase/migrations/` and rename them with timestamps.)

### 4. Configure Supabase Auth

In the Supabase Dashboard:

1. **Authentication → Email** — enable "Email" provider, configure OTP expiry.
2. **Authentication → URL Configuration** → add `http://localhost:3000/auth/callback` to Redirect URLs.
3. Optionally enable "Magic Link" under Email settings.

### 5. Seed an admin user

After running migrations, create a user via Supabase Auth, then manually set their role:

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

### 6. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — unauthenticated users are redirected to `/login`.

---

## Folder Structure

```
app/
  login/           — login page (password + magic link)
  auth/callback/   — Supabase OAuth / magic-link callback handler
  admin/           — admin dashboard (Step 5)
  client/          — client dashboard (Step 6)

components/
  ui/              — shadcn/ui components
  sign-out-button  — shared sign-out component

lib/
  supabase/
    client.ts      — browser Supabase client
    server.ts      — server Supabase client (+ service-role client)
    middleware.ts  — session refresh + role-based redirects
  types/
    database.ts    — TypeScript types matching the DB schema

db/
  migrations/      — SQL migration files (run manually or via CLI)

middleware.ts      — Next.js middleware (delegates to lib/supabase/middleware.ts)
```

---

## Role Routing

| Path | Allowed roles | Unauthenticated |
|---|---|---|
| `/login` | — (public) | ✅ |
| `/admin/*` | `admin` | → `/login` |
| `/client/*` | `client` | → `/login` |
| `/` | — | → `/login` or role dashboard |

Admins visiting `/client/*` are redirected to `/admin`.
Clients visiting `/admin/*` are redirected to `/client`.

---

## Build Phases

| Phase | Status |
|---|---|
| Step 1 — DB schema | ✅ |
| Step 2 — RLS policies | ✅ |
| Step 3 — Auth + routing | ✅ |
| Step 4 — Onboarding questionnaire | 🔜 |
| Step 5 — Admin dashboard | 🔜 |
| Step 6 — Client dashboard | 🔜 |
| Step 7 — Messaging | 🔜 |
| Step 8 — Email notifications | 🔜 |
