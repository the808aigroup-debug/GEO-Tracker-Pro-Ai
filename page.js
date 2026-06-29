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
   Client-ready PDF export — premium 808-branded deliverable.
   Opens a self-contained, fully styled report in a new window
   (no app chrome) with a one-tap "Save as PDF" button. Zero deps.
   Falls back to printing the current page if popups are blocked.
   ============================================================ */
const BRAND = {
  firm: "The 808 AI Group",
  product: "GEO Tracker PRO",
  email: "the808aigroup@gmail.com",
  site: "geotrackerpro.ai",
  // palette
  pacific: "#0A1F2D",
  ocean: "#0F3D4A",
  seaglass: "#16B3A6",
  sand: "#F3E8D5",
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bandLabel(score) {
  if (score >= 75) return "Strong AI visibility";
  if (score >= 60) return "Some visibility — gaps to close";
  return "Largely invisible to AI search";
}

function downloadReportPdf(audit, businessName) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const overall = Math.max(0, Math.min(100, Number(audit.overall_score) || 0));
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
      const w = Math.max(0, Math.min(100, Number(f.score) || 0));
      return `
        <div class="factor">
          <div class="factor-head">
            <span class="factor-name">${esc(f.name)} <span class="weight">${esc(f.weight)}% weight</span></span>
            <span class="factor-score" style="color:${fc}">${esc(f.score)}<span class="of">/100</span></span>
          </div>
          <div class="bar"><span style="width:${w}%;background:${fc}"></span></div>
          <div class="factor-find">${esc(f.findings)}</div>
        </div>`;
    })
    .join("");

  const plan = (audit.thirty_day_action_plan || [])
    .map(
      (p) => `
        <div class="plan-row">
          <span class="plan-week">WEEK ${esc(p.week)}</span>
          <span class="plan-act">${esc(p.action)}</span>
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --pacific:${BRAND.pacific}; --ocean:${BRAND.ocean}; --seaglass:${BRAND.seaglass};
    --sand:${BRAND.sand}; --cloud:#F7F9FA; --border:#E4EAEA; --line:#EEF2F2;
    --text:#0A1F2D; --muted:#64757C; --good:#138C82; --bad:#C2533B;
  }
  *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  html,body{margin:0;background:#EDF1F1;color:var(--text);
    font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;
    font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased;}
  .mono{font-family:"IBM Plex Mono",ui-monospace,monospace;}
  .sheet{max-width:820px;margin:0 auto;background:#fff;
    box-shadow:0 18px 50px rgba(10,31,45,.12);}

  /* ---- Top tip (screen only) ---- */
  .tip{max-width:820px;margin:18px auto 14px;background:#0A1F2D;color:#CFE9E6;
    border-radius:12px;padding:14px 18px;font-size:13px;line-height:1.5;
    display:flex;gap:12px;align-items:flex-start;}
  .tip b{color:#fff;} .tip .k{color:var(--seaglass);font-weight:700;}
  .tip .dot{flex-shrink:0;width:26px;height:26px;border-radius:50%;background:var(--seaglass);
    color:var(--pacific);font-weight:900;display:flex;align-items:center;justify-content:center;font-size:14px;}

  /* ---- Cover band (full-bleed dark) ---- */
  .cover{background:linear-gradient(135deg,var(--pacific) 0%,var(--ocean) 100%);
    color:#fff;padding:40px 44px 36px;position:relative;overflow:hidden;}
  .cover:after{content:"";position:absolute;right:-90px;top:-90px;width:260px;height:260px;
    border-radius:50%;background:radial-gradient(circle,rgba(22,179,166,.30),transparent 68%);}
  .brandrow{display:flex;align-items:center;gap:13px;position:relative;z-index:1;}
  .logo{background:var(--seaglass);color:var(--pacific);font-weight:900;font-size:22px;
    border-radius:11px;padding:7px 13px;letter-spacing:-.03em;line-height:1;}
  .brandrow .firm{font-weight:700;font-size:14px;letter-spacing:.02em;}
  .brandrow .firm span{color:var(--seaglass);}
  .eyebrow{margin:26px 0 6px;font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;
    color:var(--seaglass);font-weight:700;position:relative;z-index:1;}
  .cover h1{margin:0;font-size:32px;font-weight:900;letter-spacing:-.02em;line-height:1.08;
    position:relative;z-index:1;max-width:560px;}
  .cover .for{margin-top:18px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;
    position:relative;z-index:1;}
  .cover .for .biz{font-size:20px;font-weight:800;}
  .cover .for .url{color:#9FB4BA;font-size:13px;}
  .cover .date{position:absolute;right:44px;bottom:36px;color:#9FB4BA;font-size:12px;z-index:1;}

  /* ---- Score hero ---- */
  .body{padding:30px 44px 8px;}
  .hero{display:flex;gap:26px;align-items:center;background:var(--cloud);
    border:1px solid var(--border);border-radius:16px;padding:24px 26px;}
  .ring{width:120px;height:120px;border-radius:50%;flex-shrink:0;display:flex;
    align-items:center;justify-content:center;
    background:conic-gradient(${ringColor} ${overall * 3.6}deg,#E2EAEA 0deg);}
  .ring-inner{width:96px;height:96px;border-radius:50%;background:#fff;display:flex;
    flex-direction:column;align-items:center;justify-content:center;
    box-shadow:inset 0 0 0 1px rgba(10,31,45,.04);}
  .ring-num{font-size:40px;font-weight:900;line-height:1;color:${ringColor};letter-spacing:-.02em;}
  .ring-of{font-size:11px;color:var(--muted);margin-top:2px;}
  .hero-r{flex:1;min-width:0;}
  .grade{display:inline-block;background:${ringColor};color:#fff;font-weight:800;
    font-size:12.5px;letter-spacing:.02em;padding:6px 14px;border-radius:999px;margin-bottom:9px;}
  .band{font-size:13px;color:var(--muted);font-weight:600;margin-bottom:8px;}
  .exec{color:#3A4C54;font-size:14px;margin:0;}

  /* ---- Section headers ---- */
  h2.sec{display:flex;align-items:center;gap:11px;font-size:13px;font-weight:800;
    letter-spacing:.14em;text-transform:uppercase;color:var(--pacific);margin:32px 0 14px;}
  h2.sec:before{content:"";width:22px;height:4px;border-radius:2px;background:var(--seaglass);}

  /* ---- Wins / Issues ---- */
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .panel{border:1px solid var(--border);border-radius:14px;padding:18px 20px;}
  .panel.wins{background:linear-gradient(180deg,#F1FBF9,#fff);}
  .panel.issues{background:linear-gradient(180deg,#FCF3F1,#fff);}
  .panel h3{margin:0 0 11px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
    font-weight:800;display:flex;align-items:center;gap:7px;}
  .panel.wins h3{color:var(--good);} .panel.issues h3{color:var(--bad);}
  .panel h3:before{content:"";width:8px;height:8px;border-radius:50%;}
  .panel.wins h3:before{background:var(--good);} .panel.issues h3:before{background:var(--bad);}
  .panel ul{margin:0;padding-left:18px;} .panel li{margin-bottom:7px;font-size:13.5px;color:#2C3E45;}

  /* ---- 10-factor ---- */
  .factors{border:1px solid var(--border);border-radius:14px;padding:6px 20px;}
  .factor{border-top:1px solid var(--line);padding:14px 0;}
  .factor:first-child{border-top:none;}
  .factor-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;}
  .factor-name{font-weight:700;font-size:14px;color:var(--pacific);}
  .factor-name .weight{color:var(--muted);font-size:11px;font-weight:600;
    background:#EEF3F3;border-radius:6px;padding:2px 7px;margin-left:6px;letter-spacing:.02em;}
  .factor-score{font-weight:800;font-size:17px;letter-spacing:-.02em;}
  .factor-score .of{font-size:11px;color:var(--muted);font-weight:600;}
  .bar{height:7px;background:#EAF0F0;border-radius:999px;margin:9px 0;overflow:hidden;}
  .bar>span{display:block;height:100%;border-radius:999px;}
  .factor-find{color:#566B72;font-size:13px;}

  /* ---- Plan ---- */
  .plan{border:1px solid var(--border);border-radius:14px;overflow:hidden;}
  .plan-row{display:grid;grid-template-columns:78px 1fr 104px;gap:14px;align-items:center;
    padding:13px 20px;border-top:1px solid var(--line);font-size:13.5px;}
  .plan-row:first-child{border-top:none;}
  .plan-row:nth-child(even){background:#FAFCFC;}
  .plan-week{font-weight:800;color:var(--seaglass);font-size:11px;letter-spacing:.06em;}
  .plan-act{color:#2C3E45;}
  .plan-impact{font-weight:800;color:var(--good);text-align:right;font-size:12.5px;}

  /* ---- CTA ---- */
  .cta-box{background:linear-gradient(135deg,var(--pacific),var(--ocean));color:#fff;
    border-radius:16px;padding:26px 28px;margin-top:30px;position:relative;overflow:hidden;}
  .cta-box:after{content:"";position:absolute;left:-60px;bottom:-80px;width:220px;height:220px;
    border-radius:50%;background:radial-gradient(circle,rgba(22,179,166,.28),transparent 68%);}
  .cta-box h3{margin:0 0 7px;font-size:19px;font-weight:900;position:relative;z-index:1;}
  .cta-box p{margin:0 0 14px;color:#CFE0E4;font-size:14px;position:relative;z-index:1;max-width:560px;}
  .cta-btn{display:inline-block;background:var(--seaglass);color:var(--pacific);font-weight:800;
    font-size:14px;padding:11px 20px;border-radius:10px;position:relative;z-index:1;}

  /* ---- Footer ---- */
  .foot{padding:22px 44px 30px;margin-top:14px;border-top:1px solid var(--border);
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;
    color:var(--muted);font-size:12px;}
  .foot .l b{color:var(--pacific);} .foot .l span{color:var(--seaglass);}
  .foot .r{text-align:right;}

  .factor,.plan-row,.panel,.hero,.cta-box{break-inside:avoid;page-break-inside:avoid;}
  @page{margin:0;}
  @media print{
    html,body{background:#fff;}
    .noprint{display:none!important;}
    .sheet{box-shadow:none;max-width:none;}
  }
  .printbar{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(10,31,45,.96);
    backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;gap:14px;
    padding:10px 16px;}
  .printbar .msg{color:#CFE9E6;font-size:13px;}
  .printbar .msg .k{color:var(--seaglass);font-weight:700;}
  .printbtn{background:var(--seaglass);color:var(--pacific);
    border:none;border-radius:9px;padding:10px 20px;font-size:14px;font-weight:800;
    cursor:pointer;font-family:inherit;}
  .spacer{height:54px;}
</style>
</head>
<body>
  <div class="printbar noprint">
    <span class="msg">In the dialog: set <span class="k">Save as PDF</span>, then under <span class="k">More settings</span> uncheck <span class="k">Headers and footers</span>.</span>
    <button class="printbtn" onclick="window.print()">⬇ Save as PDF</button>
  </div>
  <div class="spacer noprint"></div>

  <div class="sheet">
    <!-- COVER -->
    <div class="cover">
      <div class="brandrow">
        <span class="logo">808</span>
        <span class="firm">The <span>808</span> AI Group · ${esc(BRAND.product)}</span>
      </div>
      <div class="eyebrow">Generative Engine Optimization Audit</div>
      <h1>AI Search Visibility Report</h1>
      <div class="for">
        <span class="biz">${esc(businessName || audit.url_audited)}</span>
        <span class="url">${esc(audit.url_audited)}</span>
      </div>
      <div class="date">${esc(today)}</div>
    </div>

    <div class="body">
      <!-- SCORE HERO -->
      <div class="hero">
        <div class="ring"><div class="ring-inner">
          <span class="ring-num">${esc(overall)}</span><span class="ring-of">/ 100</span>
        </div></div>
        <div class="hero-r">
          <span class="grade">Grade ${esc(audit.letter_grade)} · ${esc(audit.tier_label)}</span>
          <div class="band">${esc(bandLabel(overall))}</div>
          <p class="exec">${esc(audit.executive_summary)}</p>
        </div>
      </div>

      <!-- WINS / ISSUES -->
      <h2 class="sec">What's Working &amp; What's Not</h2>
      <div class="cols">
        <div class="panel wins"><h3>Top Wins</h3><ul>${wins}</ul></div>
        <div class="panel issues"><h3>Top Issues</h3><ul>${issues}</ul></div>
      </div>

      <!-- FACTORS -->
      <h2 class="sec">10-Factor GEO Breakdown</h2>
      <div class="factors">${factors}</div>

      <!-- PLAN -->
      <h2 class="sec">Your 30-Day Action Plan</h2>
      <div class="plan">${plan}</div>

      <!-- CTA -->
      <div class="cta-box">
        <h3>Want us to fix all of this for you?</h3>
        <p>${esc(BRAND.firm)} does done-for-you GEO optimization — we implement every fix in this report so your business shows up when customers ask AI for a recommendation.</p>
        <span class="cta-btn">${esc(BRAND.email)}</span>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="foot">
      <span class="l"><b>The <span>808</span> AI Group</b> · ${esc(BRAND.product)}</span>
      <span class="r">${esc(BRAND.email)} · ${esc(BRAND.site)}</span>
    </div>
  </div>
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
