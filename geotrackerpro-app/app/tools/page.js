"use client";

import { useState } from "react";

const TOOLS = [
  { id: 1, name: "Dynamic Title Agent", blurb: "3 SEO/GEO-optimized <title> tag options.", needs: ["businessName", "industry"] },
  { id: 2, name: "Meta Description Agent", blurb: "A 150–160 char BLUF meta description.", needs: ["businessName", "industry"] },
  { id: 3, name: "Hero Text Agent", blurb: "A 150–180 word answer-first hero paragraph.", needs: ["businessName", "industry"] },
  { id: 4, name: "Authority Signals Agent", blurb: "5 verifiable E-E-A-T trust-strip lines.", needs: ["businessName", "industry"] },
  { id: 5, name: "FAQ Section Agent", blurb: "8 FAQs as a drop-in HTML section + FAQPage schema.", needs: ["businessName", "industry"] },
  { id: 6, name: "JSON-LD Schema Agent", blurb: "Page-level WebPage + Service schema block.", needs: ["businessName", "industry", "url"] },
  { id: 7, name: "Internal Links Agent", blurb: "5 internal links with anchors + rationale.", needs: ["businessName", "industry", "url"] },
  { id: 8, name: "Last Updated Date Agent", blurb: "Freshness date + dateModified JSON-LD.", needs: ["url"] },
  { id: 9, name: "Sitemap Agent", blurb: "Priority-scored sitemap.xml (7 URLs).", needs: ["url"] },
  { id: 10, name: "Robots.txt Agent", blurb: "robots.txt that allows all major AI crawlers.", needs: ["url"] },
  { id: 11, name: "Organization Schema Agent", blurb: "Site-wide Organization/LocalBusiness schema.", needs: ["businessName", "industry", "url"] },
  { id: 14, name: "llms.txt Agent", blurb: "Drop-in llms.txt press kit for AI crawlers.", needs: ["businessName", "industry", "url"] },
  { id: 16, name: "Wikidata Submission Agent", blurb: "QuickStatements entry + notability checklist.", needs: ["businessName", "industry"] },
];

