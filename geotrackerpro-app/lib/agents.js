// ============================================================
// GeoTrackerPro — AGENT REGISTRY
// Every agent is a config entry here. The engine (lib/runAgent.js)
// reads this list and runs the right pattern. Adding an agent =
// adding an object, NOT building a new app.
//
// Numbering matches Devin's canonical agent notes.
// The free 10-factor GEO Audit (the lead magnet) is a SEPARATE
// thing from the numbered 1–60 tools, tracked as id "free-audit".
//
// type:    generate | audit | deterministic | monitor | aggregate | custom
// mode:    llm | deterministic
// status:  live | roadmap
// tier:    starter | pro | agency
// ============================================================

export const AGENTS = [
  // ---------- Lead magnet (separate from the numbered tools) ----------
  {
    id: "free-audit",
    name: "Free GEO Audit",
    type: "audit",
    mode: "llm",
    tier: "starter",
    status: "live",
    needsScrape: true,
    inputs: ["url", "firstName", "email", "phone", "businessName", "industry"],
    description:
      "The free 10-factor lead-magnet audit. Uses the locked prompt + rubric in lib/prompt.js. This is the funnel wedge, not a numbered tool.",
  },

  // ---------- STARTER TOOLS (built — runnable via lib/runAgent.js) ----------
  {
    id: 1,
    name: "Dynamic Title Agent",
    type: "generate",
    mode: "llm",
    tier: "starter",
    status: "live",
    needsScrape: false,
    inputs: ["businessName", "location", "industry"],
    outputType: "title-list", // JSON array of 3 strings
    prompt:
      "Write 3 SEO/GEO-optimized <title> tags for a {industry} business named {businessName} based in {location}. Each title MUST contain the service, the location (if provided), and the brand. Each must be 50–60 characters. Return ONLY a JSON array of 3 strings.",
    why:
      "The <title> is the single highest-leverage page-level signal for AI search. Brand + service + location in the title boosts citation for 'best <service> in <city>' queries.",
  },
  {
    id: 2,
    name: "Meta Description Agent",
    type: "generate",
    mode: "llm",
    tier: "starter",
    status: "live",
    needsScrape: false,
    inputs: ["businessName", "location", "industry"],
    outputType: "text-meta", // single 150–160 char string
    prompt:
      "Write a meta description for a {industry} business named {businessName} in {location}. It MUST be between 150 and 160 characters, lead with a direct answer (BLUF style), and include service + location + brand. Return ONLY the description text, no quotes.",
    why:
      "AI engines (esp. Perplexity and Copilot) display the meta description verbatim in citation cards. A real BLUF description converts far better than boilerplate.",
  },
  {
    id: 3,
    name: "Hero Text Agent",
    type: "generate",
    mode: "llm",
    tier: "starter",
    status: "live",
    needsScrape: false,
    inputs: ["businessName", "location", "industry"],
    outputType: "text-hero", // 150–180 word paragraph
    prompt:
      "Write a hero paragraph for a {industry} business named {businessName} based in {location}. Requirements: exactly 150–180 words; BLUF format (the very first sentence directly answers \"What is {businessName}?\"); the business name AND location must appear in the first 50 words; include 1–2 specific authority markers (years in business, license, certifications, review count, service area); end with a clear call to action. Return ONLY the paragraph.",
    why:
      "A direct-answer-first hero is the biggest predictor of whether AI engines cite a page. Most local sites open with fluff instead of answering 'what is this business and where are they?'",
  },
  {
    id: 8,
    name: "Last Updated Date Agent",
    type: "deterministic",
    mode: "deterministic",
    tier: "starter",
    status: "live",
    needsScrape: false,
    inputs: ["businessName", "url"],
    outputType: "code-freshness", // HTML + JSON-LD
    why:
      "Freshness is the most under-used GEO lever. AI engines cite recently-updated pages more readily. A visible date + matching dateModified schema is an explicit freshness anchor. Refresh every 30 days.",
  },

  // ---------- CATALOG (roadmap — from Devin's docs; convert as we build) ----------
  // Wave 2 (audit type — reuse the audit engine, new rubric):
  { id: 17, name: "Competitor GEO Audit", type: "audit", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 22, name: "Schema Validator + Crawl Health", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 23, name: "Image & Alt-Text Optimization", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 29, name: "Entity Trust Score", type: "audit", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 35, name: "Local Semantic Relevance", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 56, name: "Lead Capture & Conversion", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 57, name: "Knowledge Graph Optimization", type: "audit", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 58, name: "Featured Snippet & PAA", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 59, name: "Accessibility / WCAG", type: "audit", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 25, name: "Monthly GEO Health Score / Report", type: "aggregate", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  // Wave 3 (generate):
  { id: 16, name: "Wikidata Submission", type: "generate", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 19, name: "sameAs Entity Linking", type: "generate", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 24, name: "Video Schema", type: "generate", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 26, name: "Digital PR / Mention Outreach", type: "generate", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 30, name: "Author / Founder Entity", type: "generate", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 31, name: "GEO Content Gap", type: "generate", mode: "llm", tier: "pro", status: "roadmap", needsScrape: true },
  { id: 60, name: "Blog Content Engine", type: "generate", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  // Wave 4 (monitor):
  { id: 15, name: "AI Engine Citation Monitor", type: "monitor", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 18, name: "Query Research", type: "monitor", mode: "llm", tier: "pro", status: "roadmap", needsScrape: false },
  { id: 27, name: "AI Brand Perception", type: "monitor", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 28, name: "AI Crawler Analytics", type: "monitor", mode: "deterministic", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 32, name: "Reddit / Community Signal", type: "monitor", mode: "llm", tier: "pro", status: "roadmap", needsScrape: false },
  { id: 33, name: "AI Answer Injection Simulator", type: "monitor", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  { id: 36, name: "AI Recommendation Probability", type: "monitor", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },
  // Wave 5 (custom flagships):
  { id: 20, name: "Review Intelligence", type: "custom", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 34, name: "Podcast / Transcript Authority", type: "custom", mode: "llm", tier: "agency", status: "roadmap", needsScrape: false },
  { id: 55, name: "AI Chatbot Deployment", type: "custom", mode: "llm", tier: "agency", status: "roadmap", needsScrape: true },

  // NOTE: Starter agent 5, plus agents 4,6,7,9–14 and 37–54 — add here
  // as Devin provides the canonical notes (same shape as 1/2/3/8 above).
];

export function getAgent(id) {
  return AGENTS.find((a) => String(a.id) === String(id));
}

export function liveTools() {
  // The numbered tools that are built and runnable (excludes the free audit).
  return AGENTS.filter((a) => a.status === "live" && typeof a.id === "number");
}
