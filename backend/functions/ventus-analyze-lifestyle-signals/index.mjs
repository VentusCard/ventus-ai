// lambdas/analyze-lifestyle-signals/index.mjs
// Triggered by SQS ventus-lifestyle-queue
// Two-layer detection: canonical life events + behavioral signals
// Reads from transactions_enriched + customer_pillar_profiles
// → writes to customer_life_events + life_event_evidence

import { createDbFactory } from '../../shared/platform/db.mjs';
import { createModelGateway } from '../../shared/platform/model-gateway.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/platform/secrets.mjs';
import { checkAndEmitBatchOutcome, markCustomerPipelineFailed } from '../../shared/platform/batch-outcome.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});
const modelGateway = createModelGateway({
  getSecrets: getModelSecrets,
  functionName:
    process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-analyze-lifestyle-signals',
});

// ─── DB ───────────────────────────────────────────────────────────────────────
const getDB = createDbFactory({ getSecrets: getDbSecrets });

// ─── FIRE WEBHOOK ─────────────────────────────────────────────────────────────
const fireWebhook = createWebhookDispatcher();

// ─── FETCH TRANSACTIONS — 12 MONTH WINDOW ─────────────────────────────────────
async function fetchEnrichedTransactions(db, customerId) {
  const res = await db.query(
    `SELECT transaction_id, clean_merchant_name, lifestyle_category,
            merchant_category, amount, transaction_date, zip_code
     FROM transactions_enriched
     WHERE customer_id = $1
     AND transaction_date >= NOW() - INTERVAL '12 months'
     ORDER BY transaction_date DESC`,
    [customerId]
  );
  return res.rows;
}

// ─── FETCH PILLAR PROFILES ────────────────────────────────────────────────────
async function fetchPillarProfiles(db, customerId) {
  const res = await db.query(
    `SELECT pillar, total_spend, transaction_count, pct_of_total_spend
     FROM customer_pillar_profiles
     WHERE customer_id = $1
     ORDER BY total_spend DESC`,
    [customerId]
  );
  return res.rows;
}

// ─── FETCH EXISTING BEHAVIORAL SIGNALS ───────────────────────────────────────
async function fetchExistingBehavioralSignals(db, customerId, bankId) {
  const res = await db.query(
    `SELECT signal_category, signal_name, confidence
     FROM customer_life_events
     WHERE customer_id = $1
     AND bank_id = $2
     AND event_category = 'behavioral'
     AND status != 'expired'
     AND confidence >= 70`,
    [customerId, bankId]
  );
  return res.rows;
}

// ─── VALID SIGNAL CATEGORIES ──────────────────────────────────────────────────
const VALID_SIGNAL_CATEGORIES = new Set([
  'home_improvement',
  'travel_pattern',
  'pet_care',
  'fitness_wellness',
  'dining_entertainment',
  'subscription_spending',
  'outdoor_recreation',
  'family_spending',
  'business_activity',
  'financial_stress',
  'automotive',
  'charitable_giving',
  'healthcare_spending',
  'education_spending',
  'real_estate_activity',
  'home_services',
]);

// ─── DEFAULT PRODUCT MAPPING ──────────────────────────────────────────────────
const DEFAULT_PRODUCT_MAPPING = {
  'New Parent': [
    '529 Education Savings Plan',
    'Term Life Insurance',
    'Family Protection Review',
  ],
  'College-Bound Child': [
    '529 Education Savings Plan',
    'Student Loan Planning',
    'College Savings Consultation',
  ],
  'Home Purchase': [
    'Mortgage Pre-Approval',
    'Homeowners Insurance',
    'HELOC Planning',
  ],
  'Wedding / Engagement': [
    'Joint Financial Planning',
    'Beneficiary Update Review',
    'Wedding Savings Account',
  ],
  'Business Formation': [
    'Business Checking Account',
    'SEP-IRA / Solo 401k',
    'Business Credit Card',
  ],
  'Retirement Planning': [
    'Portfolio Rebalancing',
    'IRA / 401k Optimization',
    'Retirement Income Planning',
  ],
  'Job Change & Equity Event': [
    '401k Rollover',
    'Stock Option Planning',
    'Emergency Fund Review',
  ],
  'Aging Parent Care': [
    'Long-Term Care Insurance',
    'POA / Estate Planning',
    'Caregiver Financial Planning',
  ],
  'Major Wealth Event': [
    'Wealth Management Consultation',
    'Tax Planning',
    'Investment Portfolio Review',
  ],
  Relocation: [
    'New Home Mortgage',
    'Moving Expense Planning',
    'Local Banking Setup',
  ],
  'Empty Nest': [
    'Retirement Savings Acceleration',
    'Estate Planning Review',
    'Downsizing Consultation',
  ],
};

