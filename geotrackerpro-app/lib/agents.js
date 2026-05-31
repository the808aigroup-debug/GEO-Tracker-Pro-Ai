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
  { id: 4,  name: "Agent 4 (spec pending)",  tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 6,  name: "Agent 6 (spec pending)",  tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 7,  name: "Agent 7 (spec pending)",  tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 9,  name: "Agent 9 (spec pending)",  tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 10, name: "Agent 10 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 11, name: "Agent 11 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 14, name: "Agent 14 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 16, name: "Wikidata Submission", tier: "pro", type: "generate", status: "roadmap", needsScrape: true },
  { id: 18, name: "Query Research", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 19, name: "sameAs Entity Linking", tier: "pro", type: "generate", status: "roadmap", needsScrape: true },
  { id: 21, name: "Citation Source Audit", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 22, name: "Schema Validator + Crawl Health", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 23, name: "Image & Alt-Text Optimization", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 24, name: "Video Schema", tier: "pro", type: "generate", status: "roadmap", needsScrape: true },
  { id: 28, name: "AI Crawler Analytics", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 30, name: "Author / Founder Entity", tier: "pro", type: "generate", status: "roadmap", needsScrape: true },
  { id: 32, name: "Reddit / Community Signal", tier: "pro", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 34, name: "Podcast / Transcript Authority", tier: "pro", type: "custom", status: "roadmap", needsScrape: false },
  { id: 35, name: "Local Semantic Relevance", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 37, name: "Agent 37 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 38, name: "Agent 38 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 39, name: "Agent 39 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 40, name: "Agent 40 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 45, name: "Agent 45 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 46, name: "Agent 46 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 47, name: "Agent 47 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 53, name: "Agent 53 (spec pending)", tier: "pro", type: "tbd", status: "roadmap", needsName: true },
  { id: 56, name: "Lead Capture & Conversion", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 58, name: "Featured Snippet & PAA", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 59, name: "Accessibility / WCAG", tier: "pro", type: "audit", status: "roadmap", needsScrape: true },
  { id: 60, name: "Blog Content Engine", tier: "pro", type: "generate", status: "roadmap", needsScrape: false },

  // ---------- AGENCY ----------
  { id: 12, name: "Agent 12 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 13, name: "Agent 13 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 15, name: "AI Engine Citation Monitor", tier: "agency", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 17, name: "Competitor GEO Audit", tier: "agency", type: "audit", status: "roadmap", needsScrape: true },
  { id: 20, name: "Review Intelligence", tier: "agency", type: "custom", status: "roadmap", needsScrape: false },
  { id: 25, name: "Monthly GEO Health Score / Report", tier: "agency", type: "aggregate", status: "roadmap", needsScrape: false },
  { id: 26, name: "Digital PR / Mention Outreach", tier: "agency", type: "generate", status: "roadmap", needsScrape: false },
  { id: 27, name: "AI Brand Perception", tier: "agency", type: "monitor", status: "roadmap", needsScrape: false },
  { id: 29, name: "Entity Trust Score", tier: "agency", type: "audit", status: "roadmap", needsScrape: true },
  { id: 31, name: "GEO Content Gap", tier: "agency", type: "generate", status: "roadmap", needsScrape: true },
  { id: 33, name: "AI Answer Injection Simulator", tier: "agency", type: "monitor", status: "roadmap", needsScrape: true },
  { id: 36, name: "AI Recommendation Probability", tier: "agency", type: "monitor", status: "roadmap", needsScrape: true },
  { id: 41, name: "Agent 41 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 42, name: "Agent 42 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 43, name: "Agent 43 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 44, name: "Agent 44 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 48, name: "Agent 48 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 49, name: "Agent 49 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 50, name: "Agent 50 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 51, name: "Agent 51 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 52, name: "Agent 52 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
  { id: 54, name: "Agent 54 (spec pending)", tier: "agency", type: "tbd", status: "roadmap", needsName: true },
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
