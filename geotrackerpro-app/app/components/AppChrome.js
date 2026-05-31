"use client";

import { usePathname } from "next/navigation";

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "New Audit", href: "/" },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Sites", href: "/sites" },
      { label: "AI Citations", href: "/citations" },
      { label: "Brand Perception", href: "/brand-perception" },
      { label: "Query Fanouts", href: "/query-fanouts" },
      { label: "AI Crawler Activity", soon: true },
      { label: "Traffic", soon: true },
      { label: "Freshness", soon: true },
    ],
  },
  {
    group: "Action",
    items: [
      { label: "Recommendations", href: "/recommendations" },
      { label: "GEO Agents", href: "/agents" },
      { label: "Tools", href: "/tools" },
      { label: "Reports", href: "/reports" },
      { label: "Billing", soon: true },
    ],
  },
  {
    group: "Admin",
    items: [{ label: "Admin Console", soon: true }],
  },
];

const INTERNAL = ["/dashboard", "/sites", "/citations", "/brand-perception", "/query-fanouts", "/recommendations", "/reports", "/agents", "/tools"];

export default function AppChrome({ children }) {
  const pathname = usePathname() || "/";
  const isInternal = INTERNAL.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isInternal) return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sb-logo">808</span>
          <span className="sb-name">GEO Tracker <b>PRO</b></span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((it) =>
                it.soon ? (
                  <span className="nav-item soon" key={it.label}>
                    {it.label} <span className="soon-tag">soon</span>
                  </span>
                ) : (
                  <a
                    key={it.label}
                    href={it.href}
                    className={`nav-item ${pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href)) ? "active" : ""}`}
                  >
                    {it.label}
                  </a>
                )
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="sb-user">The 808 AI Group</div>
          <div className="sb-role">Admin</div>
        </div>
      </aside>
      <main className="sidebar-main">{children}</main>
    </div>
  );
}