// ─── TOOL SCHEMA ──────────────────────────────────────────────────────────────
const LIFESTYLE_SIGNAL_TOOL = {
  type: 'function',
  function: {
    name: 'detect_lifestyle_signals',
    description:
      'Detect canonical life events and behavioral signals from transaction patterns',
    parameters: {
      type: 'object',
      properties: {
        canonical_events: {
          type: 'array',
          description:
            'High confidence life events from fixed enum. Minimum 80% confidence.',
          items: {
            type: 'object',
            properties: {
              event_name: {
                type: 'string',
                enum: [
                  'New Parent',
                  'College-Bound Child',
                  'Home Purchase',
                  'Wedding / Engagement',
                  'Business Formation',
                  'Retirement Planning',
                  'Job Change & Equity Event',
                  'Aging Parent Care',
                  'Major Wealth Event',
                  'Relocation',
                  'Empty Nest',
                ],
              },
              confidence: { type: 'number', minimum: 0, maximum: 100 },
              event_type: {
                type: 'string',
                enum: ['URGENT', 'OPPORTUNITY', 'NOTABLE'],
              },
              urgency_timeline: { type: 'string' },
              insight: {
                type: 'string',
                description:
                  '2-3 sentence advisor insight paragraph synthesizing the most important action for this customer right now. Be specific. Reference the actual detected signals.',
              },
              evidence: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    transaction_id: { type: 'string' },
                    merchant: { type: 'string' },
                    amount: { type: 'number' },
                    date: { type: 'string' },
                    relevance: { type: 'string' },
                  },
                  required: [
                    'transaction_id',
                    'merchant',
                    'amount',
                    'date',
                    'relevance',
                  ],
                },
              },
              talking_points: { type: 'array', items: { type: 'string' } },
              next_steps: { type: 'array', items: { type: 'string' } },
              financial_projection: {
                type: 'object',
                properties: {
                  project_type: {
                    type: 'string',
                    enum: [
                      'education',
                      'home',
                      'retirement',
                      'business',
                      'wedding',
                      'wealth_transfer',
                      'liquidity_event',
                      'family_formation',
                      'charitable_giving',
                      'elder_care',
                      'other',
                    ],
                  },
                  estimated_start_year: { type: 'number' },
                  duration_years: { type: 'number' },
                  estimated_total_cost: { type: 'number' },
                  estimated_current_savings: { type: 'number' },
                  recommended_monthly_contribution: { type: 'number' },
                  cost_breakdown: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string' },
                        yearly_amounts: { type: 'object' },
                      },
                      required: ['category', 'yearly_amounts'],
                    },
                  },
                  recommended_funding_sources: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: [
                            '529',
                            'gifts',
                            'taxable',
                            'roth_ira',
                            'utma',
                            'loan',
                            'savings',
                            'home_equity',
                            'pension',
                            'social_security',
                            '401k',
                            'ira_traditional',
                            'business_loan',
                            'investor',
                            'grant',
                            'credit',
                            'inheritance',
                            'other',
                          ],
                        },
                        rationale: { type: 'string' },
                        suggested_annual_amount: { type: 'number' },
                      },
                      required: [
                        'type',
                        'rationale',
                        'suggested_annual_amount',
                      ],
                    },
                  },
                },
                required: [
                  'project_type',
                  'duration_years',
                  'estimated_total_cost',
                  'cost_breakdown',
                  'recommended_funding_sources',
                ],
              },
            },
            required: [
              'event_name',
              'confidence',
              'event_type',
              'insight',
              'evidence',
              'talking_points',
              'next_steps',
            ],
          },
        },
        behavioral_signals: {
          type: 'array',
          description:
            'Recurring behavioral patterns worth surfacing to advisors. Minimum 60% confidence.',
          items: {
            type: 'object',
            properties: {
              signal_category: {
                type: 'string',
                enum: [
                  'home_improvement',
                  'travel_pattern',
                  'pet_care',
                  'fitness_wellness',
                  'dining_entertainment',
                  'subscription_spending',
                  'outdoor_recreation',
                  'family_spending',
                  'business_activity',
                  'financial_stress',
                  'automotive',
                  'charitable_giving',
                  'healthcare_spending',
                  'education_spending',
                  'real_estate_activity',
                  'home_services',
                ],
              },
              signal_name: {
                type: 'string',
                description:
                  'Descriptive display name. Max 6 words. For travel use destination and spend tier only. Example: Hawaii Travel, Premium Ski Travel, Routine Pet Care, Regular Fitness Routine',
              },
              confidence: { type: 'number', minimum: 0, maximum: 100 },
              webhook_eligible: { type: 'boolean' },
              talking_points: { type: 'array', items: { type: 'string' } },
              evidence: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    transaction_id: { type: 'string' },
                    merchant: { type: 'string' },
                    amount: { type: 'number' },
                    date: { type: 'string' },
                    relevance: { type: 'string' },
                  },
                  required: [
                    'transaction_id',
                    'merchant',
                    'amount',
                    'date',
                    'relevance',
                  ],
                },
              },
            },
            required: [
              'signal_category',
              'signal_name',
              'confidence',
              'webhook_eligible',
              'talking_points',
              'evidence',
            ],
          },
        },
      },
      required: ['canonical_events', 'behavioral_signals'],
    },
  },
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a wealth management AI advisor analyzing client transaction patterns. You detect two types of signals:

