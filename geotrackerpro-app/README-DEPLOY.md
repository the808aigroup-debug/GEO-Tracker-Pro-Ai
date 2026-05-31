# GeoTrackerPro — Free Audit MVP · Deploy Guide

This is the working app for your free GEO audit. A visitor enters a URL + email, the app crawls the site, scores it against your **locked 10-factor rubric** using Claude, shows a branded report on screen, and (optionally) emails it.

Built on **Next.js** so it deploys to **Vercel** in a couple of clicks. The only thing required to go live is your Anthropic API key. Resend (email), Supabase (lead storage), and Browserless (JS-heavy sites) are optional and can be switched on later — the app runs without them.

---

## What you need before you start

1. A **GitHub** account (free) — github.com
2. A **Vercel** account (free) — vercel.com (sign up with your GitHub)
3. An **Anthropic API key** — console.anthropic.com → API Keys → Create Key (starts with `sk-ant-`)

That's it for v1. Total cost to launch: $0 in tooling + a few cents of Claude usage per audit.

---

## Step 1 — Put the code on GitHub

Easiest path (no command line):

1. Go to github.com → **New repository** → name it `geotrackerpro-app` → Create.
2. On the new repo page, click **uploading an existing file**.
3. Drag in **everything inside the `geotrackerpro-app` folder** (the `app/`, `lib/` folders and the `package.json`, `next.config.js`, `.gitignore`, `.env.example` files).
   - Do **not** upload `node_modules` or `.next` if they exist — they're not needed.
4. Click **Commit changes**.

---

## Step 2 — Deploy to Vercel

1. Go to vercel.com → **Add New… → Project**.
2. **Import** your `geotrackerpro-app` repo.
3. Vercel auto-detects Next.js — leave all build settings on default.
4. Before clicking Deploy, open **Environment Variables** and add this one (required):

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | your `sk-ant-...` key |

5. Click **Deploy**. ~1 minute later you'll get a live URL like `geotrackerpro-app.vercel.app`.

Open it and run an audit on a real website. You're live.

---

## Step 3 (optional) — Turn on email delivery (Resend)

Without this, the report shows on screen but isn't emailed.

1. Sign up at resend.com (free tier: 3,000 emails/mo).
2. Add + verify your domain `geotrackerpro.ai` (Resend walks you through the DNS records — SPF, DKIM).
3. Create an API key (starts with `re_`).
4. In Vercel → your project → **Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = your `re_...` key
   - `RESEND_FROM_EMAIL` = `reports@geotrackerpro.ai`
   - `RESEND_FROM_NAME` = `GeoTrackerPro`
5. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the new keys take effect.

**Lead-gen / nurture campaign:** to also auto-add each lead to an email nurture sequence,
add `RESEND_AUDIENCE_ID` (from Resend → Audiences) and follow the full setup +
ready-to-paste email copy in **`NURTURE-SEQUENCE-Book-A-Call.md`**.

---

## Step 4 (optional) — Save leads to a database (Supabase)

Without this, audits run but leads aren't stored.

1. Create a project at supabase.com (free tier).
2. In the Supabase **SQL Editor**, paste and run the `audits` table SQL from your
   `06-API-Integration-Spec.md` (section 3).
3. In Vercel env vars add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_KEY` = your service role key (Settings → API)
4. Redeploy.

---

## Step 5 (optional) — Better scraping for JS-heavy sites (Browserless)

The app uses plain HTTP fetch by default, which works for most sites. Single-page
apps (React/Vue sites that render content with JavaScript) may come back thin. If you
see low scores on sites you know are good, add Browserless:

1. Sign up at browserless.io, get an API key.
2. In Vercel env vars add `BROWSERLESS_API_KEY` = your key.
3. Redeploy. The homepage will now be rendered with JavaScript before scoring.

---

## What's NOT in this v1 (your roadmap)

Per your own strategy doc — ship the wedge first, build the rest against paid feedback:

- **$47 Pro report + Stripe checkout** — next milestone
- **GoHighLevel CRM push + nurture workflow** — wire in after leads start flowing
- **$97/mo Monthly Tracker + scheduled re-audits**
- **PDF attachment** of the report
- **The other 50+ agents**

The architecture is ready for all of it: the audit engine (`lib/`) is the reusable core,
and new "agents" slot in as new prompt/rubric configs without rebuilding anything.

---

## Cost guardrails (from your locked spec)

- Free audit uses `claude-sonnet-4-6`, ~$0.05–0.20 per audit.
- The app re-computes the weighted score in code (`lib/claude.js`) so the math is always
  exact, regardless of the model.
- Add a CAPTCHA (Cloudflare Turnstile) and IP rate-limiting before you drive paid traffic —
  noted in `06-API-Integration-Spec.md` section 12.

---

## File map

```
geotrackerpro-app/
├── app/
│   ├── layout.js            # page shell + metadata
│   ├── page.js              # landing form + analyzing state + on-screen report
│   ├── globals.css          # styling
│   └── api/audit/route.js   # the audit endpoint (validate → scrape → Claude → email)
├── lib/
│   ├── prompt.js            # LOCKED system + user prompt + 10-factor rubric (verbatim)
│   ├── scraper.js           # fetch homepage/robots/sitemap/interior pages + JSON-LD
│   ├── claude.js            # Anthropic call, JSON parse/retry, weighted scoring
│   ├── report.js            # branded HTML report (for email)
│   ├── email.js             # Resend send (optional)
│   └── db.js                # Supabase lead storage (optional)
├── package.json
├── next.config.js
└── .env.example             # copy to .env.local for local testing
```

## Run it locally first (optional)

```bash
cd geotrackerpro-app
npm install
cp .env.example .env.local      # then paste your ANTHROPIC_API_KEY into .env.local
npm run dev                     # open http://localhost:3000
```
