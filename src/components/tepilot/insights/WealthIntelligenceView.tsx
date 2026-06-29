import { BriefcaseBusiness, Sparkles } from "lucide-react";
import EnterpriseGrowthDemoPage from "@/pages/EnterpriseGrowthDemoPage";

export function WealthIntelligenceView() {
  return (
    <div className="flex h-full min-h-[760px] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BriefcaseBusiness className="h-4 w-4 flex-none text-slate-500" />
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight text-slate-900">Wealth Intelligence</h2>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
              Merrill growth prototype embedded in the bank operating console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          <Sparkles className="h-3 w-3" />
          Campaign, CRM, advisor routing
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <EnterpriseGrowthDemoPage embedded />
      </div>
    </div>
  );
}
