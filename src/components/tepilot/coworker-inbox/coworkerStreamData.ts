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

/** Seed the stream with entries spread over the recent past. */
export function seedStream(count: number): StreamEntry[] {
  const now = Date.now();
  const out: StreamEntry[] = [];
  let cursor = now - 4000;
  for (let i = 0; i < count; i += 1) {
    out.push(makeStreamEntry(cursor));
    cursor -= 12000 + Math.floor(Math.random() * 90000);
  }
  return out;
}

export function relativeTime(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} hr ago`;
}
