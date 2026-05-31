import { runAgent } from "../../../lib/runAgent.js";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { agentId, inputs } = body || {};
  if (agentId === undefined || agentId === null) {
    return Response.json({ error: "Missing agentId." }, { status: 400 });
  }
  // businessName + industry are required for the starter tools.
  const i = inputs || {};
  if (!i.businessName || !i.industry) {
    return Response.json(
      { error: "Business name and industry are required." },
      { status: 400 }
    );
  }

  try {
    const out = await runAgent({ agentId, inputs: i });
    return Response.json(out);
  } catch (e) {
    console.error("Agent run failed:", e);
    return Response.json(
      { error: e.message || "The tool failed — please try again." },
      { status: 502 }
    );
  }
}
