"use client";

import { useState, useEffect } from "react";

function scoreColor(score) {
  if (score >= 75) return "var(--good)";
  if (score >= 60) return "var(--warn)";
  return "var(--bad)";
}

// Hex versions for the standalone PDF window (CSS vars aren't shared there).
function scoreHex(score) {
  if (score >= 75) return "#138C82"; // sea-glass good
  if (score >= 60) return "#C2902F"; // sand amber warn
  return "#C2533B"; // terracotta bad
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

      // Read as text first so we can surface real server errors (e.g. an HTML
      // 401/500 page) instead of failing silently on res.json().
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(
          res.status === 401
            ? "Your admin session expired. Please log out and sign back in, then try again."
            : `Server returned an unexpected response (HTTP ${res.status}). ${text.slice(0, 160)}`
        );
        setPhase("error");
        return;
      }

      if (!res.ok) {
        setError(data.error || `Something went wrong (HTTP ${res.status}).`);
        setPhase("error");
        return;
      }
      setAudit(data.audit);
      setBusinessName(data.businessName || "");
      setSaved(!!data.saved);
      setPhase("report");
    } catch {
      setError("Network error — please check your connection and try again.");
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
          Admin quick audit — paste any website and get a full branded GEO report you can
          download as a client-ready PDF. No lead info needed.
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
        <button className="cta" onClick={() => downloadReportPdf(audit, businessName)}>
          ⬇ Download client PDF
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

/* ============================================================
   Client-ready PDF export.
   Builds a fully self-contained, 808-branded HTML document in a
   new window (no sidebar, no app chrome) and triggers the browser's
   "Save as PDF". Works in every modern browser with zero extra
   dependencies. Falls back to window.print() if popups are blocked.
   ============================================================ */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function downloadReportPdf(audit, businessName) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const overall = audit.overall_score;
  const ringColor = scoreHex(overall);

  const wins = (audit.top_3_wins || [])
    .map((w) => `<li>${esc(w)}</li>`)
    .join("");
  const issues = (audit.top_3_issues || [])
    .map((w) => `<li>${esc(w)}</li>`)
    .join("");

  const factors = (audit.factors || [])
    .map((f) => {
      const fc = scoreHex(f.score);
      return `
        <div class="factor">
          <div class="factor-head">
            <span class="factor-name">${esc(f.name)} <span class="weight">(${esc(f.weight)}%)</span></span>
            <span class="factor-score" style="color:${fc}">${esc(f.score)}/100</span>
          </div>
          <div class="bar"><span style="width:${Math.max(0, Math.min(100, Number(f.score) || 0))}%;background:${fc}"></span></div>
          <div class="factor-find">${esc(f.findings)}</div>
        </div>`;
    })
    .join("");

  const plan = (audit.thirty_day_action_plan || [])
    .map(
      (p) => `
        <div class="plan-row">
          <span class="plan-week">Week ${esc(p.week)}</span>
          <span>${esc(p.action)}</span>
          <span class="plan-impact">${esc(p.impact)}</span>
        </div>`
    )
    .join("");

  const safeName = (businessName || "GEO-Audit").replace(/[^a-z0-9]+/gi, "-");
  const docTitle = `${safeName}-GEO-Audit`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(docTitle)}</title>
