"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif", background: "#F7F9FA", color: "#0A1F2D", margin: 0 }}>
        <div style={{ maxWidth: 520, margin: "80px auto", padding: 28, background: "#fff", border: "1px solid #E2E8E8", borderRadius: 12, textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>Something went sideways</h1>
          <p style={{ color: "#5A6B72", lineHeight: 1.6 }}>
            The app hit an unexpected error. If you just ran an audit, your data is safely saved.
          </p>
          <button
            onClick={() => reset()}
            style={{ background: "#16B3A6", color: "#fff", border: "none", borderRadius: 8, padding: "13px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
