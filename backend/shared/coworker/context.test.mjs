import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SIGNAL_GRACE_DAYS,
  ageContext,
  buildHouseholdContext,
  contextFingerprint,
  diffContext,
  extractSignals,
  isContextStale,
  signalKey,
  signalsByToken,
} from './context.mjs';

const HOUSEHOLD = {
  id: 'hh_test',
  advisor_id: 'adv_test',
  name: 'Test Household',
  relationship: { tenure_years: 4, products_held: ['everyday-checking'], aum_usd: 100000, wallet_share: 0.3 },
};

const SIGNALS = {
  life_events: [{ type: 'new_child', confidence_band: 'high', evidence: 'Pediatric visits began in March.' }],
  behavioral: [{ name: 'Travel-heavy spend', level: 'HIGH', evidence: '9 flights over 12 months.' }],
  risk: [],
  financial: { idle_cash_usd: 40000, monthly_surplus_usd: 3200 },
};

const day = (n) => new Date(Date.UTC(2026, 0, 1 + n, 12, 0, 0));

function refresh({ signals = SIGNALS, previous = null, now = day(0) } = {}) {
  return buildHouseholdContext({ household: HOUSEHOLD, signals, previous, now, source: 'fixtures' });
}

test('every signal family flattens onto one comparable list', () => {
  const flat = extractSignals(SIGNALS);
  const keys = flat.map((s) => s.key);
  assert.ok(keys.includes(signalKey('life_event', 'new_child')));
  assert.ok(keys.includes(signalKey('behavioral', 'Travel-heavy spend')));
  assert.ok(keys.includes(signalKey('financial', 'idle_cash')));

  // Strength is normalized across families that spell confidence differently.
  const event = flat.find((s) => s.kind === 'life_event');
  const behavioral = flat.find((s) => s.kind === 'behavioral');
  assert.equal(event.strength, 1);
  assert.equal(behavioral.strength, 1);
});

test('MED and medium mean the same thing', () => {
  const [med] = extractSignals({ behavioral: [{ name: 'A', level: 'MED' }] });
  const [medium] = extractSignals({ life_events: [{ type: 'relocation', confidence_band: 'medium' }] });
  assert.equal(med.strength, medium.strength);
});

test('idle cash below the threshold is not a signal', () => {
  const below = extractSignals({ financial: { idle_cash_usd: 9000 } });
  assert.equal(below.length, 0);
  const above = extractSignals({ financial: { idle_cash_usd: 40000 } });
  assert.equal(above.length, 1);
  assert.equal(above[0].value, 40000);
});

test('nothing is marked new on the first refresh', () => {
  // Otherwise a household's entire history would look like it broke overnight
  // the first morning the job runs, and every row would carry a NEW badge.
  const snapshot = refresh();
  assert.equal(snapshot.signals.length, 3);
  for (const s of snapshot.signals) {
    assert.equal(s.status, 'active');
    assert.equal(s.age_days, 0);
  }
  assert.equal(snapshot.refresh_count, 1);
});

test('a signal that persists keeps its original first_seen_at and accrues age', () => {
  const first = refresh({ now: day(0) });
  const later = refresh({ previous: first, now: day(30) });

  const travel = later.signals.find((s) => s.type === 'Travel-heavy spend');
  assert.equal(travel.first_seen_at, first.refreshed_at);
  assert.equal(travel.age_days, 30);
  assert.equal(travel.status, 'active');
  assert.equal(later.refresh_count, 2);
  assert.equal(later.first_refreshed_at, first.refreshed_at);
});

test('a signal that appears after the first run is marked new', () => {
  const first = refresh({ now: day(0) });
  const withInheritance = {
    ...SIGNALS,
    life_events: [
      ...SIGNALS.life_events,
      { type: 'estate_inflow', confidence_band: 'high', evidence: 'A $240,000 deposit landed.' },
    ],
  };
  const second = refresh({ signals: withInheritance, previous: first, now: day(1) });

  const inflow = second.signals.find((s) => s.type === 'estate_inflow');
  assert.equal(inflow.status, 'new');
  assert.equal(inflow.age_days, 0);

  const travel = second.signals.find((s) => s.type === 'Travel-heavy spend');
  assert.equal(travel.status, 'active');
});

test('a one-day flicker does not reset a signal clock', () => {
  // Upstream enrichment is not stable day to day. Without the grace period a
  // behavioral pattern sitting just under its threshold would drop out, come
  // back, and present six months of history as brand new.
  const first = refresh({ now: day(0) });
  const noTravel = { ...SIGNALS, behavioral: [] };
  const missing = refresh({ signals: noTravel, previous: first, now: day(1) });

  const fading = missing.signals.find((s) => s.type === 'Travel-heavy spend');
  assert.equal(fading.status, 'fading');
  assert.equal(fading.first_seen_at, first.refreshed_at);

  const returned = refresh({ previous: missing, now: day(2) });
  const travel = returned.signals.find((s) => s.type === 'Travel-heavy spend');
  assert.equal(travel.status, 'active');
  assert.equal(travel.first_seen_at, first.refreshed_at, 'the original first-seen survives the flicker');
});

test('a signal gone longer than the grace period is dropped', () => {
  let snapshot = refresh({ now: day(0) });
  const noTravel = { ...SIGNALS, behavioral: [] };
  for (let d = 1; d <= SIGNAL_GRACE_DAYS + 2; d += 1) {
    snapshot = refresh({ signals: noTravel, previous: snapshot, now: day(d) });
  }
  assert.equal(
    snapshot.signals.find((s) => s.type === 'Travel-heavy spend'),
    undefined
  );
});

