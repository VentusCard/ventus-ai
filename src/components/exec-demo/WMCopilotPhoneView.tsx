import { Sparkles, MessageSquare, ListChecks, Paperclip, FileText, X } from "lucide-react";
import { resolveBrief, type SelectedSignal } from "./NextConversationRationale";

interface Props {
  customerName: string;
  selectedSignal: SelectedSignal | null;
  /** Optional secondary signal label to merge into the customer header summary. */
  secondarySignalLabel?: string | null;
  onClose: () => void;
}

export default function WMCopilotPhoneView({ customerName, selectedSignal, secondarySignalLabel, onClose }: Props) {
  // Use the actual customer name (already in "User #..." format) so the advisor view matches the selected user
  const displayName = customerName || "Client";

  const fallbackSignal: SelectedSignal = selectedSignal ?? { kind: "lifeEvent", label: "College Preparation for Dependent" };
  const brief = resolveBrief(fallbackSignal);

  // Build the summary line — combine selected + secondary if both are life events / lifestyle
  const summaryParts = [fallbackSignal.label];
  if (secondarySignalLabel && secondarySignalLabel !== fallbackSignal.label) {
    summaryParts.push(secondarySignalLabel);
  }
  const summary = `${summaryParts.join(" + ")} detected`;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b border-purple-200 bg-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-purple-700">WM CoPilot</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close WM CoPilot"
          className="w-6 h-6 rounded-full hover:bg-purple-100 flex items-center justify-center text-purple-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Customer summary line */}
      <div className="shrink-0 px-3 py-2.5 border-b border-slate-100">
        <p className="text-[12.5px] font-bold text-slate-900">{displayName}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{summary}</p>
      </div>

      {/* Scrollable brief content */}
      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-3 space-y-3">
        {/* INSIGHT */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ventus AI Insight</h4>
          </div>
          <p className="text-[12px] leading-snug text-slate-700">{brief.insight}</p>
        </section>

        {/* TALKING POINTS */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Talking Points</h4>
          </div>
          <ul className="space-y-1">
            {brief.talkingPoints.map((p, i) => (
              <li key={i} className="flex gap-1.5 text-[12px] leading-snug text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-purple-400"}`} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* NEXT STEPS */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <ListChecks className="w-3 h-3 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Steps</h4>
          </div>
          <ul className="space-y-1">
            {brief.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-[12px] leading-snug text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-purple-400"}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* RECOMMENDED PRODUCTS — chips */}
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Package className="w-3 h-3 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {brief.sensitive ? "Recommended Resources" : "Recommended Products"}
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brief.products.map((p, i) => (
              <span
                key={i}
                title={p.description}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1.5 border ${
                  brief.sensitive
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-purple-50 border-purple-200 text-purple-700"
                }`}
              >
                <Package className="w-3 h-3 opacity-70" />
                {p.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
