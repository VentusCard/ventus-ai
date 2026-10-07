import { ROSTER, type Person } from "./coworkerInboxData";

export type StreamKind = "advisor" | "leadership" | "signal" | "reply" | "handoff";
export type StreamDirection = "out" | "in" | "none";

export interface StreamEntry {
  id: string;
  kind: StreamKind;
  direction: StreamDirection;
  title: string;
  detail: string;
  personId?: string;
  /** epoch ms when the entry entered the stream */
  at: number;
}

interface Template {
  kind: StreamKind;
  direction: StreamDirection;
  /** {name} is replaced with the collaborator name */
  title: string;
  detail: string;
  /** restrict which roles this template applies to */
  role?: Person["role"];
}

export const STREAM_TEMPLATES: Template[] = [
  // --- Wealth manager household care ---
  { kind: "advisor", direction: "out", role: "advisor", title: "Sent life-event alert to {name}", detail: "New-baby signals · estate and beneficiary review drafted" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Prepared pre-meeting dossier for {name}", detail: "Household view, agenda, and talking points attached" },
  { kind: "handoff", direction: "out", role: "advisor", title: "Lined up trust and tax specialists for {name}", detail: "Specialist team confirmed for the family planning meeting" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Flagged assets moving away to {name}", detail: "Recurring transfers to an outside HYSA · cash conversation drafted" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Sent meeting recap and follow-ups to {name}", detail: "Action items, owners, and next touch scheduled" },
  // --- Advisor sends ---
  { kind: "advisor", direction: "out", role: "advisor", title: "Sent signal brief to {name}", detail: "3 college-prep households · 529 repositioning talking points" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Delivered outreach draft to {name}", detail: "Liquidity event · $2.4M inbound wire · call script attached" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Prepared retirement review pack for {name}", detail: "4 households entering the 60-month glidepath window" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Sent next-best-conversation list to {name}", detail: "Top 6 households ranked by receptivity and funding gap" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Flagged relationship risk to {name}", detail: "Recurring outbound transfers to an external brokerage" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Drafted follow-up email for {name}", detail: "Post-meeting recap · two product options · timing suggestion" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Refreshed household brief for {name}", detail: "New employer payroll detected · comp change likely" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Sent tax-window reminder to {name}", detail: "5 households with harvestable losses before quarter close" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Shared trust & estate prompt with {name}", detail: "New dependent detected · beneficiary review recommended" },
  { kind: "advisor", direction: "out", role: "advisor", title: "Queued mortgage-maturity brief for {name}", detail: "Renewal window opens in ~2 months · rate comparison ready" },

  // --- Leadership sends ---
  { kind: "leadership", direction: "out", role: "leadership", title: "Sent weekly wealth pulse to {name}", detail: "AUM movement, retention risk, and top three growth pockets" },
  { kind: "leadership", direction: "out", role: "leadership", title: "Drafted campaign brief for {name}", detail: "Premium travel card · projected uplift modeled by segment" },
  { kind: "leadership", direction: "out", role: "leadership", title: "Escalated region trend to {name}", detail: "Outbound transfers up week over week in the NW book" },
  { kind: "leadership", direction: "out", role: "leadership", title: "Delivered product-gap summary to {name}", detail: "Households with deposits but no investment relationship" },
  { kind: "leadership", direction: "out", role: "leadership", title: "Sent advisor-coverage readout to {name}", detail: "Books with unworked high-priority signals this week" },
  { kind: "leadership", direction: "out", role: "leadership", title: "Shared retention playbook with {name}", detail: "At-risk households grouped by exit signal and tenure" },

  // --- Replies received ---
  { kind: "reply", direction: "in", title: "Reply received from {name}", detail: "Asked which two households to prioritize this week" },
  { kind: "reply", direction: "in", title: "Reply received from {name}", detail: "Requested a deeper read on the outbound-transfer trend" },
  { kind: "reply", direction: "in", title: "Reply received from {name}", detail: "Approved the outreach draft — sending today" },
  { kind: "reply", direction: "in", title: "Reply received from {name}", detail: "Asked for the projected uplift math behind the campaign" },
  { kind: "reply", direction: "in", title: "Answered follow-up from {name}", detail: "Returned ranked next steps in under a second" },
  { kind: "reply", direction: "in", title: "Answered follow-up from {name}", detail: "Provided household history and prior recommendations" },
  { kind: "reply", direction: "in", title: "Reply received from {name}", detail: "Pushed the review out a week — rescheduled the reminder" },

  // --- Signals detected ---
  { kind: "signal", direction: "none", title: "Detected liquidity event", detail: "Inbound wire well above household baseline · advisor notified" },
  { kind: "signal", direction: "none", title: "Detected new-child signal", detail: "Care and registry spend patterns over the last 60 days" },
  { kind: "signal", direction: "none", title: "Detected relocation signal", detail: "Utility set-up plus moving services in a new metro" },
  { kind: "signal", direction: "none", title: "Detected auto-loan maturity window", detail: "Bureau tradeline nearing estimated payoff" },
  { kind: "signal", direction: "none", title: "Detected small-business formation", detail: "Merchant processing and payroll rails newly active" },
  { kind: "signal", direction: "none", title: "Detected wallet-share leakage", detail: "Recurring transfers to an external investment platform" },
  { kind: "signal", direction: "none", title: "Detected college-prep behavior", detail: "Campus travel plus recurring education transfers" },
  { kind: "signal", direction: "none", title: "Detected pre-retirement shift", detail: "Contribution pattern change and consolidation activity" },
  { kind: "signal", direction: "none", title: "Detected elevated travel intent", detail: "Multi-airline bookings clustered in one planning window" },

  // --- Hand-offs / coordination ---
  { kind: "handoff", direction: "out", title: "Routed retention brief to {name}", detail: "Hand-off from signal detection to advisor coverage" },
  { kind: "handoff", direction: "out", title: "Handed off campaign to activation", detail: "Segment pushed to the automation platform for delivery" },
  { kind: "handoff", direction: "out", title: "Coordinated cross-book hand-off for {name}", detail: "Household reassigned · context and history carried over" },
  { kind: "handoff", direction: "out", title: "Synced recommendation to CRM", detail: "Next-best action written to the relationship record" },
  { kind: "handoff", direction: "out", title: "Escalated unworked signal", detail: "No advisor action after 72 hours · leadership notified" },
  { kind: "handoff", direction: "out", title: "Scheduled follow-up sequence for {name}", detail: "Three-touch nurture queued with review checkpoints" },
];

const ADVISORS = ROSTER.filter((p) => p.role === "advisor");
const LEADERS = ROSTER.filter((p) => p.role === "leadership");

let seq = 0;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Compose a single stream entry from the template pool. */
export function makeStreamEntry(at: number = Date.now()): StreamEntry {
  const t = pick(STREAM_TEMPLATES);
  let person: Person | undefined;
  if (t.role === "advisor") person = pick(ADVISORS);
  else if (t.role === "leadership") person = pick(LEADERS);
  else if (t.title.includes("{name}")) person = pick(ROSTER);

  const name = person?.name ?? "the team";
  seq += 1;
  return {
    id: `s${seq}-${at}`,
    kind: t.kind,
    direction: t.direction,
    title: t.title.replace("{name}", name),
    detail: t.detail,
    personId: person?.id,
    at,
  };
}

const DAY_MS = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Calendar-day key used to group log rows. */
export function dayKey(at: number): number {
  return startOfDay(at);
}

/** Exact clock time for a log row, e.g. "9:12 AM". */
export function clockTime(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Day heading for a log row: Today, Yesterday, or "Mon, Oct 5". */
export function dayLabel(at: number, now: number): string {
  const d = startOfDay(at);
  const today = startOfDay(now);
  if (d === today) return "Today";
  if (d === today - DAY_MS) return "Yesterday";
  return new Date(at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

/** A moment inside working hours (08:00–18:00) of the given day, never in the future. */
function workingHoursMoment(dayStart: number, now: number): number {
  const open = dayStart + 8 * 3_600_000;
  const close = dayStart + 18 * 3_600_000;
  const at = open + Math.random() * (close - open);
  return at > now ? now - Math.floor(Math.random() * 90_000) : at;
}

/** A late-night or early-morning moment — the thin tail of the log. */
function offHoursMoment(dayStart: number, now: number): number {
  const early = dayStart + 5 * 3_600_000 + Math.random() * 2 * 3_600_000;
  const late = dayStart + 19.5 * 3_600_000 + Math.random() * 4 * 3_600_000;
  const at = Math.random() < 0.5 ? early : late;
  return at > now ? now - Math.floor(Math.random() * 90_000) : at;
}

/** Seed the log across the last three days: denser in working hours, thin overnight. */
export function seedStream(count: number = 120): StreamEntry[] {
  const now = Date.now();
  const today = startOfDay(now);
  const spread = [
    { day: today, share: 0.34 },
    { day: today - DAY_MS, share: 0.34 },
    { day: today - 2 * DAY_MS, share: 0.32 },
  ];
  const out: StreamEntry[] = [];
  for (const s of spread) {
    const n = Math.round(count * s.share);
    for (let i = 0; i < n; i += 1) {
      const at = Math.random() < 0.9 ? workingHoursMoment(s.day, now) : offHoursMoment(s.day, now);
      out.push(makeStreamEntry(at));
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

export function relativeTime(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
