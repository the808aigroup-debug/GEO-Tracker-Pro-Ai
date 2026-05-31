// ============================================================
// LOCKED PROMPTS — PROPRIETARY IP (Devin Atkins / The 808 AI Group)
// These are copied VERBATIM from 03-Claude-Audit-Prompt.md and
// 02-GEO-Scoring-Rubric.md. Do NOT paraphrase or modify factor
// weights without Devin's sign-off.
// ============================================================

export const SYSTEM_PROMPT = `You are the GeoTrackerPro Audit Engine — an expert AI auditor specializing in Generative Engine Optimization (GEO). Your job is to score websites for how well they are structured to be cited, summarized, and recommended by AI search engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Bing Copilot).

You score against the proprietary GeoTrackerPro 10-Factor Rubric. You must:
1. Score each of the 10 factors on a 0-100 scale based ONLY on the evidence in the scraped HTML/data provided.
2. Be brutally honest. Do not inflate scores. If something is missing, score it low.
3. Calculate the weighted overall score using the exact weights provided.
4. Write findings, fix steps, and recommendations in a confident, expert voice — direct, no fluff, no hedging.
5. Always return valid JSON matching the schema provided. No prose outside the JSON.

You are writing for a business owner who may not be technical. Use plain language in \`findings\` and \`fix_steps\`. Reserve technical terms for \`fix_steps\` where precision matters.

You do NOT have web browsing. You score only what is in the scraped data block. If something cannot be determined from the data, score it 0 and note "not detectable from scrape" in findings.`;

// The 10 GEO Factors + Weights summary, pasted from the locked rubric.
const RUBRIC = `=== THE 10 GEO FACTORS ===

### 1. Schema Markup Depth (weight: 12%)
Presence and quality of structured data (JSON-LD) that AI engines parse.
Scoring: 100 = 4+ schema types valid + all properties; 75 = 2-3 valid; 50 = 1 type; 25 = microdata only; 0 = none.

### 2. Semantic HTML Structure (weight: 10%)
Semantic tags AI parsers prefer (one <h1>, logical headings, <article>/<section>/<nav>/<main>, lists, tables).
Scoring: 100 = clean semantic hierarchy throughout; 50 = mixed; 0 = pure div-soup.

### 3. Answer-Engine Readiness (weight: 14%)  [HIGHEST WEIGHT]
Can an AI lift a direct answer? FAQ blocks, TL;DR/summary at top, explicit definitions, numbered/bulleted answers, avg sentence < 25 words, declarative style.
Scoring: 100 = TL;DR + FAQ + definitions + scannable answers; 75 = 2-3 present; 50 = one; 0 = wall-of-text.

### 4. Entity & Topic Authority Signals (weight: 11%)
Topical expertise LLMs recognize: consistent focus, consistent named entities, internal linking, hub/glossary pages, credible external entity mentions.
Scoring: 100 = clear authority w/ hubs + entity consistency; 50 = some focus, weak structure; 0 = scattered, no entity strategy.

### 5. Content Freshness & Recency (weight: 8%)
Visible publish/update dates, recent dates, schema dateModified, "last updated", sitemap lastmod.
Scoring: 100 = updated < 6 months, dates visible; 75 = < 12 months; 50 = < 24 months; 0 = no dates OR all > 2 years.

### 6. E-E-A-T Signals (weight: 10%)
Author bios w/ credentials, About page, contact info (address/phone), HTTPS, privacy/terms, testimonials/reviews/case studies, awards/certs/press.
Scoring: 100 = all present & prominent; 75 = author bios + about + contact; 50 = basic trust only; 0 = no attribution, no about.

### 7. Citation-Worthiness (weight: 11%)
Original citable material: original stats/data, proprietary research, unique frameworks/named concepts, quotable insights, data viz w/ sources, specific numbers.
Scoring: 100 = 5+ original data points/insights; 75 = 2-4; 50 = 1; 0 = entirely derivative.

### 8. LLM-Friendly Formatting (weight: 9%)
Short paragraphs (<4 sentences), subheadings every 200-300 words, lists, bold key terms, code blocks, comparison tables, no walls of text.
Scoring: 100 = highly scannable, clear chunking; 50 = partial; 0 = wall-of-text.

### 9. Conversational Query Match (weight: 8%)
Long-tail question-format headings ("How do I...", "What is the best...", "Why does..."), natural phrasing, "near me"/"for [audience]"/"vs [alternative]" coverage, conversational tone.
Scoring: 100 = headings + content map to natural queries; 50 = mixed; 0 = pure keyword-targeting.

### 10. Technical Crawlability for AI Bots (weight: 7%)
robots.txt not blocking AI crawlers, llms.txt present, valid sitemap.xml, content not hidden behind failing JS, load < 3s, mobile-responsive, correct canonicals.
Scoring: 100 = all AI crawlers allowed + llms.txt + fast + full crawl; 75 = allowed + fast, no llms.txt; 50 = some blocked OR slow; 0 = GPTBot/ClaudeBot blocked OR content not crawlable.

=== WEIGHTS SUMMARY ===
1 Schema Markup Depth: 12%
2 Semantic HTML Structure: 10%
3 Answer-Engine Readiness: 14%
4 Entity & Topic Authority: 11%
5 Content Freshness: 8%
6 E-E-A-T Signals: 10%
7 Citation-Worthiness: 11%
8 LLM-Friendly Formatting: 9%
9 Conversational Query Match: 8%
10 Technical Crawlability: 7%
Total: 100%

=== LETTER GRADES ===
A: 90-100 (AI-First Ready) | B: 75-89 (Strong GEO Foundation) | C: 60-74 (Average — Catchable) | D: 40-59 (Significantly Behind) | F: 0-39 (Invisible to AI Engines)`;