const FIELD_LABELS = { businessName: "Business name", industry: "Industry / service", url: "Page URL" };

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copybtn"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function Tools() {
  const [agentId, setAgentId] = useState(1);
  const [form, setForm] = useState({ businessName: "", location: "", industry: "", url: "", yearFounded: "", founders: "", notability: "" });
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const currentTool = TOOLS.find((t) => t.id === agentId) || TOOLS[0];

  async function run() {
    setError("");
    setOut(null);
    const missing = (currentTool.needs || []).filter((f) => !form[f]);
    if (missing.length) {
      setError(`Required for this tool: ${missing.map((m) => FIELD_LABELS[m] || m).join(", ")}.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, inputs: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setOut(data);
      }
    } catch {
      setError("Network error — please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8 }}>
        <span className="badge">808 AI Group · Starter Tools</span>
        <h1 style={{ fontSize: 38 }}>GEO Starter Tools</h1>
        <p className="sub">
          Quick, AI-powered fixes for the highest-leverage page signals. Pick a tool,
          drop in your business details, get copy-paste-ready output.
        </p>
      </div>

      <div className="card">
        <label>Choose a tool</label>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`tool-card ${agentId === t.id ? "active" : ""}`}
              onClick={() => { setAgentId(t.id); setOut(null); setError(""); }}
            >
              <span className="tool-name">{t.name}</span>
              <span className="tool-blurb">{t.blurb}</span>
            </button>
          ))}
        </div>

        <div className="row" style={{ marginTop: 18 }}>
          <div>
            <label>Business name {currentTool.needs.includes("businessName") ? "*" : ""}</label>
            <input placeholder="Aloha Roofing" value={form.businessName} onChange={update("businessName")} />
          </div>
          <div>
            <label>Industry / service {currentTool.needs.includes("industry") ? "*" : ""}</label>
            <input placeholder="Roofing" value={form.industry} onChange={update("industry")} />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Location {currentTool.needs.includes("location") ? "*" : "(optional, recommended)"}</label>
            <input placeholder="Honolulu, HI" value={form.location} onChange={update("location")} />
          </div>
          <div>
            <label>Page URL {currentTool.needs.includes("url") ? "*" : "(optional)"}</label>
            <input placeholder="https://yourbusiness.com" value={form.url} onChange={update("url")} />
          </div>
        </div>

        {agentId === 16 && (
          <>
            <div className="row">
              <div>
                <label>Year founded (optional)</label>
                <input placeholder="2010" value={form.yearFounded} onChange={update("yearFounded")} />
              </div>
              <div>
                <label>Founder / CEO (optional)</label>
                <input placeholder="Jane Doe" value={form.founders} onChange={update("founders")} />
              </div>
            </div>
            <div>
              <label>Notability evidence (optional)</label>
              <input placeholder="Press mentions, awards, license #, BBB rating, review count" value={form.notability} onChange={update("notability")} />
            </div>
          </>
        )}

        <button className="cta" onClick={run} disabled={loading}>
          {loading ? "Working…" : "Run tool →"}
        </button>
        {error && <p className="err" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      {out && <Output out={out} />}
    </div>
  );
}

function Output({ out }) {
  return (
    <div className="card">
      <div className="section-title" style={{ margin: "0 0 14px" }}>{out.name} — output</div>

      {out.outputType === "title-list" &&
        out.result.map((t, i) => (
          <div className="out-row" key={i}>
            <div>
              <div className="out-text">{t.text}</div>
              <div className="weight-tag">{t.chars} characters {t.chars >= 50 && t.chars <= 60 ? "✓" : "(aim for 50–60)"}</div>
            </div>
            <CopyBtn text={t.text} />
          </div>
        ))}

      {out.outputType === "string-list" &&
        out.result.items.map((t, i) => (
          <div className="out-row" key={i}>
            <div className="out-text">{t}</div>
            <CopyBtn text={t} />
          </div>
        ))}

      {(out.outputType === "code-schema" || out.outputType === "org-schema") && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Paste this block inside &lt;head&gt;.</div>
          <div className="out-row">
            <pre className="code">{out.result.jsonld}</pre>
            <CopyBtn text={out.result.jsonld} />
          </div>
        </>
      )}

      {out.outputType === "code-robots" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Save this as <code>/robots.txt</code> at your site root.</div>
          <div className="out-row">
            <pre className="code">{out.result.text}</pre>
            <CopyBtn text={out.result.text} />
          </div>
        </>
      )}

      {out.outputType === "code-llms" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Save this as <code>/llms.txt</code> at your site root.</div>
          <div className="out-row">
            <pre className="code">{out.result.text}</pre>
            <CopyBtn text={out.result.text} />
          </div>
        </>
      )}

      {out.outputType === "wikidata" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Paste into quickstatements.toolforge.org (replace placeholder Q-IDs first).</div>
          <div className="out-row">
            <pre className="code">{out.result.quickstatements}</pre>
            <CopyBtn text={out.result.quickstatements} />
          </div>
          <div className="section-title" style={{ fontSize: 16, margin: "16px 0 6px" }}>Notability self-check</div>
          {out.result.checklist.map((q, i) => (
            <div className="factor-find" key={i} style={{ padding: "3px 0" }}>☐ {q}</div>
          ))}
          <div className="section-title" style={{ fontSize: 16, margin: "16px 0 6px" }}>Submission steps</div>
          {out.result.guide.map((g, i) => (
            <div className="factor-find" key={i} style={{ padding: "3px 0" }}>{i + 1}. {g}</div>
          ))}
        </>
      )}

      {out.outputType === "links" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Drop at least 2 of these into your page body.</div>
          {out.result.links.map((l, i) => (
            <div className="out-row" key={i}>
              <div>
                <pre className="code" style={{ marginBottom: 6 }}>{l.html}</pre>
                <div className="weight-tag">{l.reason}</div>
              </div>
              <CopyBtn text={l.html} />
            </div>
          ))}
        </>
      )}

      {out.outputType === "code-sitemap" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Save this as <code>/sitemap.xml</code> at your site root.</div>
          <div className="out-row">
            <pre className="code">{out.result.xml}</pre>
            <CopyBtn text={out.result.xml} />
          </div>
        </>
      )}

      {out.outputType === "text-meta" && (
        <div className="out-row">
          <div>
            <div className="out-text">{out.result.text}</div>
            <div className="weight-tag">{out.result.chars} characters {out.result.chars >= 150 && out.result.chars <= 160 ? "✓" : "(aim for 150–160)"}</div>
          </div>
          <CopyBtn text={out.result.text} />
        </div>
      )}

      {out.outputType === "text-hero" && (
        <div className="out-row">
          <div>
            <div className="out-text" style={{ lineHeight: 1.6 }}>{out.result.text}</div>
            <div className="weight-tag">{out.result.words} words {out.result.words >= 150 && out.result.words <= 180 ? "✓" : "(aim for 150–180)"}</div>
          </div>
          <CopyBtn text={out.result.text} />
        </div>
      )}

      {out.outputType === "faq" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 10 }}>
            {out.result.faqs.length} FAQs generated. Paste the HTML block above your footer, and the JSON-LD inside &lt;head&gt;.
          </div>
          {out.result.faqs.map((f, i) => (
            <div className="factor" key={i}>
              <div className="factor-name">{f.q}</div>
              <div className="factor-find" style={{ marginTop: 4 }}>{f.a}</div>
            </div>
          ))}
          <div className="out-row" style={{ marginTop: 14 }}>
            <pre className="code">{out.result.html}</pre>
            <CopyBtn text={out.result.html} />
          </div>
          <div className="out-row">
            <pre className="code">{out.result.jsonld}</pre>
            <CopyBtn text={out.result.jsonld} />
          </div>
        </>
      )}

      {out.outputType === "code-freshness" && (
        <>
          <div className="weight-tag" style={{ marginBottom: 8 }}>Stamped {out.result.date}. Paste the first line where you want the date visible, and the script block before &lt;/head&gt;.</div>
          <div className="out-row">
            <pre className="code">{out.result.html}</pre>
            <CopyBtn text={out.result.html} />
          </div>
          <div className="out-row">
            <pre className="code">{out.result.jsonld}</pre>
            <CopyBtn text={out.result.jsonld} />
          </div>
        </>
      )}
    </div>
  );
}
