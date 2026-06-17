import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardClient,
  DetectedLifeEvent,
  EventPreparationData,
  LIFE_EVENT_CONFIG,
} from "@/types/dashboardClient";

interface AdvisorNotificationsViewProps {
  clients: DashboardClient[];
  onOpenClient: (clientId: string) => void;
  onPrepareWithVentus: (data: EventPreparationData) => void;
}

interface SignalRow {
  client: DashboardClient;
  event: DetectedLifeEvent;
}

function bucketFor(event: DetectedLifeEvent): "high" | "opportunity" | "risk" {
  if (event.urgencyScore >= 4) return "high";
  if (event.eventType === "elder_care") return "risk";
  if (
    event.eventType === "business_liquidity" ||
    event.eventType === "wealth_transfer" ||
    event.eventType === "retirement"
  )
    return "opportunity";
  return "opportunity";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const SECTIONS: {
  key: "high" | "opportunity" | "risk";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  pill: string;
}[] = [
  {
    key: "high",
    title: "High-priority life events",
    subtitle: "Urgent triggers worth a same-day touch",
    icon: AlertTriangle,
    accent: "border-amber-200 bg-amber-50",
    pill: "bg-amber-100 text-amber-800",
  },
  {
    key: "opportunity",
    title: "Opportunity triggers",
    subtitle: "Wealth events and planning moments to lean into",
    icon: TrendingUp,
    accent: "border-emerald-200 bg-emerald-50",
    pill: "bg-emerald-100 text-emerald-800",
  },
  {
    key: "risk",
    title: "At-risk signals",
    subtitle: "Disengagement or care-driven stressors",
    icon: Calendar,
    accent: "border-rose-200 bg-rose-50",
    pill: "bg-rose-100 text-rose-800",
  },
];

export function AdvisorNotificationsView({
  clients,
  onOpenClient,
  onPrepareWithVentus,
}: AdvisorNotificationsViewProps) {
  const grouped = useMemo(() => {
    const out: Record<"high" | "opportunity" | "risk", SignalRow[]> = {
      high: [],
      opportunity: [],
      risk: [],
    };
    for (const client of clients) {
      for (const event of client.detectedEvents) {
        out[bucketFor(event)].push({ client, event });
      }
    }
    (Object.keys(out) as Array<keyof typeof out>).forEach((k) =>
      out[k].sort((a, b) => b.event.urgencyScore - a.event.urgencyScore)
    );
    return out;
  }, [clients]);

  const totalSignals =
    grouped.high.length + grouped.opportunity.length + grouped.risk.length;
  const clientsWithSignals = new Set(
    [...grouped.high, ...grouped.opportunity, ...grouped.risk].map(
      (r) => r.client.id
    )
  ).size;

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Email envelope */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* Email header */}
          <div className="border-b border-slate-200 px-6 py-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-900 font-medium">
                    Ventus AI Copilot{" "}
                    <span className="text-slate-400 font-normal">
                      &lt;copilot@ventus.ai&gt;
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">{TODAY}</div>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  to: you · daily digest
                </div>
                <h1 className="text-lg font-semibold text-slate-900 mt-2 leading-snug">
                  Daily Signal Digest — {totalSignals} new triggers across your
                  book
                </h1>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-slate-700 leading-relaxed">
              Good morning — overnight I reviewed transaction activity across
              your {clients.length} HNW relationships and surfaced{" "}
              <span className="font-semibold text-slate-900">
                {totalSignals} signals
              </span>{" "}
              touching{" "}
              <span className="font-semibold text-slate-900">
                {clientsWithSignals} clients
              </span>
              . Here's what I'd act on today.
            </p>

            {SECTIONS.map((section) => {
              const rows = grouped[section.key];
              if (rows.length === 0) return null;
              const Icon = section.icon;
              return (
                <div
                  key={section.key}
                  className={cn(
                    "rounded-lg border p-4",
                    section.accent
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-700" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {section.title}
                        </div>
                        <div className="text-xs text-slate-600">
                          {section.subtitle}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        section.pill
                      )}
                    >
                      {rows.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rows.slice(0, 6).map(({ client, event }, idx) => {
                      const cfg = LIFE_EVENT_CONFIG[event.eventType];
                      return (
                        <div
                          key={`${client.id}-${event.eventType}-${idx}`}
                          className="bg-white border border-slate-200 rounded-md px-3 py-2.5 flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                            {initials(client.profile.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-900 truncate">
                                {client.profile.name}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                                {cfg.label}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 truncate">
                              {event.keyEvidence[0] || event.eventName} ·{" "}
                              {event.estimatedTiming}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => onOpenClient(client.id)}
                            >
                              Open
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-slate-900 hover:bg-slate-800 text-white"
                              onClick={() =>
                                onPrepareWithVentus({
                                  client,
                                  event,
                                  transactions: [],
                                  recommendedSteps: [],
                                })
                              }
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Prepare
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {rows.length > 6 && (
                      <div className="text-xs text-slate-500 px-1 pt-1">
                        + {rows.length - 6} more in this category
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {totalSignals === 0 && (
              <div className="text-sm text-slate-500 italic">
                No new triggers picked up overnight. Your book is quiet today.
              </div>
            )}

            {/* Signature */}
            <div className="pt-4 border-t border-slate-200 text-sm text-slate-600">
              <p>Reply to this thread to ask follow-ups, or jump into any client to prep with me.</p>
              <p className="mt-3 text-slate-900 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />— Ventus, your copilot
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
