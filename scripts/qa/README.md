# QA suites

End-to-end and security suites for Pull. They run against a **real linked
Supabase project** and a running dev server — they are not mocked tests.

Everything here creates data, so every run must be followed by the cleanup
steps below. The suites are written to restore the database themselves, but
`qa-cleanup` + `qa-users delete` are the safety net.

## Requirements

- `npm install` (installs `pg` and `playwright-core`)
- A Chromium build: `npx playwright install chromium`, or point
  `QA_CHROME_PATH` at an existing binary
- The project linked: `npx supabase link --project-ref <ref>`, so that
  `supabase/.temp/pooler-url` exists
- The dev server running on `http://localhost:3000` (`npm run dev`)

## Environment

| Variable | Used by | Notes |
|---|---|---|
| `QA_PASSWORD` | all | Password given to the throwaway `qa.*` accounts |
| `PGPASSWORD` | all DB suites | Database password for the linked project |
| `SUPABASE_URL` | `qa-users` | Project URL, e.g. `https://<ref>.supabase.co` |
| `SERVICE_ROLE` | `qa-users` | Service-role key, only for creating/deleting accounts |
| `QA_BASE_URL` | all | Defaults to `http://localhost:3000` |
| `QA_CHROME_PATH` | browser suites | Defaults to playwright's own Chromium |
| `QA_SHOTS_DIR` | browser suites | Defaults to `scripts/qa/shots/` (git-ignored) |
| `QA_PROJECT_DIR` | DB suites | Defaults to the repo root |

Never commit these values.

## Running

```bash
npm run qa:users                 # create the qa.* accounts
npm run qa:full                  # 4 roles, guards, session lifecycle, 404
npm run qa:api                   # PostgREST + RLS audit with real user tokens
npm run qa:realtime              # write in one session, refresh another
npm run qa:validation            # server-side rejection of malformed input
npm run qa:notif                 # UMKM notification inbox
npm run qa:notify:events         # application + pool-target triggers
npm run qa:notify:jobs           # new-job fan-out per district
npm run qa:notify:supplier       # supplier pool-demand fan-out
npm run qa:cleanup               # inspect leftovers (read-only)
npm run qa:cleanup:run           # delete leftovers
npm run qa:users:delete          # delete the qa.* accounts
```

Each suite prints `ok`/`FAIL` per check and exits non-zero when something
fails, so it can gate a release.

## Baseline

A healthy project after cleanup looks like this:

```
auth.users 11 | profiles 11 | activity_logs 45 | job_postings 1
job_applications 1 | pools 0 | supplier_offers 1 | notifications 1
```

`qa-cleanup inspect` prints the current numbers next to these.

## Gotchas worth remembering

- **`activity_logs.actor_id` is nulled, not cascaded,** when a profile is
  deleted. Delete a QA account's logs *before* its profile, otherwise the rows
  are orphaned.
- **`pools_enforce_initial_hour_window`** forces `deadline = now() + 1 hour` on
  insert. To test an expired pool, update the deadline *after* inserting.
- **`supplier_offers_one_active_catalog_idx`** allows only one active catalogue
  row per supplier, so a supplier can never match two catalogue entries at once.
- **`pools.target_quantity` is `numeric(14,3)`**, so `NEW.x::text` always renders
  three decimals and `rtrim(rtrim(...,'0'),'.')` is safe. It would *not* be safe
  for an unscaled `numeric`; use `trim_scale()` if that type ever changes.
- **HTML5 constraints** (`required`, `min`, `minlength`) stop a normal click from
  reaching a server action. `qa-validation` strips them first to test what an
  attacker bypassing the browser would send.
- **Piping to `tail` can SIGTERM a long suite.** Redirect to a file instead.
