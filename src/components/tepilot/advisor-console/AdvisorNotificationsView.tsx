import { useMemo, useState, useRef, useEffect } from "react";
import {
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
const DATE_STR = NOW.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const ADVISOR = {
  name: "Morgan Chen",
  email: "morgan.chen@bank.com",
  initials: "MC",
};

const VENTUS = {
  name: "Ventus AI Coworker",
  email: "wmcoworker@ventusai.com",
  initials: "VA",
};

const EVENT_OFFER: Record<string, string> = {
  business_liquidity: "Short-term T-bill / money-market parking + diversified deployment plan",
  wealth_transfer: "Trust review + estate & gifting strategy",
  retirement: "Retirement income plan + Medicare / Social Security timing review",
  elder_care: "Care-cost planning + POA / trust checkpoint",
  college_prep: "529 top-up + 529-to-Roth rollover eligibility check",
  home_purchase: "Bridge financing / jumbo mortgage pre-qual",
  new_child: "529 open + term life review",
};
function offerFor(eventType: string): string {
  return EVENT_OFFER[eventType] ?? "Household planning check-in";
}

const SECTIONS: {
  key: "high" | "opportunity" | "risk";
  title: string;
  accent: string;
  dot: string;
  pill: string;
}[] = [
  {
    key: "high",
    title: "Act now",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  {
    key: "opportunity",
    title: "Opportunities",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  {
    key: "risk",
    title: "At risk",
    accent: "border-l-rose-500",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-800 border border-rose-200",
  },
];

const RIBBON_BUTTONS = [
  { icon: Reply, label: "Reply" },
  { icon: ReplyAll, label: "Reply All" },
  { icon: Forward, label: "Forward" },
];

const RIBBON_ICONS = [
  { icon: Trash2, label: "Delete" },
  { icon: Archive, label: "Archive" },
  { icon: Flag, label: "Flag" },
  { icon: Printer, label: "Print" },
  { icon: MoreHorizontal, label: "More" },
];

type Sender = "ventus" | "advisor";

interface MessageDef {
  sender: Sender;
  time: string;
  navLabel: string;
  subjectPrefix: "" | "Re: ";
  quoted?: string;
  render?: (ctx: { nameA: string; nameB: string; labelA: string; labelB: string }) => React.ReactNode;
}

const REPLY_MESSAGES: MessageDef[] = [
  {
    sender: "advisor",
    time: "9:22 AM",
    navLabel: "9:22",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:14 AM — Daily digest: signals to action across your book…`,
    render: ({ nameA, nameB, labelA, labelB }) => (
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
    sender: "ventus",
    time: "9:23 AM",
    navLabel: "9:23",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 9:22 AM — Give me the story behind each, not just the headline.`,
    render: ({ nameA, nameB, labelA, labelB }) => (
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
    sender: "advisor",
    time: "9:44 AM",
    navLabel: "9:44",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:23 AM — Want the fuller household picture for each…`,
    render: () => (
      <p>
        Yes. Household composition, anything about the spouse or dependents, and whatever context would change how I frame the conversation. I don't want to walk in cold on either of them.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "9:45 AM",
    navLabel: "9:45",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 9:44 AM — I don't want to walk in cold on either of them.`,
    render: ({ nameA, nameB }) => (
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
    sender: "advisor",
    time: "10:07 AM",
    navLabel: "10:07",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:45 AM — Want a prep sheet for each…`,
    render: () => (
      <p>
        Please. Angle, 3 talking points, and a short intro paragraph per client. Log both as follow-ups so I have the prep notes when I pick these up.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "10:08 AM",
    navLabel: "10:08",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 10:07 AM — Angle, 3 talking points, and a short intro paragraph per client…`,
    render: ({ nameA, nameB }) => (
      <>
        <p>Prep sheets below — logged both as follow-ups.</p>

        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-3">
          <p className="text-sm font-semibold text-slate-900">{nameA}</p>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Angle</p>
            <p>Lead with curiosity about what's shifting for them — not a product. You're checking in because things look different, and you want to understand before offering anything.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Talking points</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acknowledge the rhythm of their household feels different lately, without naming specifics — invite them to share what's on their mind.</li>
              <li>Ask how they're thinking about the next chapter, and whether anyone else in the household is part of that thinking now.</li>
              <li>Signal you're available to help think it through — no agenda, no proposal on this call.</li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Intro paragraph</p>
            <div className="border-l-2 border-slate-300 pl-3 text-slate-700 italic">
              Hi {nameA.split(" ")[0]} — wanted to reach out and say hello, no agenda. It's been a little while and I've been thinking about the conversations we've had over the past year. If you have twenty minutes this week, I'd love to hear how things are landing on your end and where your head's at going into next quarter.
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-3">
          <p className="text-sm font-semibold text-slate-900">{nameB}</p>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Angle</p>
            <p>Warm and household-aware. Recognize the spouse is central here and frame the conversation around the family, not the portfolio.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Talking points</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Open with a gentle check-in on the household — leave room for them to share whatever they want to share.</li>
              <li>Ask how decisions are being made together right now, and whether it would help to have both of them on the next conversation.</li>
              <li>Skip anything adjacent to the prior product thread unless they raise it — hold that ground and let them lead.</li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Intro paragraph</p>
            <div className="border-l-2 border-slate-300 pl-3 text-slate-700 italic">
              Hi {nameB.split(" ")[0]} — hope you and the family are doing well. I wanted to check in and see how things are feeling on your end lately. If it's easier to have a quick call together with your spouse rather than just the two of us, happy to make that work — whatever fits your rhythm right now.
            </div>
          </div>
        </div>

        <p>Ping me if you want either sheet reshaped after the calls.</p>
      </>
    ),
  },
];


export function AdvisorNotificationsView({
  clients,
  onOpenClient: _onOpenClient,
  onPrepareWithVentus: _onPrepareWithVentus,

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

  const nameA = topTwo[0]?.client.profile.name ?? "the first client";
  const nameB = topTwo[1]?.client.profile.name ?? "the second client";
  const labelA = topTwo[0] ? LIFE_EVENT_CONFIG[topTwo[0].event.eventType].label : "";
  const labelB = topTwo[1] ? LIFE_EVENT_CONFIG[topTwo[1].event.eventType].label : "";

  const [activeIndex, setActiveIndex] = useState(0);
  const total = REPLY_MESSAGES.length + 1;

  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    pillRefs.current[activeIndex]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const activeMsg: {
    sender: Sender;
    time: string;
    subject: string;
    kind: "digest" | "reply";
    quoted?: string;
    body: React.ReactNode;
  } = activeIndex === 0
    ? {
        sender: "ventus",
        time: "9:14 AM",
        subject: `Daily digest — ${totalSignals} signals to action`,
        kind: "digest",
        body: null,
      }
    : (() => {
        const m = REPLY_MESSAGES[activeIndex - 1];
        return {
          sender: m.sender,
          time: m.time,
          subject: `Re: Daily digest — ${totalSignals} signals to action`,
          kind: "reply",
          quoted: m.quoted,
          body: m.render?.({ nameA, nameB, labelA, labelB }),
        };
      })();

  const senderProfile = activeMsg.sender === "ventus" ? VENTUS : ADVISOR;
  const senderColor = activeMsg.sender === "ventus" ? "#0078D4" : "#475569";

  const navItems = [
    { idx: 0, label: "Digest", who: "ventus" as Sender, timeLabel: "9:14" },
    ...REPLY_MESSAGES.map((m, i) => ({
      idx: i + 1,
      label: m.sender === "ventus" ? "Ventus" : "You",
      who: m.sender,
      timeLabel: m.navLabel,
    })),
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-100">
      <div className="max-w-[960px] mx-auto p-6 space-y-3">
        {/* Primary navigation */}
        <div className="sticky top-0 z-10 -mx-6 px-6 py-2 bg-slate-100/95 backdrop-blur border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous message"
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {navItems.map((item) => {
                const active = item.idx === activeIndex;
                const isVentus = item.who === "ventus";
                return (
                  <button
                    key={item.idx}
                    ref={(el) => { pillRefs.current[item.idx] = el; }}
                    type="button"
                    onClick={() => setActiveIndex(item.idx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors shrink-0",
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
                    <span className={cn(active ? "text-slate-400" : "text-slate-400")}>·</span>
                    <span>{item.label}</span>
                    <span className={cn(active ? "text-slate-300" : "text-slate-500")}>{item.timeLabel}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex(Math.min(total - 1, activeIndex + 1))}
              disabled={activeIndex === total - 1}
              aria-label="Next message"
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Email window */}
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
              {activeMsg.subject}
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">
              Message {activeIndex + 1} of {total}
            </p>
          </div>

          {/* Sender block */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ backgroundColor: senderColor }}
              >
                {senderProfile.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-900">
                    <span className="font-semibold">{senderProfile.name}</span>{" "}
                    <span className="text-slate-500 font-normal">
                      &lt;{senderProfile.email}&gt;
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-slate-300" />
                    <Flag className="w-3.5 h-3.5 text-slate-300" />
                    <span>
                      {activeMsg.time} · {DATE_STR}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">To:</span>{" "}
                  <span className="text-slate-700">
                    {activeMsg.sender === "ventus" ? "You" : "Ventus AI Copilot"}
                  </span>
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
                    style={{
                      backgroundColor: activeMsg.kind === "digest" ? "#F3E8FF" : "#E2E8F0",
                      color: activeMsg.kind === "digest" ? "#6B21A8" : "#334155",
                    }}
                  >
                    {activeMsg.kind === "digest" ? "Daily Digest" : "Reply"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div key={activeIndex} className="px-6 py-5 space-y-5 transition-opacity">
            {activeMsg.kind === "digest" ? (
              <>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Morning — <span className="font-semibold text-slate-900">{totalSignals}</span> new signals across{" "}
                  <span className="font-semibold text-slate-900">{clientsWithSignals} clients</span>.
                  Grouped by how time-sensitive they are so you can plan the day.
                  Every row has the underlying signal count, the window it covers, and my confidence —
                  reply if you want me to go deeper on any of them.
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

                      <div>
                        {rows.slice(0, 6).map(({ client, event }, idx) => {
                          const cfg = LIFE_EVENT_CONFIG[event.eventType];
                          const signalCount = event.keyEvidence.length || 3;
                          const windowDays =
                            event.urgencyScore >= 5 ? 14
                            : event.urgencyScore === 4 ? 30
                            : event.urgencyScore === 3 ? 60
                            : 90;
                          const confidencePct = Math.round(
                            (event.confidence ?? Math.min(0.95, event.urgencyScore * 0.18 + 0.1)) * 100
                          );
                          const rawTiming = event.estimatedTiming?.trim() ?? "";
                          const looksConcrete = /\d|week|month|day|quarter/i.test(rawTiming);
                          const timingPhrase = looksConcrete
                            ? rawTiming
                            : event.urgencyScore >= 5 ? "this week"
                            : event.urgencyScore === 4 ? "next 2–3 weeks"
                            : event.urgencyScore === 3 ? "this quarter"
                            : "no rush";
                          return (
                            <div
                              key={`${client.id}-${event.eventType}-${idx}`}
                              className="border-b border-slate-100 last:border-b-0 py-2.5 flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                {initials(client.profile.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {client.profile.name}
                                  </span>
                                  <span className="text-[11px] uppercase tracking-wide text-slate-500">
                                    {cfg.label}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[11px] font-medium px-2 py-0.5 rounded-full",
                                      section.pill
                                    )}
                                  >
                                    {timingPhrase}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed mt-1">
                                  {event.keyEvidence[0] || event.eventName}.{" "}
                                  <span className="text-slate-500">
                                    <span className="font-semibold text-slate-900">{signalCount}</span> signals
                                    over the past <span className="font-semibold text-slate-900">{windowDays}</span> days
                                    · <span className="font-semibold text-slate-900">{confidencePct}%</span> confidence.
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {totalSignals === 0 && (
                  <div className="text-sm text-slate-500 italic">
                    Quiet morning — no new signals.
                  </div>
                )}

                <p className="text-sm text-slate-700 leading-relaxed">
                  Nothing here needs an immediate call except the Act Now list.
                  Reply on any name and I'll pull household context, prior conversations, or draft prep notes.
                </p>
              </>
            ) : (

              <>
                {activeMsg.quoted && (
                  <div className="border-l-2 border-slate-200 pl-3 text-xs text-slate-500 italic">
                    {activeMsg.quoted}
                  </div>
                )}
                <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                  {activeMsg.body}
                </div>
              </>
            )}

            {/* Signature */}
            <div className="pt-5 border-t border-slate-200 text-sm text-slate-700 space-y-1">
              <p className="text-slate-900 font-medium">
                — {activeMsg.sender === "ventus" ? "Ventus" : ADVISOR.name.split(" ")[0]}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                {activeMsg.sender === "ventus"
                  ? "Sent by Ventus Copilot · ventusai.com"
                  : `Sent from Outlook · ${ADVISOR.email}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
