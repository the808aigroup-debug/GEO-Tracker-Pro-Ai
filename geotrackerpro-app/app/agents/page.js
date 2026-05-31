import { AGENTS, TIERS, byTier } from "../../lib/agents.js";

export const metadata = { title: "Agent Control Panel — GeoTrackerPro" };

const STATUS = {
  live: { dot: "var(--status-live)", label: "Live" },
  built: { dot: "var(--status-built)", label: "Built" },
  roadmap: { dot: "var(--status-roadmap)", label: "Roadmap" },
};

export default function ControlPanel() {
  const total = AGENTS.length;
  const live = AGENTS.filter((a) => a.status === "live").length;
  const built = AGENTS.filter((a) => a.status === "built").length;

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8 }}>
        <span className="badge">808 AI Group · Internal</span>
        <h1 style={{ fontSize: 40 }}>Agent Control Panel</h1>
        <p className="sub">Every agent in the platform, by tier and status. Live agents are runnable now.</p>
      </div>

      <div className="panel-summary">
        <div className="stat"><span className="stat-num">{total}</span><span className="stat-lab">Total agents</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--status-live)" }}>{live}</span><span className="stat-lab">Live</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--status-built)" }}>{built}</span><span className="stat-lab">Built</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--status-roadmap)" }}>{total - live - built}</span><span className="stat-lab">Roadmap</span></div>
        <a className="cta panel-run" href="/tools">Run the live tools →</a>
      </div>

      {TIERS.map((t) => {
        const agents = byTier(t.key);
        return (
          <section className={`tier-section tier-${t.key}`} key={t.key}>
            <div className="tier-head">
              <span className="tier-label">{t.label}</span>
              <span className="tier-count">{agents.length} agents</span>
            </div>
            <div className="agent-grid">
              {agents.map((a) => {
                const s = STATUS[a.status] || STATUS.roadmap;
                const chip = (
                  <div className={`agent-chip ${a.status === "live" ? "is-live" : ""}`}>
                    <div className="chip-top">
                      <span className="chip-num">{a.id}</span>
                      <span className="status-dot" style={{ background: s.dot }} title={s.label} />
                    </div>
                    <span className="chip-name">{a.name}</span>
                    <span className="chip-status">{s.label}</span>
                  </div>
                );
                return a.status === "live" ? (
                  <a key={a.id} href="/tools" className="chip-link">{chip}</a>
                ) : (
                  <div key={a.id}>{chip}</div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
