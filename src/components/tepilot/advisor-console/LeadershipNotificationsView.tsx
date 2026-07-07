import { useState, useRef, useEffect } from "react";
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

const NOW = new Date();
const DATE_STR = NOW.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const LEADER = {
  name: "Priya Raman",
  email: "priya.raman@bank.com",
  initials: "PR",
  title: "Head of Wealth Management, West Region",
};

const VENTUS = {
  name: "Ventus AI Coworker",
  email: "wmcoworker@ventusai.com",
  initials: "VA",
};

interface DigestRow {
  cohort: string;
  category: string;
  timing: string;
  context: string;
  advisors: number;
  households: number;
  confidence: number;
}

const SECTIONS: {
  key: "high" | "opportunity" | "risk";
  title: string;
  accent: string;
  dot: string;
  pill: string;
  rows: DigestRow[];
}[] = [
  {
    key: "high",
    title: "Act now",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
    rows: [
      {
        cohort: "Pre-retirees, mid-book",
        category: "Product gap",
        timing: "this week",
        context: "Rising demand for structured income planning across a cohort with limited coverage from current playbooks.",
        advisors: 42,
        households: 1180,
        confidence: 92,
      },
      {
        cohort: "West region, high-net-worth",
        category: "Retention pocket",
        timing: "this week",
        context: "Cluster of households drifting toward outbound wealth transfers — pattern started forming three weeks ago.",
        advisors: 18,
        households: 240,
        confidence: 88,
      },
      {
        cohort: "Advisor books, top decile",
        category: "Capacity risk",
        timing: "this week",
        context: "A small group of advisors is absorbing most inbound signals; response times slipping on top clients.",
        advisors: 9,
        households: 520,
        confidence: 90,
      },
    ],
  },
  {
    key: "opportunity",
    title: "Opportunities",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    rows: [
      {
        cohort: "Pre-retirees, engaged",
        category: "Life-event campaign",
        timing: "next 2–3 weeks",
        context: "Behavioral signals suggest openness to a structured income conversation — projected material AUM uplift over the quarter.",
        advisors: 61,
        households: 2340,
        confidence: 84,
      },
      {
        cohort: "Business owners, liquidity event",
        category: "Cross-sell",
        timing: "this quarter",
        context: "Cluster showing early signs of a liquidity event — advisory + trust services under-attached today.",
        advisors: 27,
        households: 410,
        confidence: 79,
      },
      {
        cohort: "Next-gen inheritors",
        category: "Relationship deepening",
        timing: "this quarter",
        context: "Younger household members increasingly active on joint accounts — natural moment to open a direct relationship.",
        advisors: 54,
        households: 1620,
        confidence: 76,
      },
    ],
  },
  {
    key: "risk",
    title: "At risk",
    accent: "border-l-rose-500",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-800 border border-rose-200",
    rows: [
      {
        cohort: "Emerging affluent, tech corridor",
        category: "Wallet-share loss",
        timing: "next 2–3 weeks",
        context: "Recurring outbound transfers to a competing platform — pattern has held for six weeks and is accelerating.",
        advisors: 33,
        households: 780,
        confidence: 86,
      },
      {
        cohort: "Long-tenured retirees",
        category: "Attrition risk",
        timing: "this quarter",
        context: "Engagement quietly softening — fewer inbound touches, no complaint signal, classic slow-drift pattern.",
        advisors: 46,
        households: 610,
        confidence: 81,
      },
    ],
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

type Sender = "ventus" | "leader";

interface MessageDef {
  sender: Sender;
  time: string;
  navLabel: string;
  quoted?: string;
  render: () => React.ReactNode;
}

const REPLY_MESSAGES: MessageDef[] = [
  {
    sender: "leader",
    time: "8:41 AM",
    navLabel: "8:41",
    quoted: `Ventus AI, 8:15 AM — Weekly leadership brief: signals across the region…`,
    render: () => (
      <>
        <p>
          Good brief. Focus me on the top Act Now item — the pre-retiree product gap.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Which advisors are most exposed, and how concentrated is this in the West vs. spillover from other regions?</li>
          <li>What's actually driving the demand — is this a new behavior or something that's been building?</li>
          <li>And what would you recommend I do about it this week vs. next?</li>
        </ul>
      </>
    ),
  },
  {
    sender: "ventus",
    time: "8:42 AM",
    navLabel: "8:42",
    quoted: `Priya, 8:41 AM — Focus me on the top Act Now item — the pre-retiree product gap.`,
    render: () => (
      <>
        <p>Here's the shape of it:</p>
        <div>
          <p className="font-medium text-slate-900">Cohort</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Roughly <span className="font-semibold text-slate-900">1,180</span> households in the pre-retiree segment across <span className="font-semibold text-slate-900">42</span> advisor books.</li>
            <li>Concentration: ~70% West region, ~20% Mountain, ~10% spillover from Central. This is primarily a West phenomenon.</li>
            <li>Behavioral pattern: households are shifting spending toward planning-heavy activity (advisor searches, income tools, insurance quoting) over the last six to eight weeks.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-900">Advisor books most exposed</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><span className="font-semibold text-slate-900">Chen (West-Bay)</span> — ~180 affected households, currently no structured income playbook running.</li>
            <li><span className="font-semibold text-slate-900">Ortiz (SoCal-North)</span> — ~140 households, product gap coverage patchy.</li>
            <li><span className="font-semibold text-slate-900">Whitfield (Pacific-NW)</span> — ~110 households, book skews older pre-retiree with the strongest signal density.</li>
          </ul>
        </div>
        <p>Want me to draft a campaign brief for the cohort, and a shorter advisor-comms note to loop in those three books?</p>
      </>
    ),
  },
  {
    sender: "leader",
    time: "9:04 AM",
    navLabel: "9:04",
    quoted: `Ventus AI, 8:42 AM — Want me to draft a campaign brief and an advisor-comms note?`,
    render: () => (
      <p>
        Yes to both. And give me a read on the pre-retiree opportunity in the second section — is that the same cohort, or a different slice? I want to make sure we're not double-counting when I take this to the exec review.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "9:05 AM",
    navLabel: "9:05",
    quoted: `Priya, 9:04 AM — Yes to both. And give me a read on the pre-retiree opportunity in the second section…`,
    render: () => (
      <>
        <p>Both drafts below, plus a note on the overlap.</p>

        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Campaign brief — Pre-retiree structured income</p>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Audience</p>
            <p>West-region pre-retirees showing planning-heavy behavior over the last two months. ~1,180 households, 42 advisor books.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Message angle</p>
            <p>"Let's talk about what income looks like for you in the next chapter." Advisor-led, warm, not product-forward.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Channels & timing</p>
            <p>Advisor outreach primary, secondary follow-up via personalized email. Two-week window, staggered by book size.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Projected uplift</p>
            <p>Material AUM uplift over the quarter in the mid-range of comparable campaigns; expect a meaningful lift in booked planning conversations well before AUM shows.</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Advisor-comms note — Chen, Ortiz, Whitfield</p>
          <div className="border-l-2 border-slate-300 pl-3 text-slate-700 italic">
            Heads up — Ventus is picking up a planning-heavy behavioral shift across a large slice of your pre-retiree households. Priya has approved a two-week outreach window. You'll get a per-book prep sheet from Ventus with the affected households, the angle, and a soft intro paragraph to adapt. Reply to Ventus if you'd like the sheet reshaped or want a different sequencing.
          </div>
        </div>

        <div>
          <p className="font-medium text-slate-900">Overlap with the Opportunities row</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>The Opportunities cohort (~2,340 households) is the broader engaged pre-retiree pool across all regions — the Act Now cohort is the West-region subset showing the strongest signal density.</li>
            <li>Roughly <span className="font-semibold text-slate-900">50%</span> overlap. Treat Act Now as the tip of the spear; Opportunities is the next wave once the West playbook is proven.</li>
            <li>Safe to present both to the exec review as long as you call out the nested framing — no double-counting risk if we sequence them.</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    sender: "leader",
    time: "9:31 AM",
    navLabel: "9:31",
    quoted: `Ventus AI, 9:05 AM — Both drafts below, plus a note on the overlap.`,
    render: () => (
      <p>
        Campaign brief is approved in principle. Schedule a 20-minute working session with Chen, Ortiz, and Whitfield later this week to align on the outreach — send them the note beforehand. And log the broader pre-retiree opportunity for next week's exec review with the nested framing you outlined.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "9:32 AM",
    navLabel: "9:32",
    quoted: `Priya, 9:31 AM — Campaign brief is approved in principle…`,
    render: () => (
      <>
        <p>Done — here's what's going out:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <span className="font-medium text-slate-900">Working session</span> — 20 minutes, Thursday 2:00 PM PT with Chen, Ortiz, Whitfield. Advisor-comms note sent ahead as pre-read.
          </li>
          <li>
            <span className="font-medium text-slate-900">Per-book prep sheets</span> — queued to send Wednesday morning so each advisor walks in with their household list, the angle, and a soft intro paragraph ready.
          </li>
          <li>
            <span className="font-medium text-slate-900">Exec review item</span> — pre-retiree opportunity logged with the nested framing (Act Now West cohort + broader Opportunities wave), ready for next Tuesday's slot.
          </li>
        </ul>
        <p>
          I'll send a rollup next Monday: outreach coverage across the three books, early engagement signals, and any drift in the cohort behavior. Reply anytime if you want a mid-week pulse.
        </p>
      </>
    ),
  },

  {
    sender: "leader",
    time: "9:47 AM",
    navLabel: "9:47",
    quoted: `Ventus AI, 9:32 AM — I'll send a rollup next Monday…`,
    render: () => (
      <p>
        Different topic. I'm presenting to the board Thursday on the wallet-share loss in the tech corridor. Give me a one-slide read — size the outflow, tell me where it's actually going, and what we'd propose doing about it.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "9:48 AM",
    navLabel: "9:48",
    quoted: `Priya, 9:47 AM — Board-ready read on the tech-corridor wallet-share loss…`,
    render: () => (
      <>
        <p>Here's the board-ready read:</p>
        <div>
          <p className="font-medium text-slate-900">Size &amp; velocity</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>~<span className="font-semibold text-slate-900">780</span> households in the emerging-affluent tech corridor showing recurring outbound flow.</li>
            <li>~<span className="font-semibold text-slate-900">$1.2B</span> in cumulative outbound over the last two quarters.</li>
            <li>Run-rate accelerating <span className="font-semibold text-slate-900">~14% QoQ</span> — pattern has held for six weeks and is still steepening.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-900">Where it's going</p>
          <div className="border border-slate-200 rounded-md divide-y divide-slate-200 overflow-hidden mt-1">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-1.5 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <div>Destination type</div>
              <div className="text-right">% of flow</div>
              <div className="text-right">Trend</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 items-center">
              <div className="text-slate-900">Brokerage-first neobanks</div>
              <div className="text-right tabular-nums text-slate-700">46%</div>
              <div className="text-right text-rose-600">↑ accel.</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 items-center">
              <div className="text-slate-900">Self-directed investing platforms</div>
              <div className="text-right tabular-nums text-slate-700">31%</div>
              <div className="text-right text-rose-600">↑ steady</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 items-center">
              <div className="text-slate-900">Alt-asset &amp; crypto apps</div>
              <div className="text-right tabular-nums text-slate-700">15%</div>
              <div className="text-right text-amber-600">→ flat</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 items-center">
              <div className="text-slate-900">Other / uncategorized</div>
              <div className="text-right tabular-nums text-slate-700">8%</div>
              <div className="text-right text-slate-500">—</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Destination categories inferred from outbound transaction patterns; no named platforms in the board deck.</p>
        </div>
        <div>
          <p className="font-medium text-slate-900">Who's leaking</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Concentrated in <span className="font-semibold text-slate-900">33</span> advisor books, all West-region tech corridor.</li>
            <li><span className="font-semibold text-slate-900">~60%</span> of leaking households are under 45; avg client tenure <span className="font-semibold text-slate-900">4.2 yrs</span>.</li>
            <li>Top-decile leakers hold meaningful investable assets still on-platform — this is a wallet-share problem, not a full attrition problem yet.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-900">Proposed response</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><span className="font-medium text-slate-900">Fee-review pilot</span> for the top-decile leakers — pricing has been flagged in outbound transfer memos.</li>
            <li><span className="font-medium text-slate-900">Self-directed-lite surface</span> inside our app — close the "I want to trade without calling my advisor" gap.</li>
            <li><span className="font-medium text-slate-900">Advisor-led 1:1 outreach</span> for the top <span className="font-semibold text-slate-900">120</span> households before end of quarter — highest-conviction save list.</li>
          </ul>
        </div>
        <p>Want me to package this as a board-ready one-pager and pre-brief your Chief of Staff?</p>
      </>
    ),
  },

  {
    sender: "leader",
    time: "10:11 AM",
    navLabel: "10:11",
    quoted: `Ventus AI, 9:48 AM — Want me to package this as a board-ready one-pager…`,
    render: () => (
      <p>
        Yes, package it and loop in my CoS. Before my 1:1s, summarize today's to-do list across both tasks — the pre-retiree cohort and the board prep. Keep it tight, no detail.
      </p>
    ),
  },
  {
    sender: "ventus",
    time: "10:12 AM",
    navLabel: "10:12",
    quoted: `Priya, 10:11 AM — Summarize today's to-do list across both tasks…`,
    render: () => (
      <>
        <p>Here's today's list:</p>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Task 1 — Pre-retiree structured income</p>
          <ul className="list-disc pl-5 space-y-0.5 mt-1">
            <li><span className="font-medium text-slate-900">Working session</span> — Thu 2:00 PM PT with Chen, Ortiz, Whitfield.</li>
            <li><span className="font-medium text-slate-900">Per-book prep sheets</span> — going out Wed AM as pre-read.</li>
            <li><span className="font-medium text-slate-900">Exec review item</span> — logged with the nested Act Now + Opportunities framing.</li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Task 2 — Board deck: wallet-share outflow</p>
          <ul className="list-disc pl-5 space-y-0.5 mt-1">
            <li><span className="font-medium text-slate-900">One-pager</span> — drafted for Thursday's board slot.</li>
            <li><span className="font-medium text-slate-900">CoS pre-brief</span> — 15 min scheduled tomorrow.</li>
            <li><span className="font-medium text-slate-900">Fee-review pilot shortlist</span> — 33 advisor books compiled, ready for pricing review.</li>
            <li><span className="font-medium text-slate-900">Top-120 save list</span> — queued for advisor assignment on Monday.</li>
          </ul>
        </div>
        <p>All logged. Monday rollup will cover both.</p>
      </>
    ),
  },

];

export function LeadershipNotificationsView() {
  const totalSignals = SECTIONS.reduce((n, s) => n + s.rows.length, 0);
  const totalHouseholds = SECTIONS.reduce(
    (n, s) => n + s.rows.reduce((m, r) => m + r.households, 0),
    0
  );
  const totalAdvisors = SECTIONS.reduce(
    (n, s) => n + s.rows.reduce((m, r) => m + r.advisors, 0),
    0
  );

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
        time: "8:15 AM",
        subject: `Weekly leadership brief — ${totalSignals} signals across the region`,
        kind: "digest",
        body: null,
      }
    : (() => {
        const m = REPLY_MESSAGES[activeIndex - 1];
        return {
          sender: m.sender,
          time: m.time,
          subject: `Re: Weekly leadership brief — ${totalSignals} signals across the region`,
          kind: "reply",
          quoted: m.quoted,
          body: m.render(),
        };
      })();

  const senderProfile = activeMsg.sender === "ventus" ? VENTUS : LEADER;
  const senderColor = activeMsg.sender === "ventus" ? "#0078D4" : "#B45309";

  const navItems = [
    { idx: 0, label: "Brief", who: "ventus" as Sender, timeLabel: "8:15" },
    ...REPLY_MESSAGES.map((m, i) => ({
      idx: i + 1,
      label: m.sender === "ventus" ? "Ventus" : "Leadership",
      who: m.sender,
      timeLabel: m.navLabel,
    })),
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-100">
      <div className="max-w-[960px] mx-auto p-6 space-y-5">
        {/* Primary navigation */}
        <div className="sticky top-0 z-10 -mx-6 px-6 pt-4 pb-3 bg-slate-100/95 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Example Conversation thread between Leadership and Ventus AI Coworker</h2>
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
                    {activeMsg.sender === "ventus" ? "You" : "Ventus AI Coworker"}
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
                      backgroundColor: activeMsg.kind === "digest" ? "#FEF3C7" : "#E2E8F0",
                      color: activeMsg.kind === "digest" ? "#92400E" : "#334155",
                    }}
                  >
                    {activeMsg.kind === "digest" ? "Weekly Brief" : "Reply"}
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
                  Morning Priya — <span className="font-semibold text-slate-900">{totalSignals}</span> enterprise signals
                  this week, touching <span className="font-semibold text-slate-900">{totalHouseholds.toLocaleString()}</span> households
                  across <span className="font-semibold text-slate-900">{totalAdvisors}</span> advisor books in the region.
                  Grouped by whether they need a decision, an investment, or a defensive move. Every row shows the underlying
                  scope and confidence — reply on any of them for the cohort breakdown, the exposed advisor list, or a campaign brief.
                </p>

                {SECTIONS.map((section) => (
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
                        {section.rows.length}
                      </span>
                    </div>

                    <div>
                      {section.rows.map((row, idx) => (
                        <div
                          key={`${section.key}-${idx}`}
                          className="border-b border-slate-100 last:border-b-0 py-2.5"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">
                              {row.cohort}
                            </span>
                            <span className="text-[11px] uppercase tracking-wide text-slate-500">
                              {row.category}
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-medium px-2 py-0.5 rounded-full",
                                section.pill
                              )}
                            >
                              {row.timing}
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 leading-relaxed mt-1">
                            {row.context}{" "}
                            <span className="text-slate-500">
                              <span className="font-semibold text-slate-900">{row.advisors}</span> advisors
                              · <span className="font-semibold text-slate-900">{row.households.toLocaleString()}</span> households
                              · <span className="font-semibold text-slate-900">{row.confidence}%</span> confidence.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <p className="text-sm text-slate-700 leading-relaxed">
                  Nothing here needs an immediate decision except the Act Now list.
                  Reply on any row and I'll pull the cohort breakdown, exposed advisor books, or a campaign brief you can take to the exec review.
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
                — {activeMsg.sender === "ventus" ? "Ventus" : LEADER.name.split(" ")[0]}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                {activeMsg.sender === "ventus"
                  ? "Sent by Ventus Coworker · ventusai.com"
                  : `${LEADER.title} · ${LEADER.email}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
