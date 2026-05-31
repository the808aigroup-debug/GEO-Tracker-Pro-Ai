# GeoTrackerPro — "Book a Call" Nurture Sequence

**Goal:** Turn free-audit leads into booked discovery calls for The 808 AI Group's done-for-you GEO service ($1.5k–$5k).
**Tool:** Resend Automations.
**Audience:** People who ran the free GEO audit on your site.
**Voice:** Confident, direct, expert — same voice as the audit report. No fluff, no hype.

> **Merge tags:** Resend uses `{{{FIRST_NAME}}}` for personalization. Where a first name may be missing, the fallback below uses `{{{FIRST_NAME|there}}}` which renders "there" if blank. Replace `[YOUR BOOKING LINK]` with your real calendar URL (Calendly, GHL, etc.) before publishing.

---

## How the campaign runs (the loop)

1. Someone runs a free audit → your app emails their report **and** adds them to your Resend **Audience** (the code for this is now in your app — just add `RESEND_AUDIENCE_ID` in Vercel).
2. Joining the Audience **triggers** this Automation.
3. They get 5 emails over ~12 days, each nudging toward a booked call. Anyone who replies or books should be removed from the sequence (set the exit condition in step C below).

---

## Email 1 — Day 0 (sent ~2 hours after the report)

**Subject:** {{{FIRST_NAME|there}}}, your GEO score isn't the real problem
**Preview text:** What it's actually costing you — and the fastest fix.

Hi {{{FIRST_NAME|there}}},

You just got your GEO audit, so you've seen the number. Here's the part the score doesn't say out loud:

Every month your site stays where it is, AI search engines — ChatGPT, Perplexity, Gemini — are answering your customers' questions using **someone else's** website. Usually a competitor's. The click you used to get from Google is now an answer your prospect reads without ever seeing your name.

That's not a future problem. It's happening on every AI search right now.

The good news: GEO is fixable, and most of your competitors haven't even started. The businesses that fix this in the next few months get cited as "the answer" — and that position is sticky once you own it.

If you want, I'll walk you through your specific report on a quick call and show you the 2–3 fixes that move your score the most. No pitch deck, just your site on the screen.

**[Book your free GEO strategy call →]([YOUR BOOKING LINK])**

— Devin
The 808 AI Group

---

## Email 2 — Day 2

**Subject:** What a 90/100 site does that yours doesn't (yet)
**Preview text:** It's not more content. It's structure.

Hi {{{FIRST_NAME|there}}},

Quick one. The sites that score 90+ on GEO aren't writing more — they're structured so AI can *lift answers straight off the page*.

Three things they do that most sites don't:

- **They answer questions directly.** A clear question as a heading, then a tight, quotable answer right under it. AI grabs that and cites it.
- **They prove who they are.** Schema markup, author credentials, real data. This is what tells an AI engine "this source is trustworthy."
- **They're machine-readable.** Clean structure, the right tags, AI crawlers allowed in. If GPTBot can't read you, you don't exist to ChatGPT.

Your report flags exactly which of these you're missing. On a call I'll show you the order to fix them in — because doing them in the wrong order wastes weeks.

**[Grab a time here →]([YOUR BOOKING LINK])**

— Devin

---

## Email 3 — Day 4

**Subject:** "Can't I just do this myself?"
**Preview text:** Honestly — yes. Here's the catch.

Hi {{{FIRST_NAME|there}}},

Fair question, and I'll give you a straight answer: yes, you can do GEO yourself. The factors in your report aren't secret.

The catch is time and sequencing. Schema markup, llms.txt, restructuring your top pages, building the citable content AI engines reward — each one is a project, and done in the wrong order you can spend two months and barely move the number.

What we do is compress that. We implement every fix in your report **for** you, in the order that moves your score fastest, and you watch it climb. Most clients are live with the core fixes inside the first few weeks.

If your time is worth more than the work, that's the whole pitch. Want me to scope what that looks like for your site?

**[Book a 20-minute call →]([YOUR BOOKING LINK])**

— Devin

---

## Email 4 — Day 7

**Subject:** Your competitors are already showing up in AI answers
**Preview text:** A 60-second test you can run right now.

Hi {{{FIRST_NAME|there}}},

Try this: open ChatGPT and ask it the question your best customer would ask before buying from you. Something like *"best [what you do] in [your city]"* or *"how do I choose a [your service]."*

Whoever it names is winning GEO. If that's not you, that's the gap — and it's worth real money, because the person asking is ready to buy.

This is the whole reason GEO matters now and didn't 18 months ago. AI search went from novelty to where people actually start their search. The businesses adjusting now will own their category's answers for years.

I'll run that exact test live on our call, on your real keywords, and show you what it'd take to flip the answer to you.

**[Pick a time →]([YOUR BOOKING LINK])**

— Devin

---

## Email 5 — Day 12 (soft close)

**Subject:** Should I close your file, {{{FIRST_NAME|there}}}?
**Preview text:** Last note from me — no hard feelings either way.

Hi {{{FIRST_NAME|there}}},

I've sent a few notes since your audit and don't want to crowd your inbox, so this is my last one.

If GEO isn't a priority right now, all good — keep your report, work through the action plan when you're ready, and reach out whenever.

But if being invisible to AI search *is* costing you customers and you'd rather not spend months figuring out the fix order yourself — let's talk. One call, your site on the screen, a clear plan. If we're a fit, great; if not, you still walk away knowing exactly what to do.

**[Book the call before I close your file →]([YOUR BOOKING LINK])**

Either way, thanks for running the audit.

— Devin
The 808 AI Group

---

## Setting it up in Resend (step by step)

**A. Create the Audience**
1. Resend dashboard → **Audiences** → **Create Audience** → name it `GEO Audit Leads`.
2. Open it and copy the **Audience ID** (a long id in the URL / settings).
3. In **Vercel** → your project → Settings → Environment Variables, add:
   - `RESEND_AUDIENCE_ID` = that ID
   - (and `RESEND_API_KEY` if you haven't already)
4. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy). From now on, every audit adds the lead to this Audience automatically.

**B. Build the Automation**
1. Resend → **Automations** → **Create Automation**.
2. **Trigger:** "Contact added to audience" → select `GEO Audit Leads`.
3. Add 5 **Send email** steps with **delays** between them: Day 0 (2h), Day 2, Day 4, Day 7, Day 12.
4. Paste each email's subject + body from above. (Use Resend's AI-from-description builder if you'd rather scaffold it fast, then paste the copy in.)

**C. Exit conditions (important)**
- Add an exit/stop condition so people who **book a call** or **reply** drop out of the sequence — otherwise you'll keep nudging someone who already said yes. Easiest version: tag bookers in your calendar tool and exclude that tag, or manually unsubscribe them from the audience.

**D. Before you send to real people**
- Replace every `[YOUR BOOKING LINK]` with your real calendar URL.
- Send all 5 to yourself first and read them on your phone.
- Make sure your sending domain is verified in Resend (SPF/DKIM) or these land in spam.
- Add a physical address + unsubscribe link in the footer (Resend adds unsubscribe automatically for audiences) — required by anti-spam law (CAN-SPAM).

---

## What to test / improve later

- **Subject lines** are your biggest lever — A/B test Email 1's subject first (it sets open rates for the whole sequence).
- Once you have volume, **segment by score**: low scorers (< 60) need more "you're invisible" urgency; high scorers (75+) respond better to "you're close — let's finish it."
- Add a **Broadcast** monthly to the whole Audience (a GEO tip or a "what changed in AI search this month" note) to stay warm with people who didn't book.