1. CANONICAL LIFE EVENTS — major life changes requiring immediate advisor action
2. BEHAVIORAL SIGNALS — recurring spending patterns providing useful advisor context

## CANONICAL LIFE EVENTS — 80% MINIMUM CONFIDENCE

CONFIDENCE SCORING:
- 3 directly causal transactions = 80%
- 4-5 directly causal transactions = 85-90%
- 6+ directly causal transactions = 90-95%

EVIDENCE QUALITY:
Apply three tests to every evidence transaction:
- CAUSALITY: Is this DIRECTLY caused by the life event? "Buy Buy Baby" yes. "Delta Air Lines" no.
- SPECIFICITY: Does the merchant contain SPECIFIC context? "Princeton Review SAT Prep" yes. "Staples" no.
- REASONABLE PERSON: Would an objective observer agree? If you have to assume a connection, EXCLUDE it.

FALSE POSITIVE PREVENTION:
Home Purchase requires escrow, title company, moving company, or mortgage evidence. Home improvement stores alone are NOT sufficient.
New Parent requires multiple baby-specific merchant visits. Single baby store visit could be a gift.
College-Bound Child requires test prep, campus visits, or application fees. Back to school shopping is not sufficient.
Wedding / Engagement requires venue, catering, or jewelry with other wedding evidence. Single jewelry purchase is not sufficient.
Empty Nest requires evidence of children leaving — college move-in supplies, dorm purchases, reduced family food spend, sudden home downsizing activity.

INSIGHT REQUIREMENT:
For every canonical event write a 2-3 sentence insight paragraph synthesizing what the advisor needs to know and what action to take immediately. Be specific. Reference actual merchants and amounts detected.

