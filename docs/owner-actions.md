# Owner actions

Things only the owner can do: dashboard settings, accounts, money, product decisions. Agents add items here when they hit one; the owner ticks them off.

## Open

- [ ] **Enable auto-renew for `artmuse.app`** in Vercel → Domains. The domain expires on 2027-05-31.

## Done

- [x] `CRON_SECRET` added to Production by the owner (2026-11-24); the daily digest cron is authorised.
- [x] Vercel Web Analytics is live (2026-11-24): `/_vercel/insights/script.js` serves on artmuse.app.
- [x] `AUTH_SECRET` rotated for Production by the owner and added for Preview by the orchestrator (2026-11-23, sensitive, never printed). The new Production secret takes effect on the next production deploy and invalidates every session minted before it, including any made through the old magic-link bypass, so everyone signs in again.
- [x] `PUBLIC_APP_URL=https://artmuse.app` set for Production; `museums-eu-atlas.vercel.app` redirects to `artmuse.app` (2026-11-23).
