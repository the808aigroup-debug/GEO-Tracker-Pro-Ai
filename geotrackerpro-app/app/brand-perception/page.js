import InsightRunner from "../components/InsightRunner.js";

export const metadata = { title: "Brand Perception — GeoTrackerPro" };

export default function BrandPerception() {
  return (
    <InsightRunner
      agentId={27}
      title="AI Brand Perception"
      subtitle="Generate the 8-query perception playbook + scoring sheet to see how AI engines describe this business."
      fields={["businessName", "location", "industry"]}
      kind="playbook"
    />
  );
}