WHAT NOT TO DETECT:
Travel events are handled by a separate system. Only flag travel if it signals relocation (one-way flight + moving company + new utility setup in different zip code).

## BEHAVIORAL SIGNALS — 60% MINIMUM CONFIDENCE

Only detect if an advisor could have a meaningful conversation based on it.
Worth detecting: Annual Hawaiian Vacations, Routine Pet Care, Seasonal Ski Trips, Home Improvement Activity, Regular Fitness Routine
NOT worth detecting: Weekly grocery shopping, Monthly Netflix charge, Regular gas station visits, ATM withdrawals

NAMING RULES:
- Max 6 words
- Use EXACT same signal_name as existing signals listed in the prompt
- For non-travel patterns include frequency if clearly evidenced: Routine, Regular, Monthly
- Never guess frequency — if you only see one instance omit frequency entirely

TRAVEL PATTERNS are allowed as behavioral signals. Use destination and spend tier only — never frequency.
- "Hawaii Travel" not "Annual Hawaiian Vacations"
- "Premium Ski Travel" not "Seasonal Ski Trips"
- "International Travel" not "Frequent International Travel"
- The evidence transactions show the advisor how often — you don't need to label it

## EVIDENCE TRANSACTION IDS
Each transaction is prefixed with [ID:uuid]. Include exact transaction_id for every evidence item. NEVER fabricate.

## FINANCIAL PROJECTION YEAR
Only include estimated_start_year if clearly inferrable. Never guess. Omit for immediate events.`;

// ─── CALL MODEL GATEWAY ───────────────────────────────────────────────────────
async function callModelForLifestyleSignals(
  customerId,
  transactions,
  spendingSummary,
  existingSignals
) {
  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
  );

  const transactionSummary = sortedTxns
    .map(
      (t) =>
        `- [ID:${t.transaction_id}] ${t.clean_merchant_name}: $${t.amount} (${t.lifestyle_category}, ${t.merchant_category || ''}) on ${t.transaction_date}`
    )
    .join('\n');

  const existingSignalsText =
    existingSignals.length > 0
      ? `\nEXISTING BEHAVIORAL SIGNALS — use EXACT same signal_name if detecting same pattern:\n${existingSignals.map((s) => `- ${s.signal_category}: "${s.signal_name}"`).join('\n')}\n`
      : '';

  const userPrompt = `Analyze this customer's transactions and detect canonical life events and behavioral signals.

CUSTOMER ID: ${customerId}
${existingSignalsText}
TRANSACTIONS (Last 12 months):
${transactionSummary}

SPENDING SUMMARY:
- Total Spend: $${spendingSummary.total_spend || 0}
- Top Categories: ${spendingSummary.top_categories?.join(', ') || 'N/A'}

