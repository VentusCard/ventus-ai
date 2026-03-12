import type { DemoCustomer } from "@/lib/demoData";
import { AlertTriangle, Clock, Calendar } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
}

export default function DemoLifeEventsView({ customerA, customerB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomerLifeEvents customer={customerA} color="#3b82f6" />
      <CustomerLifeEvents customer={customerB} color="#10b981" />
    </div>
  );
}

function CustomerLifeEvents({ customer, color }: { customer: DemoCustomer; color: string }) {
  const urgencyConfig = {
    Urgent: { icon: AlertTriangle, bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", text: "#ef4444" },
    Soon: { icon: Clock, bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", text: "#f59e0b" },
    Upcoming: { icon: Calendar, bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", text: "#3b82f6" },
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color }}>Detected Life Events</p>

      {customer.lifeEvents.map((event) => {
        const config = urgencyConfig[event.urgency];
        const Icon = config.icon;

        return (
          <div
            key={event.name}
            className="rounded-lg border border-slate-200 overflow-hidden bg-white"
          >
            <div className="px-4 py-3 flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: config.bg, border: `1px solid ${config.border}` }}
              >
                <Icon className="w-4 h-4" style={{ color: config.text }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{event.name}</p>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}
                  >
                    {event.urgency}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Target: {event.timing}</p>
              </div>
            </div>

            <div className="px-4 pb-3 space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-400">Confidence</span>
                  <span className="font-semibold text-slate-900">{event.confidence}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${event.confidence}%`, background: event.color }}
                  />
                </div>
              </div>

              <div className="rounded p-2.5" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Evidence</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">{event.evidence}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
