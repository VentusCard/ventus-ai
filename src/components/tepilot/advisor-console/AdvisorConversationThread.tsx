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
  LIFE_EVENT_CONFIG,
} from "@/types/dashboardClient";

interface Props {
  clients: DashboardClient[];
  /** "full" = current /bankdemo WM Coworker layout. "compact" = fits ~500px tablet column. */
  density?: "full" | "compact";
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
  retirement: "Rollover IRA + Merrill Guided Investing with Advisor; review Preferred Rewards tier",
  education: "529 College Savings Plan top-up; Custodial UGMA/UTMA for flexible funds",
  home_purchase: "Jumbo Mortgage or Affordable Loan Solution pre-qual; HELOC on current home for bridge",
  wealth_transfer: "Trust Services + Estate Planning Services; Philanthropic Solutions for legacy gifts",
  business_liquidity: "Fixed-Term CD ladder + Advantage Savings for parking; Merrill Lynch Wealth Management for deployment",
  family_formation: "529 College Savings Plan open; Advantage Relationship Banking bundle",
  elder_care: "Trust Services checkpoint + Specialty Asset Management; Preferred Rewards tier review",
};
function offerFor(eventType: string): string {
  return EVENT_OFFER[eventType] ?? "Preferred Rewards tier review + Merrill Guided Investing with Advisor intro";
}

const EVIDENCE: Record<string, { transactions: string[]; household: string }> = {
  retirement: {
    transactions: [
      "Recurring pickleball club dues",
      "Viking / Princess cruise deposits",
      "National-park lodge bookings",
      "Medigap premium debits started",
      "Two large IRA-adjacent transfers in",
    ],
    household: "30-yr tenure, mortgage nearly paid, spouse on joint account.",
  },
  wealth_transfer: {
    transactions: [
      "Recurring debit to an estate-planning law firm",
      "Residential real-estate appraisal fee",
      "Safe-deposit-box annual renewal",
      "Wire out to a title company",
      "Charitable-gift-fund contribution",
    ],
    household: "Three adult children on statements, primary POA not yet on file.",
  },
  business_liquidity: {
    transactions: [
      "Retainer to a business-brokerage firm",
      "Monthly CPA advisory debit",
      "Escrow-adjacent inflow last week",
      "Recurring commercial-insurance premium",
      "Charter-flight charge",
    ],
    household: "Business owner, spouse on business payroll.",
  },
  home_purchase: {
    transactions: [
      "Home-inspection service charge",
      "Two moving-quote deposits",
      "Zillow Premier subscription",
      "Storage-unit rental started",
      "Earnest-money-adjacent debit",
    ],
    household: "Renter locally, one child entering school next fall.",
  },
  education: {
    transactions: [
      "SAT/ACT prep provider",
      "Admissions-consultant retainer",
      "College-tour airfare to Boston and Providence same weekend",
      "Campus-bookstore charge",
      "Common App fee",
    ],
    household: "High-school junior at home, dual-income.",
  },
  family_formation: {
    transactions: [
      "Obstetrics copays every 4 weeks",
      "Nursery-furniture retailer",
      "Prenatal-class provider",
      "Maternity-apparel spend",
      "Baby-registry retailer activity",
    ],
    household: "Married, no dependents yet on file.",
  },
  elder_care: {
    transactions: [
      "In-home-care agency debit",
      "Geriatric-care-manager retainer",
      "Medical-equipment supplier",
      "Memory-care assessment center",
      "Pharmacy spend up sharply",
    ],
    household: "Parent recently widowed, POA not yet on file.",
  },
};
function evidenceFor(eventType: string): { transactions: string[]; household: string } {
  return EVIDENCE[eventType] ?? {
    transactions: [
      "Broad shift in category mix over the last 60 days",
      "New recurring debits started",
      "Balance drift across accounts",
    ],
    household: "Standard profile on file.",
  };
}

