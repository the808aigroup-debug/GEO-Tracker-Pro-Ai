import InsightRunner from "../components/InsightRunner.js";

export const metadata = { title: "AI Citations — GeoTrackerPro" };

export default function Citations() {
  return (
    <InsightRunner
      agentId={15}
      title="AI Citations"
      subtitle="Does AI recommend this business? A live, simulated citation check across buying-intent queries."
      fields={["businessName", "industry", "location"]}
      kind="citation-check"
    />
  );
}
