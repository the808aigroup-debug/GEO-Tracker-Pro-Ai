// ============================================================
// GeoTrackerPro — AGENT REGISTRY (all 60)
// Single source of truth. The engine (lib/runAgent.js) runs the
// built ones; the Control Panel (/agents) renders all of them.
// Tiers match Devin's canonical "Full Platform Recap":
//   STARTER (5):  1,2,3,5,8
//   PRO (31):     4,6,7,9,10,11,14,16,18,19,21,22,23,24,28,30,32,
//                 34,35,37,38,39,40,45,46,47,53,56,58,59,60
//   AGENCY (24):  12,13,15,17,20,25,26,27,29,31,33,36,41,42,43,44,
//                 48,49,50,51,52,54,55,57
//
// status: live (built+running) | built (built, untested) | roadmap
// Add prompt/outputType to an entry to make it runnable (see 1,2,3,8).
// ============================================================

// The free 10-factor audit — the lead magnet, separate from the numbered tools.
export const FREE_AUDIT = {
  id: "free-audit",
  name: "Free GEO Audit",
  tier: "starter",
  status: "live",
  description: "Free 10-factor lead-magnet audit. Uses locked prompt/rubric in lib/prompt.js.",
};

export const AGENTS = [
  // ---------- STARTER (built + runnable) ----------
  {
    id: 1, name: "Dynamic Title Agent", tier: "starter", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry"],
    outputType: "title-list",
    prompt: "Write 3 SEO/GEO-optimized <title> tags for a {industry} business named {businessName} based in {location}. Each title MUST contain the service, the location (if provided), and the brand. Each must be 50–60 characters. Return ONLY a JSON array of 3 strings.",
    why: "The <title> is the single highest-leverage page-level signal for AI search.",
  },
  {
    id: 2, name: "Meta Description Agent", tier: "starter", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry"],
    outputType: "text-meta",
    prompt: "Write a meta description for a {industry} business named {businessName} in {location}. It MUST be between 150 and 160 characters, lead with a direct answer (BLUF style), and include service + location + brand. Return ONLY the description text, no quotes.",
    why: "AI engines display the meta description verbatim in citation cards.",
  },
  {
    id: 3, name: "Hero Text Agent", tier: "starter", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry"],
    outputType: "text-hero",
    prompt: "Write a hero paragraph for a {industry} business named {businessName} based in {location}. Requirements: exactly 150–180 words; BLUF format (the very first sentence directly answers \"What is {businessName}?\"); the business name AND location must appear in the first 50 words; include 1–2 specific authority markers (years in business, license, certifications, review count, service area); end with a clear call to action. Return ONLY the paragraph.",
    why: "A direct-answer-first hero is the biggest predictor of whether AI engines cite a page.",
  },
  {
    id: 5, name: "FAQ Section Agent", tier: "starter", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry"],
    outputType: "faq",
    prompt: "Generate 8 question-driven FAQ entries for a {industry} business named {businessName} in {location}. Each entry must be a real question a customer would ask (starts with \"How\", \"What\", \"Do you\", \"How much\", etc.) and have a 2–4 sentence direct answer (no marketing fluff). Include service or location mention naturally. Return ONLY a JSON array of objects with shape { \"q\": string, \"a\": string }.",
    why: "Question-driven H2/H3 headings + FAQPage schema is the single most reliable structural pattern for AI citations. Eight entries also passes layer 5 of the 8-Layer Audit.",
  },
  {
    id: 8, name: "Last Updated Date Agent", tier: "starter", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["businessName", "url"], outputType: "code-freshness",
    why: "Freshness is the most under-used GEO lever; AI engines cite recently-updated pages more readily.",
  },

  // ---------- PRO ----------
  {
    id: 4, name: "Authority Signals Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry"],
    outputType: "string-list",
    prompt: "List 5 specific, verifiable authority markers a {industry} business named {businessName} in {location} should add to its homepage. Each marker should be ONE concrete sentence (no fluff). Return ONLY a JSON array of 5 strings.",
    why: "AI engines weigh E-E-A-T heavily for local queries. 3+ verifiable markers on the homepage is the most reliable way to move from 'Mentioned' to 'Recommended'.",
  },
  {
    id: 6, name: "JSON-LD Schema Agent (page-level)", tier: "pro", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry", "url"],
    outputType: "code-schema",
    why: "Pages that explicitly declare their type + the entity they describe rank higher in AI answers. Most sites never declare per-page schema, leaving AI engines guessing at internal-page intent.",
  },
  {
    id: 7, name: "Internal Links Agent", tier: "pro", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["businessName", "industry", "url"],
    outputType: "links",
    why: "Cross-linking 2+ related pages with descriptive anchors helps AI map your site as a coherent entity. 2+ internal links per page is layer 7 of the 8-Layer Audit.",
  },
  {
    id: 9, name: "Sitemap Agent", tier: "pro", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["url"],
    outputType: "code-sitemap",
    why: "A priority-scored sitemap tells crawlers which pages matter most. Most local sites have none, or auto-generate one with every page at equal priority — which hurts discovery.",
  },
  {
    id: 10, name: "Robots.txt Agent", tier: "pro", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["url"], outputType: "code-robots",
    why: "AI engines silently skip sites whose robots.txt blocks them — the #1 reason a business isn't cited. Fixes it in one paste.",
  },
  {
    id: 11, name: "Organization Schema Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry", "url"],
    outputType: "org-schema",
    prompt: "You are a GEO (Generative Engine Optimization) expert. Generate a complete, copy-paste-ready Organization JSON-LD schema block for a business. Business name: {businessName}. Location: {location}. Industry: {industry}. Website URL: {url}. Return ONLY valid JSON-LD wrapped in <script type=\"application/ld+json\"> tags. Include @context, @type Organization (or LocalBusiness if a physical location is provided), name, url, address, areaServed, and a description that includes the business name, industry, and location.",
    why: "Organization/LocalBusiness schema is the strongest entity-recognition signal available; adding it to every page typically improves citation rates within 7–14 days. Pair with Agent 6.",
  },
  {
    id: 14, name: "llms.txt Agent", tier: "pro", type: "deterministic", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["businessName", "location", "industry", "url"],
    outputType: "code-llms",
    why: "llms.txt tells AI crawlers who the entity is and which pages to cite. Adoption is in single digits — shipping one is an easy differentiator.",
  },
  {
    id: 16, name: "Wikidata Submission Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "industry"],
    extraInputs: ["location", "url", "yearFounded", "founders", "notability"],
    outputType: "wikidata",
    prompt: "Generate a Wikidata QuickStatements entry for {businessName}, a {industry} company founded {yearFounded} in {location}. Website: {url}. Founder/CEO: {founders}. Include these statements: instance of (P31), industry (P452), located in the administrative territorial entity (P131), country (P17), official website (P856), inception (P571), and headquarters location (P159). Use proper Q-IDs for industry and location. Return ONLY valid QuickStatements syntax.",
    why: "Wikidata is the largest knowledge graph AI engines reference for entity disambiguation. A clean entry is the strongest 'this entity exists' signal; adoption is low single digits — a moat.",
  },
  {
    id: 18, name: "Query Research", tier: "pro", type: "monitor", mode: "deterministic",
    status: "live", lite: true, needsScrape: false, inputs: ["industry"], extraInputs: ["location"],
    outputType: "query-list",
    why: "Real conversational queries from Google + YouTube autocomplete (your spec's free sources). Feeds Agents 1,2,3,5,14,15. Paid sources (AlsoAsked/ATP/Reddit/Quora) added when keys available.",
  },
  {
    id: 19, name: "sameAs Entity Linking", tier: "pro", type: "generate", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["businessName", "url"], extraInputs: ["profiles"],
    outputType: "code-schema",
    why: "sameAs is the schema-level entity disambiguation signal — pairs with Wikidata to make the business unmistakably 'this entity' to AI crawlers.",
  },
  { id: 21, name: "Citation Source Audit", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  {
    id: 22, name: "Schema Validator + Crawl Health", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: true, inputs: ["url"], outputType: "checks",
    prompt: "You are auditing a web page for schema validity and crawl health. Page HTML:\n{pageHtml}\n\nCheck each of these and report status: (1) JSON-LD blocks present and structurally valid, (2) noindex meta tag, (3) canonical tag present / conflicting, (4) mixed content (http on https), (5) viewport / mobile-friendly meta, (6) title + meta description present, (7) robots meta. Return ONLY JSON: { \"summary\": \"<1-2 sentences>\", \"checks\": [ { \"label\": \"\", \"status\": \"pass|warn|fail\", \"fix\": \"<exact remediation>\" } ] }",
    why: "A broken schema block silently kills everything the schema agents built. This is the QA layer to run after every change.",
  },
  {
    id: 23, name: "Image & Alt-Text Optimization", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: true, inputs: ["url", "businessName", "industry"], extraInputs: ["location"],
    outputType: "doc",
    prompt: "You are auditing images on a web page for {businessName} ({industry} in {location}). Page HTML:\n{pageHtml}\n\nFor each <img>, assess the filename and alt text (good alt includes service + location). Suggest a better filename and alt for each. Generate an ImageObject JSON-LD for the hero image. Return ONLY JSON: { \"title\": \"Image & Alt-Text Audit\", \"bodyHtml\": \"<an HTML <ul> listing each image: current filename/alt → issues → suggested filename/alt>\", \"codeBlocks\": [ { \"label\": \"ImageObject (hero)\", \"code\": \"<script type=\\\"application/ld+json\\\">…</script>\" } ] }",
    why: "Gemini and GPT-4V read images. Descriptive filenames + alt text are the multimodal equivalent of meta descriptions.",
  },
  {
    id: 24, name: "Video Schema", tier: "pro", type: "generate", mode: "deterministic",
    status: "live", needsScrape: false, inputs: ["videoUrl"], extraInputs: ["videoTitle", "videoDesc"],
    outputType: "code-schema",
    why: "Video schema with a transcript is one of the most-cited content types on Perplexity and Gemini, and almost nobody on local sites bothers with it.",
  },
  { id: 28, name: "AI Crawler Analytics", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false },
  {
    id: 30, name: "Author / Founder Entity", tier: "pro", type: "generate", mode: "deterministic",
    status: "live", needsScrape: false,
    inputs: ["founderName", "role", "businessName", "industry"],
    extraInputs: ["years", "certs", "education", "linkedinUrl", "press", "awards"],
    outputType: "person-entity",
    why: "AI engines increasingly weight 'who is the expert behind this answer' via the Person entity. Tying a recognized human to the brand is one of the highest-leverage E-E-A-T moves.",
  },
  { id: 32, name: "Reddit / Community Signal", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 34, name: "Podcast / Transcript Authority", tier: "pro", type: "custom", status: "roadmap", needsScrape: false },
  {
    id: 35, name: "Local Semantic Relevance", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: false,
    inputs: ["businessName", "industry", "location"],
    extraInputs: ["serviceArea"],
    outputType: "local-semantic",
    prompt: "You are a local-SEO/GEO expert. For {businessName}, a {industry} business serving {location} ({serviceArea}), build a deep local semantic map. Cover these categories: neighborhoods (with zip codes), climate/weather factors relevant to {industry}, local regulations or permits, seasonal local problems, local terminology/dialect, and major landmarks. Map signals to target pages and write injection snippets. Return ONLY JSON: { \"signals\": [ { \"category\": \"\", \"detail\": \"\" } ], \"injections\": [ { \"page\": \"\", \"recommendation\": \"\" } ], \"paragraph\": \"<sample hyper-local homepage paragraph>\", \"faqs\": [ { \"q\": \"\", \"a\": \"\" } ], \"areaServed\": [ \"<neighborhood>\" ] }",
    why: "AI engines treat 'we serve Honolulu' and a richly localized signal set as completely different. This is what separates a generic local business from 'the local expert' entity.",
  },
  {
    id: 37, name: "Full Service Page Generator", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "industry", "serviceName"], extraInputs: ["location", "targetQuery"],
    outputType: "doc",
    prompt: "Generate a complete, ready-to-publish service page for {businessName}, a {industry} business in {location}, for the service: {serviceName}. Target queries: {targetQuery}. Requirements: BLUF hero, E-E-A-T authority signals, an FAQ section, internal links to /services and /contact, and a CTA. Return ONLY JSON: { \"title\": \"\", \"bodyHtml\": \"<full HTML using h1/h2/h3/p/ul>\", \"codeBlocks\": [ { \"label\": \"Service + FAQPage JSON-LD\", \"code\": \"<script type=\\\"application/ld+json\\\">…</script>\" } ] }",
    why: "Scale from one optimized page to an entire service section — dramatically increasing content coverage and citation potential.",
  },
  {
    id: 38, name: "Location Cluster Page Builder", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "industry", "areas"], extraInputs: ["location"],
    outputType: "doc",
    prompt: "Generate hyper-local landing page content for {businessName}, a {industry} business in {location}, for these areas: {areas}. For EACH area, produce a unique short hero paragraph, 2 FAQs, and an authority note. Return ONLY JSON: { \"title\": \"Location pages\", \"bodyHtml\": \"<HTML with an <h2> per area, each with hero + FAQs>\", \"codeBlocks\": [ { \"label\": \"AreaServed schema\", \"code\": \"…\" } ] }",
    why: "Hyper-local pages are one of the strongest signals for 'best [service] in [neighborhood]' queries — neighborhood-level dominance.",
  },
  {
    id: 39, name: "A/B Content Variant Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["contentBlock", "businessName", "industry"], extraInputs: ["location"],
    outputType: "cards",
    prompt: "Create 3 alternative versions of this content block for A/B testing. Original: {contentBlock}. Business: {businessName}, a {industry} in {location}. Variant 1 = more authority, Variant 2 = more local, Variant 3 = more benefit-driven. Return ONLY JSON: { \"items\": [ { \"title\": \"Variant 1 — more authority\", \"body\": \"<the variant text>\" } ] }",
    why: "Real A/B testing of what actually moves citation and perception scores instead of guessing.",
  },
  {
    id: 40, name: "Voice & Speakable Content Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "industry"], extraInputs: ["location", "contentBlock"],
    outputType: "doc",
    prompt: "Rewrite the following content for voice search (natural spoken language, direct answers) and generate Speakable JSON-LD. Content: {contentBlock}. Business: {businessName}, a {industry} in {location}. Return ONLY JSON: { \"title\": \"Voice-optimized content\", \"bodyHtml\": \"<rewritten content as HTML>\", \"codeBlocks\": [ { \"label\": \"Speakable JSON-LD\", \"code\": \"…\" } ] }",
    why: "Content that speaks naturally gets pulled into more AI voice and audio answers.",
  },
  { id: 45, name: "Multimodal Visibility Tester", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false,
    note: "Runs visual search in Gemini/GPT-4V — needs vision API access. Heavy/later." },
  {
    id: 46, name: "Source Authority Mapper", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["industry", "location"], outputType: "cards",
    prompt: "List the 8 most authoritative knowledge sources AI engines trust for a {industry} business in {location} — directories, publications, associations, review sites. For each, give why it matters and a concrete outreach recommendation. Return ONLY JSON: { \"items\": [ { \"title\": \"<source name>\", \"body\": \"Why: … | Outreach: …\" } ] }",
    why: "Getting mentioned in the right sources dramatically boosts entity trust.",
  },
  {
    id: 47, name: "Review Response Strategist", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["reviewText", "businessName"], extraInputs: ["authorityMarkers"],
    outputType: "cards",
    prompt: "Write a smart, natural reply to this customer review that reinforces authority and feeds future citations. Review: {reviewText}. Business: {businessName}. Authority markers: {authorityMarkers}. Return ONLY JSON: { \"items\": [ { \"title\": \"Suggested reply\", \"body\": \"<reply>\" }, { \"title\": \"Follow-up actions\", \"body\": \"<2-3 actions>\" } ] }",
    why: "Smart review management directly improves perception and citation rates.",
  },
  {
    id: 53, name: "Vertical Specialization Agent", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["industry"], extraInputs: ["location"],
    outputType: "cards",
    prompt: "Provide the top 5 vertical-specific GEO optimizations a {industry} business{location} should make for AI search. For each, give a concrete template or example. Return ONLY JSON: { \"items\": [ { \"title\": \"<optimization>\", \"body\": \"<template/example>\" } ] }",
    why: "Deeper, industry-specific optimization per vertical.",
  },
  {
    id: 56, name: "Lead Capture & Conversion", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: true, inputs: ["url", "businessName", "industry"], extraInputs: ["location", "leadCaptureMethod"],
    outputType: "doc",
    prompt: "You are a conversion-optimization expert. Audit this page's conversion layer for {businessName}, a {industry} business in {location}. Lead capture method: {leadCaptureMethod}. Page HTML:\n{pageHtml}\n\nScore against this 12-point checklist: (1) primary CTA above the fold, (2) clickable tel: phone in header, (3) form fields ≤5, (4) social proof near CTA, (5) urgency element, (6) mobile sticky CTA, (7) exit-intent capture, (8) no autoplay video over CTA, (9) trust badges visible, (10) clear next-step language, (11) thank-you page, (12) form analytics. Return ONLY JSON: { \"title\": \"Conversion Audit — score X/100\", \"bodyHtml\": \"<an HTML table of all 12 checks with pass/fail + remediation, then 3 sample CTA rewrites>\", \"codeBlocks\": [ { \"label\": \"Mobile sticky-CTA snippet\", \"code\": \"<div>…</div>\" } ] }",
    why: "Citations bring traffic; traffic without a conversion path is wasted. This ensures GEO work compounds into real bookings.",
  },
  {
    id: 58, name: "Featured Snippet & PAA", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: true, inputs: ["url", "targetQuery"], outputType: "doc",
    prompt: "You are a Featured Snippet + People Also Ask optimizer. Target query: '{targetQuery}'. Current page content:\n{pageHtml}\n\nGenerate: (1) an optimized snippet block (choose paragraph / list / table format) built to win position 0, (2) 5-8 People Also Ask question + 40-60 word answer blocks with H3 headings, (3) matching schema (QAPage/HowTo/Article). You cannot see Google's live results — produce best-practice optimized blocks. Return ONLY JSON: { \"title\": \"Featured Snippet & PAA\", \"bodyHtml\": \"<snippet block + PAA Q&A as HTML with h3s>\", \"codeBlocks\": [ { \"label\": \"PAA schema\", \"code\": \"…\" } ] }",
    why: "Featured snippets + PAA are double-counted: they show in Google AND get ingested by AI engines as Google-validated answers (2-3x more citations).",
  },
  {
    id: 59, name: "Accessibility / WCAG", tier: "pro", type: "audit", mode: "llm",
    status: "live", needsScrape: true, inputs: ["url"], outputType: "checks",
    prompt: "You are a WCAG 2.1 AA accessibility auditor. Audit this page HTML for accessibility issues — alt text, heading order, ARIA labels, form labels, link text quality, lang attribute, button labels, etc. (note: you cannot measure color contrast without rendering, so flag it as 'verify manually'). Page HTML:\n{pageHtml}\n\nReturn ONLY JSON: { \"summary\": \"<compliance overview + 2-3 quick wins>\", \"checks\": [ { \"label\": \"<WCAG criterion / issue>\", \"status\": \"pass|warn|fail\", \"fix\": \"<specific code fix>\" } ] }",
    why: "Two reasons: ADA lawsuits against small-business sites cost $10K-$50K to settle, and accessible HTML is more parseable HTML — a confirmed ranking signal for Google + AI engines.",
  },
  {
    id: 60, name: "Blog Content Engine", tier: "pro", type: "generate", mode: "llm",
    status: "live", needsScrape: false,
    inputs: ["businessName", "industry", "topic"],
    extraInputs: ["location", "founderName", "targetQuery"],
    outputType: "blog",
    prompt: "You are a GEO content writer. Write a complete blog post for {businessName}, a {industry} business in {location}, on the topic: {topic}. Target query: {targetQuery}. Author byline: {founderName}. Requirements: 1200-1800 words; a BLUF intro (first sentence directly answers the topic); question-driven H2/H3 headings; embed 1-2 specific authority markers; suggest 2-3 internal links to /services, /about, /faq; add a 3-5 question FAQ section at the end; an SEO title (50-60 chars); a meta description (150-160 chars); 3 social captions (LinkedIn, X, Facebook); and a hero image alt text. Return ONLY JSON: { \"title\": \"\", \"metaDescription\": \"\", \"bodyHtml\": \"<full HTML using <h2>,<h3>,<p>,<ul>>\", \"faqs\": [ { \"q\": \"\", \"a\": \"\" } ], \"social\": { \"linkedin\": \"\", \"x\": \"\", \"facebook\": \"\" }, \"internalLinks\": [ \"\" ], \"heroAlt\": \"\" }",
    why: "Ongoing blog content keeps the site fresh, expands topical coverage, and creates new citation surfaces — a weekly post compounds into 50+ citation surfaces/year per client.",
  },

  // ---------- AGENCY ----------
  { id: 12, name: "Agent 12 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 13, name: "Agent 13 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  {
    id: 15, name: "AI Citation Monitor (manual)", tier: "agency", type: "monitor", mode: "deterministic",
    status: "live", lite: true, needsScrape: false, inputs: ["businessName", "industry"], extraInputs: ["location"],
    outputType: "playbook",
    why: "Your canonical fallback: a run-it-yourself playbook with queries per engine + the scoring rubric. Upgrades to the full automated multi-engine monitor when APIs are funded.",
  },
  { id: 17, name: "Competitor GEO Audit", tier: "agency", type: "audit", status: "roadmap", needsScrape: true },
  { id: 20, name: "Review Intelligence", tier: "agency", type: "custom", status: "roadmap", needsScrape: false },
  { id: 25, name: "Monthly GEO Health Score / Report", tier: "agency", type: "aggregate", status: "roadmap", needsScrape: false },
  {
    id: 26, name: "Digital PR / Mention Outreach", tier: "agency", type: "generate", mode: "llm",
    status: "live", lite: true, liteLabel: "Lite · Apollo later", needsScrape: false,
    inputs: ["businessName", "industry", "outletType"],
    extraInputs: ["location", "authorityMarkers", "reviewThemes"],
    outputType: "pr",
    prompt: "You are a digital PR strategist. For {businessName}, a {industry} business in {location}, draft outreach to {outletType} outlets. Authority markers: {authorityMarkers}. Review themes: {reviewThemes}. Suggest 5 realistic outlet targets appropriate to the location/industry (local news, industry blogs, podcasts, or best-of roundups). For EACH outlet include its real website domain (e.g. honolulumagazine.com) so contacts can be looked up. For each, write a personalized pitch with: a subject line, a hook, a value proposition tied to the authority markers/review themes, and a clear CTA. Also provide a 5-day and 12-day follow-up message. Return ONLY JSON: { \"outlets\": [ { \"name\": \"\", \"type\": \"\", \"domain\": \"\", \"angle\": \"\", \"subject\": \"\", \"pitch\": \"\" } ], \"followups\": { \"day5\": \"\", \"day12\": \"\" } }",
    why: "Being mentioned by a publication AI engines trust is worth more than 100 schema tweaks. Editor emails are pulled live from Apollo (needs APOLLO_API_KEY + credits).",
  },
  {
    id: 27, name: "AI Brand Perception (manual)", tier: "agency", type: "monitor", mode: "deterministic",
    status: "live", lite: true, needsScrape: false, inputs: ["businessName"], extraInputs: ["location", "industry"],
    outputType: "playbook",
    why: "Your canonical fallback: the 8 perception queries + a manual scoring sheet. Upgrades to the full automated multi-engine version when APIs are funded.",
  },
  { id: 29, name: "Entity Trust Score", tier: "agency", type: "audit", status: "roadmap", needsScrape: true },
  { id: 31, name: "GEO Content Gap", tier: "agency", type: "generate", status: "roadmap", needsScrape: true },
  { id: 33, name: "AI Answer Injection Simulator", tier: "agency", type: "monitor", status: "roadmap", needsScrape: true },
  { id: 36, name: "AI Recommendation Probability", tier: "agency", type: "monitor", status: "roadmap", needsScrape: true },
  {
    id: 41, name: "Multi-Language GEO Agent", tier: "agency", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["businessName", "industry", "languages"], extraInputs: ["location", "contentBlock"],
    outputType: "doc",
    prompt: "You are a multilingual GEO specialist. Create localized versions of key page content for {businessName}, a {industry} business in {location}, in these target language(s): {languages}. Preserve GEO rules (BLUF, authority markers, natural local references) and cultural nuance — do not translate literally. Source content (if provided): {contentBlock}. If no source is provided, generate a localized hero paragraph + 3 FAQs per language. Also generate hreflang tags and a short implementation note. Return ONLY JSON: { \"title\": \"Localized content\", \"bodyHtml\": \"<localized content, an <h2> per language>\", \"codeBlocks\": [ { \"label\": \"hreflang tags\", \"code\": \"<link rel=\\\"alternate\\\" hreflang=…>\" } ] }",
    why: "In markets like Hawaii, supporting multiple languages significantly expands reachable audience and citation opportunities.",
  },
  { id: 42, name: "Automated Change Deployer", tier: "agency", type: "deploy", status: "roadmap", needsScrape: false,
    note: "Pushes approved changes into the CMS via API (WordPress/Webflow) — needs CMS credentials + write access + versioning. Heavy/later." },
  {
    id: 43, name: "Predictive Impact Simulator", tier: "agency", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["proposedChange"], extraInputs: ["currentScore", "businessName", "industry"],
    outputType: "cards",
    prompt: "Estimate how much this proposed change will improve a business's AI Recommendation Probability. Proposed change: {proposedChange}. Current score (if known): {currentScore}. Business: {businessName} ({industry}). Using GEO best practices, estimate the score lift, a confidence level, and whether to prioritize it. Return ONLY JSON: { \"items\": [ { \"title\": \"Predicted lift\", \"body\": \"+X points · confidence: low/medium/high\" }, { \"title\": \"Reasoning\", \"body\": \"…\" }, { \"title\": \"Prioritize now?\", \"body\": \"yes/no + why\" } ] }",
    why: "Focus effort on changes with the highest ROI instead of guessing. (Lighter heuristic version; the full model uses Agents 29/36 + historical client data.)",
  },
  { id: 44, name: "Competitor Evolution Tracker", tier: "agency", type: "monitor", status: "roadmap", needsScrape: false,
    note: "Weekly scheduled competitor crawls + snapshot diffs + alerts — needs scheduling + a snapshot database. Heavy/later." },
  { id: 48, name: "Anomaly & Risk Alert", tier: "agency", type: "monitor", status: "roadmap", needsScrape: false,
    note: "Monitors all agent outputs over time for sudden drops — needs the metrics database + scheduled checks. Heavy/later." },
  {
    id: 49, name: "Master Orchestrator", tier: "agency", type: "generate", mode: "llm",
    status: "live", lite: true, liteLabel: "Lite · plan only", needsScrape: false,
    inputs: ["businessName", "workflow"], extraInputs: ["industry", "location"],
    outputType: "cards",
    prompt: "You are the GeoTrackerPro orchestrator. For {businessName} ({industry} in {location}), the requested workflow is: {workflow}. Recommend the optimal ordered sequence of GeoTrackerPro agents to run (e.g. Query Research → Title/Meta/Hero → FAQ → Schema → Authority → Internal Links → Citation Check → Blog, etc.). Return an ordered plan. Return ONLY JSON: { \"items\": [ { \"title\": \"Step N — <agent name>\", \"body\": \"what it does + why at this step\" } ] }",
    why: "The brain that sequences the agents into one workflow. (Lite version outputs the plan; auto-running every agent end-to-end comes later.)",
  },
  {
    id: 50, name: "Natural Language GEO Consultant", tier: "agency", type: "generate", mode: "llm",
    status: "live", lite: true, liteLabel: "Lite · plan only", needsScrape: false,
    inputs: ["request"], extraInputs: ["businessName"],
    outputType: "cards",
    prompt: "You are the GeoTrackerPro AI consultant. A client said: \"{request}\". Interpret what they actually need, then output a recommended action plan: which GeoTrackerPro agents to run and in what order, each with a one-line reason. Return ONLY JSON: { \"items\": [ { \"title\": \"<agent / action>\", \"body\": \"<why>\" } ] }",
    why: "Makes the whole system accessible to non-technical clients in plain language. (Lite version returns the plan; auto-triggering agents comes later.)",
  },
  { id: 51, name: "Per-Client Dashboard & Instance Manager", tier: "agency", type: "platform", status: "roadmap", needsScrape: false,
    note: "Platform infrastructure, not a runnable agent: multi-tenant isolation — separate data + dashboards per client. Build alongside white-label (54) when scaling to paying clients." },
  {
    id: 52, name: "ROI & Business Impact Calculator", tier: "agency", type: "generate", mode: "llm",
    status: "live", needsScrape: false, inputs: ["currentScore", "businessName", "industry"], extraInputs: ["ltv", "monthlyLeads", "location"],
    outputType: "cards",
    prompt: "You are a GEO ROI analyst. For {businessName} ({industry} in {location}), project the business impact of improving their AI Recommendation Probability. Current GEO score: {currentScore}. Average customer LTV: {ltv}. Current monthly leads/traffic: {monthlyLeads}. Estimate the additional leads and revenue from raising the score (e.g., toward 75+), stating your assumptions clearly. Return ONLY JSON: { \"items\": [ { \"title\": \"Current state\", \"body\": \"…\" }, { \"title\": \"Projected at 75+\", \"body\": \"…\" }, { \"title\": \"Estimated added leads / revenue\", \"body\": \"…\" }, { \"title\": \"Assumptions\", \"body\": \"…\" } ] }",
    why: "Translates GEO scores into revenue numbers — the report that justifies retainers to a business owner.",
  },
  { id: 54, name: "White-Label & Agency Mode", tier: "agency", type: "platform", status: "roadmap", needsScrape: false,
    note: "Platform feature, not a runnable agent: multi-tenant rebranding (logo/colors/domain) across reports + UI. Build as infrastructure when selling agency seats." },
  { id: 55, name: "AI Chatbot Deployment", tier: "agency", type: "custom", status: "roadmap", needsScrape: true },
  { id: 57, name: "Knowledge Graph Optimization", tier: "agency", type: "audit", status: "roadmap", needsScrape: true },
];

