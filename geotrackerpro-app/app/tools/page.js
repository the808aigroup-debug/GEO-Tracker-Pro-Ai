"use client";

import { useState } from "react";
import { liveTools } from "../../lib/agents.js";

// Tool list is derived from the registry — every live numbered agent shows up
// here automatically, numbered. No manual syncing.
const BLURBS = {
  1: "3 SEO/GEO-optimized <title> tags.",
  2: "150–160 char BLUF meta description.",
  3: "150–180 word answer-first hero paragraph.",
  4: "5 verifiable E-E-A-T trust-strip lines.",
  5: "8 FAQs as HTML section + FAQPage schema.",
  6: "Page-level WebPage + Service schema.",
  7: "5 internal links with anchors + rationale.",
  8: "Freshness date + dateModified JSON-LD.",
  9: "Priority-scored sitemap.xml.",
  10: "robots.txt allowing all AI crawlers.",
  11: "Site-wide Organization / LocalBusiness schema.",
  14: "Drop-in llms.txt press kit.",
  15: "Does AI recommend you? (simulated check)",
  16: "Wikidata QuickStatements + notability check.",
  18: "Real buyer queries from live autocomplete.",
  27: "How AI engines perceive the brand.",
};

const TOOLS = liveTools()
  .map((a) => ({
    id: a.id,
    name: a.name,
    blurb: BLURBS[a.id] || "",
    needs: (a.inputs || []).filter((f) => f !== "location"),
    fields: [...new Set([...(a.inputs || []), ...(a.extraInputs || [])])],
  }))
  .sort((x, y) => x.id - y.id);

