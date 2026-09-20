// backend/shared/coworker/context.mjs
//
// Customer context: the daily-refreshed view of what we know about a household.
//
// The problem this solves. The provider hands back a household's signals as a
// snapshot with no history: "expecting a child, travel-heavy spend, $40k idle."
// True today, true last month, and nothing in that shape says which. An advisor
// reading a digest row cannot tell a signal that appeared overnight from one
// that has been sitting there since spring, and those two warrant completely
// different behavior.
//
// Rather than invent timestamps in the fixtures (which would be fiction, and
// would not survive contact with a real enrichment pipeline), age is derived
// from the refresh history itself. Each daily run compares what the provider
// reports against yesterday's stored snapshot: a signal still present keeps the
// first_seen_at it already had, a signal that has appeared gets stamped with
// now, and one that has gone is retained for a grace period before it drops.
// After a week of running, every signal carries a real observed age, and that
// age is what timing.mjs consumes.
//
// The grace period matters more than it looks. Upstream enrichment is not
// stable day to day: a behavioral pattern sitting just under its threshold can
// flicker off and back on. Without the grace period a flicker would reset
// first_seen_at, and a six-month-old signal would present itself as brand new.
//
// Pure functions, no I/O. The refresh Lambda supplies the provider reads and
// the persistence; everything here is testable with plain objects.

import { lifeEventLabel, signalLabel } from './labels.mjs';

/** Snapshot schema version. Bumped when the shape changes in a way readers must notice. */
export const CONTEXT_VERSION = 1;

/**
 * How long a signal survives disappearing from the provider before it is
 * dropped from the snapshot.
 *
 * Two days, so a single bad refresh cannot erase history but a genuinely
 * resolved signal still clears within the week.
 */
export const SIGNAL_GRACE_DAYS = 2;

const DAY_MS = 86_400_000;

/**
 * Signal families, in the order they are emitted into the snapshot.
 *
 * Ordering is by how much an advisor can act on the family, not alphabetical:
 * a life event is a reason to call today, a balance is a standing fact.
 */
export const SIGNAL_KINDS = ['life_event', 'behavioral', 'risk', 'financial'];

/**
 * Confidence bands and behavioral levels normalized onto one 0-1 scale so
 * strength changes are comparable across families. The provider spells these
 * inconsistently ("high" on a life event, "HIGH" on a behavioral, "MED" on
 * some), so the lookup is case-folded and both spellings of medium are mapped.
 */
const STRENGTH_SCALE = {
  high: 1,
  med: 0.6,
  medium: 0.6,
  low: 0.3,
};

function strengthOf(raw) {
  const key = String(raw ?? '').trim().toLowerCase();
  return STRENGTH_SCALE[key] ?? 0.5;
}

/**
 * Financial fields promoted to tracked signals, with the threshold that has to
 * be cleared before the field counts as one.
 *
 * Only fields that represent an opportunity are here. monthly_surplus_usd and
 * wallet_share are inputs to the benefit calculation rather than things whose
 * appearance is itself news, so they travel in the snapshot's financial block
 * without becoming tracked signals with an age.
 *
 * The idle-cash threshold matches IDLE_CASH_TOKEN_THRESHOLD in tasks.mjs. Two
 * copies of one number is a liability, but importing tasks.mjs here would make
 * the dependency point backwards: tasks consumes context, not the reverse.
 */
const FINANCIAL_SIGNALS = [
  { field: 'idle_cash_usd', token: 'idle_cash', threshold: 25_000 },
  { field: 'home_equity_usd', token: 'home_equity', threshold: 1 },
  { field: 'student_loan_balance_usd', token: 'student_loan_balance', threshold: 1 },
];

/**
 * A stable identity for a signal across refreshes.
 *
 * Namespaced by family because the families are separate keyspaces upstream and
 * a collision would silently merge two different signals' histories.
 *
 * @param {string} kind  one of SIGNAL_KINDS
 * @param {string} type  the family-local identifier
 * @returns {string}
 */
