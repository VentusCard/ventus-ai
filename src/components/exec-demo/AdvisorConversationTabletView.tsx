import { useMemo } from "react";
import { X, Sparkles } from "lucide-react";
import { AdvisorConversationThread } from "@/components/tepilot/advisor-console/AdvisorConversationThread";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";

interface Props {
  onClose?: () => void;
}

export default function AdvisorConversationTabletView({ onClose }: Props) {
  const clients = useMemo(() => generateDashboardClients(60), []);

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      {/* Header */}
      <div className="shrink-0 px-3 py-2 border-b border-purple-200 bg-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-purple-700">
            AI Coworker ↔ Advisor
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close conversation"
            className="w-6 h-6 rounded-full hover:bg-purple-100 flex items-center justify-center text-purple-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Thread (nav + scrollable email) */}
      <div className="flex-1 min-h-0">
        <AdvisorConversationThread clients={clients} density="compact" />
      </div>
    </div>
  );
}
