import { ArrowRight, Plug } from "lucide-react";
import { TEAM_DESTINATIONS, COWORKER_INTEGRATIONS } from "./coworkerInboxData";

const ACCENT: Record<string, string> = {
  indigo: "text-indigo-700 bg-indigo-50 border-indigo-200",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  rose: "text-rose-700 bg-rose-50 border-rose-200",
  violet: "text-violet-700 bg-violet-50 border-violet-200",
  sky: "text-sky-700 bg-sky-50 border-sky-200",
  teal: "text-teal-700 bg-teal-50 border-teal-200",
};

export function CoworkerIntegrationsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto h-full pb-4">
      {TEAM_DESTINATIONS.map((t) => {
        const i = COWORKER_INTEGRATIONS[t.id];
        if (!i) return null;
        return (
          <div key={t.id} data-testid="coworker-integration-card" className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${ACCENT[t.accent]}`}>
                {t.name.replace("Coworker for ", "")}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-medium">Coworker</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <Plug className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-900">{i.destination}</span>
            </div>
            <p className="text-xs text-slate-600">{i.deliverable}</p>
            <div className="flex justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
              <span>Last sync {i.lastSync}</span>
              <span><span className="font-semibold text-slate-800">{i.weeklyItems.toLocaleString()}</span> sent this week</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