const SECTIONS: {
  key: "high" | "opportunity" | "risk";
  title: string;
  accent: string;
  dot: string;
  pill: string;
}[] = [
  { key: "high", title: "Act now", accent: "border-l-amber-500", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border border-amber-200" },
  { key: "opportunity", title: "Opportunities", accent: "border-l-emerald-500", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  { key: "risk", title: "At risk", accent: "border-l-rose-500", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-800 border border-rose-200" },
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

type TravelCardRow = { name: string; recentTrip: string; tripWindow: string; estSavings: number; timing: string };
type DigestRow = { name: string; eventLabel: string; sectionLabel: string };

interface MessageDef {
  sender: Sender;
  time: string;
  navLabel: string;
  subjectPrefix: "" | "Re: ";
  quoted?: string;
  render?: (ctx: {
    nameA: string;
    nameB: string;
    labelA: string;
    labelB: string;
    eventTypeA: string;
    eventTypeB: string;
    travelCardCohort: TravelCardRow[];
    digestRows: DigestRow[];
  }) => React.ReactNode;
}

const TRAVEL_CARD_ROTATION: Array<Omit<TravelCardRow, "name">> = [
  { recentTrip: "Italy", tripWindow: "Mar 2026", estSavings: 320, timing: "Reach out this week" },
  { recentTrip: "Spain", tripWindow: "Feb 2026", estSavings: 280, timing: "Reach out this week" },
  { recentTrip: "Hawaii", tripWindow: "Apr 2026", estSavings: 260, timing: "Reach out this week" },
  { recentTrip: "Canada", tripWindow: "Jan 2026", estSavings: 175, timing: "Next 2 weeks" },
  { recentTrip: "Portugal", tripWindow: "Mar 2026", estSavings: 240, timing: "Next 2 weeks" },
  { recentTrip: "Japan", tripWindow: "Feb 2026", estSavings: 340, timing: "Reach out this week" },
  { recentTrip: "Iceland", tripWindow: "Dec 2025", estSavings: 195, timing: "Next 2 weeks" },
  { recentTrip: "Mexico", tripWindow: "Apr 2026", estSavings: 155, timing: "Next 2 weeks" },
];

export const REPLY_MESSAGES: MessageDef[] = [
  {
    sender: "advisor",
    time: "9:22 AM",
    navLabel: "9:22",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:14 AM — Daily digest: signals to action across your book…`,
    render: ({ nameA, nameB, labelA, labelB }) => (
      <>
        <p>Share with me me the supporting evidence these clients.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            On <span className="font-medium text-slate-900">{nameA}</span> ({labelA.toLowerCase()}) — which transactions triggered this, and what do we know about the household?
          </li>
          <li>
            On <span className="font-medium text-slate-900">{nameB}</span> ({labelB.toLowerCase()}) — same thing: the transactions we're seeing, and what's on file for the household.
          </li>
        </ul>
      </>
    ),
  },
  {
    sender: "ventus",
    time: "9:23 AM",
    navLabel: "9:23",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 9:22 AM — Give me the supporting evidence on both.`,
    render: ({ nameA, nameB, labelA, labelB, eventTypeA, eventTypeB }) => {
      const evA = evidenceFor(eventTypeA);
      const evB = evidenceFor(eventTypeB);
      return (
        <>
          <p>Hi Morgan,</p>
          <p>Here's what we're actually seeing on the ledger:</p>
          <div>
            <p className="font-medium text-slate-900">{nameA} <span className="text-slate-500 font-normal">· {labelA}</span></p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">Transactions (last 90 days)</p>
            <ul className="list-disc pl-5 space-y-1 mt-0.5">
              {evA.transactions.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1.5">Household</p>
            <p className="mt-0.5">{evA.household}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">{nameB} <span className="text-slate-500 font-normal">· {labelB}</span></p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">Transactions (last 90 days)</p>
            <ul className="list-disc pl-5 space-y-1 mt-0.5">
              {evB.transactions.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1.5">Household</p>
            <p className="mt-0.5">{evB.household}</p>
          </div>
          <p>Want the fuller household picture for each — who's involved, what's changing around them?</p>
        </>
      );
    },
  },
  {
    sender: "advisor",
    time: "9:44 AM",
    navLabel: "9:44",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:23 AM — Want the fuller household picture for each…`,
    render: () => (
      <p>
        Different topic. We are pushing the new premium travel card next month and corporate has asked us to seed it from the book. Pull me a working list of clients who are ideal candidates.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "9:45 AM",
    navLabel: "9:45",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 9:44 AM — Pull me a working list of clients who'd genuinely benefit from the new premium travel card…`,
    render: ({ travelCardCohort }) => (
      <>
        <p>Hi Morgan,</p>
        <p>I see the new Premium Travel Card has these features:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>60,000 bonus points on sign-up</li>
          <li>2x points on travel & dining, 1.5x on everything else</li>
          <li>Up to $200/yr in Airline Incidental + TSA PreCheck / Global Entry statement credits</li>
        </ul>
        <p>8 candidates with recent trips where the card would have paid off:</p>
        <div className="border border-slate-200 rounded-md divide-y divide-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-2.5 py-1.5 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <div>Client</div>
            <div className="text-right">Trip</div>
            <div className="text-right">Window</div>
            <div className="text-right">Saved</div>
          </div>
          {travelCardCohort.map((row) => (
            <div key={row.name} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-2.5 py-1.5 items-center text-[12px]">
              <div className="font-medium text-slate-900 truncate">{row.name}</div>
              <div className="text-right text-slate-700">{row.recentTrip}</div>
              <div className="text-right text-slate-700 tabular-nums">{row.tripWindow}</div>
              <div className="text-right text-slate-700 tabular-nums">${row.estSavings}</div>
            </div>
          ))}
        </div>
        <p>Savings estimate assumes 2x travel/dining on the trip spend plus the $200 travel credits. Want me to log this as a campaign audience?</p>
      </>
    ),
  },
  {
    sender: "advisor",
    time: "10:07 AM",
    navLabel: "10:07",
    subjectPrefix: "Re: ",
    quoted: `Ventus AI, 9:45 AM — 8 candidates with recent trips where the card would have paid off…`,
    render: () => (
      <p>
        Before I sign off, summarize today's to-do list from both tasks — the full digest and the travel card candidates. Keep it tight, no detail.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "10:08 AM",
    navLabel: "10:08",
    subjectPrefix: "Re: ",
    quoted: `Morgan, 10:07 AM — Summarize today's to-do list from both tasks…`,
    render: ({ travelCardCohort, digestRows }) => (
      <>
        <p>Hi Morgan,</p>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Task 1 — Digest signals ({digestRows.length})</p>
          <ul className="list-disc pl-5 space-y-0.5 mt-1">
            {digestRows.map((r) => (
              <li key={`d-${r.name}`}>
                <span className="font-medium text-slate-900">{r.name}</span>
                <span className="text-slate-600"> — {r.eventLabel} · {r.sectionLabel}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Task 2 — Premium travel card candidates ({travelCardCohort.length})</p>
          <ul className="list-disc pl-5 space-y-0.5 mt-1">
            {travelCardCohort.map((r) => (
              <li key={`a-${r.name}`}>
                <span className="font-medium text-slate-900">{r.name}</span>
                <span className="text-slate-600"> — {r.recentTrip} · est. ${r.estSavings} saved</span>
              </li>
            ))}
          </ul>
        </div>
        <p>All logged.</p>
      </>
    ),
  },
];

export function AdvisorConversationThread({ clients, density = "full" }: Props) {
  const compact = density === "compact";

  const grouped = useMemo(() => {
    const out: Record<"high" | "opportunity" | "risk", SignalRow[]> = { high: [], opportunity: [], risk: [] };
    const seenClients = new Set<string>();
    const perClient: SignalRow[] = [];
    for (const client of clients) {
      if (!client.detectedEvents?.length) continue;
      const top = [...client.detectedEvents].sort((a, b) => {
        if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore;
        return (b.confidence ?? 0) - (a.confidence ?? 0);
      })[0];
      perClient.push({ client, event: top });
    }
    perClient.sort((a, b) => b.event.urgencyScore - a.event.urgencyScore);
    for (const row of perClient) {
      if (seenClients.has(row.client.id)) continue;
      seenClients.add(row.client.id);
      out[bucketFor(row.event)].push(row);
    }
    return out;
  }, [clients]);

  const totalSignals = grouped.high.length + grouped.opportunity.length + grouped.risk.length;

  const topTwo = useMemo(() => {
    const pool = [...grouped.high, ...grouped.opportunity, ...grouped.risk];
    const picked: SignalRow[] = [];
    const seen = new Set<string>();
    for (const row of pool) {
      if (seen.has(row.client.id)) continue;
      seen.add(row.client.id);
      picked.push(row);
      if (picked.length === 2) break;
    }
    return picked;
  }, [grouped]);

  const nameA = topTwo[0]?.client.profile.name ?? "the first client";
  const nameB = topTwo[1]?.client.profile.name ?? "the second client";
  const labelA = topTwo[0] ? LIFE_EVENT_CONFIG[topTwo[0].event.eventType].label : "";
  const labelB = topTwo[1] ? LIFE_EVENT_CONFIG[topTwo[1].event.eventType].label : "";
  const eventTypeA = topTwo[0]?.event.eventType ?? "";
  const eventTypeB = topTwo[1]?.event.eventType ?? "";

  const excludeIds = new Set(topTwo.map((r) => r.client.id));
  const travelCardCohort: TravelCardRow[] = useMemo(() => {
    const pool = [...clients]
      .filter((c) => !excludeIds.has(c.id))
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, TRAVEL_CARD_ROTATION.length);
    return pool.map((c, i) => ({ name: c.profile.name, ...TRAVEL_CARD_ROTATION[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, topTwo]);

  const digestRows: DigestRow[] = useMemo(() => {
    const sectionLabel: Record<"high" | "opportunity" | "risk", string> = { high: "Act Now", opportunity: "Opportunity", risk: "At Risk" };
    const out: DigestRow[] = [];
    (["high", "opportunity", "risk"] as const).forEach((k) => {
      grouped[k].forEach(({ client, event }) => {
        out.push({ name: client.profile.name, eventLabel: LIFE_EVENT_CONFIG[event.eventType].label, sectionLabel: sectionLabel[k] });
      });
    });
    return out;
  }, [grouped]);

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
          body: m.render?.({ nameA, nameB, labelA, labelB, eventTypeA, eventTypeB, travelCardCohort, digestRows }),
        };
      })();

  const senderProfile = activeMsg.sender === "ventus" ? VENTUS : ADVISOR;
  const senderColor = activeMsg.sender === "ventus" ? "#0078D4" : "#475569";

  const navItems = [
    { idx: 0, label: "Digest", who: "ventus" as Sender, timeLabel: "9:14" },
    ...REPLY_MESSAGES.map((m, i) => ({
      idx: i + 1,
      label: m.sender === "ventus" ? "Ventus" : "Advisor",
      who: m.sender,
      timeLabel: m.navLabel,
    })),
  ];

  // ==================== FULL DENSITY (original layout) ====================
  if (!compact) {
    return (
      <div className="h-full overflow-y-auto bg-slate-100">
        <div className="max-w-[960px] mx-auto p-6 space-y-5">
          {/* Primary navigation */}
          <div className="sticky top-0 z-10 -mx-6 px-6 pt-4 pb-3 bg-slate-100/95 backdrop-blur border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Example Conversation thread between Advisor and Ventus AI Coworker</h2>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1">
                Message {activeIndex + 1} of {total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                aria-label="Previous message"
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
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
                        "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-all shrink-0 border",
                        active
                          ? isVentus
                            ? "bg-sky-600 border-sky-600 text-white shadow-md"
                            : "bg-slate-700 border-slate-700 text-white shadow-md"
                          : isVentus
                            ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className="font-semibold tabular-nums">{item.idx + 1}</span>
                      <span className="font-medium">{item.label}</span>
                      <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>{item.timeLabel}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(Math.min(total - 1, activeIndex + 1))}
                disabled={activeIndex === total - 1}
                aria-label="Next message"
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-sm font-medium transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email window */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            {/* Outlook ribbon */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
              {RIBBON_BUTTONS.map(({ icon: Icon, label }) => (
                <button key={label} type="button" disabled className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 rounded hover:bg-slate-100 disabled:opacity-100 cursor-default">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              {RIBBON_ICONS.map(({ icon: Icon, label }) => (
                <button key={label} type="button" disabled aria-label={label} className="p-1.5 text-slate-600 rounded hover:bg-slate-100 disabled:opacity-100 cursor-default">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Subject */}
            <div className="px-6 pt-5 pb-3 border-b border-slate-200">
              <h1 className="text-xl font-semibold text-slate-900 leading-snug">{activeMsg.subject}</h1>
            </div>

            {/* Sender block */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ backgroundColor: senderColor }}>
                  {senderProfile.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-900">
                      <span className="font-semibold">{senderProfile.name}</span>{" "}
                      <span className="text-slate-500 font-normal">&lt;{senderProfile.email}&gt;</span>
                    </div>
                    <div className="text-xs text-slate-500 shrink-0 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-slate-300" />
                      <Flag className="w-3.5 h-3.5 text-slate-300" />
                      <span>{activeMsg.time} · {DATE_STR}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    <span className="text-slate-400">To:</span>{" "}
                    <span className="text-slate-700">{activeMsg.sender === "ventus" ? "Advisor" : "Ventus AI Coworker"}</span>
                    <span className="text-slate-400 ml-3">Cc:</span>{" "}
                    <span className="text-slate-500">—</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#E5F1FB", color: "#0078D4" }}>Inbox</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: activeMsg.kind === "digest" ? "#F3E8FF" : "#E2E8F0", color: activeMsg.kind === "digest" ? "#6B21A8" : "#334155" }}>
                      {activeMsg.kind === "digest" ? "Daily Digest" : "Reply"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div key={activeIndex} className="px-6 py-5 space-y-5 transition-opacity">
              {activeMsg.kind === "digest" ? (
                <DigestBody grouped={grouped} totalSignals={totalSignals} compact={false} />
              ) : (
                <>
                  {activeMsg.quoted && (
                    <div className="border-l-2 border-slate-200 pl-3 text-xs text-slate-500 italic">{activeMsg.quoted}</div>
                  )}
                  <div className="text-sm text-slate-700 leading-relaxed space-y-3">{activeMsg.body}</div>
                </>
              )}

              {/* Signature */}
              <div className="pt-5 border-t border-slate-200 text-sm text-slate-700 space-y-1">
                <p className="text-slate-900 font-medium">— {activeMsg.sender === "ventus" ? "Ventus" : ADVISOR.name.split(" ")[0]}</p>
                <p className="text-[11px] text-slate-400 pt-1">
                  {activeMsg.sender === "ventus" ? "Sent by Ventus Coworker · ventusai.com" : `Sent from Outlook · ${ADVISOR.email}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== COMPACT DENSITY (tablet slot) ====================
  return (
    <div className="h-full flex flex-col bg-slate-100 min-h-0">
      {/* Sticky nav */}
      <div className="shrink-0 px-3 pt-2.5 pb-2 bg-slate-100/95 backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-[11px] font-bold text-slate-900 leading-tight">Advisor ↔ Ventus AI Coworker</h2>
          <span className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-0.5 tabular-nums">
            {activeIndex + 1} / {total}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous message"
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
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
                    "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] whitespace-nowrap transition-all shrink-0 border",
                    active
                      ? isVentus ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-700 border-slate-700 text-white"
                      : isVentus ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="font-semibold tabular-nums">{item.idx + 1}</span>
                  <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>{item.timeLabel}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(Math.min(total - 1, activeIndex + 1))}
            disabled={activeIndex === total - 1}
            aria-label="Next message"
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable email */}
      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll p-2.5">
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          {/* Subject */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-200">
            <h1 className="text-[13px] font-semibold text-slate-900 leading-snug">{activeMsg.subject}</h1>
          </div>

          {/* Sender block */}
          <div className="px-3 py-2.5 border-b border-slate-200">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ backgroundColor: senderColor }}>
                {senderProfile.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-slate-900 leading-tight">
                  <span className="font-semibold">{senderProfile.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">&lt;{senderProfile.email}&gt;</div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="text-[10px] text-slate-600">
                    <span className="text-slate-400">To:</span>{" "}
                    <span className="text-slate-700">{activeMsg.sender === "ventus" ? "Advisor" : "Ventus AI Coworker"}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">{activeMsg.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#E5F1FB", color: "#0078D4" }}>Inbox</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: activeMsg.kind === "digest" ? "#F3E8FF" : "#E2E8F0", color: activeMsg.kind === "digest" ? "#6B21A8" : "#334155" }}>
                    {activeMsg.kind === "digest" ? "Daily Digest" : "Reply"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div key={activeIndex} className="px-3 py-3 space-y-3">
            {activeMsg.kind === "digest" ? (
              <DigestBody grouped={grouped} totalSignals={totalSignals} compact />
            ) : (
              <>
                {activeMsg.quoted && (
                  <div className="border-l-2 border-slate-200 pl-2 text-[10px] text-slate-500 italic leading-snug">{activeMsg.quoted}</div>
                )}
                <div className="text-[12px] text-slate-700 leading-snug space-y-2">{activeMsg.body}</div>
              </>
            )}

            {/* Signature */}
            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-700 space-y-0.5">
              <p className="text-slate-900 font-medium">— {activeMsg.sender === "ventus" ? "Ventus" : ADVISOR.name.split(" ")[0]}</p>
              <p className="text-[9px] text-slate-400 pt-0.5">
                {activeMsg.sender === "ventus" ? "Sent by Ventus Coworker · ventusai.com" : `Sent from Outlook · ${ADVISOR.email}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED DIGEST BODY ====================

interface DigestBodyProps {
  grouped: Record<"high" | "opportunity" | "risk", SignalRow[]>;
  totalSignals: number;
  compact: boolean;
}

function DigestBody({ grouped, totalSignals, compact }: DigestBodyProps) {
  const textCls = compact ? "text-[12px] leading-snug" : "text-sm leading-relaxed";
  return (
    <>
      <p className={cn(textCls, "text-slate-700")}>Hi Morgan,</p>
      <p className={cn(textCls, "text-slate-700")}>
        A short list this morning – the handful worth your attention, grouped by how time-sensitive they are.
        Each row has a suggested offer and my confidence. Reply on any name to go deeper.
      </p>

      {SECTIONS.map((section) => {
        const rows = grouped[section.key];
        if (rows.length === 0) return null;
        return (
          <div key={section.key} className={cn("border-l-2", section.accent, compact ? "pl-2.5" : "pl-4")}>
            <div className={cn("flex items-center justify-between", compact ? "mb-1.5" : "mb-2.5")}>
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", section.dot)} />
                <div className={cn("font-semibold text-slate-900", compact ? "text-[12px]" : "text-sm")}>{section.title}</div>
              </div>
              <span className={cn("font-medium px-2 py-0.5 rounded-full", section.pill, compact ? "text-[10px]" : "text-xs")}>{rows.length}</span>
            </div>

            <div>
              {rows.slice(0, section.key === "risk" ? 2 : 3).map(({ client, event }, idx) => {
                const cfg = LIFE_EVENT_CONFIG[event.eventType];
                const signalCount = event.keyEvidence.length || 3;
                const windowDays = event.urgencyScore >= 5 ? 14 : event.urgencyScore === 4 ? 30 : event.urgencyScore === 3 ? 60 : 90;
                const confidencePct = (event.confidence ?? Math.min(0.95, event.urgencyScore * 0.18 + 0.1)).toFixed(1);
                const rawTiming = event.estimatedTiming?.trim() ?? "";
                const looksConcrete = /\d|week|month|day|quarter/i.test(rawTiming);
                const timingPhrase = looksConcrete
                  ? rawTiming
                  : event.urgencyScore >= 5 ? "this week"
                  : event.urgencyScore === 4 ? "next 2–3 weeks"
                  : event.urgencyScore === 3 ? "this quarter"
                  : "no rush";
                const offer = offerFor(event.eventType);
                return (
                  <div key={`${client.id}-${event.eventType}-${idx}`} className={cn("border-b border-slate-100 last:border-b-0 flex items-start gap-2.5", compact ? "py-1.5" : "py-2.5")}>
                    <div className={cn("rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center shrink-0 mt-0.5", compact ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-[11px]")}>
                      {initials(client.profile.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("font-semibold text-slate-900", compact ? "text-[12px]" : "text-sm")}>{client.profile.name}</span>
                        <span className={cn("uppercase tracking-wide text-slate-500", compact ? "text-[9px]" : "text-[11px]")}>{cfg.label}</span>
                        <span className={cn("font-medium px-1.5 py-0.5 rounded-full", section.pill, compact ? "text-[9px]" : "text-[11px]")}>{timingPhrase}</span>
                      </div>
                      <div className={cn("text-slate-700 mt-0.5", compact ? "text-[11px] leading-snug" : "text-sm leading-relaxed")}>
                        {event.keyEvidence[0] || event.eventName}.{" "}
                        <span className="text-slate-500">
                          <span className="font-semibold text-slate-900">{signalCount}</span> signals over the past{" "}
                          <span className="font-semibold text-slate-900">{windowDays}</span> days · <span className="font-semibold text-slate-900">{confidencePct}%</span> confidence.
                        </span>
                      </div>
                      <div className={cn("text-slate-700 mt-0.5", compact ? "text-[11px]" : "text-[13px]")}>
                        <span className={cn("uppercase tracking-wide text-slate-500 mr-1", compact ? "text-[9px]" : "text-[11px]")}>Recommended offer:</span>
                        {offer}
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
        <div className={cn("italic text-slate-500", compact ? "text-[11px]" : "text-sm")}>Quiet morning — no new signals.</div>
      )}

      <p className={cn(textCls, "text-slate-700")}>
        Nothing here needs an immediate call except the Act Now list. Reply on any name and I'll pull household context, prior conversations, or draft prep notes.
      </p>
    </>
  );
}
