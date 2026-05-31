"use client";

export default function Error({ error, reset }) {
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <div className="card" style={{ marginTop: 80, textAlign: "center" }}>
        <h1 style={{ fontSize: 26, margin: "0 0 10px" }}>Something went sideways</h1>
        <p className="exec" style={{ marginTop: 0 }}>
          The page hit an unexpected error while rendering. Don&apos;t worry — if you just ran an audit,
          your report and contact info are <b>safely saved</b> and viewable on your dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          <button className="cta" onClick={() => reset()}>Try again</button>
          <a className="signin-link" href="/" style={{ padding: "13px 18px" }}>Back to home</a>
          <a className="signin-link" href="/dashboard" style={{ padding: "13px 18px" }}>View dashboard</a>
        </div>
        {error?.message && (
          <p className="weight-tag" style={{ marginTop: 16 }}>Detail: {String(error.message).slice(0, 200)}</p>
        )}
      </div>
    </div>
  );
}
