import { getAudits } from "../../lib/db.js";

export const metadata = { title: "Recommendations — GeoTrackerPro" };
export const dynamic = "force-dynamic";

const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

export default async function Recommendations() {
  const { ok, audits, reason } = await getAudits(200);

  // Latest audit per site, then collect high/critical fixes.
  const seen = new Set();
  const recs = [];
  for (const a of audits) {
    const key = (a.url || "").replace(/\/+$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    const factors = a.audit_json?.factors || [];
    for (const f of factors) {
      if (f.fix_priority === "high" || f.fix_priority === "critical") {
        recs.push({
          site: a.business_name || key,
          name: f.name,
          priority: f.fix_priority,
          findings: f.findings,
          lift: f.estimated_lift,
          steps: f.fix_steps || [],
        });
      }
    }
  }
  recs.sort((x, y) => (PRIORITY_RANK[x.priority] ?? 9) - (PRIORITY_RANK[y.priority] ?? 9));

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <h1 style={{ fontSize: 34 }}>Recommendations</h1>
        <p className="sub" style={{ margin: 0 }}>Highest-impact fixes across your audited sites — what to ship next.</p>
      </div>

      {!ok ? (
        <div className="card"><p className="exec">Couldn&apos;t load data ({reason}). Connect Supabase in Vercel.</p></div>
      ) : recs.length === 0 ? (
        <div className="card"><p className="exec">No high-priority fixes yet — run an audit to generate recommendations.</p></div>
      ) : (
        recs.slice(0, 40).map((r, i) => (
          <div className="card" key={i} style={{ marginTop: 12 }}>
            <div className="factor-head">
              <span className="factor-name">{r.name} <span className="weight-tag">· {r.site}</span></span>
              <span className="score-chip" style={{ background: r.priority === "critical" ? "#C2533B" : "#C2902F" }}>{r.priority}{r.lift ? ` · ${r.lift}` : ""}</span>
            </div>
            <div className="factor-find" style={{ marginTop: 8 }}>{r.findings}</div>
            {r.steps.length > 0 && (
              <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                {r.steps.map((s, j) => <li key={j} className="factor-find" style={{ marginBottom: 4 }}>{s}</li>)}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}
