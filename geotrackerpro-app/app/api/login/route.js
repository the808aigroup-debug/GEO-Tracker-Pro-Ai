import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const pass = process.env.DASHBOARD_PASS;
  // If no password configured, the app is open — let them through.
  if (!pass) return Response.json({ ok: true });

  if ((body.password || "") === pass) {
    cookies().set("gtp_auth", pass, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "Incorrect password." }, { status: 401 });
}