const FIELD_LABELS = {
  businessName: "Business name",
  industry: "Industry / service",
  location: "Location",
  url: "Page URL",
  yearFounded: "Year founded",
  founders: "Founder / CEO",
  notability: "Notability evidence",
};
const PLACEHOLDERS = {
  businessName: "Aloha Roofing",
  industry: "Roofing",
  location: "Honolulu, HI",
  url: "https://yourbusiness.com",
  yearFounded: "2010",
  founders: "Jane Doe",
  notability: "Press, awards, license #, review count",
};

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="copybtn" onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function Tools() {
  const [agentId, setAgentId] = useState(TOOLS[0]?.id || 1);
  const [form, setForm] = useState({ businessName: "", location: "", industry: "", url: "", yearFounded: "", founders: "", notability: "" });
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const current = TOOLS.find((t) => t.id === agentId) || TOOLS[0];
  const required = current.needs;

  async function run() {
    setError(""); setOut(null);
    const missing = required.filter((f) => !form[f]);
    if (missing.length) { setError(`Required for this tool: ${missing.map((m) => FIELD_LABELS[m] || m).join(", ")}.`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId, inputs: form }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setOut(data);
    } catch { setError("Network error — please try again."); }
    setLoading(false);
  }

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8 }}>
        <span className="badge">808 AI Group · Tools</span>
        <h1 style={{ fontSize: 38 }}>GEO Agent Tools</h1>
        <p className="sub">Run any live agent. Pick one, enter the business details, get copy-paste-ready output.</p>
      </div>

      <div className="card">
        <label>Choose an agent ({TOOLS.length} live)</label>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <button key={t.id} className={`tool-card ${agentId === t.id ? "active" : ""}`} onClick={() => { setAgentId(t.id); setOut(null); setError(""); }}>
              <span className="tool-name"><span className="tool-num">#{t.id}</span> {t.name}</span>
              <span className="tool-blurb">{t.blurb}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          {chunk(current.fields, 2).map((pair, ri) => (
            <div className="row" key={ri}>
              {pair.map((f) => (
                <div key={f}>
                  <label>{FIELD_LABELS[f]} {required.includes(f) ? "*" : "(optional)"}</label>
                  <input value={form[f]} onChange={update(f)} placeholder={PLACEHOLDERS[f] || FIELD_LABELS[f]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <button className="cta" onClick={run} disabled={loading}>{loading ? "Working…" : "Run agent →"}</button>
        {error && <p className="err" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      {out && <Output out={out} />}
    </div>
  );
}

function Output({ out }) {
  const r = out.result;
  return (
    <div className="card">
      <div className="section-title" style={{ margin: "0 0 14px" }}>#{out.agentId} {out.name} — output</div>

      {out.outputType === "title-list" && out.result.map((t, i) => (
        <div className="out-row" key={i}>
          <div><div className="out-text">{t.text}</div><div className="weight-tag">{t.chars} characters {t.chars >= 50 && t.chars <= 60 ? "✓" : "(aim 50–60)"}</div></div>
          <CopyBtn text={t.text} />
        </div>
      ))}

      {out.outputType === "string-list" && out.result.items.map((t, i) => (
        <div className="out-row" key={i}><div className="out-text">{t}</div><CopyBtn text={t} /></div>
      ))}

      {out.outputType === "query-list" && (
        <>
          {r.source && <div className="weight-tag" style={{ marginBottom: 10 }}>Source: {r.source}</div>}
          {r.items.map((it, i) => {
            const q = typeof it === "string" ? it : it.query;
            const intent = typeof it === "object" ? it.intent : "";
            const target = typeof it === "object" ? it.target : "";
            return (
              <div key={i} style={{ padding: "8px 0", borderTop: i ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <span className="factor-find" style={{ margin: 0 }}>{i + 1}. {q}</span>
                <span style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {intent && <span className="weight-tag" style={{ background: "var(--bg-soft)", padding: "2px 8px", borderRadius: 999 }}>{intent}</span>}
                  {target && <span className="weight-tag" style={{ background: "rgba(22,179,166,0.1)", padding: "2px 8px", borderRadius: 999 }}>{target}</span>}
                </span>
              </div>
            );
          })}
        </>
      )}

      {out.outputType === "brand-perception" && (
        <>
          <p className="exec" style={{ marginTop: 0 }}>{r.knows}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
            <span className="score-chip" style={{ background: "#0F3D4A" }}>Sentiment: {r.sentiment}</span>
            <span className="score-chip" style={{ background: "#5A6B72" }}>Confidence: {r.confidence}</span>
          </div>
          <div className="section-title" style={{ fontSize: 16, margin: "14px 0 6px" }}>Top gaps</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{(r.gaps || []).map((g, i) => <li key={i} className="factor-find" style={{ marginBottom: 4 }}>{g}</li>)}</ul>
          <div className="section-title" style={{ fontSize: 16, margin: "14px 0 6px" }}>Highest-impact fix</div>
          <p className="factor-find" style={{ margin: 0 }}>{r.top_action}</p>
        </>
      )}

      {out.outputType === "citation-check" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 10 }}>Simulated estimate of how AI assistants answer buying-intent queries.</div>
          <p className="exec" style={{ marginTop: 0 }}>
            <span className="score-chip" style={{ background: r.cited ? "#138C82" : "#C2533B", marginRight: 8 }}>{r.cited ? "Cited" : "Not cited"}</span>{r.overall}
          </p>
          {(r.checks || []).map((c, i) => (
            <div className="factor" key={i}>
              <div className="factor-head">
                <span className="factor-name">“{c.query}”</span>
                <span className="score-chip" style={{ background: c.would_cite_business ? "#138C82" : "#C2533B" }}>{c.would_cite_business ? "Names you" : "Doesn't name you"}</span>
              </div>
              <div className="factor-find" style={{ marginTop: 6 }}>AI names instead: {c.names_instead}</div>
            </div>
          ))}
        </>
      )}

      {(out.outputType === "code-schema" || out.outputType === "org-schema") && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Paste this block inside &lt;head&gt;.</div>
          <div className="out-row"><pre className="code">{r.jsonld}</pre><CopyBtn text={r.jsonld} /></div></>
      )}

      {out.outputType === "code-robots" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Save as <code>/robots.txt</code> at your site root.</div>
          <div className="out-row"><pre className="code">{r.text}</pre><CopyBtn text={r.text} /></div></>
      )}

      {out.outputType === "code-llms" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Save as <code>/llms.txt</code> at your site root.</div>
          <div className="out-row"><pre className="code">{r.text}</pre><CopyBtn text={r.text} /></div></>
      )}

      {out.outputType === "code-sitemap" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Save as <code>/sitemap.xml</code> at your site root.</div>
          <div className="out-row"><pre className="code">{r.xml}</pre><CopyBtn text={r.xml} /></div></>
      )}

      {out.outputType === "links" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Drop at least 2 of these into your page body.</div>
          {r.links.map((l, i) => (
            <div className="out-row" key={i}><div><pre className="code" style={{ marginBottom: 6 }}>{l.html}</pre><div className="weight-tag">{l.reason}</div></div><CopyBtn text={l.html} /></div>
          ))}</>
      )}

      {out.outputType === "wikidata" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Paste into quickstatements.toolforge.org (replace placeholder Q-IDs first).</div>
          <div className="out-row"><pre className="code">{r.quickstatements}</pre><CopyBtn text={r.quickstatements} /></div>
          <div className="section-title" style={{ fontSize: 16, margin: "16px 0 6px" }}>Notability self-check</div>
          {r.checklist.map((q, i) => <div className="factor-find" key={i} style={{ padding: "3px 0" }}>☐ {q}</div>)}
          <div className="section-title" style={{ fontSize: 16, margin: "16px 0 6px" }}>Submission steps</div>
          {r.guide.map((g, i) => <div className="factor-find" key={i} style={{ padding: "3px 0" }}>{i + 1}. {g}</div>)}</>
      )}

      {out.outputType === "text-meta" && (
        <div className="out-row"><div><div className="out-text">{r.text}</div><div className="weight-tag">{r.chars} characters {r.chars >= 150 && r.chars <= 160 ? "✓" : "(aim 150–160)"}</div></div><CopyBtn text={r.text} /></div>
      )}

      {out.outputType === "text-hero" && (
        <div className="out-row"><div><div className="out-text" style={{ lineHeight: 1.6 }}>{r.text}</div><div className="weight-tag">{r.words} words {r.words >= 150 && r.words <= 180 ? "✓" : "(aim 150–180)"}</div></div><CopyBtn text={r.text} /></div>
      )}

      {out.outputType === "faq" && (
        <><div className="weight-tag" style={{ marginBottom: 10 }}>{r.faqs.length} FAQs. Paste the HTML above your footer, the JSON-LD inside &lt;head&gt;.</div>
          {r.faqs.map((f, i) => (<div className="factor" key={i}><div className="factor-name">{f.q}</div><div className="factor-find" style={{ marginTop: 4 }}>{f.a}</div></div>))}
          <div className="out-row" style={{ marginTop: 14 }}><pre className="code">{r.html}</pre><CopyBtn text={r.html} /></div>
          <div className="out-row"><pre className="code">{r.jsonld}</pre><CopyBtn text={r.jsonld} /></div></>
      )}

      {out.outputType === "code-freshness" && (
        <><div className="weight-tag" style={{ marginBottom: 8 }}>Stamped {r.date}. Paste the line where you want the date, and the script block before &lt;/head&gt;.</div>
          <div className="out-row"><pre className="code">{r.html}</pre><CopyBtn text={r.html} /></div>
          <div className="out-row"><pre className="code">{r.jsonld}</pre><CopyBtn text={r.jsonld} /></div></>
      )}
    </div>
  );
}