export function signalKey(kind, type) {
  return `${kind}:${String(type ?? '').trim()}`;
}

/**
 * Flatten a provider signal bundle into a comparable list.
 *
 * The provider's shape is four differently-shaped families; everything
 * downstream wants one list of things with a key, a strength, and evidence.
 *
 * @param {object} signals  provider.getSignals() output
 * @returns {Array<{key:string,kind:string,type:string,label:string,strength:number,band:string|null,evidence:string|null}>}
 */
export function extractSignals(signals = {}) {
  const out = [];

  for (const ev of signals.life_events || []) {
    if (!ev?.type) continue;
    out.push({
      key: signalKey('life_event', ev.type),
      kind: 'life_event',
      type: ev.type,
      label: lifeEventLabel(ev.type),
      strength: strengthOf(ev.confidence_band),
      band: ev.confidence_band ?? null,
      evidence: ev.evidence ?? null,
    });
  }

  for (const b of signals.behavioral || []) {
    if (!b?.name) continue;
    out.push({
      key: signalKey('behavioral', b.name),
      kind: 'behavioral',
      // Behavioral signals are already written as display phrases upstream
      // ("Travel-heavy spend"), so the name is both the identity and the label.
      type: b.name,
      label: b.name,
      strength: strengthOf(b.level),
      band: b.level ?? null,
      evidence: b.evidence ?? null,
    });
  }

  for (const r of signals.risk || []) {
    if (!r?.type) continue;
    out.push({
      key: signalKey('risk', r.type),
      kind: 'risk',
      type: r.type,
      label: signalLabel(r.type),
      strength: strengthOf(r.band),
      band: r.band ?? null,
      evidence: r.evidence ?? null,
    });
  }

  const fin = signals.financial || {};
  for (const { field, token, threshold } of FINANCIAL_SIGNALS) {
    const value = Number(fin[field]);
    if (!Number.isFinite(value) || value < threshold) continue;
    out.push({
      key: signalKey('financial', token),
      kind: 'financial',
      type: token,
      label: signalLabel(token),
      // A balance is observed directly rather than inferred, so it is always
      // full strength. What varies is the amount, which is tracked as a value
      // change rather than a strength change.
      strength: 1,
      band: null,
      evidence: null,
      value,
    });
  }

  return out;
}

/**
 * Build today's context snapshot for one household.
 *
 * @param {object} args
 * @param {object} args.household     provider.getHousehold()
 * @param {object} args.signals       provider.getSignals()
 * @param {object|null} [args.previous]  yesterday's snapshot, or null on first run
 * @param {Date} [args.now]
 * @param {string} [args.source]      provider.source, recorded for audit
 * @returns {object} snapshot
 */
