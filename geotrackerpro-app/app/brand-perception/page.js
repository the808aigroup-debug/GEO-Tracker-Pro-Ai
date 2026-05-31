import InsightRunner from "../components/InsightRunner.js";

export const metadata = { title: "Brand Perception — GeoTrackerPro" };

export default function BrandPerception() {
  return (
    <InsightRunner
      agentId={27}
      title="Brand Perception"
      subtitle="What AI search engines currently know and think about a business — and the gaps to fix."
      fields={["businessName", "industry", "location"]}
      kind="brand-perception"
    />
  );
}
