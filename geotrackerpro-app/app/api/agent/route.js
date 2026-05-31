import { runAgent } from "../../../lib/runAgent.js";
import { getAgent } from "../../../lib/agents.js";

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

  const agent = getAgent(agentId);
  if (!agent) return Response.json({ error: "Unknown agent." }, { status: 400 });

  // Validate the agent's required inputs (location is always optional).
  const i = inputs || {};
  const required = (agent.inputs || []).filter((x) => x !== "location");
  const missing = required.filter((f) => !i[f]);
  if (missing.length) {
    return Response.json(
      { error: `Missing required field(s): ${missing.join(", ")}.` },
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
