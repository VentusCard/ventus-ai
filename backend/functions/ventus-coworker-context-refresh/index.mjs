// backend/functions/ventus-coworker-context-refresh/index.mjs
//
// Daily customer context refresh, triggered by EventBridge an hour before the
// digest goes out.
//
// For every household in the book: read what the provider currently reports,
// compare it against yesterday's stored snapshot, and write today's. The
// comparison is the whole point — it is what turns a timeless list of signals
// into signals with an observed age, which is what lets the digest tell an
// inheritance that landed overnight from one it has been mentioning since
// spring.
//
// Runs ahead of the digest rather than inside it for two reasons. A refresh
// that fails should not take the digest down with it: yesterday's context plus
// today's mail is a slightly stale ordering, while no mail at all is a broken
// product. And the run leaves a record, so "the digest looked wrong this
// morning" has somewhere to be answered from.
//
// Thin adapter: all snapshot and diff logic lives in shared/coworker/context.mjs.

import { createFixturePortfolioProvider } from '../../shared/coworker/portfolio-provider.mjs';
import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { buildHouseholdContext, diffContext } from '../../shared/coworker/context.mjs';

const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-context-refresh';
const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';
const HISTORY_DAYS = Number(process.env.COWORKER_CONTEXT_HISTORY_DAYS || 90);

const provider = createFixturePortfolioProvider();

let storePromise;
function getStore() {
  if (!storePromise) {
    storePromise = createDynamoBackend({ tableName: TABLE_NAME }).then((backend) =>
      createCoworkerStore(backend)
    );
  }
  return storePromise;
}

export const handler = async () => {
  const startedAt = new Date();
  const store = await getStore();
  const households = provider.getHouseholds();

  const summary = {
    households: households.length,
    refreshed: 0,
    failed: 0,
    first_run: 0,
    changed: 0,
    unchanged: 0,
    signals_added: 0,
    signals_removed: 0,
    signals_strengthened: 0,
    signals_weakened: 0,
    financial_moves: 0,
    source: provider.source,
  };

  // Households whose context moved overnight, named in the run record. When an
  // advisor asks why a row appeared today, this is the first place to look.
  const movements = [];
  const failures = [];

  for (const household of households) {
    try {
      const previous = await store.getContext(household.id);
      const snapshot = buildHouseholdContext({
        household,
        signals: provider.getSignals(household.id),
        previous,
        now: startedAt,
        source: provider.source,
      });
      const delta = diffContext(previous, snapshot);

      // Written every day even when nothing changed. The snapshot's own
      // freshness is a signal the digest reads, so skipping the write to save a
      // put would make a healthy quiet day indistinguishable from a refresh
      // that stopped running.
      await store.putContext(snapshot, { historyDays: HISTORY_DAYS });

      summary.refreshed += 1;
      if (delta.first_run) summary.first_run += 1;
      if (delta.changed && !delta.first_run) {
        summary.changed += 1;
        summary.signals_added += delta.added.length;
        summary.signals_removed += delta.removed.length;
        summary.signals_strengthened += delta.strengthened.length;
        summary.signals_weakened += delta.weakened.length;
        summary.financial_moves += delta.financial.length;
        movements.push({
          household_id: household.id,
          household_name: household.name,
          advisor_id: household.advisor_id,
          added: delta.added.map((s) => s.label),
          removed: delta.removed.map((s) => s.label),
          strengthened: delta.strengthened.map((s) => s.label),
          financial: delta.financial.map((f) => `${f.field} ${f.direction}`),
        });
        console.log(
          `[${LAMBDA_NAME}] ${household.id} changed: +${delta.added.length} -${delta.removed.length} ` +
            `strengthened ${delta.strengthened.length} financial ${delta.financial.length}`
        );
      } else if (!delta.first_run) {
        summary.unchanged += 1;
      }
    } catch (err) {
      // One household's failure must not abort the book. A partial refresh
      // leaves the rest of the advisors with fresh context and reports the gap;
      // throwing here would leave everyone on yesterday's.
      summary.failed += 1;
      failures.push({ household_id: household.id, message: String(err?.message || err) });
      console.error(`[${LAMBDA_NAME}] Failed to refresh ${household.id}:`, err);
    }
  }

  const status = summary.failed === 0 ? 'ok' : summary.refreshed === 0 ? 'failed' : 'partial';
  summary.movements = movements.slice(0, 50);
  summary.duration_ms = Date.now() - startedAt.getTime();

  await store.putRun({
    kind: 'context-refresh',
    status,
    summary,
    error: failures.length ? failures.slice(0, 10) : null,
    now: startedAt,
    retentionDays: HISTORY_DAYS,
  });

  console.log(
    `[${LAMBDA_NAME}] ${status}: refreshed ${summary.refreshed}/${summary.households}, ` +
      `${summary.changed} changed, ${summary.first_run} first-run, ${summary.failed} failed ` +
      `in ${summary.duration_ms}ms.`
  );

  // Surfaced as a Lambda error so the existing error alarm fires. A refresh
  // that silently writes nothing is the failure this whole job exists to make
  // visible, so it must not exit 200.
  if (status === 'failed') {
    throw new Error(`Context refresh failed for all ${summary.households} households.`);
  }

  return { status, ...summary };
};
