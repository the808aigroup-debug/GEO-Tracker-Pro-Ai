import { getAudits } from "../../lib/db.js";

export const metadata = { title: "Sites — GeoTrackerPro" };
export const dynamic = "force-dynamic";

function scoreColor(s) {
  if (s >= 75) return "#138C82";
  if (s >= 60) return "#C2902F";
  return "#C2533B";
}

export default async function Sites() {
  const { ok, audits, reason } = await getAudits(200);

  // Group by site (latest audit per URL).
  const map = new Map();
  for (const a of audits) {
    const key = (a.url || "").replace(/\/+$/, "");
    if (!map.has(key)) map.set(key, { url: key, business: a.business_name, latest: a, count: 0 });
    map.get(key).count += 1;
  }
  const sites = [...map.values()];

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <h1 style={{ fontSize: 34 }}>Sites</h1>
        <p className="sub" style={{ margin: 0 }}>Every site you&apos;ve audited, with its latest GEO score.</p>
      </div>

      {!ok ? (
        <div className="card"><p className="exec">Couldn&apos;t load data ({reason}). Connect Supabase in Vercel.</p></div>
      ) : sites.length === 0 ? (
        <div className="card"><p className="exec">No sites yet. Run an audit and it&apos;ll show up here.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="lead-table">
            <thead><tr><th>Business</th><th>Site</th><th>Audits</th><th>Latest score</th><th>Last audited</th></tr></thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.url}>
                  <td>{s.business || "—"}</td>
                  <td className="weight-tag" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{s.url}</td>
                  <td>{s.count}</td>
                  <td><span className="score-chip" style={{ background: scoreColor(s.latest.overall_score) }}>{s.latest.overall_score} {s.latest.letter_grade}</span></td>
                  <td className="weight-tag">{new Date(s.latest.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
