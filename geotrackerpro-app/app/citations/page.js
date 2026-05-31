import InsightRunner from "../components/InsightRunner.js";

export const metadata = { title: "AI Citations — GeoTrackerPro" };

export default function Citations() {
  return (
    <InsightRunner
      agentId={15}
      title="AI Citation Check"
      subtitle="Generate a run-it-yourself playbook to check whether AI engines cite this business — with the scoring grid."
      fields={["businessName", "industry", "location"]}
      kind="playbook"
    />
  );
}
