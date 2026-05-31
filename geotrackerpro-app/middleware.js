import { NextResponse } from "next/server";

// Password-protect the INTERNAL pages (dashboard, agents, tools, agent API).
// The public free audit ("/" and /api/audit) stays open — that's the lead magnet.
// Protection only activates once DASHBOARD_USER + DASHBOARD_PASS are set in Vercel,
// so you can never lock yourself out before configuring it.
export const config = {
  matcher: ["/dashboard/:path*", "/agents/:path*", "/tools/:path*", "/api/agent/:path*"],
};

export function middleware(req) {
  const user = process.env.DASHBOARD_USER;
  const pass = process.env.DASHBOARD_PASS;
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GeoTrackerPro Admin"' },
  });
}
