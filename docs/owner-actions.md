# Owner actions

Things only the owner can do: dashboard settings, accounts, money, product decisions. Agents add items here when they hit one; the owner ticks them off.

## Open

- [ ] **Add `CRON_SECRET` for the daily digest** (the agent was not permitted to write Vercel env vars). Until then `/api/cron/digest` answers 401 and no digest is sent. Run, then redeploy or wait for the next push:
  `cd ~/DevTools/Repos-Dev/museums-eu-atlas && openssl rand -base64 48 | tr -d '\n' | vercel env add CRON_SECRET production --sensitive --scope aydar-ga-projects`
- [ ] **Enable Vercel Web Analytics** for the project: Vercel → museums-eu-atlas → Analytics → Enable. The `<Analytics />` component already ships on Vercel deployments.
- [ ] **Enable auto-renew for `artmuse.app`** in Vercel → Domains. The domain expires on 2027-05-31.

## Done

- `AUTH_SECRET` rotated for Production by the owner and added for Preview by the orchestrator (2026-11-23, sensitive, never printed). The new Production secret takes effect on the next production deploy and invalidates every session minted before it, including any made through the old magic-link bypass, so everyone signs in again.
- [x] `PUBLIC_APP_URL=https://artmuse.app` set for Production; `museums-eu-atlas.vercel.app` redirects to `artmuse.app` (2026-11-23).