export function buildHouseholdContext({ household, signals, previous = null, now = new Date(), source = 'unknown' }) {
  if (!household?.id) throw new Error('buildHouseholdContext requires a household with an id');

  const nowIso = now.toISOString();
  const observed = extractSignals(signals);
  const priorByKey = new Map((previous?.signals || []).map((s) => [s.key, s]));
  const observedKeys = new Set(observed.map((s) => s.key));

  const tracked = observed.map((s) => {
    const prior = priorByKey.get(s.key);
    if (!prior) {
      return {
        ...s,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        // Everything is new on the very first refresh, which would make the
        // household's entire history look like it broke overnight. Only call a
        // signal new when there was a previous snapshot for it to be absent
        // from.
        status: previous ? 'new' : 'active',
        age_days: 0,
        peak_strength: s.strength,
      };
    }
    return {
      ...s,
      first_seen_at: prior.first_seen_at || nowIso,
      last_seen_at: nowIso,
      status: 'active',
      age_days: daysBetween(prior.first_seen_at || nowIso, nowIso),
      // Retaining the peak lets a signal that has softened be distinguished
      // from one that was always weak, which changes whether it is worth a
      // conversation.
      peak_strength: Math.max(Number(prior.peak_strength ?? 0), s.strength),
    };
  });

  // Signals the provider stopped reporting. Held through the grace period so a
  // one-day flicker does not reset the clock, then dropped.
  const fading = [];
  for (const [key, prior] of priorByKey) {
    if (observedKeys.has(key)) continue;
    const missingSince = prior.status === 'fading' ? prior.missing_since || nowIso : nowIso;
    if (daysBetween(missingSince, nowIso) > SIGNAL_GRACE_DAYS) continue;
    fading.push({
      ...prior,
      status: 'fading',
      missing_since: missingSince,
      age_days: daysBetween(prior.first_seen_at || nowIso, nowIso),
    });
  }

  const signalsOut = [...tracked, ...fading].sort(
    (a, b) => SIGNAL_KINDS.indexOf(a.kind) - SIGNAL_KINDS.indexOf(b.kind) || (a.key < b.key ? -1 : 1)
  );

  return {
    version: CONTEXT_VERSION,
    household_id: household.id,
    advisor_id: household.advisor_id || null,
    household_name: household.name || null,
    refreshed_at: nowIso,
    source,
    signals: signalsOut,
    signal_count: tracked.length,
    // The raw financial block travels alongside the tracked signals because the
    // benefit calculator needs the amounts, not just the fact that a balance
    // cleared a threshold.
    financial: { ...(signals?.financial || {}) },
    relationship: {
      tenure_years: household.relationship?.tenure_years ?? null,
      products_held: household.relationship?.products_held || [],
      aum_usd: household.relationship?.aum_usd ?? null,
      wallet_share: household.relationship?.wallet_share ?? null,
    },
    // Lets the refresh job skip a write, and lets the digest tell "nothing
    // changed" from "we failed to refresh".
    fingerprint: contextFingerprint(signalsOut, signals?.financial || {}),
    first_refreshed_at: previous?.first_refreshed_at || nowIso,
    refresh_count: Number(previous?.refresh_count || 0) + 1,
  };
}

/**
 * Content hash over the parts of a snapshot whose change is meaningful.
 *
 * Deliberately excludes refreshed_at and the derived age fields: those move
 * every single day, and a fingerprint that always differs cannot answer the
 * question it exists for. Financial amounts are bucketed to the nearest $1,000
 * so ordinary balance drift does not read as a change while a real move does.
 *
 * Not cryptographic. This is change detection, not integrity, and a plain
 * string join keeps the module free of node:crypto so it stays trivially
 * portable.
 *
 * @returns {string}
 */
export function contextFingerprint(signals = [], financial = {}) {
  const signalPart = signals
    .filter((s) => s.status !== 'fading')
    .map((s) => `${s.key}=${s.strength}`)
    .sort()
    .join('|');
  const financialPart = Object.entries(financial)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k}=${Math.round(v / 1000)}`)
    .sort()
    .join('|');
  return `${signalPart}#${financialPart}`;
}

/**
 * What changed between two snapshots.
 *
 * Feeds two consumers with different needs: the refresh run summary, which
 * reports how much the book moved overnight, and the digest, which uses
 * "appeared today" as a reason to promote a row.
 *
 * @param {object|null} previous
 * @param {object} next
 * @returns {{added:object[],removed:object[],strengthened:object[],weakened:object[],financial:object[],changed:boolean,first_run:boolean}}
 */
export function diffContext(previous, next) {
  const priorByKey = new Map((previous?.signals || []).filter((s) => s.status !== 'fading').map((s) => [s.key, s]));
  const nextLive = (next?.signals || []).filter((s) => s.status !== 'fading');
  const nextByKey = new Map(nextLive.map((s) => [s.key, s]));

  const added = [];
  const strengthened = [];
  const weakened = [];

  for (const s of nextLive) {
    const prior = priorByKey.get(s.key);
    if (!prior) {
      added.push({ key: s.key, kind: s.kind, label: s.label, strength: s.strength });
      continue;
    }
    if (s.strength > prior.strength) {
      strengthened.push({ key: s.key, kind: s.kind, label: s.label, from: prior.strength, to: s.strength });
    } else if (s.strength < prior.strength) {
      weakened.push({ key: s.key, kind: s.kind, label: s.label, from: prior.strength, to: s.strength });
    }
  }

  const removed = [];
  for (const [key, prior] of priorByKey) {
    if (nextByKey.has(key)) continue;
    removed.push({ key, kind: prior.kind, label: prior.label });
  }

  const financial = diffFinancial(previous?.financial || {}, next?.financial || {});

  return {
    added,
    removed,
    strengthened,
    weakened,
    financial,
    changed: Boolean(
      added.length || removed.length || strengthened.length || weakened.length || financial.length
    ),
    first_run: !previous,
  };
}

