"use client";

import { useState } from "react";

const TOOLS = [
  { id: 1, name: "Dynamic Title Agent", blurb: "3 SEO/GEO-optimized <title> tag options." },
  { id: 2, name: "Meta Description Agent", blurb: "A 150–160 char BLUF meta description." },
  { id: 3, name: "Hero Text Agent", blurb: "A 150–180 word answer-first hero paragraph." },
  { id: 8, name: "Last Updated Date Agent", blurb: "Freshness date + dateModified JSON-LD." },
];

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
  const [form, setForm] = useState({ businessName: "", location: "", industry: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function run() {
    setError("");
    setOut(null);
    if (!form.businessName || !form.industry) {
      setError("Business name and industry are required.");
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
            <label>Business name *</label>
            <input placeholder="Aloha Roofing" value={form.businessName} onChange={update("businessName")} />
          </div>
          <div>
            <label>Industry / service *</label>
            <input placeholder="Roofing" value={form.industry} onChange={update("industry")} />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Location</label>
            <input placeholder="Honolulu, HI" value={form.location} onChange={update("location")} />
          </div>
          <div>
            <label>Page URL {agentId === 8 ? "*" : "(optional)"}</label>
            <input placeholder="https://yourbusiness.com" value={form.url} onChange={update("url")} />
          </div>
        </div>

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