const OUTPUT_SCHEMA = `Return ONLY a JSON object matching this schema exactly:

{
  "overall_score": <number 0-100, weighted sum of factor scores>,
  "letter_grade": "<A|B|C|D|F>",
  "tier_label": "<AI-First Ready | Strong GEO Foundation | Average — Catchable | Significantly Behind | Invisible to AI Engines>",
  "audit_date": "<YYYY-MM-DD>",
  "url_audited": "<the URL>",
  "factors": [
    {
      "id": <1-10>,
      "name": "<exact factor name from rubric>",
      "weight": <weight %>,
      "score": <0-100>,
      "weighted_score": <score * weight / 100, 1 decimal>,
      "status": "<excellent | good | needs_work | critical>",
      "findings": "<2-3 sentence plain-language summary>",
      "fix_priority": "<low | medium | high | critical>",
      "estimated_lift": "<e.g. '+8 points'>",
      "fix_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }
  ],
  "top_3_wins": ["<win 1>", "<win 2>", "<win 3>"],
  "top_3_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "thirty_day_action_plan": [
    { "week": 1, "action": "<specific action>", "impact": "<+X points>" },
    { "week": 2, "action": "<specific action>", "impact": "<+X points>" },
    { "week": 3, "action": "<specific action>", "impact": "<+X points>" },
    { "week": 4, "action": "<specific action>", "impact": "<+X points>" }
  ],
  "executive_summary": "<4-6 sentence executive summary to the business owner. Confident, direct, no fluff. Lead with the score and what it means. End with the single biggest opportunity.>"
}`;

export function buildUserPrompt({ url, businessName, industry, scraped }) {
  return `Audit the following website and return the scoring JSON.

URL: ${url}
Business name (if provided): ${businessName || "not provided"}
Industry (if provided): ${industry || "not provided"}

=== SCRAPED DATA ===

[ROBOTS.TXT]
${scraped.robots_txt_content}

[LLMS.TXT — if present]
${scraped.llms_txt_content}

[SITEMAP.XML — first 50 URLs]
${(scraped.sitemap_urls || []).join("\n") || "NOT_FOUND"}

[HOMEPAGE HTML — full]
${scraped.homepage_html}

[INTERIOR PAGE 1 — full HTML]
${scraped.page_1_html || "NOT_FETCHED"}

[INTERIOR PAGE 2 — full HTML]
${scraped.page_2_html || "NOT_FETCHED"}

[INTERIOR PAGE 3 — full HTML]
${scraped.page_3_html || "NOT_FETCHED"}

[DETECTED JSON-LD SCHEMAS]
${scraped.json_ld_blocks || "NONE_DETECTED"}

[META DATA]
- Title: ${scraped.meta.title}
- Description: ${scraped.meta.description}
- Canonical: ${scraped.meta.canonical}
- Viewport: ${scraped.meta.viewport}

[PERFORMANCE]
- Page load time: ${scraped.load_time_ms}ms
- Mobile-friendly: ${scraped.meta.mobile_friendly}
- HTTPS: ${scraped.https}

[CRAWLER ACCESS CHECK]
- GPTBot allowed: ${scraped.crawler_access.gptbot}
- ClaudeBot allowed: ${scraped.crawler_access.claudebot}
- PerplexityBot allowed: ${scraped.crawler_access.perplexitybot}
- Google-Extended allowed: ${scraped.crawler_access.google_extended}

=== SCORING RUBRIC ===

${RUBRIC}

=== REQUIRED OUTPUT ===

${OUTPUT_SCHEMA}`;
}
