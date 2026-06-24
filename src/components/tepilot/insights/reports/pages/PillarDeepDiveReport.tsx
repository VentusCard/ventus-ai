import { PillarDeepDiveHeatmap } from "../../PillarDeepDiveHeatmap";
import { ReportPageShell } from "../ReportPageShell";

export function PillarDeepDiveReport({ onBack }: { onBack: () => void }) {
  return (
    <ReportPageShell
      title="Pillar deep-dive (age × region)"
      category="Lifestyle"
      description="Heatmap of pillar penetration across age bands and US regions."
      onBack={onBack}
    >
      {() => (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <PillarDeepDiveHeatmap />
        </div>
      )}
    </ReportPageShell>
  );
}