test('peak strength survives a signal softening', () => {
  const first = refresh({ now: day(0) });
  const softened = {
    ...SIGNALS,
    life_events: [{ type: 'new_child', confidence_band: 'low', evidence: 'Fewer pediatric visits.' }],
  };
  const second = refresh({ signals: softened, previous: first, now: day(10) });
  const child = second.signals.find((s) => s.type === 'new_child');
  assert.equal(child.strength, 0.3);
  assert.equal(child.peak_strength, 1);
});

test('the fingerprint ignores the passage of time but catches a real move', () => {
  const first = refresh({ now: day(0) });
  const sameContentLaterDay = refresh({ previous: first, now: day(5) });
  assert.equal(sameContentLaterDay.fingerprint, first.fingerprint);

  // Ordinary balance drift is below the bucket, a real move is not.
  const drifted = refresh({
    signals: { ...SIGNALS, financial: { ...SIGNALS.financial, idle_cash_usd: 40200 } },
    previous: first,
    now: day(6),
  });
  assert.equal(drifted.fingerprint, first.fingerprint);

  const moved = refresh({
    signals: { ...SIGNALS, financial: { ...SIGNALS.financial, idle_cash_usd: 120000 } },
    previous: first,
    now: day(7),
  });
  assert.notEqual(moved.fingerprint, first.fingerprint);
});

test('the fingerprint is stable regardless of signal ordering', () => {
  const a = contextFingerprint(
    [
      { key: 'behavioral:B', strength: 1, status: 'active' },
      { key: 'life_event:A', strength: 0.6, status: 'active' },
    ],
    {}
  );
  const b = contextFingerprint(
    [
      { key: 'life_event:A', strength: 0.6, status: 'active' },
      { key: 'behavioral:B', strength: 1, status: 'active' },
    ],
    {}
  );
  assert.equal(a, b);
});

test('the diff names what appeared, left, and changed strength', () => {
  const first = refresh({ now: day(0) });
  const next = refresh({
    signals: {
      life_events: [
        { type: 'new_child', confidence_band: 'low', evidence: 'Softened.' },
        { type: 'estate_inflow', confidence_band: 'high', evidence: 'Deposit landed.' },
      ],
      behavioral: [],
      risk: [],
      financial: { idle_cash_usd: 250000, monthly_surplus_usd: 3200 },
    },
    previous: first,
    now: day(1),
  });

  const delta = diffContext(first, next);
  assert.equal(delta.changed, true);
  assert.equal(delta.first_run, false);
  assert.deepEqual(
    delta.added.map((s) => s.key),
    ['life_event:estate_inflow']
  );
  assert.deepEqual(
    delta.removed.map((s) => s.key),
    ['behavioral:Travel-heavy spend']
  );
  assert.deepEqual(
    delta.weakened.map((s) => s.key),
    ['life_event:new_child']
  );
  assert.equal(delta.financial[0].field, 'idle_cash_usd');
  assert.equal(delta.financial[0].direction, 'up');
});

test('an unchanged book reports no movement', () => {
  const first = refresh({ now: day(0) });
  const second = refresh({ previous: first, now: day(1) });
  const delta = diffContext(first, second);
  assert.equal(delta.changed, false);
  assert.equal(delta.added.length, 0);
  assert.equal(delta.removed.length, 0);
});

test('the first run is flagged rather than reported as a book-wide change', () => {
  const delta = diffContext(null, refresh());
  assert.equal(delta.first_run, true);
});

test('ages are recomputed against read time, not write time', () => {
  // A snapshot is written once in the morning and read by every send that day.
  const written = refresh({ now: day(0) });
  const readLater = ageContext(written, day(9));
  const travel = readLater.signals.find((s) => s.type === 'Travel-heavy spend');
  assert.equal(travel.age_days, 9);
  assert.equal(readLater.context_age_days, 9);
});

test('context past two days old is stale', () => {
  const snapshot = refresh({ now: day(0) });
  assert.equal(isContextStale(snapshot, { now: day(1) }).stale, false);
  assert.equal(isContextStale(snapshot, { now: day(2) }).stale, false);
  assert.equal(isContextStale(snapshot, { now: day(3) }).stale, true);
  assert.equal(isContextStale(null).stale, true);
});

test('tokens map back to the signal that carries their history', () => {
  const first = refresh({ now: day(0) });
  const aged = ageContext(refresh({ previous: first, now: day(20) }), day(20));
  const byToken = signalsByToken(aged);

  // These are the exact tokens buildAudience matches products against.
  assert.equal(byToken.get('new_child').age_days, 20);
  assert.equal(byToken.get('Travel-heavy spend').kind, 'behavioral');
  assert.equal(byToken.get('idle_cash').kind, 'financial');
});

test('a fading signal is not offered to the matcher', () => {
  const first = refresh({ now: day(0) });
  const missing = refresh({ signals: { ...SIGNALS, behavioral: [] }, previous: first, now: day(1) });
  assert.equal(signalsByToken(missing).has('Travel-heavy spend'), false);
});

test('building context without a household id fails loudly', () => {
  assert.throws(() => buildHouseholdContext({ household: {}, signals: SIGNALS }), /household with an id/);
});
