import { getAudits } from "../../lib/db.js";

export const metadata = { title: "Reports — GeoTrackerPro" };
export const dynamic = "force-dynamic";

function scoreColor(s) {
  if (s >= 75) return "#138C82";
  if (s >= 60) return "#C2902F";
  return "#C2533B";
}

export default async function Reports() {
  const { ok, audits, reason } = await getAudits(200);

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <h1 style={{ fontSize: 34 }}>Reports</h1>
        <p className="sub" style={{ margin: 0 }}>Every audit you&apos;ve run, newest first.</p>
      </div>

      {!ok ? (
        <div className="card"><p className="exec">Couldn&apos;t load data ({reason}). Connect Supabase in Vercel.</p></div>
      ) : audits.length === 0 ? (
        <div className="card"><p className="exec">No reports yet. Each completed audit is saved here.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="lead-table">
            <thead><tr><th>Date</th><th>Business</th><th>Site</th><th>Score</th><th>Summary</th></tr></thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id}>
                  <td className="weight-tag">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>{a.business_name || "—"}</td>
                  <td className="weight-tag" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{a.url}</td>
                  <td><span className="score-chip" style={{ background: scoreColor(a.overall_score) }}>{a.overall_score} {a.letter_grade}</span></td>
                  <td className="factor-find" style={{ maxWidth: 360 }}>{(a.audit_json?.executive_summary || "").slice(0, 160)}{(a.audit_json?.executive_summary || "").length > 160 ? "…" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
