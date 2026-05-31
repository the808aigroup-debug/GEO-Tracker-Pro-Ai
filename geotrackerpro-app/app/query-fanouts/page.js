import InsightRunner from "../components/InsightRunner.js";

export const metadata = { title: "Query Fanouts — GeoTrackerPro" };

export default function QueryFanouts() {
  return (
    <InsightRunner
      agentId={18}
      title="Query Fanouts"
      subtitle="The real questions buyers ask AI assistants in this industry — the queries you need to win."
      fields={["industry", "location"]}
      kind="query-list"
    />
  );
}
