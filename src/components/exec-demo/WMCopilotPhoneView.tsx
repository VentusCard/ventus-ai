import { Sparkles, ListChecks, Paperclip, FileText, X } from "lucide-react";
import { resolveBrief, type SelectedSignal } from "./NextConversationRationale";

interface Props {
  customerName: string;
  selectedSignal: SelectedSignal | null;
  /** Optional secondary signal label to merge into the customer header summary. */
  secondarySignalLabel?: string | null;
  onClose: () => void;
}

export default function WMCopilotPhoneView({ customerName, selectedSignal, secondarySignalLabel, onClose }: Props) {
  // Use the actual customer name so the advisor view matches the selected user
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
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-purple-700">WM CoPilot</span>
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
        <p className="text-[13.5px] font-bold text-slate-900">{displayName}</p>
        <p className="text-[12px] text-slate-600 mt-0.5">{summary}</p>
      </div>

      {/* Scrollable brief content */}
      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll px-3 py-3 space-y-3">
        {/* INSIGHT */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ventus AI Insight</h4>
          </div>
          <p className="text-[13px] leading-snug text-slate-700">{brief.insight}</p>
        </section>

        {/* NEXT STEPS */}
        <section>
          <div className="flex items-center gap-1.5 mb-1">
            <ListChecks className="w-3 h-3 text-slate-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next Steps</h4>
          </div>
          <ul className="space-y-1">
            {brief.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-[13px] leading-snug text-slate-700">
                <span className={`shrink-0 mt-1.5 w-1 h-1 rounded-full ${brief.sensitive ? "bg-rose-400" : "bg-purple-400"}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* TASK AUTOMATED — single file packet attached */}
        {(() => {
          // Derive a stable mock first name. customer.profile.name is "User #12345"
          // style and has no real name, so pick deterministically from a pool keyed
          // on whatever digits/letters trail the displayName.
          const FIRST_NAMES = [
            "Sarah", "Michael", "Priya", "James", "Emily", "David", "Olivia",
            "Daniel", "Sophia", "Liam", "Ava", "Noah", "Mia", "Ethan", "Isabella",
          ];
          const seedSrc = (displayName || "Client").replace(/[^A-Za-z0-9]/g, "");
          let seed = 0;
          for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
          const looksLikeRealName = /^[A-Za-z]+\s+[A-Za-z]+/.test(displayName || "") && !/^User\b/i.test(displayName || "");
          const firstName = looksLikeRealName
            ? (displayName || "").split(/\s+/)[0]
            : FIRST_NAMES[seed % FIRST_NAMES.length];

          const SHORT_MAP: Record<string, string> = {
            "College Preparation for Dependent": "College_Prep",
            "Home Purchase": "Home_Purchase",
            "Wedding Planning": "Wedding",
            "New Baby": "New_Baby",
            "Retirement Planning": "Retirement",
            "Hawaiian Vacations": "Hawaii_Trip",
            "Annual Hawaiian Vacations": "Hawaii_Trip",
            "Winter Ski Trips": "Ski_Trip",
          };
          const short =
            SHORT_MAP[fallbackSignal.label] ??
            fallbackSignal.label
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join("_");
          const fileName = `${firstName}_${short}.pdf`;
          return (
            <section>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className={`w-3 h-3 ${brief.sensitive ? "text-rose-500" : "text-purple-500"}`} />
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tasks Automated</h4>
              </div>
              <p className="text-[12px] leading-snug text-slate-700 mb-2">
                I've prepped the timeline and action list — see attachment below.
              </p>
              <div
                className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 shadow-sm ${
                  brief.sensitive
                    ? "bg-rose-50 border-rose-200"
                    : "bg-amber-50/70 border-amber-200"
                }`}
              >
                <div
                  className={`shrink-0 w-8 h-9 rounded flex items-center justify-center ${
                    brief.sensitive ? "bg-rose-100 text-rose-700" : "bg-white text-amber-700 border border-amber-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11.5px] font-semibold text-slate-800 truncate leading-tight">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Timeline · {brief.nextSteps.length} action items
                  </p>
                </div>
                <Paperclip className={`w-3.5 h-3.5 shrink-0 ${brief.sensitive ? "text-rose-400" : "text-amber-500"}`} />
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
