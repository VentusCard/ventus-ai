// backend/shared/coworker/timing.mjs
//
// When a row is worth an advisor's attention, and when it stopped being worth it.
//
// Before this module the digest had one timing concept: outreachWindow(), which
// stamped a row "Next 14 days" based on the lead signal's type. Useful as a
// label, but it did nothing. The same row carried the same 14-day window on day
// 1 and on day 90, because nothing knew how old the signal was, and the digest
// re-sent it every morning at identical rank until the advisor stopped opening
// the mail. A window that never closes is not a window.
//
// context.mjs now supplies first_seen_at per signal, so this module can do the
// part that was missing: decay a row as its signal ages, expire it when the
// window has genuinely closed, promote it on the day it appears, and refuse to
// put the same household in front of the same advisor every morning.
//
// The decay model splits on something real rather than applying one curve to
// everything:
//
//   Event signals (inheritance received, expecting a child) describe a moment.
//   The money gets deployed, the decision gets made, and after the window the
//   opportunity is not diminished, it is gone. These decay to zero and expire.
//
//   Standing signals (travel-heavy spend, idle cash) describe a condition.
//   Travel-heavy spend is as true on day 200 as on day 1, so decaying it to
//   zero would be a lie. These decay on a half-life toward a floor: still
//   surfaceable, no longer competitive with fresh news. The floor exists
//   because "the advisor has seen this and not acted" is weak evidence that it
//   does not matter, not proof.
//
// Pure functions, no I/O.

import { outreachWindow } from './labels.mjs';

/**
 * Days a signal counts as news.
 *
 * Three rather than one, because the digest is daily but advisors are not.
 * A signal that appears Friday evening should still be flagged as new in
 * Monday's mail, or the one person who took the weekend off never sees it.
 */
export const NOVELTY_WINDOW_DAYS = 3;

/**
 * Rank multiplier applied while a signal is still news.
 *
 * Large enough to lift a genuinely new signal past a stale one of similar size,
 * deliberately not large enough to lift a trivial new signal past a major
 * standing one. Novelty is a tiebreaker with weight, not an override.
 */
export const NOVELTY_MULTIPLIER = 1.5;

/** Minimum days between two digest rows for the same household, absent new signals. */
export const MIN_DAYS_BETWEEN_TOUCHES = 7;

/** Minimum days before the same household may be shown the same product again. */
export const MIN_DAYS_BETWEEN_SAME_PRODUCT = 30;

/**
 * Decay policy per signal family.
 *
 * `windowed` signals run out; `standing` signals settle onto a floor.
 * Half-lives are stated in days and chosen to be defensible out loud rather
 * than fitted to anything: 90 days for a behavioral pattern is roughly a
 * quarter, which is how often a book gets reviewed, and 60 for a balance
 * reflects that idle cash left alone for two months is usually a decision
 * rather than an oversight.
 */
const DECAY_POLICY = {
  life_event: { mode: 'windowed', halfLifeDays: 120, floor: 0.5 },
  behavioral: { mode: 'standing', halfLifeDays: 90, floor: 0.5 },
  financial: { mode: 'standing', halfLifeDays: 60, floor: 0.4 },
  // Risk signals gate rows out rather than rank them in, so they never decay:
  // an overdraft cluster from 60 days ago still disqualifies.
  risk: { mode: 'standing', halfLifeDays: Infinity, floor: 1 },
};

const DEFAULT_POLICY = { mode: 'standing', halfLifeDays: 90, floor: 0.5 };

/**
 * How much weight a signal still carries at a given age.
 *
 * `mode` is supplied by the signal's window bucket and overrides the family
 * default, because the families are not internally consistent: an inheritance
 * and a retirement horizon are both life events, but one is a moment that
 * closes and the other is a state that persists for years. Falling back to the
 * family default keeps the function usable on its own.
 *
 * @param {object} args
 * @param {string} args.kind      signal family (life_event | behavioral | financial | risk)
 * @param {number} args.ageDays   days since first observed
 * @param {number} args.windowDays  the outreach window, used by windowed signals
 * @param {string} [args.mode]    'windowed' | 'standing', from the window bucket
 * @returns {{decay:number, mode:string, expired:boolean}}
 */