Canonical events: 80%+ confidence only. Apply causality test strictly.
Behavioral signals: 60%+ confidence, must be advisor-actionable, minimum 2 evidence transactions.
Include exact transaction_id from [ID:xxx] prefix for every evidence item.`;

  const { response: res, metadata } = await modelGateway.chatCompletion({
    task: 'life_event_detection',
    label: 'LIFESTYLE',
    maxRetries: 4,
    maxDelayMs: 20000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    tools: [LIFESTYLE_SIGNAL_TOOL],
    tool_choice: {
      type: 'function',
      function: { name: 'detect_lifestyle_signals' },
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `${metadata.provider}/${metadata.model} error ${res.status}: ${err.slice(0, 200)}`
    );
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.log('[LIFESTYLE] No tool call found, returning empty results');
    return { canonical_events: [], behavioral_signals: [] };
  }

  const args = toolCall.function.arguments;
  return typeof args === 'string' ? JSON.parse(args) : args;
}

// ─── WRITE CANONICAL EVENTS ───────────────────────────────────────────────────
async function writeCanonicalEvents(
  db,
  customerId,
  bankId,
  batchId,
  events,
  transactions
) {
  const writtenEvents = [];
  const webhookLifeEventIds = [];
  const validIds = new Set(transactions.map((t) => t.transaction_id));
  const CONFIDENCE_THRESHOLD = 80;

  const filteredEvents = events
    .map((e) => ({
      ...e,
      confidence: e.confidence <= 1 ? e.confidence * 100 : e.confidence,
    }))
    .filter((e) => {
      if (e.confidence < CONFIDENCE_THRESHOLD) {
        console.log(
          `[LIFESTYLE] Skipping low confidence canonical event: ${e.event_name} (${e.confidence}%)`
        );
        return false;
      }
      if (!e.evidence || e.evidence.length < 2) {
        console.log(
          `[LIFESTYLE] Skipping canonical event with insufficient evidence: ${e.event_name}`
        );
        return false;
      }
      return true;
    });

  console.log(
    `[LIFESTYLE] ${filteredEvents.length}/${events.length} canonical events passed threshold`
  );

  for (const event of filteredEvents) {
    const eventType = event.event_type || 'NOTABLE';
    const cleanName = event.event_name?.trim();
    const proj = event.financial_projection;
    const safeInt = (v) => (v != null ? Math.round(Number(v)) || null : null);
    const safeFloat = (v) =>
      v != null ? parseFloat(Number(v).toFixed(2)) || null : null;
    const recommendedProducts = DEFAULT_PRODUCT_MAPPING[cleanName] || [];

    const existing = await db.query(
      `SELECT id, webhook_fired_at, insight_generated_at
       FROM customer_life_events
       WHERE customer_id = $1 AND bank_id = $2
       AND event_name = $3 AND event_category = 'life_event'`,
      [customerId, bankId, cleanName]
    );

    const isNew = existing.rows.length === 0;
    const existingRow = existing.rows[0];
    const webhookAlreadyFired = existingRow?.webhook_fired_at != null;
    const shouldRegenerateInsight =
      !existingRow?.insight_generated_at ||
      new Date(existingRow.insight_generated_at);
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let lifeEventId;

    if (isNew) {
      const result = await db.query(
        `INSERT INTO customer_life_events
          (customer_id, bank_id, batch_id, event_name, event_type, event_category,
           confidence, urgency_timeline, status,
           talking_points, next_steps, project_type,
           estimated_start_year, duration_years, estimated_total_cost,
           estimated_current_savings, recommended_monthly_contribution,
           cost_breakdown, recommended_funding_sources, recommended_products,
           insight, insight_generated_at,
           detected_at, first_detected_at, last_confirmed_at)
         VALUES ($1,$2,$3,$4,$5,'life_event',$6,$7,'active',$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW(),NOW(),NOW(),NOW())
         RETURNING id`,
        [
          customerId,
          bankId,
          batchId,
          cleanName,
          eventType,
          event.confidence,
          event.urgency_timeline || 'Unknown',
          JSON.stringify(event.talking_points || []),
          JSON.stringify(event.next_steps || []),
          proj?.project_type || null,
          safeInt(proj?.estimated_start_year),
          safeInt(proj?.duration_years),
          safeFloat(proj?.estimated_total_cost),
          safeFloat(proj?.estimated_current_savings),
          safeFloat(proj?.recommended_monthly_contribution),
          JSON.stringify(proj?.cost_breakdown || []),
          JSON.stringify(proj?.recommended_funding_sources || []),
          JSON.stringify(recommendedProducts),
          event.insight || null,
        ]
      );
      lifeEventId = result.rows[0]?.id;
      console.log(`[LIFESTYLE] New canonical event: ${cleanName}`);
    } else {
      lifeEventId = existingRow.id;
      await db.query(
        `UPDATE customer_life_events
         SET last_confirmed_at = NOW(),
             confidence = $1,
             batch_id = $2,
             talking_points = $3,
             next_steps = $4,
             insight = CASE WHEN $5 THEN $6 ELSE insight END,
             insight_generated_at = CASE WHEN $5 THEN NOW() ELSE insight_generated_at END
         WHERE id = $7`,
        [
          event.confidence,
          batchId,
          JSON.stringify(event.talking_points || []),
          JSON.stringify(event.next_steps || []),
          shouldRegenerateInsight,
          event.insight || null,
          lifeEventId,
        ]
      );
      console.log(`[LIFESTYLE] Updated canonical event: ${cleanName}`);
    }

    if (lifeEventId && event.evidence?.length > 0) {
      await db.query(
        `DELETE FROM life_event_evidence WHERE life_event_id = $1`,
        [lifeEventId]
      );
      for (const e of event.evidence) {
        if (!e.transaction_id || !validIds.has(e.transaction_id)) continue;
        await db
          .query(
            `INSERT INTO life_event_evidence (life_event_id, transaction_id, relevance)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [lifeEventId, e.transaction_id, e.relevance]
          )
          .catch((err) =>
            console.warn('[LIFESTYLE] Evidence insert failed:', err.message)
          );
      }
    }

    if (isNew && !webhookAlreadyFired && lifeEventId) {
      await db.query(
        `UPDATE customer_life_events SET webhook_fired_at = NOW() WHERE id = $1`,
        [lifeEventId]
      );
      webhookLifeEventIds.push(String(lifeEventId));
      writtenEvents.push(event);
    } else if (!isNew) {
      writtenEvents.push(event);
    }
  }

  await db.query(
    `UPDATE customer_life_events
     SET resolved_at = NOW(), status = 'resolved'
     WHERE customer_id = $1 AND bank_id = $2
     AND event_category = 'life_event'
     AND status = 'active'
     AND last_confirmed_at < NOW() - INTERVAL '90 days'`,
    [customerId, bankId]
  );

  console.log(`[RDS] ✓ Wrote/updated ${writtenEvents.length} canonical events`);
  return { writtenCount: writtenEvents.length, webhookLifeEventIds };
}

