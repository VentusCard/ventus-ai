import { useMemo, useState, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
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
    title: "Act now",
    subtitle: "",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  {
    key: "opportunity",
    title: "Opportunities",
    subtitle: "",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  {
    key: "risk",
    title: "At risk",
    subtitle: "",
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

  const topTwo = useMemo(() => {
    const pool = grouped.high.length >= 2 ? grouped.high : [...grouped.high, ...grouped.opportunity];
    return pool.slice(0, 2);
  }, [grouped]);

  const clientA = topTwo[0];
  const clientB = topTwo[1];
  const nameA = clientA?.client.profile.name ?? "the first client";
  const nameB = clientB?.client.profile.name ?? "the second client";
  const labelA = clientA ? LIFE_EVENT_CONFIG[clientA.event.eventType].label : "";
  const labelB = clientB ? LIFE_EVENT_CONFIG[clientB.event.eventType].label : "";


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
              Daily digest — {totalSignals} signals to action
            </h1>
          </div>

          {/* Sender block */}
          <div id="msg-0" className="px-6 py-4 border-b border-slate-200 scroll-mt-4">
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
              Morning — {totalSignals} new signals across{" "}
              <span className="font-semibold text-slate-900">
                {clientsWithSignals} clients
              </span>{" "}
              worth acting on today.
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
                      <div className="text-sm font-semibold text-slate-900">
                        {section.title}
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
                Quiet morning — no new signals.
              </div>
            )}

            {/* Conversation thread */}
            <ConversationThread
              nameA={nameA}
              nameB={nameB}
              labelA={labelA}
              labelB={labelB}
            />


            {/* Signature */}
            <div className="pt-5 border-t border-slate-200 text-sm text-slate-700 space-y-1">
              <p className="text-slate-900 font-medium">— Ventus</p>
              <p className="text-[11px] text-slate-400 pt-1">
                Sent by Ventus Copilot · ventusai.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ADVISOR = {
  name: "Morgan Chen",
  email: "morgan.chen@bank.com",
  initials: "MC",
};

interface ThreadProps {
  nameA: string;
  nameB: string;
  labelA: string;
  labelB: string;
}

function ConversationThread({ nameA, nameB, labelA, labelB }: ThreadProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const goTo = (idx: number) => {
    setActiveIndex(idx);
    if (idx === 0) {
      document.getElementById("msg-0")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      cardRefs.current[idx - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  const messages: {
    from: "ventus" | "advisor";
    time: string;
    quoted?: string;
    body: React.ReactNode;
  }[] = [
    {
      from: "advisor",
      time: "9:22 AM",
      quoted: `Ventus AI, 9:14 AM — Daily digest: signals to action across your book…`,
      body: (
        <>
          <p>
            Good list. Before I reach out — walk me through what's actually behind the top two on Act Now.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              On <span className="font-medium text-slate-900">{nameA}</span> — what actually changed for them?
              Last time we spoke it was mostly steady-state. What's the {labelA.toLowerCase()} signal picking up on?
            </li>
            <li>
              On <span className="font-medium text-slate-900">{nameB}</span> — is this the same {labelB.toLowerCase()} thread
              we flagged last quarter, or something new? And do we know if the spouse is involved in this one?
            </li>
          </ul>
          <p>Give me the story behind each, not just the headline.</p>
        </>
      ),
    },
    {
      from: "ventus",
      time: "9:38 AM",
      quoted: `Morgan, 9:22 AM — Give me the story behind each, not just the headline.`,
      body: (
        <>
          <p>Here's what's underneath each one:</p>
          <div>
            <p className="font-medium text-slate-900">{nameA}</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Household spending mix has been drifting toward a different lifestyle pattern over the past couple of months — the sort of shift we usually see when someone is quietly planning a bigger change.</li>
              <li>In similar households this pattern typically precedes a {labelA.toLowerCase()} decision within the next few conversations, not immediately.</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900">{nameB}</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Different thread from last quarter — the earlier one has quieted down. This one is a fresh {labelB.toLowerCase()} signal driven by new activity on the joint side of the household.</li>
              <li>Spouse is on the joint account and appears to be the one initiating most of the recent behavior, which will change who you're really speaking to.</li>
            </ul>
          </div>
          <p>Want the fuller household picture for each — who's involved, what's changing around them?</p>
        </>
      ),
    },
    {
      from: "advisor",
      time: "9:44 AM",
      quoted: `Ventus AI, 9:38 AM — Want the fuller household picture for each…`,
      body: (
        <p>
          Yes. Household composition, anything about the spouse or dependents, and whatever context would change how I frame the conversation. I don't want to walk in cold on either of them.
        </p>
      ),
    },
    {
      from: "ventus",
      time: "10:02 AM",
      quoted: `Morgan, 9:44 AM — I don't want to walk in cold on either of them.`,
      body: (
        <>
          <div>
            <p className="font-medium text-slate-900">{nameA}</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Two-adult household, individual primary account with a shared secondary. Decisions historically made solo, but recent activity suggests they're consulting a partner more than before.</li>
              <li>Behavioral shift reads as someone reassessing lifestyle priorities — not a distress signal, more of a rethink.</li>
              <li>Careful nuance: they've been pitched a similar concept before and passed. Lead with curiosity, not a product.</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900">{nameB}</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Married, joint primary account, one dependent. Spouse is currently the more active user on the household.</li>
              <li>The shift looks tied to a family-side change rather than a market view — worth acknowledging gently rather than analytically.</li>
              <li>Careful nuance: prior exposure to a related product that underperformed. Don't reopen that thread unless they do.</li>
            </ul>
          </div>
          <p>Want a prep sheet for each — angle, 3 talking points, and a soft intro you can paste?</p>
        </>
      ),
    },
    {
      from: "advisor",
      time: "10:07 AM",
      quoted: `Ventus AI, 10:02 AM — Want a prep sheet for each…`,
      body: (
        <p>
          Please. Angle, 3 talking points, and a short intro paragraph per client. Log both as follow-ups so I have the prep notes when I pick these up.
        </p>
      ),
    },
  ];

  const totalCount = messages.length + 1;
  const navItems = [
    { idx: 0, label: "Digest", time: "9:14", who: "ventus" as const },
    ...messages.map((m, i) => ({
      idx: i + 1,
      label: m.from === "ventus" ? "Ventus" : "You",
      time: m.time.replace(" AM", "").replace(" PM", ""),
      who: m.from,
    })),
  ];

  return (
    <div className="pt-5 border-t border-slate-200 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Conversation ({totalCount})
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous message"
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(totalCount - 1, activeIndex + 1))}
            disabled={activeIndex === totalCount - 1}
            aria-label="Next message"
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {navItems.map((item) => {
          const active = item.idx === activeIndex;
          const isVentus = item.who === "ventus";
          return (
            <button
              key={item.idx}
              type="button"
              onClick={() => goTo(item.idx)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: isVentus ? "#0078D4" : "#94a3b8" }}
              />
              <span className="font-medium">{item.idx + 1}</span>
              <span className={cn(active ? "text-slate-200" : "text-slate-500")}>·</span>
              <span>{item.label}</span>
              <span className={cn(active ? "text-slate-300" : "text-slate-500")}>
                {item.time}
              </span>
            </button>
          );
        })}
      </div>

      {messages.map((m, i) => {
        const isVentus = m.from === "ventus";
        const senderName = isVentus ? "Ventus AI Copilot" : ADVISOR.name;
        const senderEmail = isVentus ? "copilot@ventusai.com" : ADVISOR.email;
        return (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={cn(
              "border rounded-md p-4 scroll-mt-4 transition-colors",
              isVentus ? "bg-white" : "bg-slate-50",
              activeIndex === i + 1 ? "border-slate-900" : "border-slate-200"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                )}
                style={{
                  backgroundColor: isVentus ? "#0078D4" : "#475569",
                }}
              >
                {isVentus ? "VA" : ADVISOR.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-900">
                    <span className="font-semibold">{senderName}</span>{" "}
                    <span className="text-slate-500 font-normal text-xs">
                      &lt;{senderEmail}&gt;
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">
                    Today · {m.time}
                  </div>
                </div>
                {m.quoted && (
                  <div className="border-l-2 border-slate-200 pl-3 mt-2 text-xs text-slate-500 italic">
                    {m.quoted}
                  </div>
                )}
                <div className="text-sm text-slate-700 leading-relaxed mt-3 space-y-2">
                  {m.body}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


