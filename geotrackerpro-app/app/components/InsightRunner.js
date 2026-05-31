"use client";

import { useState } from "react";

const FIELD_LABELS = {
  businessName: "Business name",
  industry: "Industry / service",
  location: "Location",
  url: "Website URL",
};

export default function InsightRunner({ agentId, title, subtitle, fields, kind }) {
  const [form, setForm] = useState({ businessName: "", industry: "", location: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const required = fields.filter((f) => f !== "location");

  async function run() {
    setError(""); setOut(null);
    const missing = required.filter((f) => !form[f]);
    if (missing.length) { setError(`Required: ${missing.map((m) => FIELD_LABELS[m]).join(", ")}.`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, inputs: form }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setOut(data);
    } catch { setError("Network error — please try again."); }
    setLoading(false);
  }

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <h1 style={{ fontSize: 34 }}>{title}</h1>
        <p className="sub" style={{ margin: 0 }}>{subtitle}</p>
      </div>

      <div className="card">
        <div className="row">
          {fields.map((f) => (
            <div key={f}>
              <label>{FIELD_LABELS[f]} {required.includes(f) ? "*" : "(optional)"}</label>
              <input value={form[f]} onChange={update(f)} placeholder={FIELD_LABELS[f]} />
            </div>
          ))}
        </div>
        <button className="cta" onClick={run} disabled={loading}>{loading ? "Running…" : "Run →"}</button>
        {error && <p className="err" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      {out && <Output out={out} kind={kind} />}
    </div>
  );
}

function Output({ out, kind }) {
  const r = out.result;
  if (kind === "query-list") {
    return (
      <div className="card">
        <div className="section-title" style={{ margin: "0 0 4px" }}>Questions buyers ask AI</div>
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
      </div>
    );
  }
  if (kind === "brand-perception") {
    return (
      <div className="card">
        <div className="section-title" style={{ margin: "0 0 10px" }}>How AI perceives this brand</div>
        <p className="exec" style={{ marginTop: 0 }}>{r.knows}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
          <span className="score-chip" style={{ background: "#0F3D4A" }}>Sentiment: {r.sentiment}</span>
          <span className="score-chip" style={{ background: "#5A6B72" }}>Confidence: {r.confidence}</span>
        </div>
        <div className="section-title" style={{ fontSize: 16, margin: "14px 0 6px" }}>Top gaps</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>{(r.gaps || []).map((g, i) => <li key={i} className="factor-find" style={{ marginBottom: 4 }}>{g}</li>)}</ul>
        <div className="section-title" style={{ fontSize: 16, margin: "14px 0 6px" }}>Highest-impact fix</div>
        <p className="factor-find" style={{ margin: 0 }}>{r.top_action}</p>
      </div>
    );
  }
  if (kind === "citation-check") {
    return (
      <div className="card">
        <div className="section-title" style={{ margin: "0 0 4px" }}>AI Citation Check</div>
        <div className="weight-tag" style={{ marginBottom: 10 }}>Simulated estimate of how AI assistants answer buying-intent queries.</div>
        <p className="exec" style={{ marginTop: 0 }}>
          <span className="score-chip" style={{ background: r.cited ? "#138C82" : "#C2533B", marginRight: 8 }}>{r.cited ? "Cited" : "Not cited"}</span>
          {r.overall}
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
      </div>
    );
  }
  return null;
}
