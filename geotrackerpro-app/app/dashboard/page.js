import { getAudits } from "../../lib/db.js";

export const metadata = { title: "Dashboard — GeoTrackerPro" };
export const dynamic = "force-dynamic";

function scoreColor(s) {
  if (s >= 75) return "#138C82";
  if (s >= 60) return "#C2902F";
  return "#C2533B";
}

function countOpenFixes(audits) {
  let n = 0;
  for (const a of audits) {
    const factors = a.audit_json?.factors || [];
    n += factors.filter((f) => f.fix_priority === "high" || f.fix_priority === "critical" || f.status === "critical" || f.status === "needs_work").length;
  }
  return n;
}

// Tiny dependency-free SVG line chart of score over time (oldest → newest).
function TrendChart({ points }) {
  if (points.length < 2) {
    return <div className="weight-tag" style={{ padding: "30px 0", textAlign: "center" }}>Run at least 2 audits to see a trend.</div>;
  }
  const W = 640, H = 220, pad = 28;
  const xs = (i) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const ys = (v) => H - pad - (v / 100) * (H - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(p.score).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={W - pad} y1={ys(g)} y2={ys(g)} stroke="#E2E8E8" strokeWidth="1" />
          <text x={4} y={ys(g) + 4} fontSize="10" fill="#5A6B72" fontFamily="monospace">{g}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#16B3A6" strokeWidth="2.5" />
      {points.map((p, i) => (
        <circle key={i} cx={xs(i)} cy={ys(p.score)} r="3.5" fill={scoreColor(p.score)} />
      ))}
    </svg>
  );
}

export default async function Dashboard() {
  const { ok, audits, reason } = await getAudits(100);

  if (!ok) {
    return (
      <div className="wrap">
        <div className="hero" style={{ paddingBottom: 8 }}>
          <h1 style={{ fontSize: 36 }}>Dashboard</h1>
          <p className="sub">Your GEO health at a glance.</p>
        </div>
        <div className="card">
          <p className="exec">Couldn&apos;t load your data yet — Supabase isn&apos;t connected on this deployment ({reason}). Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_KEY</code> in Vercel and redeploy.</p>
        </div>
      </div>
    );
  }

  const total = audits.length;
  const scored = audits.filter((a) => typeof a.overall_score === "number");
  const avg = scored.length ? Math.round(scored.reduce((s, a) => s + a.overall_score, 0) / scored.length) : 0;
  const sites = new Set(audits.map((a) => (a.url || "").replace(/\/+$/, ""))).size;
  const openFixes = countOpenFixes(audits);
  const latest = audits[0];
  // oldest → newest for the trend
  const trend = [...scored].reverse().map((a) => ({ score: a.overall_score }));

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <span className="badge">808 AI Group · Admin</span>
        <h1 style={{ fontSize: 38 }}>Dashboard</h1>
        <p className="sub" style={{ margin: 0 }}>Your GEO health at a glance — real audits, scores, and leads.</p>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-label">Avg. GEO Score</div><div className="kpi-num" style={{ color: scoreColor(avg) }}>{avg}<span className="kpi-of">/100</span></div></div>
        <div className="kpi"><div className="kpi-label">Sites Audited</div><div className="kpi-num">{sites}</div></div>
        <div className="kpi"><div className="kpi-label">Open Fixes</div><div className="kpi-num">{openFixes}</div></div>
        <div className="kpi"><div className="kpi-label">Audits Run</div><div className="kpi-num">{total}</div></div>
      </div>

      <div className="dash-cols">
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 4px" }}>Score Trend</div>
          <div className="weight-tag" style={{ marginBottom: 10 }}>GEO score across all audits</div>
          <TrendChart points={trend} />
        </div>
        <div className="card">
          <div className="section-title" style={{ margin: "0 0 12px" }}>Latest Audit</div>
          {latest ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="score-ring" style={{ width: 92, height: 92, background: `conic-gradient(${scoreColor(latest.overall_score)} ${latest.overall_score * 3.6}deg, var(--bg-soft) 0deg)` }}>
                  <div style={{ width: 74, height: 74, borderRadius: "50%", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="score-num" style={{ fontSize: 28, color: scoreColor(latest.overall_score) }}>{latest.overall_score}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--pacific)" }}>{latest.business_name || latest.url}</div>
                  <div className="weight-tag">{latest.url}</div>
                  <div className="grade-pill" style={{ background: scoreColor(latest.overall_score), color: "#fff", marginTop: 6 }}>Grade {latest.letter_grade} — {latest.tier_label}</div>
                </div>
              </div>
            </>
          ) : <div className="weight-tag">No audits yet — run one at the home page.</div>}
        </div>
      </div>

      {/* Leads / recent audits */}
      <div className="section-title">Recent Audits &amp; Leads</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {audits.length === 0 ? (
          <p className="exec" style={{ padding: 24 }}>No audits yet. Once people run the free audit, they&apos;ll appear here with their contact info and score.</p>
        ) : (
          <table className="lead-table">
            <thead>
              <tr><th>Date</th><th>Business</th><th>Contact</th><th>Site</th><th>Score</th></tr>
            </thead>
            <tbody>
              {audits.slice(0, 25).map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>{a.business_name || "—"}</td>
                  <td>
                    <div>{a.first_name || ""}</div>
                    <div className="weight-tag">{a.email}</div>
                    {a.phone && <div className="weight-tag">{a.phone}</div>}
                  </td>
                  <td className="weight-tag" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{a.url}</td>
                  <td><span className="score-chip" style={{ background: scoreColor(a.overall_score) }}>{a.overall_score} {a.letter_grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