export function signalDecay({ kind, ageDays, windowDays, mode }) {
  const family = DECAY_POLICY[kind] || DEFAULT_POLICY;
  const policy = { ...family, mode: mode || family.mode };
  const age = Math.max(0, Number(ageDays) || 0);

  if (policy.mode === 'windowed') {
    const window = Math.max(1, Number(windowDays) || 1);
    // Linear rather than exponential: an advisor asking why a row dropped from
    // the list deserves "the window was 14 days and it has been 15", not a
    // curve. Windowed signals are the ones most likely to be questioned,
    // because they are the ones that disappear.
    const remaining = (window - age) / window;
    return { decay: clamp01(remaining), mode: 'windowed', expired: age >= window };
  }

  if (!Number.isFinite(policy.halfLifeDays)) {
    return { decay: policy.floor, mode: 'standing', expired: false };
  }

  const halved = Math.pow(0.5, age / policy.halfLifeDays);
  // Rescale onto [floor, 1] so a brand-new standing signal is still worth 1.0
  // and an ancient one asymptotes to the floor instead of to zero.
  const decay = policy.floor + (1 - policy.floor) * halved;
  return { decay: clamp01(decay), mode: 'standing', expired: false };
}

/**
 * The full timing picture for one opportunity.
 *
 * @param {object} args
 * @param {{type:string}} args.leadSignal  the signal the row is built on
 * @param {object|null} args.signal        the tracked context signal for that lead, if we have one
 * @param {Date} [args.now]
 * @returns {{
 *   window: object, age_days: number|null, days_remaining: number|null,
 *   decay: number, novel: boolean, urgency: string, status: string,
 *   first_seen_at: string|null, basis: string
 * }}
 */
export function outreachTiming({ leadSignal, signal = null, now = new Date() }) {
  const window = outreachWindow(leadSignal?.type);

  // No tracked signal means the context refresh has not seen this one yet,
  // which happens on the first run and whenever a signal is too new to have
  // been snapshotted. Treat it as undated rather than as brand new: claiming
  // an age we do not have is exactly the overstatement this module exists to
  // stop. Full weight, no novelty boost, no expiry.
  if (!signal?.first_seen_at) {
    return {
      window,
      age_days: null,
      days_remaining: null,
      decay: 1,
      novel: false,
      urgency: urgencyFor(window.days),
      status: 'undated',
      first_seen_at: null,
      basis: window.basis,
    };
  }

  const ageDays = Number.isFinite(signal.age_days)
    ? signal.age_days
    : Math.max(0, Math.floor((now.getTime() - Date.parse(signal.first_seen_at)) / 86_400_000));

  const { decay, mode, expired } = signalDecay({
    kind: signal.kind,
    ageDays,
    windowDays: window.days,
    mode: window.mode,
  });
  const daysRemaining = mode === 'windowed' ? window.days - ageDays : null;
  const novel = ageDays <= NOVELTY_WINDOW_DAYS && signal.status === 'new';

  return {
    window,
    age_days: ageDays,
    days_remaining: daysRemaining,
    decay,
    novel,
    urgency: expired ? 'closed' : urgencyFor(daysRemaining ?? window.days),
    status: expired ? 'expired' : novel ? 'new' : mode === 'windowed' && decay < 0.35 ? 'closing' : 'open',
    first_seen_at: signal.first_seen_at,
    basis: expired
      ? `The ${window.days}-day window on this signal closed ${ageDays - window.days} days ago.`
      : window.basis,
  };
}

/**
 * Urgency band from days left.
 *
 * Bands, not a number, because "act within 4.3 days" is false precision on an
 * inferred signal and an advisor will treat the whole row as invented.
 */
function urgencyFor(daysLeft) {
  const d = Number(daysLeft);
  if (!Number.isFinite(d)) return 'no_rush';
  if (d <= 0) return 'closed';
  if (d <= 7) return 'this_week';
  if (d <= 21) return 'this_month';
  return 'no_rush';
}

