# Owner actions

Things only the owner can do: dashboard settings, accounts, money, product decisions. Agents add items here when they hit one; the owner ticks them off.

## Open

- [ ] **Enable auto-renew for `artmuse.app`** in Vercel → Domains. The domain expires on 2027-05-31.
- [ ] **Decide whether to sign everyone out.** Until 2026-11-23, production returned a working magic link for any email address, so anyone could have created a session for any account. Sessions last 30 days. Rotating `AUTH_SECRET` in Vercel → Settings → Environment Variables (Production), then redeploying, invalidates every existing session. Cost: every real user signs in again once email sign-in is on.
- [ ] **Add `AUTH_SECRET` to the Preview environment** in Vercel, so preview deployments sign tokens with a private key instead of the public development fallback.

## Done

- [x] `PUBLIC_APP_URL=https://artmuse.app` set for Production; `museums-eu-atlas.vercel.app` redirects to `artmuse.app` (2026-11-23).
