"use client";

import { useState, useEffect } from "react";

function scoreColor(score) {
  if (score >= 75) return "var(--good)";
  if (score >= 60) return "var(--warn)";
  return "var(--bad)";
}

const STEPS = [
  "Crawling your homepage…",
  "Fetching robots.txt, sitemap & llms.txt…",
  "Checking AI crawler access (GPTBot, ClaudeBot)…",
  "Reading your interior pages…",
  "Scoring against the 10-factor GEO rubric…",
  "Writing your action plan…",
];

export default function Home() {
  const [form, setForm] = useState({
    url: "",
    email: "",
    firstName: "",
    phone: "",
    businessName: "",
    industry: "",
  });
  const [phase, setPhase] = useState("form"); // form | analyzing | report | error
  const [stepIdx, setStepIdx] = useState(0);
  const [audit, setAudit] = useState(null);
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setInterval(
      () => setStepIdx((i) => (i + 1) % STEPS.length),
      4000
    );
    return () => clearInterval(t);
  }, [phase]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setPhase("analyzing");
    setStepIdx(0);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setPhase("error");
        return;
      }
      setAudit(data.audit);
      setEmailed(!!data.emailed);
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
  }

  return (
    <div className="wrap">
      <div className="hero">
        <span className="badge">Free AI Search Audit</span>
        <h1>Is your website invisible to ChatGPT?</h1>
        <p className="sub">
          GeoTrackerPro scores any site on how well it&apos;s built to be cited and
          recommended by AI search engines — ChatGPT, Claude, Perplexity &amp; Gemini.
          Get your GEO score and a 30-day action plan in under a minute.
        </p>
      </div>

      {phase === "form" && (
        <div className="card">
          <form onSubmit={submit}>
            <div>
              <label>Website URL *</label>
              <input
                required
                placeholder="yourbusiness.com"
                value={form.url}
                onChange={update("url")}
              />
            </div>
            <div className="row">
              <div>
                <label>First name *</label>
                <input
                  required
                  placeholder="Devin"
                  value={form.firstName}
                  onChange={update("firstName")}
                />
              </div>
              <div>
                <label>Email *</label>
                <input
                  required
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Phone *</label>
                <input
                  required
                  type="tel"
                  placeholder="(808) 555-0199"
                  value={form.phone}
                  onChange={update("phone")}
                />
              </div>
              <div>
                <label>Business name *</label>
                <input
                  required
                  placeholder="Acme Co."
                  value={form.businessName}
                  onChange={update("businessName")}
                />
              </div>
            </div>
            <div>
              <label>Industry *</label>
              <input
                required
                placeholder="e.g. Roofing, SaaS, Law"
                value={form.industry}
                onChange={update("industry")}
              />
            </div>
            <button className="cta" type="submit">
              Run my free GEO audit →
            </button>
            <p className="fineprint">
              Takes ~30–60 seconds. We&apos;ll email you a copy of the full report.
            </p>
          </form>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="card analyzing">
          <div className="spinner" />
          <h2 style={{ margin: "0 0 14px" }}>Analyzing your site…</h2>
          <p className="step">{STEPS[stepIdx]}</p>
          <p className="fineprint" style={{ marginTop: 20 }}>
            Hang tight — running a real audit, not a canned result.
          </p>
        </div>
      )}

      {phase === "error" && (
        <div className="card analyzing">
          <h2 style={{ margin: "0 0 12px" }}>We hit a snag</h2>
          <p className="err">{error}</p>
          <button className="cta" onClick={reset} style={{ marginTop: 16 }}>
            Try again
          </button>
        </div>
      )}

      {phase === "report" && audit && <Report audit={audit} emailed={emailed} onReset={reset} />}
    </div>
  );
}

function Report({ audit, emailed, onReset }) {
  const color = scoreColor(audit.overall_score);
  return (
    <>
      <div className="card">
        <div className="score-hero">
          <div
            className="score-ring"
            style={{ background: `conic-gradient(${color} ${audit.overall_score * 3.6}deg, var(--bg-soft) 0deg)` }}
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
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{audit.url_audited}</div>
            <p className="exec">{audit.executive_summary}</p>
            {emailed && (
              <p className="fineprint" style={{ textAlign: "left", marginTop: 8 }}>
                ✓ A copy of this report has been emailed to you.
              </p>
            )}
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

      <h2 className="section-title">Your 10-Factor Breakdown</h2>
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

      <h2 className="section-title">Your 30-Day Action Plan</h2>
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
          The 808 AI Group does done-for-you GEO optimization — we implement every fix
          above so your business shows up in AI answers. Reply to your report email to book a call.
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button className="cta" onClick={onReset}>Audit another site</button>
      </div>
    </>
  );
}
