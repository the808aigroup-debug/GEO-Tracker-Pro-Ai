import { AGENTS, TIERS, byTier, bandOf, byBand } from "../../lib/agents.js";

export const metadata = { title: "Agent Control Panel — GeoTrackerPro" };

const BAND_DOT = {
  live: "var(--status-live)",
  medium: "#2C7DA0",
  heavy: "#C2533B",
  pending: "var(--status-roadmap)",
};
const BAND_LABEL = { live: "Live", medium: "Buildable", heavy: "Heavy · later", pending: "Spec pending" };

export default function ControlPanel() {
  const total = AGENTS.filter((a) => typeof a.id === "number").length;
  const live = byBand("live").length;
  const heavy = byBand("heavy").length;
  const pending = byBand("pending").length;

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 8, textAlign: "left" }}>
        <span className="badge">808 AI Group · Internal</span>
        <h1 style={{ fontSize: 40 }}>Agent Control Panel</h1>
        <p className="sub" style={{ margin: 0 }}>All 60 agents by package. Green = live. Red-tinted = heavy (needs APIs/data — do later). Grab the easy wins first.</p>
      </div>

      <div className="panel-summary">
        <div className="stat"><span className="stat-num">{total}</span><span className="stat-lab">Total agents</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--status-live)" }}>{live}</span><span className="stat-lab">Live</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "#C2533B" }}>{heavy}</span><span className="stat-lab">Heavy · later</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--status-roadmap)" }}>{pending}</span><span className="stat-lab">Spec pending</span></div>
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
                const band = bandOf(a);
                const chip = (
                  <div className={`agent-chip ${band === "live" ? "is-live" : ""} ${band === "heavy" ? "is-heavy" : ""}`}>
                    <div className="chip-top">
                      <span className="chip-num">{a.id}</span>
                      <span className="status-dot" style={{ background: BAND_DOT[band] }} title={BAND_LABEL[band]} />
                    </div>
                    <span className="chip-name">{a.name}</span>
                    {a.lite ? (
                      <span className="chip-status" style={{ color: "#C2902F" }}>Lite · full later</span>
                    ) : (
                      <span className="chip-status" style={band === "heavy" ? { color: "#C2533B" } : undefined}>{BAND_LABEL[band]}</span>
                    )}
                  </div>
                );
                return band === "live" ? (
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
