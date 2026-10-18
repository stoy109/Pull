# Security Policy

## Supported versions

Only the latest production deployment of the Pull platform (`pull-phi.vercel.app`) is maintained. Older deployments and forks are out of scope.

## Reporting a vulnerability

Please report suspected security issues **privately** — do not open a public issue:

- **Email:** [halo@pull.id](mailto:halo@pull.id) — subject `[SECURITY] <short summary>`
- **GitHub:** open a [private vulnerability report](https://github.com/stoy109/Pull/security/advisories/new) (Security tab → *Report a vulnerability*)

You can expect an acknowledgement within **3 working days**. A useful report includes:

- a description of the issue and its impact,
- reproduction steps or a proof of concept,
- the affected URL/commit, if known.

Valid reports will be credited in the release notes unless you prefer to stay anonymous.

## Scope

**In scope:** the Pull web app served from `pull-phi.vercel.app`, its build pipeline, and the code in this repository.

**Out of scope:** third-party services (Vercel, Supabase, GitHub), the separate landing page (`pull-landing-page.vercel.app`), social engineering, and volumetric/denial-of-service testing.

## Hardening notes

- Baseline security headers are configured in [`vercel.json`](./vercel.json) and apply to preview and production deployments. The framework banner (`x-powered-by`) is disabled in [`next.config.ts`](./next.config.ts). A full Content-Security-Policy is planned as a follow-up.
- Automated dependency updates (Dependabot) and CodeQL code scanning are enabled for this repository.