/** Display phrases for the urgency bands. */
const URGENCY_LABELS = {
  this_week: 'This week',
  this_month: 'This month',
  no_rush: 'No rush',
  closed: 'Window closed',
};

/** Human phrase for an urgency band. */
export function urgencyLabel(urgency) {
  return URGENCY_LABELS[urgency] || 'No rush';
}

/**
 * Whether an advisor has been shown this household recently enough that showing
 * them again would be noise.
 *
 * The novelty exemption is the point of the whole function. A flat cadence cap
 * is easy and wrong: it would hold back the inheritance that landed this
 * morning because the same household came up last Tuesday about a travel card.
 *
 * Novelty overrides both caps, including the same-product one. An earlier
 * version held the same-product case back on the reasoning that an unchanged
 * product meant an unchanged conclusion — which sounds right and is not. The
 * product is the answer; the lead signal is the question. A household that just
 * came into $310,000 may well still be best served by the account we suggested
 * last week, and "same answer, completely different reason, and the reason is
 * urgent" is exactly the mail an advisor wants. What the cap is there to stop
 * is the same pitch for the same reason arriving twice, and `novel` is true
 * only when the lead signal itself first appeared within the last few days, so
 * it cannot fire on a re-run of yesterday's reasoning.
 *
 * @param {object} args
 * @param {string|null} args.lastTouchAt   ISO of the last time this household appeared
 * @param {string|null} [args.lastProductTouchAt]  ISO of the last time with this same product
 * @param {boolean} [args.novel]           whether the lead signal is new
 * @param {Date} [args.now]
 * @returns {{ready:boolean, reason:string|null, days_since:number|null, next_eligible_at:string|null}}
 */
export function contactCadence({
  lastTouchAt = null,
  lastProductTouchAt = null,
  novel = false,
  now = new Date(),
  minDaysBetween = MIN_DAYS_BETWEEN_TOUCHES,
  minDaysBetweenSameProduct = MIN_DAYS_BETWEEN_SAME_PRODUCT,
} = {}) {
  const nowMs = now.getTime();
  const householdDays = daysSince(lastTouchAt, nowMs);

  if (novel) {
    return {
      ready: true,
      reason: 'new_signal_override',
      days_since: householdDays,
      next_eligible_at: null,
    };
  }

  // The same pitch for the same reason must not arrive twice in a month.
  const productDays = daysSince(lastProductTouchAt, nowMs);
  if (productDays != null && productDays < minDaysBetweenSameProduct) {
    return {
      ready: false,
      reason: 'same_product_recently',
      days_since: productDays,
      next_eligible_at: addDays(lastProductTouchAt, minDaysBetweenSameProduct),
    };
  }

  if (householdDays == null || householdDays >= minDaysBetween) {
    return { ready: true, reason: null, days_since: householdDays, next_eligible_at: null };
  }
  return {
    ready: false,
    reason: 'contacted_recently',
    days_since: householdDays,
    next_eligible_at: addDays(lastTouchAt, minDaysBetween),
  };
}

/**
 * Rank weight for an opportunity, folding timing into the dollar figure.
 *
 * Returns a sort key, not a dollar amount, and must never be rendered as one.
 * The email shows the real benefit; this only decides row order.
 *
 * Deliberately does not touch the benefit qualifier tier. That tier encodes how
 * defensible a figure is, and a fresh estimate outranking a computed net would
 * put the least defensible row at the top of the mail — the exact failure the
 * tiering was built to prevent. Timing reorders within a tier.
 *
 * @param {object} args
 * @param {number} args.benefitUsd
 * @param {number} args.decay
 * @param {boolean} [args.novel]
 * @returns {number}
 */
export function priorityScore({ benefitUsd, decay, novel = false }) {
  const base = Math.max(0, Number(benefitUsd) || 0);
  const factor = clamp01(Number(decay) ?? 1) * (novel ? NOVELTY_MULTIPLIER : 1);
  return base * factor;
}

function daysSince(iso, nowMs) {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return null;
  return Math.max(0, Math.floor((nowMs - then) / 86_400_000));
}

function addDays(iso, days) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return null;
  return new Date(then + days * 86_400_000).toISOString();
}

function clamp01(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}
