"use client";

import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        const params = new URLSearchParams(window.location.search);
        window.location.href = params.get("from") || "/dashboard";
      } else {
        setError(data.error || "Incorrect password.");
      }
    } catch {
      setError("Something went wrong — try again.");
    }
    setLoading(false);
  }

  return (
    <div className="wrap" style={{ maxWidth: 460 }}>
      <div className="hero" style={{ paddingTop: 72 }}>
        <span className="badge">808 AI Group</span>
        <h1 style={{ fontSize: 34 }}>Sign in</h1>
        <p className="sub">Access your GeoTrackerPro dashboard.</p>
      </div>

      <div className="card">
        <form onSubmit={submit}>
          <div>
            <label>Password *</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your dashboard password"
            />
          </div>
          <button className="cta" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
          {error && <p className="err" style={{ marginTop: 6 }}>{error}</p>}
        </form>
      </div>

      <div className="card" style={{ textAlign: "center", background: "var(--sand)", border: "1px solid #E4D6BC" }}>
        <p className="exec" style={{ color: "var(--pacific)", margin: 0 }}>
          Not the owner? GeoTrackerPro is a private tool by <b>The 808 AI Group</b>.
          Want to see how your site scores with AI search? <a href="/">Run your free GEO audit →</a>
        </p>
      </div>
    </div>
  );
}