// ─── WRITE BEHAVIORAL SIGNALS ─────────────────────────────────────────────────
async function writeBehavioralSignals(
  db,
  customerId,
  bankId,
  batchId,
  signals,
  transactions
) {
  const writtenSignals = [];
  const webhookBehavioralSignalIds = [];
  const validIds = new Set(transactions.map((t) => t.transaction_id));
  const CONFIDENCE_THRESHOLD = 60;

  const filteredSignals = signals
    .map((s) => ({
      ...s,
      confidence: s.confidence <= 1 ? s.confidence * 100 : s.confidence,
    }))
    .filter((s) => {
      if (s.confidence < CONFIDENCE_THRESHOLD) {
        console.log(
          `[LIFESTYLE] Skipping low confidence behavioral signal: ${s.signal_name} (${s.confidence}%)`
        );
        return false;
      }
      if (!VALID_SIGNAL_CATEGORIES.has(s.signal_category)) {
        console.warn(
          `[LIFESTYLE] Invalid signal_category: ${s.signal_category}, skipping`
        );
        return false;
      }
      if (!s.evidence || s.evidence.length < 2) {
        console.log(
          `[LIFESTYLE] Skipping behavioral signal with insufficient evidence: ${s.signal_name}`
        );
        return false;
      }
      const words = (s.signal_name || '').split(' ').length;
      if (words > 6) {
        s.signal_name = s.signal_name.split(' ').slice(0, 6).join(' ');
      }
      return true;
    });

  console.log(
    `[LIFESTYLE] ${filteredSignals.length}/${signals.length} behavioral signals passed threshold`
  );

  for (const signal of filteredSignals) {
    const existing = await db.query(
      `SELECT id, webhook_fired_at
       FROM customer_life_events
       WHERE customer_id = $1 AND bank_id = $2
       AND signal_category = $3 AND signal_name = $4
       AND event_category = 'behavioral'`,
      [customerId, bankId, signal.signal_category, signal.signal_name]
    );

    const isNew = existing.rows.length === 0;
    const webhookAlreadyFired = existing.rows[0]?.webhook_fired_at != null;
    let lifeEventId;

    if (isNew) {
      const result = await db.query(
        `INSERT INTO customer_life_events
          (customer_id, bank_id, batch_id, event_name, event_type, event_category,
           signal_category, signal_name, confidence, urgency_timeline, status,
           talking_points, next_steps, detected_at, first_detected_at, last_confirmed_at)
         VALUES ($1,$2,$3,$4,'NOTABLE','behavioral',$5,$6,$7,'Ongoing','active',$8,'[]',NOW(),NOW(),NOW())
         RETURNING id`,
        [
          customerId,
          bankId,
          batchId,
          signal.signal_name,
          signal.signal_category,
          signal.signal_name,
          signal.confidence,
          JSON.stringify(signal.talking_points || []),
        ]
      );
      lifeEventId = result.rows[0]?.id;
      console.log(`[LIFESTYLE] New behavioral signal: ${signal.signal_name}`);
    } else {
      lifeEventId = existing.rows[0].id;
      await db.query(
        `UPDATE customer_life_events
         SET last_confirmed_at = NOW(),
             confidence = $1,
             batch_id = $2,
             talking_points = $3
         WHERE id = $4`,
        [
          signal.confidence,
          batchId,
          JSON.stringify(signal.talking_points || []),
          lifeEventId,
        ]
      );
      console.log(
        `[LIFESTYLE] Updated behavioral signal: ${signal.signal_name}`
      );
    }

    if (lifeEventId && signal.evidence?.length > 0) {
      await db.query(
        `DELETE FROM life_event_evidence WHERE life_event_id = $1`,
        [lifeEventId]
      );
      for (const e of signal.evidence) {
        if (!e.transaction_id || !validIds.has(e.transaction_id)) continue;
        await db
          .query(
            `INSERT INTO life_event_evidence (life_event_id, transaction_id, relevance)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [lifeEventId, e.transaction_id, e.relevance]
          )
          .catch((err) =>
            console.warn('[LIFESTYLE] Evidence insert failed:', err.message)
          );
      }
    }

    if (
      isNew &&
      signal.webhook_eligible &&
      !webhookAlreadyFired &&
      lifeEventId
    ) {
      await db.query(
        `UPDATE customer_life_events SET webhook_fired_at = NOW() WHERE id = $1`,
        [lifeEventId]
      );
      webhookBehavioralSignalIds.push(String(lifeEventId));
    }

    writtenSignals.push(signal);
  }

  await db.query(
    `UPDATE customer_life_events
     SET status = 'expired'
     WHERE customer_id = $1 AND bank_id = $2
     AND event_category = 'behavioral'
     AND status = 'active'
     AND last_confirmed_at < NOW() - INTERVAL '30 days'`,
    [customerId, bankId]
  );

  console.log(
    `[RDS] ✓ Wrote/updated ${writtenSignals.length} behavioral signals`
  );
  return { writtenCount: writtenSignals.length, webhookBehavioralSignalIds };
}

// ─── UPDATE PIPELINE_RUNS ─────────────────────────────────────────────────────
async function updatePipelineRuns(db, batchId, customerId) {
  const result = await db.query(
    `UPDATE pipeline_runs
     SET lifestyle_analyzed_at = NOW(),
         stages_complete = stages_complete + 1,
         status = CASE WHEN stages_complete + 1 >= 4 THEN 'complete' ELSE 'lifestyle_analyzed' END,
         completed_at = CASE WHEN stages_complete + 1 >= 4 THEN NOW() ELSE completed_at END
     WHERE batch_id = $1 AND customer_id = $2
     RETURNING stages_complete`,
    [batchId, customerId]
  );
  return result.rows[0]?.stages_complete;
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  for (const record of event.Records) {
    const { batch_id, customer_id, bank_id } = JSON.parse(record.body);
    console.log(
      `[LIFESTYLE] Processing customer ${customer_id} batch ${batch_id}`
    );

    const db = await getDB();
    await db.connect();

    try {
      const transactions = await fetchEnrichedTransactions(db, customer_id);
      if (transactions.length === 0) {
        console.warn(`[LIFESTYLE] No transactions for ${customer_id}`);
        continue;
      }
      console.log(
        `[LIFESTYLE] Found ${transactions.length} transactions (12 month window)`
      );

      const pillarProfiles = await fetchPillarProfiles(db, customer_id);
      const totalSpend = pillarProfiles.reduce(
        (sum, p) => sum + parseFloat(p.total_spend || 0),
        0
      );
      const topCategories = pillarProfiles
        .slice(0, 3)
        .map((p) => `${p.pillar} ($${parseFloat(p.total_spend).toFixed(0)})`);
      const spendingSummary = {
        total_spend: Math.round(totalSpend * 100) / 100,
        top_categories: topCategories,
      };

      const existingSignals = await fetchExistingBehavioralSignals(
        db,
        customer_id,
        bank_id
      );
      console.log(
        `[LIFESTYLE] ${existingSignals.length} existing behavioral signals for context`
      );

      console.log(`[LIFESTYLE] Calling model gateway for two-layer detection...`);
      const aiResult = await callModelForLifestyleSignals(
        customer_id,
        transactions,
        spendingSummary,
        existingSignals
      );

      const canonicalEvents = aiResult.canonical_events || [];
      const behavioralSignals = aiResult.behavioral_signals || [];
      console.log(
        `[LIFESTYLE] Model gateway: ${canonicalEvents.length} canonical events, ${behavioralSignals.length} behavioral signals`
      );

      const { writtenCount: canonicalWrittenCount, webhookLifeEventIds } =
        await writeCanonicalEvents(
          db,
          customer_id,
          bank_id,
          batch_id,
          canonicalEvents,
          transactions
        );

      if (webhookLifeEventIds.length > 0) {
        await fireWebhook(db, bank_id, 'life_event_detected', {
          schema_version: 1,
          customer_id,
          batch_id,
          life_event_ids: webhookLifeEventIds,
        });
        console.log(
          `[WEBHOOK] life_event_detected: ${webhookLifeEventIds.length} new event(s) for ${customer_id}`
        );
      }

      const { writtenCount: behavioralWrittenCount, webhookBehavioralSignalIds } =
        await writeBehavioralSignals(
          db,
          customer_id,
          bank_id,
          batch_id,
          behavioralSignals,
          transactions
        );

      if (webhookBehavioralSignalIds.length > 0) {
        await fireWebhook(db, bank_id, 'behavioral_signal_detected', {
          schema_version: 1,
          customer_id,
          batch_id,
          behavioral_signal_ids: webhookBehavioralSignalIds,
        });
        console.log(
          `[WEBHOOK] behavioral_signal_detected: ${webhookBehavioralSignalIds.length} new signal(s) for ${customer_id}`
        );
      }

      const stagesComplete = await updatePipelineRuns(
        db,
        batch_id,
        customer_id
      );
      console.log(
        `[LIFESTYLE] stages_complete: ${stagesComplete}/4 for ${customer_id}`
      );

      if (stagesComplete >= 4) {
        await checkAndEmitBatchOutcome(db, batch_id, bank_id, fireWebhook);
      }

      console.log(
        `[LIFESTYLE] ✓ Done for ${customer_id} — ${canonicalWrittenCount} canonical, ${behavioralWrittenCount} behavioral`
      );
    } catch (err) {
      console.error(`[LIFESTYLE] Error for customer ${customer_id}:`, err);
      await markCustomerPipelineFailed(
        db,
        { batchId: batch_id, customerId: customer_id, bankId: bank_id, errorMessage: err.message },
        fireWebhook
      );
      throw err;
    } finally {
      await db.end();
    }
  }

  return { statusCode: 200 };
};
