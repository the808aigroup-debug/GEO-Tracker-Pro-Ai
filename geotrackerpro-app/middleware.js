import { NextResponse } from "next/server";

// Cookie-based auth for the INTERNAL pages. Unauthenticated visitors are
// redirected to a friendly /login page (not a browser popup). API routes get
// a 401 JSON. Protection only activates once DASHBOARD_PASS is set in Vercel.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sites/:path*",
    "/citations/:path*",
    "/brand-perception/:path*",
    "/query-fanouts/:path*",
    "/recommendations/:path*",
    "/reports/:path*",
    "/agents/:path*",
    "/tools/:path*",
    "/run-audit/:path*",
    "/api/agent/:path*",
    "/api/admin-audit/:path*",
  ],
};

export function middleware(req) {
  const pass = process.env.DASHBOARD_PASS;
  if (!pass) return NextResponse.next();

  const cookie = req.cookies.get("gtp_auth")?.value;
  if (cookie && cookie === pass) return NextResponse.next();

  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized — sign in to use this." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", path);
  return NextResponse.redirect(url);
}
