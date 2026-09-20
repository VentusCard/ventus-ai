import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MIN_DAYS_BETWEEN_SAME_PRODUCT,
  MIN_DAYS_BETWEEN_TOUCHES,
  NOVELTY_MULTIPLIER,
  contactCadence,
  outreachTiming,
  priorityScore,
  signalDecay,
  urgencyLabel,
} from './timing.mjs';

const day = (n) => new Date(Date.UTC(2026, 0, 1 + n, 12, 0, 0));

function signal({ kind = 'life_event', ageDays = 0, status = 'active' } = {}) {
  return {
    kind,
    status,
    age_days: ageDays,
    first_seen_at: new Date(Date.UTC(2026, 0, 1, 12, 0, 0)).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Decay
// ---------------------------------------------------------------------------

test('a windowed signal decays to nothing and then expires', () => {
  const fresh = signalDecay({ kind: 'life_event', ageDays: 0, windowDays: 14 });
  assert.equal(fresh.decay, 1);
  assert.equal(fresh.expired, false);

  const half = signalDecay({ kind: 'life_event', ageDays: 7, windowDays: 14 });
  assert.equal(half.decay, 0.5);

  const done = signalDecay({ kind: 'life_event', ageDays: 14, windowDays: 14 });
  assert.equal(done.decay, 0);
  assert.equal(done.expired, true);

  const past = signalDecay({ kind: 'life_event', ageDays: 40, windowDays: 14 });
  assert.equal(past.expired, true);
  assert.equal(past.decay, 0, 'decay is clamped rather than going negative');
});

test('a standing signal settles onto a floor rather than expiring', () => {
  // Travel-heavy spend is as true on day 200 as on day 1. Decaying it to zero
  // would be a statement about the household that is simply false.
  const fresh = signalDecay({ kind: 'behavioral', ageDays: 0, windowDays: 45 });
  assert.equal(fresh.decay, 1);

  const oneHalfLife = signalDecay({ kind: 'behavioral', ageDays: 90, windowDays: 45 });
  assert.ok(Math.abs(oneHalfLife.decay - 0.75) < 1e-9, 'floor 0.5 plus half of the remaining 0.5');

  const ancient = signalDecay({ kind: 'behavioral', ageDays: 3650, windowDays: 45 });
  assert.ok(ancient.decay >= 0.5, 'never falls below the floor');
  assert.equal(ancient.expired, false, 'a standing signal never expires');
});

test('a balance decays faster than a behavioral pattern but still floors', () => {
  const behavioral = signalDecay({ kind: 'behavioral', ageDays: 60, windowDays: 45 });
  const financial = signalDecay({ kind: 'financial', ageDays: 60, windowDays: 45 });
  assert.ok(financial.decay < behavioral.decay);
  assert.ok(financial.decay >= 0.4);
});

test('risk signals never decay', () => {
  // An overdraft cluster from 60 days ago still disqualifies.
  const old = signalDecay({ kind: 'risk', ageDays: 500, windowDays: 45 });
  assert.equal(old.decay, 1);
  assert.equal(old.expired, false);
});

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

test('a signal we have no history for is undated, not new', () => {
  // Claiming an age we do not have is the overstatement this module exists to
  // prevent. Full weight, no novelty boost, no expiry.
  const timing = outreachTiming({ leadSignal: { type: 'estate_inflow' }, signal: null });
  assert.equal(timing.status, 'undated');
  assert.equal(timing.age_days, null);
  assert.equal(timing.decay, 1);
  assert.equal(timing.novel, false);
});

test('a fresh inheritance is urgent and a stale one has closed', () => {
  const fresh = outreachTiming({
    leadSignal: { type: 'estate_inflow' },
    signal: signal({ kind: 'life_event', ageDays: 1, status: 'new' }),
  });
  assert.equal(fresh.window.days, 14, 'a one-time inflow gets the fast bucket');
  assert.equal(fresh.days_remaining, 13);
  // Urgency is days left, not how short the window started out. On day 1 of a
  // 14-day window there genuinely is no need to act this week, and saying
  // otherwise would burn the phrase for the rows that do need it.
  assert.equal(fresh.urgency, 'this_month');
  assert.equal(fresh.novel, true);
  assert.equal(fresh.status, 'new');

  const nearlyDue = outreachTiming({
    leadSignal: { type: 'estate_inflow' },
    signal: signal({ kind: 'life_event', ageDays: 9 }),
  });
  assert.equal(nearlyDue.urgency, 'this_week');

  const stale = outreachTiming({
    leadSignal: { type: 'estate_inflow' },
    signal: signal({ kind: 'life_event', ageDays: 21 }),
  });
  assert.equal(stale.status, 'expired');
  assert.equal(stale.urgency, 'closed');
  assert.match(stale.basis, /closed 7 days ago/);
});

test('a window most of the way through is flagged as closing', () => {
  const closing = outreachTiming({
    leadSignal: { type: 'relocation' },
    signal: signal({ kind: 'life_event', ageDays: 25 }),
  });
  assert.equal(closing.window.days, 30);
  assert.equal(closing.status, 'closing');
  assert.equal(closing.days_remaining, 5);
});

test('a standing signal has no deadline to report', () => {
  const timing = outreachTiming({
    leadSignal: { type: 'Travel-heavy spend' },
    signal: signal({ kind: 'behavioral', ageDays: 200 }),
  });
  assert.equal(timing.days_remaining, null);
  assert.equal(timing.status, 'open');
  assert.notEqual(timing.urgency, 'closed');
});

test('novelty lapses after the weekend even while the signal stays marked new', () => {
  // The window is three days so a Friday signal is still news on Monday, but a
  // status left at "new" by a stale snapshot must not keep boosting forever.
  const monday = outreachTiming({
    leadSignal: { type: 'new_child' },
    signal: signal({ kind: 'life_event', ageDays: 3, status: 'new' }),
  });
  assert.equal(monday.novel, true);

  const later = outreachTiming({
    leadSignal: { type: 'new_child' },
    signal: signal({ kind: 'life_event', ageDays: 4, status: 'new' }),
  });
  assert.equal(later.novel, false);
});

test('urgency bands cover every case without inventing precision', () => {
  assert.equal(urgencyLabel('this_week'), 'This week');
  assert.equal(urgencyLabel('closed'), 'Window closed');
  assert.equal(urgencyLabel('nonsense'), 'No rush');
});

// ---------------------------------------------------------------------------
// Cadence
// ---------------------------------------------------------------------------

test('a household never surfaced before is always ready', () => {
  const cadence = contactCadence({ lastTouchAt: null, now: day(10) });
  assert.equal(cadence.ready, true);
  assert.equal(cadence.days_since, null);
});

test('a household surfaced this week is held back', () => {
  const cadence = contactCadence({ lastTouchAt: day(8).toISOString(), now: day(10) });
  assert.equal(cadence.ready, false);
  assert.equal(cadence.reason, 'contacted_recently');
  assert.equal(cadence.days_since, 2);
  assert.ok(cadence.next_eligible_at);
});

test('the cadence cap expires on schedule', () => {
  const cadence = contactCadence({
    lastTouchAt: day(0).toISOString(),
    now: day(MIN_DAYS_BETWEEN_TOUCHES),
  });
  assert.equal(cadence.ready, true);
});

test('a new signal overrides the cadence cap', () => {
  // A flat cap would hold back the inheritance that landed this morning because
  // the same household came up last Tuesday about a travel card.
  const cadence = contactCadence({ lastTouchAt: day(9).toISOString(), novel: true, now: day(10) });
  assert.equal(cadence.ready, true);
  assert.equal(cadence.reason, 'new_signal_override');
});

test('a new signal overrides the same-product cap too', () => {
  // The product is the answer; the lead signal is the question. A household
  // that just came into money may still be best served by the account we
  // suggested last week, and that mail is worth sending because the reason
  // changed even though the answer did not.
  const cadence = contactCadence({
    lastTouchAt: day(9).toISOString(),
    lastProductTouchAt: day(9).toISOString(),
    novel: true,
    now: day(10),
  });
  assert.equal(cadence.ready, true);
  assert.equal(cadence.reason, 'new_signal_override');
});

test('the same pitch for an unchanged reason is held for a month', () => {
  const cadence = contactCadence({
    lastTouchAt: day(9).toISOString(),
    lastProductTouchAt: day(9).toISOString(),
    novel: false,
    now: day(10),
  });
  assert.equal(cadence.ready, false);
  assert.equal(cadence.reason, 'same_product_recently');
});

test('cadence thresholds are tunable without a code change', () => {
  const strict = contactCadence({ lastTouchAt: day(8).toISOString(), now: day(10), minDaysBetween: 30 });
  assert.equal(strict.ready, false);
  const loose = contactCadence({ lastTouchAt: day(8).toISOString(), now: day(10), minDaysBetween: 1 });
  assert.equal(loose.ready, true);
});

test('the same product comes back once its longer cap has passed', () => {
  const cadence = contactCadence({
    lastTouchAt: day(0).toISOString(),
    lastProductTouchAt: day(0).toISOString(),
    now: day(MIN_DAYS_BETWEEN_SAME_PRODUCT),
  });
  assert.equal(cadence.ready, true);
});

test('a malformed timestamp is treated as no contact rather than blocking forever', () => {
  const cadence = contactCadence({ lastTouchAt: 'not-a-date', now: day(10) });
  assert.equal(cadence.ready, true);
});

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

test('priority equals the benefit when nothing has decayed', () => {
  // This is what keeps the pre-context ordering intact until a refresh has run.
  assert.equal(priorityScore({ benefitUsd: 1200, decay: 1 }), 1200);
});

test('a decayed signal ranks below an identical fresh one', () => {
  const fresh = priorityScore({ benefitUsd: 1000, decay: 1 });
  const aged = priorityScore({ benefitUsd: 1000, decay: 0.4 });
  assert.ok(aged < fresh);
});

test('novelty lifts a row without letting a trivial one leapfrog a major one', () => {
  const smallAndNew = priorityScore({ benefitUsd: 400, decay: 1, novel: true });
  const largeAndStale = priorityScore({ benefitUsd: 2000, decay: 0.5 });
  assert.equal(smallAndNew, 400 * NOVELTY_MULTIPLIER);
  assert.ok(smallAndNew < largeAndStale, 'novelty is a weighted tiebreaker, not an override');
});

test('priority never goes negative on a loss-making figure', () => {
  assert.equal(priorityScore({ benefitUsd: -500, decay: 1 }), 0);
});
