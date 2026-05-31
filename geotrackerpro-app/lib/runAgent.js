// ============================================================
// Agent engine — runs any built starter agent from its registry
// config. LLM agents (1,2,3) fill their prompt template and call
// Claude with a fallback; deterministic agents (8) compute output
// directly with no AI call.
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { getAgent } from "./agents.js";

function fillTemplate(tpl, inputs) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => inputs[k] || "");
}

async function callLLM(prompt, maxTokens = 800) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.CLAUDE_MODEL_FREE || "claude-haiku-4-5-20251001";
  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content[0].text.trim();
}

// ---------- Fallbacks (used if the LLM under-delivers) ----------
function fallbackTitles({ businessName, location, industry }) {
  const loc = location ? ` in ${location}` : "";
  return [
    `${industry}${loc} | ${businessName}`,
    `${businessName} — ${industry}${loc}`,
    `Best ${industry}${loc} | ${businessName}`,
  ];
}

function fallbackMeta({ businessName, location, industry }) {
  let s = `${businessName} delivers trusted ${industry} services${location ? ` in ${location}` : ""}. Book a free consultation today and get fast, reliable, local expertise you can count on now.`;
  if (s.length < 150) s = s + " Call us today.";
  return s.slice(0, 160);
}

function fallbackHero({ businessName, location, industry }) {
  return `${businessName} is a ${location ? location + "-based " : ""}${industry} company trusted by local customers for dependable, professional service. Based${location ? ` in ${location}` : ""}, ${businessName} has built its reputation on years of hands-on experience, licensed and insured work, and hundreds of satisfied clients across the area. Whether you need a quick fix or a complete project, our team brings the expertise, transparency, and reliability that sets us apart from the competition. We pride ourselves on clear communication, fair pricing, and quality workmanship that lasts. Every job — large or small — gets the same attention to detail and commitment to doing it right the first time. Our customers choose us because we show up on time, stand behind our work, and treat their property like our own. If you are looking for a ${industry} provider${location ? ` in ${location}` : ""} you can actually trust, reach out today for a free, no-obligation quote and discover why so many locals recommend ${businessName}.`;
}

function deterministicFreshness({ url }) {
  const today = new Date().toISOString().slice(0, 10);
  const html = `<p class="last-updated">Last updated: ${today}</p>`;
  const jsonld = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "${url || ""}",
  "dateModified": "${today}"
}
</script>`;
  return { date: today, html, jsonld };
}

function countWords(s) {
  return (s.trim().match(/\S+/g) || []).length;
}

export async function runAgent({ agentId, inputs }) {
  const agent = getAgent(agentId);
  if (!agent) throw new Error("Unknown agent.");
  if (agent.status !== "live") throw new Error("That agent isn't built yet.");

  // --- Deterministic agents (no AI) ---
  if (agent.mode === "deterministic") {
    if (agent.id === 8) {
      return { agentId: agent.id, name: agent.name, outputType: agent.outputType, result: deterministicFreshness(inputs) };
    }
    throw new Error("No deterministic handler for this agent.");
  }

  // --- LLM agents ---
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY.");
  const prompt = fillTemplate(agent.prompt, inputs);

  if (agent.outputType === "title-list") {
    let titles;
    try {
      const raw = await callLLM(prompt, 400);
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      titles = JSON.parse(cleaned);
      if (!Array.isArray(titles) || titles.length < 1) throw new Error("bad");
    } catch {
      titles = fallbackTitles(inputs);
    }
    const result = titles.slice(0, 3).map((t) => ({ text: t, chars: String(t).length }));
    return { agentId: agent.id, name: agent.name, outputType: agent.outputType, result };
  }

  if (agent.outputType === "text-meta") {
    let text;
    try {
      text = (await callLLM(prompt, 200)).replace(/^["']|["']$/g, "").trim();
      if (text.length < 120) throw new Error("short");
    } catch {
      text = fallbackMeta(inputs);
    }
    return { agentId: agent.id, name: agent.name, outputType: agent.outputType, result: { text, chars: text.length } };
  }

  if (agent.outputType === "text-hero") {
    let text;
    try {
      text = await callLLM(prompt, 600);
      if (countWords(text) < 130) throw new Error("short");
    } catch {
      text = fallbackHero(inputs);
    }
    return { agentId: agent.id, name: agent.name, outputType: agent.outputType, result: { text, words: countWords(text) } };
  }

  throw new Error("Unsupported agent output type.");
}
