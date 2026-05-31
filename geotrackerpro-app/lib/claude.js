import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

const WEIGHTS = {
  1: 12, 2: 10, 3: 14, 4: 11, 5: 8, 6: 10, 7: 11, 8: 9, 9: 8, 10: 7,
};

function gradeFor(score) {
  if (score >= 90) return { letter: "A", tier: "AI-First Ready" };
  if (score >= 75) return { letter: "B", tier: "Strong GEO Foundation" };
  if (score >= 60) return { letter: "C", tier: "Average — Catchable" };
  if (score >= 40) return { letter: "D", tier: "Significantly Behind" };
  return { letter: "F", tier: "Invisible to AI Engines" };
}

// Recompute the weighted overall score from factor scores so the number is
// always mathematically correct (don't trust the model's arithmetic).
function recomputeScore(audit) {
  if (!Array.isArray(audit.factors) || audit.factors.length === 0) return audit;
  let total = 0;
  for (const f of audit.factors) {
    const w = WEIGHTS[f.id] ?? f.weight ?? 0;
    const s = typeof f.score === "number" ? f.score : 0;
    f.weight = w;
    f.weighted_score = Math.round(((s * w) / 100) * 10) / 10;
    total += (s * w) / 100;
  }
  const overall = Math.round(total);
  const { letter, tier } = gradeFor(overall);
  audit.overall_score = overall;
  audit.letter_grade = letter;
  audit.tier_label = tier;
  return audit;
}

function parseJson(text) {
  // Strip code fences / stray prose, then parse the first {...} block.
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(t);
  } catch {
    const first = t.indexOf("{");
    const last = t.lastIndexOf("}");
    if (first !== -1 && last !== -1) return JSON.parse(t.slice(first, last + 1));
    throw new Error("not_json");
  }
}

export async function runAudit({ url, businessName, industry, scraped }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.CLAUDE_MODEL_FREE || "claude-sonnet-4-6";
  const max_tokens = parseInt(process.env.CLAUDE_MAX_TOKENS || "6000", 10);
  const userPrompt = buildUserPrompt({ url, businessName, industry, scraped });

  const message = await client.messages.create({
    model,
    max_tokens,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = message.content[0].text;
  let json;
  try {
    json = parseJson(raw);
  } catch {
    const retry = await client.messages.create({
      model,
      max_tokens,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt },
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "Your previous response was not valid JSON. Return ONLY the JSON object, no prose.",
        },
      ],
    });
    json = parseJson(retry.content[0].text);
  }

  json.url_audited = url;
  if (!json.audit_date) json.audit_date = new Date().toISOString().slice(0, 10);
  return { audit: recomputeScore(json), usage: message.usage };
}
