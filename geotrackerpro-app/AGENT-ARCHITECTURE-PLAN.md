# GeoTrackerPro — How to Build All 60 Agents (Architecture & Build Order)

**The whole point of this doc:** you are NOT building 60 apps. You built **one engine** (the live GEO audit). Every other agent is a **config entry** that reuses that engine (or one of a few engine "types"). Adding an agent = adding a config, not deploying a new app.

---

## The 5 engine types (your 60 agents collapse into these)

Almost every agent is one of five patterns. Build the 5 engines once; everything else is config.

### Type A — AUDIT / SCORE  ← you already built this
Crawl a site → send to Claude with a rubric → return a scored report.
**Config per agent:** name, system prompt, rubric, output shape.
Agents: #1 GEO Audit (LIVE), #17 Competitor GEO Audit, #22 Schema Validator + Crawl Health, #23 Image & Alt-Text, #29 Entity Trust Score, #35 Local Semantic Relevance, #56 Lead Capture/Conversion, #57 Knowledge Graph, #58 Featured Snippet & PAA, #59 Accessibility/WCAG.
→ ~10 agents, **zero new engine work** — just new rubrics.

### Type B — GENERATE
Inputs → Claude generates an asset (schema code, content, copy, markup) → return the asset.
Agents: #16 Wikidata Submission, #19 sameAs Entity Linking, #24 Video Schema, #26 Digital PR Outreach, #30 Author/Founder Entity, #31 GEO Content Gap, #60 Blog Content Engine.
→ ~7 agents, one new engine (prompt in → text/code out).

### Type C — MONITOR / RESEARCH
Run queries against AI engines / external sources, track results over time.
Agents: #15 AI Citation Monitor, #18 Query Research, #27 Brand Perception, #28 Crawler Analytics, #32 Reddit/Community Signal, #33 Answer Injection Simulator, #36 Recommendation Probability.
→ ~7 agents, one new engine (query → compare → log). Needs scheduled runs + storage (Supabase, which you're already setting up).

### Type D — AGGREGATE / REPORT
Roll up the outputs of other agents into one client-facing report.
Agents: #25 Monthly GEO Health Score / Reporting.
→ Built last; it reads what the other agents produced.

### Type E — CUSTOM BUILD (genuinely different)
These are real standalone projects, not config:
#20 Review Intelligence (ingest reviews), #34 Podcast/Transcript Authority, #55 AI Chatbot Deployment (RAG widget).
→ Build these only after the platform is selling. #55 is your $5k/mo flagship — worth it later.

---

## The config schema (what one agent looks like as data)

Every Type A/B agent is just this object in the registry:

```js
{
  id: 17,
  name: "Competitor GEO Audit",
  type: "audit",            // audit | generate | monitor | aggregate | custom
  tier: "agency",           // starter | pro | agency
  status: "roadmap",        // live | roadmap
  needsScrape: true,
  model: "claude-haiku-4-5-20251001",
  inputs: ["url", "competitorUrl", "industry"],
  systemPrompt: "...",      // the agent's instructions
  rubric: "...",            // what it scores / how
  outputShape: { ... }      // the JSON it returns
}
```

To add Agent #18, you add one of these to the list. The engine reads it and runs. **No new deploy-from-scratch, ever.**

---

## Build order (ship in waves — do NOT build all 60 first)

Per your own strategy note: ship a sellable v1, then let paid clients tell you what to build next.

**Wave 1 — already live:** #1 GEO Audit (free) + lead capture.

**Wave 2 — the sellable v1 (~10 agents, all Type A = same engine, new rubrics):**
#17 Competitor, #22 Schema/Crawl Health, #29 Entity Trust, #35 Local Semantic, #56 Conversion, #58 Featured Snippet, #59 Accessibility, #23 Alt-Text, #57 Knowledge Graph, + #25 Monthly Report to package it.
This is your paid product. Charge for it before building more.

**Wave 3 — Generate agents (Type B):** #16, #19, #24, #30, #31, #60 — these become "done-for-you" deliverables.

**Wave 4 — Monitor agents (Type C):** #15, #18, #27, #28, #36 — the "tracker" subscription ($97/mo), needs scheduling + storage.

**Wave 5 — Custom flagships (Type E):** #55 Chatbot, #20 Reviews, #34 Podcasts — high-ticket, build against real demand.

---

## What I need from you to fill the registry

For each agent you want in the next wave, I need (from your Trello cards or the agent docs):
1. What it scores or generates (the rubric / the output).
2. Its inputs (what the user types in).
3. Its tier (starter / pro / agency).

I already have agents 15–36 and 55–60 in your docs. Paste me agents **1–14** and **37–54** (or export the Trello cards) and I can convert all 60 into config entries.

---

## Bottom line

- One engine, many configs. ✅ (engine is live)
- ~60 agents = ~5 engine types + a list of configs.
- Build in waves; sell Wave 2 before building Wave 3.
- Adding an agent = adding a config object, not a new app.
