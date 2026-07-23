This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run quality checks before opening a PR:

```bash
npm run lint
npm run typecheck
npm run build
```

You can start editing the login page by modifying `app/(auth)/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Lato.

## Environment

Create a local `.env.local` file with these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MVP_AUTH_MODE=true
```

The app validates required Supabase variables through `lib/env.ts`. Only publishable Supabase keys should be exposed through `NEXT_PUBLIC_*` variables. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipasang pada environment server Vercel/lokal dan tidak boleh memakai prefix `NEXT_PUBLIC_`.

### Mode Auth MVP

Mode MVP aktif secara default (`MVP_AUTH_MODE` selain `false`). Register/login memakai cookie demo `httpOnly`; email, OTP, Google OAuth, dan penyimpanan password dilewati. Pilihan role dan profil onboarding tetap tersimpan selama 7 hari agar seluruh dashboard dapat didemokan. Untuk membuka dashboard Administrator, login dengan `admin@pull.demo` dan kata sandi apa pun yang tidak kosong.

Set `MVP_AUTH_MODE=false` saat siap mengaktifkan Supabase Auth kembali. Activity write juga dilewati selama mode MVP karena user demo tidak mempunyai foreign key di `auth.users`. Mode ini hanya untuk demo/hackathon, bukan production.

## Constraint 1: Multi-Role & Activity Monitoring

Jalankan `supabase/migrations/20260723_activity_logs.sql` melalui Supabase SQL Editor, lalu buat akun demo untuk role `umkm`, `pekerja`, `supplier`, dan `admin`. Akun admin tetap memerlukan grant database; metadata role saja tidak memberi akses:

```sql
insert into public.profiles (id, is_admin)
values ('UUID_USER_ADMIN', true)
on conflict (id) do update set is_admin = excluded.is_admin;
```

Setelah minimal satu user tersedia, jalankan `supabase/seed-activity-demo.sql`. Script menghapus seed demo lama lalu membuat 32 aktivitas lintas empat role.

### Cara Demo Constraint 1

1. Login sebagai admin, buka `/admin`, lalu tunjukkan pengguna aktif 24 jam, aktivitas hari ini, lima aktivitas terbaru, dan distribusi aktivitas per role.
2. Ubah filter role dan rentang waktu pada tabel aktivitas; data tabel harus ikut berubah.
3. Login sebagai UMKM, buka `/dashboard/pools`, buat pool baru, lalu kembali ke `/admin`; jumlah aktivitas dan audit terbaru bertambah.
4. Login sebagai supplier, buka `/supplier`, lalu tunjukkan layout, menu, demand insight, metrik, dan daftar pool yang berbeda dari dashboard UMKM/admin.
5. Login sebagai pekerja, buka `/worker/activity`, lalu tunjukkan riwayat real dari API `/api/worker/activities` beserta filter Lamaran/Profil/Bukti.

### Retensi Data Request

IP dan user-agent wajib dianonimkan setelah 30 hari. Placeholder berikut perlu dijadwalkan harian lewat Supabase Cron atau Scheduled Edge Function saat deployment:

```sql
create or replace function public.redact_old_activity_request_data()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.activity_logs
  set ip = null, user_agent = null
  where created_at < now() - interval '30 days'
    and (ip is not null or user_agent is not null);
$$;

-- Placeholder jadwal pg_cron:
-- select cron.schedule('redact-activity-request-data', '15 0 * * *',
--   'select public.redact_old_activity_request_data()');
```

Dashboard supplier dan ringkasan UMKM membaca event audit `pool.create`, `job.post`, dan `job.apply` dari Supabase. Ini mempertahankan SPA mock existing sambil membuat monitoring demo memakai data database nyata.

## Project Structure

```text
app/                  Route definitions, route groups, metadata, and global styles
  (auth)/             Login, registration, verification, and reset-password routes
  (protected)/        Onboarding and authenticated application routes
  (public)/           Public legal pages
features/             Feature-specific actions, components, and data access
lib/                  Shared helpers, environment validation, and Supabase clients
public/               Static assets grouped by feature, plus the service worker
```

Route-group folder names in parentheses organize the code without changing public URLs. Keep route files in `app/`, and place reusable domain code in its matching `features/<feature>/` folder.

## Design System Foundation

Design tokens live in `app/globals.css` and are exposed to Tailwind through CSS theme variables and `tailwind.config.ts`.

### Color Palette

Primary:

- `primary-500`: `#145C46`

Secondary:

- `secondary-500`: `#299A45`

Accent:

- `accent-green`: `#A7C840`
- `accent-yellow`: `#EDC113`
- `accent-orange`: `#EC8E3B`
- `accent-red`: `#B61F3E`

Each brand color includes 50-900 shade variables for consistent UI states.

### Semantic Color Tokens

Use semantic tokens in components instead of raw hex values:

```tsx
<section className="bg-surface text-text-primary border-border">
  <h1 className="text-heading text-primary">Pull</h1>
  <p className="text-body text-text-secondary">Reusable design tokens.</p>
</section>
```

Available semantic tokens include `primary`, `secondary`, `accent-green`, `accent-yellow`, `accent-orange`, `accent-red`, `background`, `surface`, `surface-muted`, `surface-inverse`, `foreground`, `text-primary`, `text-secondary`, `text-muted`, `text-inverse`, `border`, `border-muted`, `success`, `warning`, and `danger`.

### Typography Scale

The default font stack is `Lato, Inter, system-ui, sans-serif`.

| Token | Size | Line height | Weight |
| --- | ---: | ---: | ---: |
| `text-heading` | 40px | 48px | 700 |
| `text-subheading` | 32px | 40px | 500 |
| `text-body` | 24px | 36px | 300 |

Use the typography tokens for primary content hierarchy instead of inline font-size utilities.

## Supabase And Data

Supabase helpers are split by runtime:

- `lib/supabase/client.ts` for browser components.
- `lib/supabase/server.ts` for server components and server-side reads.
- `lib/supabase/middleware.ts` for session refresh in `proxy.ts`.

Before creating tables during the hackathon:

- Use lowercase plural table names.
- Enable Row Level Security for user-owned data.
- Avoid service role keys in the frontend.
- Document each table purpose and ownership rule in the PR.

## Hackathon Workflow

Use this flow once the two unknown challenges are announced:

1. Create one branch per challenge, such as `challenge-1/short-name` and `challenge-2/short-name`.
2. Fill out the challenge intake before coding.
3. Build the smallest complete user flow first.
4. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
5. Deploy a preview and verify it on mobile and desktop.
6. Merge only after the flow is demo-ready.

Challenge intake template:

```md
## Challenge
What is being asked?

## User Flow
What must the user do?

## Data Needed
Tables, API calls, external services?

## UI Needed
Pages, components, states?

## Risks
Auth, deployment, performance, unknown APIs?

## First 90 Minutes
Concrete implementation plan.
```

## Deployment

Preferred deployment target: Vercel.

Before the hackathon:

- Connect the GitHub repository.
- Add the Supabase environment variables.
- Confirm preview deployments work.
- Keep the deploy path documented so challenge branches can be tested quickly.

## Pre-Hackathon Checklist

- [ ] Clean working tree before kickoff.
- [ ] Base branch includes the design system and UI primitives.
- [ ] Every teammate can run `npm install` and `npm run dev`.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- [ ] Preview deployment is configured.
- [ ] Supabase project and env vars are available.
- [ ] Branch strategy is agreed.
- [ ] No domain-specific feature is built before challenges are announced.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
