import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  cookies().delete("gtp_auth");
  return Response.json({ ok: true });
}
