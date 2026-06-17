import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Flag,
  Star,
  Printer,
  MoreHorizontal,
} from "lucide-react";
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

const NOW = new Date();
const TIME_STR = NOW.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const DATE_STR = NOW.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const SECTIONS: {
  key: "high" | "opportunity" | "risk";
  title: string;
  subtitle: string;
  accent: string; // left border
  dot: string;
  pill: string;
}[] = [
  {
    key: "high",
    title: "High-priority life events",
    subtitle: "Urgent triggers worth a same-day touch",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  {
    key: "opportunity",
    title: "Opportunity triggers",
    subtitle: "Wealth events and planning moments to lean into",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  {
    key: "risk",
    title: "At-risk signals",
    subtitle: "Disengagement or care-driven stressors",
    accent: "border-l-rose-500",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-800 border border-rose-200",
  },
];

const RIBBON_BUTTONS: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { icon: Reply, label: "Reply" },
  { icon: ReplyAll, label: "Reply All" },
  { icon: Forward, label: "Forward" },
];

const RIBBON_ICONS: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { icon: Trash2, label: "Delete" },
  { icon: Archive, label: "Archive" },
  { icon: Flag, label: "Flag" },
  { icon: Printer, label: "Print" },
  { icon: MoreHorizontal, label: "More" },
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
    <div className="h-full overflow-y-auto bg-slate-100">
      <div className="max-w-[960px] mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          {/* Outlook ribbon */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
            {RIBBON_BUTTONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                disabled
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 rounded hover:bg-slate-100 disabled:opacity-100 cursor-default"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-200 mx-1" />
            {RIBBON_ICONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                disabled
                aria-label={label}
                className="p-1.5 text-slate-600 rounded hover:bg-slate-100 disabled:opacity-100 cursor-default"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Subject */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900 leading-snug">
              Daily Signal Digest — {totalSignals} new triggers across your book
            </h1>
          </div>

          {/* Sender block */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ backgroundColor: "#0078D4" }}
              >
                VA
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-900">
                    <span className="font-semibold">Ventus AI Copilot</span>{" "}
                    <span className="text-slate-500 font-normal">
                      &lt;copilot@ventusai.com&gt;
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-slate-300" />
                    <Flag className="w-3.5 h-3.5 text-slate-300" />
                    <span>
                      {TIME_STR} · {DATE_STR}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">To:</span>{" "}
                  <span className="text-slate-700">You</span>
                  <span className="text-slate-400 ml-3">Cc:</span>{" "}
                  <span className="text-slate-500">—</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: "#E5F1FB", color: "#0078D4" }}
                  >
                    Inbox
                  </span>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: "#F3E8FF", color: "#6B21A8" }}
                  >
                    Daily Digest
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
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
              return (
                <div
                  key={section.key}
                  className={cn("border-l-2 pl-4", section.accent)}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full", section.dot)} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {section.title}
                        </div>
                        <div className="text-xs text-slate-500">
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

                  <div className="space-y-1.5">
                    {rows.slice(0, 6).map(({ client, event }, idx) => {
                      const cfg = LIFE_EVENT_CONFIG[event.eventType];
                      return (
                        <div
                          key={`${client.id}-${event.eventType}-${idx}`}
                          className="border-b border-slate-100 last:border-b-0 py-2 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {initials(client.profile.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-900 truncate">
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
                      <div className="text-xs text-slate-500 pt-1">
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
            <div className="pt-5 border-t border-slate-200 text-sm text-slate-700 space-y-1">
              <p>Reply to this thread to ask follow-ups, or jump into any client to prep with me.</p>
              <p className="text-slate-900 font-medium">— Ventus, your copilot</p>
              <p className="text-[11px] text-slate-400 pt-2">
                Sent by Ventus Copilot · ventusai.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
