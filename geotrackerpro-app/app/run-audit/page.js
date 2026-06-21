"use client";

import { useState, useEffect } from "react";

function scoreColor(score) {
  if (score >= 75) return "var(--good)";
  if (score >= 60) return "var(--warn)";
  return "var(--bad)";
}

const STEPS = [
  "Crawling the homepage…",
  "Fetching robots.txt, sitemap & llms.txt…",
  "Checking AI crawler access (GPTBot, ClaudeBot)…",
  "Reading interior pages…",
  "Scoring against the 10-factor GEO rubric…",
  "Writing the action plan…",
];

export default function RunAudit() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("form"); // form | analyzing | report | error
  const [stepIdx, setStepIdx] = useState(0);
  const [audit, setAudit] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setInterval(() => setStepIdx((i) => (i + 1) % STEPS.length), 4000);
    return () => clearInterval(t);
  }, [phase]);

  async function submit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setPhase("analyzing");
    setStepIdx(0);
    try {
      const res = await fetch("/api/admin-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setPhase("error");
        return;
      }
      setAudit(data.audit);
      setBusinessName(data.businessName || "");
      setSaved(!!data.saved);
      setPhase("report");
    } catch {
      setError("Network error — please try again.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("form");
    setAudit(null);
    setError("");
    setUrl("");
  }

  return (
    <div className="audit-page">
      <div className="page-head no-print">
        <h1 style={{ margin: 0 }}>Run Audit</h1>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Admin quick audit — paste any website and get a full branded GEO report. No lead
          info needed.
        </p>
      </div>

      {phase === "form" && (
        <div className="card no-print" style={{ maxWidth: 640 }}>
          <form onSubmit={submit}>
            <div>
              <label>Website URL</label>
              <input
                autoFocus
                required
                placeholder="acmebuilders.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button className="cta" type="submit" style={{ marginTop: 14 }}>
              Run GEO audit →
            </button>
            <p className="fineprint" style={{ textAlign: "left" }}>
              Takes ~30–60 seconds. Business name is auto-detected from the domain. The audit
              is saved to your Dashboard &amp; Reports automatically.
            </p>
          </form>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="card analyzing no-print">
          <div className="spinner" />
          <h2 style={{ margin: "0 0 14px" }}>Analyzing the site…</h2>
          <p className="step">{STEPS[stepIdx]}</p>
          <p className="fineprint" style={{ marginTop: 20 }}>
            Running a real audit, not a canned result.
          </p>
        </div>
      )}

      {phase === "error" && (
        <div className="card analyzing no-print">
          <h2 style={{ margin: "0 0 12px" }}>We hit a snag</h2>
          <p className="err">{error}</p>
          <button className="cta" onClick={reset} style={{ marginTop: 16 }}>
            Try again
          </button>
        </div>
      )}

      {phase === "report" && audit && (
        <Report
          audit={audit}
          businessName={businessName}
          saved={saved}
          onReset={reset}
        />
      )}
    </div>
  );
}

function Report({ audit, businessName, saved, onReset }) {
  const color = scoreColor(audit.overall_score);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="report-area">
      <div className="report-actions no-print">
        <button className="cta" onClick={() => window.print()}>
          ⬇ Download PDF
        </button>
        <button className="ghost-btn" onClick={onReset}>
          Audit another site
        </button>
        {saved && (
          <span className="saved-tag">✓ Saved to Dashboard &amp; Reports</span>
        )}
      </div>

      {/* Print-only branded header */}
      <div className="print-only print-header">
        <span className="print-logo">808</span>
        <div>
          <div className="print-title">GEO Tracker PRO — AI Search Audit</div>
          <div className="print-sub">
            {businessName ? businessName + " · " : ""}
            {audit.url_audited} · {today}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="score-hero">
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(${color} ${audit.overall_score * 3.6}deg, var(--bg-soft) 0deg)`,
            }}
          >
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: "50%",
                background: "var(--card)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="score-num" style={{ color }}>
                {audit.overall_score}
              </span>
              <span className="score-of">/ 100</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <span className="grade-pill" style={{ background: color, color: "#06121f" }}>
              Grade {audit.letter_grade} — {audit.tier_label}
            </span>
            {businessName && (
              <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>
                {businessName}
              </div>
            )}
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{audit.url_audited}</div>
            <p className="exec">{audit.executive_summary}</p>
          </div>
        </div>
      </div>

      <div className="cols">
        <div className="card list-card wins">
          <h3 style={{ color: "var(--good)" }}>Top Wins</h3>
          <ul>{(audit.top_3_wins || []).map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
        <div className="card list-card issues">
          <h3 style={{ color: "var(--bad)" }}>Top Issues</h3>
          <ul>{(audit.top_3_issues || []).map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      </div>

      <h2 className="section-title">10-Factor Breakdown</h2>
      <div className="card">
        {(audit.factors || []).map((f) => {
          const fc = scoreColor(f.score);
          return (
            <div className="factor" key={f.id}>
              <div className="factor-head">
                <span className="factor-name">
                  {f.name} <span className="weight-tag">({f.weight}%)</span>
                </span>
                <span className="factor-score" style={{ color: fc }}>
                  {f.score}/100
                </span>
              </div>
              <div className="bar">
                <span style={{ width: `${f.score}%`, background: fc }} />
              </div>
              <div className="factor-find">{f.findings}</div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">30-Day Action Plan</h2>
      <div className="card">
        {(audit.thirty_day_action_plan || []).map((p, i) => (
          <div className="plan-row" key={i}>
            <span className="plan-week">Week {p.week}</span>
            <span>{p.action}</span>
            <span className="plan-impact">{p.impact}</span>
          </div>
        ))}
      </div>

      <div className="card upsell">
        <h3>Want us to fix all of this for you?</h3>
        <p className="exec" style={{ color: "var(--text)" }}>
          The 808 AI Group does done-for-you GEO optimization — we implement every fix above
          so your business shows up in AI answers.
        </p>
      </div>
    </div>
  );
}