export function getAgent(id) {
  return AGENTS.find((a) => String(a.id) === String(id));
}

export function liveTools() {
  return AGENTS.filter((a) => a.status === "live" && typeof a.id === "number");
}

export function byTier(tier) {
  return AGENTS.filter((a) => a.tier === tier).sort((a, b) => a.id - b.id);
}

export const TIERS = [
  { key: "starter", label: "Starter Tier" },
  { key: "pro", label: "Pro Tier" },
  { key: "agency", label: "Agency Tier" },
];

// ---- Readiness bands (how much work/cost is left to build each) ----
const MEDIUM = new Set([]); // (22,23,56,58,59 now live; nothing left in this band)
const HEAVY = new Set([12, 13, 17, 20, 21, 25, 28, 29, 31, 32, 33, 34, 36, 42, 44, 45, 48, 51, 54, 55, 57]); // need paid APIs / data / DB / scheduling / platform infra

export function bandOf(a) {
  if (a.status === "live") return "live";
  if (typeof a.id !== "number") return "live";
  if (MEDIUM.has(a.id)) return "medium";
  if (HEAVY.has(a.id)) return "heavy";
  return "pending"; // 37–54 and any other undocumented
}

export const BANDS = [
  { key: "live", label: "Live — good to go" },
  { key: "medium", label: "Buildable next (no API cost)" },
  { key: "heavy", label: "Heavy — needs APIs / data (later)" },
  { key: "pending", label: "Spec pending" },
];

export function byBand(key) {
  return AGENTS.filter((a) => bandOf(a) === key && typeof a.id === "number").sort((a, b) => a.id - b.id);
}