<style>
  :root{
    --pacific:#0A1F2D; --ocean:#0F3D4A; --seaglass:#16B3A6; --sand:#F3E8D5;
    --cloud:#F7F9FA; --border:#E2E8E8; --text:#0A1F2D; --muted:#5A6B72;
    --good:#138C82; --bad:#C2533B;
  }
  *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  body{margin:0;background:#fff;color:var(--text);
    font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;}
  .sheet{max-width:780px;margin:0 auto;padding:28px 30px 56px;}

  /* Branded cover header */
  .cover{display:flex;align-items:center;gap:16px;border-bottom:3px solid var(--seaglass);
    padding-bottom:18px;margin-bottom:8px;}
  .logo{background:var(--seaglass);color:var(--pacific);font-weight:900;font-size:24px;
    border-radius:12px;padding:8px 14px;letter-spacing:-.02em;}
  .cover-title{font-size:20px;font-weight:800;color:var(--pacific);}
  .cover-sub{color:var(--muted);font-size:13px;margin-top:3px;}

  .meta{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;
    gap:8px;margin:14px 0 4px;}
  .meta .biz{font-size:22px;font-weight:800;color:var(--pacific);}
  .meta .url{color:var(--muted);font-size:13px;}

  .scorebar{display:flex;align-items:center;gap:22px;background:var(--cloud);
    border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin:14px 0 6px;}
  .ring{width:104px;height:104px;border-radius:50%;flex-shrink:0;display:flex;
    align-items:center;justify-content:center;
    background:conic-gradient(${ringColor} ${overall * 3.6}deg,#E5ECEC 0deg);}
  .ring-inner{width:84px;height:84px;border-radius:50%;background:#fff;display:flex;
    flex-direction:column;align-items:center;justify-content:center;}
  .ring-num{font-size:34px;font-weight:800;line-height:1;color:${ringColor};}
  .ring-of{font-size:11px;color:var(--muted);}
  .grade{display:inline-block;background:${ringColor};color:#06121f;font-weight:700;
    font-size:13px;padding:5px 13px;border-radius:999px;margin-bottom:6px;}
  .exec{color:#33454d;font-size:14px;margin:6px 0 0;}

  h2.sec{font-size:17px;font-weight:800;color:var(--pacific);margin:26px 0 10px;
    padding-bottom:6px;border-bottom:1px solid var(--border);}

  .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .panel{border:1px solid var(--border);border-radius:12px;padding:16px 18px;}
  .panel h3{margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;}
  .panel.wins h3{color:var(--good);} .panel.issues h3{color:var(--bad);}
  .panel ul{margin:0;padding-left:18px;} .panel li{margin-bottom:6px;font-size:13.5px;}

  .factor{border-top:1px solid var(--border);padding:13px 0;}
  .factor:first-child{border-top:none;}
  .factor-head{display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .factor-name{font-weight:600;font-size:14px;color:var(--pacific);}
  .factor-name .weight{color:var(--muted);font-size:12px;font-weight:400;}
  .factor-score{font-weight:700;font-size:14px;}
  .bar{height:8px;background:#E9EFEF;border-radius:999px;margin:9px 0;overflow:hidden;}
  .bar>span{display:block;height:100%;border-radius:999px;}
  .factor-find{color:var(--muted);font-size:13px;}

  .plan-row{display:grid;grid-template-columns:74px 1fr 96px;gap:12px;align-items:center;
    padding:11px 0;border-top:1px solid var(--border);font-size:13.5px;}
  .plan-row:first-child{border-top:none;}
  .plan-week{font-weight:700;color:var(--seaglass);font-size:12.5px;}
  .plan-impact{font-weight:700;color:var(--good);text-align:right;font-size:13px;}

  .cta-box{background:var(--sand);border:1px solid #E4D6BC;border-radius:14px;
    padding:20px 22px;margin-top:24px;text-align:center;}
  .cta-box h3{margin:0 0 6px;color:var(--pacific);font-size:18px;font-weight:800;}
  .cta-box p{margin:0;color:#5b4f3a;font-size:14px;}

  .foot{margin-top:28px;padding-top:14px;border-top:2px solid var(--seaglass);
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;
    color:var(--muted);font-size:12px;}
  .foot b{color:var(--pacific);}

  .card{break-inside:avoid;page-break-inside:avoid;}
  .factor,.plan-row,.panel{break-inside:avoid;page-break-inside:avoid;}
  @page{margin:14mm;}
  @media print{.noprint{display:none!important;}}
  .printbtn{position:fixed;top:14px;right:14px;background:var(--seaglass);color:#fff;
    border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;
    cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(10,31,45,.18);}
</style>
</head>
<body>
  <button class="printbtn noprint" onclick="window.print()">⬇ Save as PDF</button>
  <div class="sheet">
    <div class="cover">
      <span class="logo">808</span>
      <div>
        <div class="cover-title">GEO Tracker PRO — AI Search Audit</div>
        <div class="cover-sub">Generative Engine Optimization report · The 808 AI Group</div>
      </div>
    </div>

    <div class="meta">
      <div>
        <div class="biz">${esc(businessName || audit.url_audited)}</div>
        <div class="url">${esc(audit.url_audited)}</div>
      </div>
      <div class="url">${esc(today)}</div>
    </div>

    <div class="scorebar">
      <div class="ring"><div class="ring-inner">
        <span class="ring-num">${esc(overall)}</span><span class="ring-of">/ 100</span>
      </div></div>
      <div>
        <span class="grade">Grade ${esc(audit.letter_grade)} — ${esc(audit.tier_label)}</span>
        <p class="exec">${esc(audit.executive_summary)}</p>
      </div>
    </div>

    <div class="cols">
      <div class="panel wins"><h3>Top Wins</h3><ul>${wins}</ul></div>
      <div class="panel issues"><h3>Top Issues</h3><ul>${issues}</ul></div>
    </div>

    <h2 class="sec">10-Factor GEO Breakdown</h2>
    ${factors}

    <h2 class="sec">30-Day Action Plan</h2>
    ${plan}

    <div class="cta-box">
      <h3>Want us to fix all of this for you?</h3>
      <p>The 808 AI Group does done-for-you GEO optimization — we implement every fix above so your business shows up in AI answers.</p>
    </div>

    <div class="foot">
      <span><b>The 808 AI Group</b> · GEO Tracker PRO</span>
      <span>AI Search Visibility Audit · ${esc(today)}</span>
    </div>
  </div>
  <script>
    window.onload = function(){ setTimeout(function(){ try{ window.print(); }catch(e){} }, 350); };
  </script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) {
    // Popup blocked — fall back to printing the current page.
    window.print();
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  try {
    w.document.title = docTitle;
  } catch {}
}