/**
 * Material moves in the financial block.
 *
 * Thresholded at the greater of 10% or $1,000 so the noise floor of ordinary
 * cash-flow movement does not generate a change event every morning. A
 * household whose checking balance swings a few hundred dollars a day has not
 * told us anything.
 */
function diffFinancial(before, after) {
  const out = [];
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const field of fields) {
    const a = Number(before[field]);
    const b = Number(after[field]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    const delta = b - a;
    if (delta === 0) continue;
    const floor = Math.max(1000, Math.abs(a) * 0.1);
    if (Math.abs(delta) < floor) continue;
    out.push({ field, from: a, to: b, delta, direction: delta > 0 ? 'up' : 'down' });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

/**
 * Whole-number days between two ISO timestamps, floored and never negative.
 *
 * Floored rather than rounded because a signal first seen 18 hours ago is in
 * its first day, not its second, and reporting "1 day old" for something
 * observed this morning overstates what we know.
 */
export function daysBetween(fromIso, toIso) {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / DAY_MS));
}

/**
 * Re-derive ages against a read time.
 *
 * A snapshot is written once in the morning and read by every send that day, so
 * its stored age_days is only correct at write time. Any consumer that cares
 * about age calls this first.
 *
 * @param {object} snapshot
 * @param {Date} [now]
 * @returns {object} snapshot with age_days recomputed and staleness reported
 */
export function ageContext(snapshot, now = new Date()) {
  if (!snapshot) return null;
  const nowIso = now.toISOString();
  return {
    ...snapshot,
    signals: (snapshot.signals || []).map((s) => ({
      ...s,
      age_days: daysBetween(s.first_seen_at || snapshot.refreshed_at, nowIso),
      days_since_seen: daysBetween(s.last_seen_at || snapshot.refreshed_at, nowIso),
    })),
    context_age_days: daysBetween(snapshot.refreshed_at, nowIso),
  };
}

/**
 * Whether a snapshot is too old to drive a send.
 *
 * The refresh runs daily, so anything past two days means the job has failed
 * more than once. Sending on stale context is worse than not sending: the
 * advisor gets a confident row about a signal that may no longer exist, and
 * that is the failure mode that loses their trust permanently.
 *
 * @returns {{stale:boolean, age_days:number}}
 */
export function isContextStale(snapshot, { now = new Date(), maxAgeDays = 2 } = {}) {
  if (!snapshot?.refreshed_at) return { stale: true, age_days: Infinity };
  const age = daysBetween(snapshot.refreshed_at, now.toISOString());
  return { stale: age > maxAgeDays, age_days: age };
}

/**
 * Index the tracked signals by the token tasks.mjs matches products against.
 *
 * buildAudience works in flat tokens (householdTokens), while context works in
 * namespaced keys. This is the adapter between them, so a matched token can be
 * traced back to when its signal was first observed.
 *
 * @param {object} snapshot
 * @returns {Map<string, object>} token -> signal
 */
export function signalsByToken(snapshot) {
  const out = new Map();
  for (const s of snapshot?.signals || []) {
    if (s.status === 'fading') continue;
    // Both spellings: behavioral tokens are the display name, every other
    // family's token is its type. They happen to coincide, but stating it
    // keeps the mapping obvious at the call site.
    out.set(s.type, s);
  }
  return out;
}
