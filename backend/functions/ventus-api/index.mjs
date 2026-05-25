// lambdas/api/index.mjs

import express from 'express';
import serverless from 'serverless-http';
import crypto from 'crypto';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createDbFactory } from '../../shared/db.mjs';
import { resolveSecretId } from '../../shared/secrets.mjs';
import { buildWebhookBody, recordWebhookDelivery } from '../../shared/webhooks.mjs';

const sqs = new SQSClient({ region: 'us-east-2' });
const app = express();
app.use(express.json());

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const getDB = createDbFactory({ secretId: DATABASE_SECRET_ID });
const DEFAULT_ALLOWED_ORIGINS = [
  'https://ventusai.com',
  'https://www.ventusai.com',
  'https://staging.d1gaewa028qzng.amplifyapp.com',
  'https://*.ventusai.com',
  'https://*.lovable.app',
  'https://*.lovable.dev',
  'https://*.lovableproject.com',
  'https://*.amplifyapp.com',
];
const DEFAULT_DEV_ALLOWED_ORIGINS = [
  'http://localhost:*',
  'http://127.0.0.1:*',
];

// ─── URGENCY TIMELINE DEFAULTS ────────────────────────────────────────────────
function getDefaultUrgencyTimeline(eventName) {
  const defaults = {
    'New Parent': 'Immediate',
    'College-Bound Child': '1-4 years',
    'Home Purchase': '3-6 months',
    'Wedding / Engagement': '6-18 months',
    'Business Formation': '1-2 years',
    'Retirement Planning': '2-10 years',
    'Job Change & Equity Event': 'Immediate',
    'Aging Parent Care': 'Varies',
    'Major Wealth Event': 'Immediate',
    Relocation: 'Immediate',
    'Empty Nest': '2-5 years',
  };
  return defaults[eventName] || 'Near-term';
}

// ─── SEGMENT DISPLAY NAMES ────────────────────────────────────────────────────
const SEGMENT_DISPLAY_NAMES = {
  home_improvement: 'Home Improvement',
  travel_pattern: 'Travel',
  pet_care: 'Pet Care',
  fitness_wellness: 'Fitness & Wellness',
  dining_entertainment: 'Dining & Entertainment',
  subscription_spending: 'Subscriptions',
  outdoor_recreation: 'Outdoor Recreation',
  family_spending: 'Family',
  business_activity: 'Business Activity',
  financial_stress: 'Financial Stress',
  automotive: 'Automotive',
  charitable_giving: 'Charitable Giving',
  healthcare_spending: 'Healthcare',
  education_spending: 'Education',
  real_estate_activity: 'Real Estate',
  home_services: 'Home Services',
};

const WEBHOOK_EVENTS = [
  'batch_started',
  'batch_complete',
  'life_event_detected',
  'trip_detected',
  'risk_detected',
  'behavioral_signal_detected',
];

function validateWebhookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function deliverWebhookTest({ db, webhook, bankId }) {
  const deliveryId = crypto.randomUUID();
  const body = buildWebhookBody({
    eventType: 'webhook_test',
    bankId,
    deliveryId,
    payload: {
      message: 'Ventus webhook test delivery',
      configured_events: webhook.events,
    },
  });
  const signature = webhook.secret
    ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
    : null;

  let response = null;
  let errorMessage = null;
  try {
    response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ventus-event': 'webhook_test',
        'x-ventus-delivery-id': deliveryId,
        ...(signature && { 'x-ventus-signature': signature }),
      },
      body,
    });
  } catch (error) {
    errorMessage = error.message;
  }

  await recordWebhookDelivery({
    db,
    deliveryId,
    webhookId: webhook.webhook_id,
    bankId,
    eventType: 'webhook_test',
    targetUrl: webhook.url,
    payloadBody: body,
    attemptCount: 1,
    status: response?.ok ? 'delivered' : 'failed',
    statusCode: response?.status ?? null,
    errorMessage: response?.ok ? null : errorMessage || `HTTP ${response?.status}`,
  });

  return {
    delivery_id: deliveryId,
    status_code: response?.status ?? null,
    delivered: response?.ok ?? false,
  };
}

async function deliverWebhookReplay({ db, originalDelivery, webhook }) {
  const deliveryId = crypto.randomUUID();
  const originalPayload = originalDelivery.payload_json;
  const body = buildWebhookBody({
    eventType: originalDelivery.event_type,
    bankId: originalDelivery.bank_id,
    deliveryId,
    payload: originalPayload.data,
  });
  const signature = webhook.secret
    ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
    : null;

  let response = null;
  let errorMessage = null;
  try {
    response = await fetch(originalDelivery.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ventus-event': originalDelivery.event_type,
        'x-ventus-delivery-id': deliveryId,
        ...(signature && { 'x-ventus-signature': signature }),
      },
      body,
    });
  } catch (error) {
    errorMessage = error.message;
  }

  await recordWebhookDelivery({
    db,
    deliveryId,
    webhookId: originalDelivery.webhook_id,
    bankId: originalDelivery.bank_id,
    eventType: originalDelivery.event_type,
    targetUrl: originalDelivery.target_url,
    payloadBody: body,
    attemptCount: 1,
    status: response?.ok ? 'delivered' : 'failed',
    statusCode: response?.status ?? null,
    errorMessage: response?.ok ? null : errorMessage || `HTTP ${response?.status}`,
    replayOfDeliveryId: originalDelivery.delivery_id,
  });

  return {
    delivery_id: deliveryId,
    replay_of_delivery_id: originalDelivery.delivery_id,
    status_code: response?.status ?? null,
    delivered: response?.ok ?? false,
  };
}

// ─── CORS MIDDLEWARE ──────────────────────────────────────────────────────────
function parseAllowedOrigins(value, environment) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (environment === 'production') {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return ['*'];
}

function wildcardOriginToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '[^.:/]+');
  return new RegExp(`^${escaped}$`);
}

function originMatchesPattern(origin, pattern) {
  if (pattern === '*') return true;
  if (pattern === origin) return true;
  if (!pattern.includes('*')) return false;
  return wildcardOriginToRegex(pattern).test(origin);
}

function resolveCorsOrigin(origin, allowedOrigins) {
  if (!origin) return null;
  return allowedOrigins.some((allowedOrigin) => originMatchesPattern(origin, allowedOrigin))
    ? origin
    : null;
}

const environment = process.env.VENTUS_ENVIRONMENT || process.env.NODE_ENV || 'development';
const allowedOrigins = [
  ...parseAllowedOrigins(process.env.VENTUS_ALLOWED_ORIGINS, environment),
  ...(environment === 'production' ? [] : DEFAULT_DEV_ALLOWED_ORIGINS),
];

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  const corsOrigin = resolveCorsOrigin(req.headers.origin, allowedOrigins);
  if (corsOrigin) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Ventus-Version', 'v1');
  res.setHeader('X-Request-ID', requestId);
  req.requestId = requestId;
  next();
});

app.options('*splat', (req, res) => res.sendStatus(200));

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
app.use(async (req, res, next) => {
  if (req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(403).json({ error: 'API key required' });

  const db = await getDB();
  await db.connect();
  try {
    const result = await db.query(
      `UPDATE api_keys SET last_used_at = NOW()
       WHERE key = $1 AND is_active = true
       RETURNING bank_id`,
      [apiKey]
    );
    if (result.rows.length === 0)
      return res.status(403).json({ error: 'Invalid or inactive API key' });
    req.bankId = result.rows[0].bank_id;
    next();
  } catch (e) {
    console.error('[AUTH]', e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────
app.get('/v1/customers/:id/profile', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    const pillars = await db.query(
      `SELECT pillar, total_spend, transaction_count, avg_transaction,
              pct_of_total_spend, last_purchase_date, analyzed_at
       FROM customer_pillar_profiles
       WHERE customer_id = $1 AND bank_id = $2
       ORDER BY total_spend DESC`,
      [id, req.bankId]
    );

    if (pillars.rows.length === 0)
      return res.status(404).json({ error: 'Customer not found' });

    const totalSpend = pillars.rows.reduce(
      (sum, p) => sum + parseFloat(p.total_spend || 0),
      0
    );

    res.status(200).json({
      customer_id: id,
      bank_id: req.bankId,
      total_spend: Math.round(totalSpend * 100) / 100,
      pillars: pillars.rows.map((p) => ({
        pillar: p.pillar,
        total_spend: parseFloat(p.total_spend),
        transaction_count: parseInt(p.transaction_count),
        avg_transaction: parseFloat(p.avg_transaction),
        pct_of_total_spend: parseFloat(p.pct_of_total_spend),
        last_purchase_date: p.last_purchase_date,
        analyzed_at: p.analyzed_at,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── LIFE EVENTS ──────────────────────────────────────────────────────────────
app.get('/v1/customers/:id/life-events', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    const allEvents = await db.query(
      `SELECT id, event_name, event_type, event_category, confidence, urgency_timeline,
              status, is_dismissed, talking_points, next_steps,
              project_type, estimated_start_year, duration_years,
              estimated_total_cost, estimated_current_savings,
              recommended_monthly_contribution, cost_breakdown,
              recommended_funding_sources, recommended_products,
              signal_category, signal_name, insight,
              first_detected_at, last_confirmed_at, detected_at
       FROM customer_life_events
       WHERE customer_id = $1 AND bank_id = $2
       AND status = 'active' AND is_dismissed = false
       ORDER BY confidence DESC`,
      [id, req.bankId]
    );

    if (allEvents.rows.length === 0)
      return res.status(404).json({ error: 'No life events found' });

    const withEvidence = [];
    for (const event of allEvents.rows) {
      const evidence = await db.query(
        `SELECT lee.transaction_id, te.clean_merchant_name as merchant,
                te.amount, te.transaction_date as date, lee.relevance
         FROM life_event_evidence lee
         LEFT JOIN transactions_enriched te ON lee.transaction_id = te.transaction_id
         WHERE lee.life_event_id = $1`,
        [event.id]
      );
      withEvidence.push({ ...event, evidence: evidence.rows });
    }

    // ── Canonical life events ────────────────────────────────────────────────
    const lifeEvents = withEvidence
      .filter((e) => e.event_category === 'life_event')
      .map((e) => ({
        id: e.id,
        event_name: e.event_name,
        event_type: e.event_type,
        confidence: e.confidence,
        urgency_timeline:
          !e.urgency_timeline || e.urgency_timeline === 'Unknown'
            ? getDefaultUrgencyTimeline(e.event_name)
            : e.urgency_timeline,
        status: e.status,
        talking_points: e.talking_points,
        next_steps: e.next_steps,
        insight: e.insight,
        recommended_products: e.recommended_products,
        ...(e.estimated_total_cost || e.project_type
          ? {
              financial_projection: {
                project_type: e.project_type,
                estimated_start_year: e.estimated_start_year,
                duration_years: e.duration_years,
                estimated_total_cost: e.estimated_total_cost,
                estimated_current_savings: e.estimated_current_savings,
                recommended_monthly_contribution:
                  e.recommended_monthly_contribution,
                cost_breakdown: e.cost_breakdown,
                recommended_funding_sources: e.recommended_funding_sources,
              },
            }
          : {}),
        first_detected_at: e.first_detected_at,
        last_confirmed_at: e.last_confirmed_at,
        detected_at: e.detected_at,
        evidence: e.evidence,
      }));

    // ── Behavioral signals ───────────────────────────────────────────────────
    const behavioralSignals = withEvidence
      .filter((e) => e.event_category === 'behavioral')
      .map((e) => ({
        id: e.id,
        signal_category: e.signal_category,
        signal_name: e.signal_name,
        confidence: e.confidence,
        status: e.status,
        talking_points: e.talking_points,
        first_detected_at: e.first_detected_at,
        last_confirmed_at: e.last_confirmed_at,
        detected_at: e.detected_at,
        evidence: e.evidence,
      }));

    res.status(200).json({
      customer_id: id,
      life_events: lifeEvents,
      behavioral_signals: behavioralSignals,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── PURCHASE SIGNALS ─────────────────────────────────────────────────────────
app.get('/v1/customers/:id/purchase-signals', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    const now = new Date();
    const daysElapsedThisMonth = now.getDate();
    const daysInLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();

    // ── Pillars to exclude from purchase cycle intel ─────────────────────────
    const EXCLUDED_PILLARS = new Set([
      'Travel & Exploration',
      'Financial & Aspirational',
      'Miscellaneous & Unclassified',
    ]);

    // ── Spend trend — current vs last month normalized by days ───────────────
    const spendTrend = await db.query(
      `SELECT
        lifestyle_category as pillar,
        SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', NOW())
            THEN amount ELSE 0 END) as current_month_spend,
        SUM(CASE WHEN transaction_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
            AND transaction_date < DATE_TRUNC('month', NOW())
            THEN amount ELSE 0 END) as last_month_spend,
        COUNT(CASE WHEN transaction_date >= DATE_TRUNC('month', NOW())
            THEN 1 END) as current_month_txn_count,
        COUNT(CASE WHEN transaction_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
            AND transaction_date < DATE_TRUNC('month', NOW())
            THEN 1 END) as last_month_txn_count
      FROM transactions_enriched
      WHERE customer_id = $1 AND bank_id = $2
      AND transaction_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
      AND lifestyle_category NOT IN ('Travel & Exploration', 'Financial & Aspirational', 'Miscellaneous & Unclassified')
      GROUP BY lifestyle_category`,
      [id, req.bankId]
    );

    // ── Gap detection — days since last purchase per pillar ──────────────────
    const gapDetection = await db.query(
      `SELECT
        lifestyle_category as pillar,
        MAX(transaction_date)::date as last_purchase_date,
        (NOW()::date - MAX(transaction_date)::date) as days_since_last_purchase
      FROM transactions_enriched
      WHERE customer_id = $1 AND bank_id = $2
      AND lifestyle_category NOT IN ('Travel & Exploration', 'Financial & Aspirational', 'Miscellaneous & Unclassified')
      GROUP BY lifestyle_category`,
      [id, req.bankId]
    );

    // ── Purchase frequency — avg days between purchases ──────────────────────
    const purchaseFrequency = await db.query(
      `SELECT
        lifestyle_category as pillar,
        COUNT(*) as transaction_count,
        MIN(transaction_date)::date as first_purchase_date,
        MAX(transaction_date)::date as last_purchase_date,
        CASE
          WHEN COUNT(*) >= 2 THEN
            EXTRACT(EPOCH FROM (MAX(transaction_date)::timestamp - MIN(transaction_date)::timestamp))
            / NULLIF(COUNT(*) - 1, 0) / 86400
          ELSE NULL
        END as avg_days_between_purchases
      FROM transactions_enriched
      WHERE customer_id = $1 AND bank_id = $2
      AND transaction_date >= NOW() - INTERVAL '12 months'
      AND lifestyle_category NOT IN ('Travel & Exploration', 'Financial & Aspirational', 'Miscellaneous & Unclassified')
      GROUP BY lifestyle_category
      HAVING COUNT(*) >= 2`,
      [id, req.bankId]
    );

    // ── Monthly breakdown — 12 months of spend per pillar ───────────────────
    const monthlyBreakdown = await db.query(
      `SELECT
        lifestyle_category as pillar,
        TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') as month,
        SUM(amount) as monthly_spend,
        COUNT(*) as transaction_count
      FROM transactions_enriched
      WHERE customer_id = $1 AND bank_id = $2
      AND transaction_date >= NOW() - INTERVAL '12 months'
      GROUP BY lifestyle_category, DATE_TRUNC('month', transaction_date)
      ORDER BY lifestyle_category, month ASC`,
      [id, req.bankId]
    );

    // ── Travel frequency — calculated from trips not transactions ────────────
    const travelFrequency = await db.query(
      `SELECT
        COUNT(*) as trip_count,
        MIN(trip_start)::date as first_trip_date,
        MAX(trip_start)::date as last_trip_date,
        MAX(trip_end)::date as last_trip_end,
        SUM(total_trip_spend) as total_travel_spend,
        CASE
          WHEN COUNT(*) >= 2 THEN
            EXTRACT(EPOCH FROM (MAX(trip_start)::timestamp - MIN(trip_start)::timestamp))
            / NULLIF(COUNT(*) - 1, 0) / 86400
          ELSE NULL
        END as avg_days_between_trips
      FROM customer_trips
      WHERE customer_id = $1 AND bank_id = $2
      AND trip_start >= NOW() - INTERVAL '12 months'`,
      [id, req.bankId]
    );

    if (spendTrend.rows.length === 0 && gapDetection.rows.length === 0) {
      return res.status(404).json({ error: 'No purchase data found' });
    }

    // ── Build monthly breakdown map ──────────────────────────────────────────
    const monthlyMap = {};
    for (const row of monthlyBreakdown.rows) {
      if (!monthlyMap[row.pillar]) monthlyMap[row.pillar] = [];
      monthlyMap[row.pillar].push({
        month: row.month,
        spend: Math.round(parseFloat(row.monthly_spend) * 100) / 100,
        transaction_count: parseInt(row.transaction_count),
      });
    }

    // ── Build pillar map ──────────────────────────────────────────────────────
    const pillarMap = {};

    for (const row of gapDetection.rows) {
      if (EXCLUDED_PILLARS.has(row.pillar)) continue;
      pillarMap[row.pillar] = {
        pillar: row.pillar,
        last_purchase_date: row.last_purchase_date,
        days_since_last_purchase: parseInt(row.days_since_last_purchase),
        monthly_breakdown: monthlyMap[row.pillar] || [],
      };
    }

    for (const row of spendTrend.rows) {
      if (EXCLUDED_PILLARS.has(row.pillar)) continue;
      if (!pillarMap[row.pillar]) {
        pillarMap[row.pillar] = {
          pillar: row.pillar,
          monthly_breakdown: monthlyMap[row.pillar] || [],
        };
      }

      const currentSpend = parseFloat(row.current_month_spend || 0);
      const lastSpend = parseFloat(row.last_month_spend || 0);

      const currentDailyAvg =
        daysElapsedThisMonth > 0 ? currentSpend / daysElapsedThisMonth : 0;
      const currentMonthProjected = currentDailyAvg * daysInLastMonth;

      let trendPct = null;
      let trendDirection = 'flat';

      if (lastSpend > 0) {
        trendPct = Math.round(
          ((currentMonthProjected - lastSpend) / lastSpend) * 100
        );
        if (trendPct > 5) trendDirection = 'up';
        else if (trendPct < -5) trendDirection = 'down';
        else trendDirection = 'flat';
      } else if (currentSpend > 0) {
        trendDirection = 'new';
        trendPct = null;
      }

      pillarMap[row.pillar] = {
        ...pillarMap[row.pillar],
        current_month_spend: Math.round(currentSpend * 100) / 100,
        last_month_spend: Math.round(lastSpend * 100) / 100,
        current_month_projected: Math.round(currentMonthProjected * 100) / 100,
        trend_pct: trendPct,
        trend_direction: trendDirection,
        current_month_txn_count: parseInt(row.current_month_txn_count || 0),
        last_month_txn_count: parseInt(row.last_month_txn_count || 0),
      };
    }

    // ── Add defaults for pillars missing spend trend data ────────────────────
    for (const key of Object.keys(pillarMap)) {
      if (pillarMap[key].current_month_spend === undefined) {
        pillarMap[key].current_month_spend = 0;
        pillarMap[key].last_month_spend = 0;
        pillarMap[key].current_month_projected = 0;
        pillarMap[key].trend_pct = null;
        pillarMap[key].trend_direction = 'inactive';
        pillarMap[key].current_month_txn_count = 0;
        pillarMap[key].last_month_txn_count = 0;
      }
    }

    for (const row of purchaseFrequency.rows) {
      if (EXCLUDED_PILLARS.has(row.pillar)) continue;
      if (!pillarMap[row.pillar]) continue;

      const avgDays = row.avg_days_between_purchases
        ? Math.round(parseFloat(row.avg_days_between_purchases))
        : null;

      const daysSince = pillarMap[row.pillar].days_since_last_purchase;
      const lastPurchase = pillarMap[row.pillar].last_purchase_date;
      const isHighFrequency = avgDays !== null && avgDays <= 60;

      let predictedNextPurchase = null;
      let purchaseOverdue = false;

      if (isHighFrequency && lastPurchase) {
        const lastDate = new Date(lastPurchase);
        const predictedDate = new Date(lastDate);
        predictedDate.setDate(predictedDate.getDate() + avgDays);
        predictedNextPurchase = predictedDate.toISOString().split('T')[0];
        purchaseOverdue = daysSince > avgDays * 1.5;
      }

      pillarMap[row.pillar] = {
        ...pillarMap[row.pillar],
        transaction_count_12m: parseInt(row.transaction_count),
        avg_days_between_purchases: avgDays,
        is_high_frequency: isHighFrequency,
        predicted_next_purchase: predictedNextPurchase,
        purchase_overdue: purchaseOverdue,
      };
    }

    // ── Build sorted pillar signals ───────────────────────────────────────────
    const purchaseSignals = Object.values(pillarMap).sort(
      (a, b) =>
        (a.days_since_last_purchase || 0) - (b.days_since_last_purchase || 0)
    );

    // ── Add travel signal if customer has recurring trips ────────────────────
    const travel = travelFrequency.rows[0];
    if (travel && parseInt(travel.trip_count) >= 2) {
      const avgDaysBetweenTrips = travel.avg_days_between_trips
        ? Math.round(parseFloat(travel.avg_days_between_trips))
        : null;
      const isFrequentTraveler =
        avgDaysBetweenTrips !== null && avgDaysBetweenTrips <= 60;
      const daysSinceLastTrip = travel.last_trip_end
        ? Math.round(
            (new Date() - new Date(travel.last_trip_end)) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      let predictedNextTrip = null;
      let tripOverdue = false;

      if (isFrequentTraveler && travel.last_trip_date) {
        const lastDate = new Date(travel.last_trip_date);
        const predictedDate = new Date(lastDate);
        predictedDate.setDate(predictedDate.getDate() + avgDaysBetweenTrips);
        predictedNextTrip = predictedDate.toISOString().split('T')[0];
        tripOverdue =
          daysSinceLastTrip !== null &&
          daysSinceLastTrip > avgDaysBetweenTrips * 1.5;
      }

      if (isFrequentTraveler) {
        purchaseSignals.push({
          pillar: 'Travel & Exploration',
          trip_count_12m: parseInt(travel.trip_count),
          last_trip_end: travel.last_trip_end,
          days_since_last_trip: daysSinceLastTrip,
          avg_days_between_trips: avgDaysBetweenTrips,
          total_travel_spend_12m: parseFloat(travel.total_travel_spend),
          is_high_frequency: true,
          predicted_next_trip: predictedNextTrip,
          trip_overdue: tripOverdue,
          monthly_breakdown: monthlyMap['Travel & Exploration'] || [],
        });
      }
    }

    res.status(200).json({
      customer_id: id,
      generated_at: new Date().toISOString(),
      days_elapsed_this_month: daysElapsedThisMonth,
      purchase_signals: purchaseSignals,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── TRIPS ────────────────────────────────────────────────────────────────────
app.get('/v1/customers/:id/trips', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    const trips = await db.query(
      `SELECT trip_id, destination, trip_start, trip_end,
              trip_duration_days, total_trip_spend, transaction_count,
              transport_spend, lodging_spend, dining_spend,
              activities_spend, other_spend, detected_at
       FROM customer_trips
       WHERE customer_id = $1 AND bank_id = $2
       ORDER BY trip_start DESC`,
      [id, req.bankId]
    );

    if (trips.rows.length === 0)
      return res.status(404).json({ error: 'No trips found' });

    res.status(200).json({
      customer_id: id,
      trips: trips.rows.map((t) => ({
        ...t,
        is_upcoming: new Date(t.trip_end) > new Date(),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── RISK FACTORS ─────────────────────────────────────────────────────────────
app.get('/v1/customers/:id/risk-factors', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    const result = await db.query(
      `SELECT id, transaction_id, category_group, category_label,
              severity, merchant, amount, transaction_date, reason, detected_at
       FROM customer_risk_factors
       WHERE customer_id = $1 AND bank_id = $2
       ORDER BY 
         CASE severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         detected_at DESC`,
      [id, req.bankId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No risk factors found' });

    res.status(200).json({
      customer_id: id,
      risk_factors: result.rows,
      summary: {
        total: result.rows.length,
        high: result.rows.filter((r) => r.severity === 'high').length,
        medium: result.rows.filter((r) => r.severity === 'medium').length,
        low: result.rows.filter((r) => r.severity === 'low').length,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
app.get('/v1/customers/:id/transactions', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    const {
      pillar,
      date_from,
      date_to,
      confidence_min,
      limit = 50,
      offset = 0,
    } = req.query;
    if (!id) return res.status(400).json({ error: 'Customer ID required' });

    let conditions = ['customer_id = $1', 'bank_id = $2'];
    let params = [id, req.bankId];
    let paramIdx = 3;

    if (pillar) {
      conditions.push(`lifestyle_category = $${paramIdx++}`);
      params.push(pillar);
    }
    if (date_from) {
      conditions.push(`transaction_date >= $${paramIdx++}`);
      params.push(date_from);
    }
    if (date_to) {
      conditions.push(`transaction_date <= $${paramIdx++}`);
      params.push(date_to);
    }
    if (confidence_min) {
      conditions.push(`confidence_score >= $${paramIdx++}`);
      params.push(parseFloat(confidence_min));
    }

    const transactions = await db.query(
      `SELECT transaction_id, clean_merchant_name, lifestyle_category,
              merchant_category, amount, pre_tax_amount, tax_amount,
              tax_rate, tax_state, transaction_date, confidence_score,
              inferred_purchase, trip_id, zip_code
       FROM transactions_enriched
       WHERE ${conditions.join(' AND ')}
       ORDER BY transaction_date DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    if (transactions.rows.length === 0)
      return res.status(404).json({ error: 'No transactions found' });

    res.status(200).json({
      customer_id: id,
      total: transactions.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      transactions: transactions.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── BANK ANALYTICS ───────────────────────────────────────────────────────────
app.get('/v1/analytics/bank', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const bankId = req.bankId;

    const overview = await db.query(
      `SELECT COUNT(DISTINCT customer_id) as total_customers,
              COUNT(*) as total_transactions,
              SUM(amount) as total_spend,
              AVG(amount) as avg_transaction,
              AVG(confidence_score) as avg_confidence
       FROM transactions_enriched WHERE bank_id = $1`,
      [bankId]
    );

    const pillars = await db.query(
      `SELECT lifestyle_category as pillar,
              COUNT(*) as transaction_count,
              SUM(amount) as total_spend,
              COUNT(DISTINCT customer_id) as customer_count,
              ROUND((SUM(amount)::numeric / NULLIF((SELECT SUM(amount) FROM transactions_enriched WHERE bank_id = $1), 0) * 100), 2) as pct_of_total
       FROM transactions_enriched WHERE bank_id = $1
       GROUP BY lifestyle_category ORDER BY total_spend DESC`,
      [bankId]
    );

    const lifeEvents = await db.query(
      `SELECT event_name, COUNT(*) as count,
              ROUND(AVG(confidence)::numeric, 2) as avg_confidence
       FROM customer_life_events
       WHERE bank_id = $1
       AND status = 'active'
       AND event_category = 'life_event'
       GROUP BY event_name
       ORDER BY count DESC`,
      [bankId]
    );

    const behavioralSignals = await db.query(
      `SELECT signal_category, COUNT(*) as count,
              ROUND(AVG(confidence)::numeric, 2) as avg_confidence
       FROM customer_life_events
       WHERE bank_id = $1
       AND status = 'active'
       AND event_category = 'behavioral'
       GROUP BY signal_category
       ORDER BY count DESC`,
      [bankId]
    );

    const riskSummary = await db.query(
      `SELECT category_group, severity,
              COUNT(DISTINCT customer_id) as customer_count
       FROM customer_risk_factors WHERE bank_id = $1
       GROUP BY category_group, severity
       ORDER BY
         CASE severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         customer_count DESC`,
      [bankId]
    );

    const topMerchants = await db.query(
      `SELECT clean_merchant_name as merchant,
              COUNT(*) as transaction_count,
              SUM(amount) as total_spend,
              COUNT(DISTINCT customer_id) as customer_count
       FROM transactions_enriched WHERE bank_id = $1
       GROUP BY clean_merchant_name
       ORDER BY total_spend DESC LIMIT 10`,
      [bankId]
    );

    const segments = await db.query(
      `SELECT signal_category as segment,
              COUNT(DISTINCT customer_id) as customer_count,
              ROUND(AVG(confidence)::numeric, 2) as avg_confidence
       FROM customer_life_events
       WHERE bank_id = $1
       AND event_category = 'behavioral'
       AND status = 'active'
       GROUP BY signal_category
       ORDER BY customer_count DESC
       LIMIT 10`,
      [bankId]
    );

    const ov = overview.rows[0];
    res.status(200).json({
      bank_id: bankId,
      generated_at: new Date().toISOString(),
      overview: {
        total_customers: parseInt(ov.total_customers),
        total_transactions: parseInt(ov.total_transactions),
        total_spend: parseFloat(parseFloat(ov.total_spend).toFixed(2)),
        avg_transaction: parseFloat(parseFloat(ov.avg_transaction).toFixed(2)),
        avg_confidence: parseFloat(parseFloat(ov.avg_confidence).toFixed(2)),
      },
      pillar_distribution: pillars.rows.map((p) => ({
        pillar: p.pillar,
        transaction_count: parseInt(p.transaction_count),
        total_spend: parseFloat(p.total_spend),
        customer_count: parseInt(p.customer_count),
        pct_of_total: parseFloat(p.pct_of_total),
      })),
      life_event_summary: lifeEvents.rows.map((e) => ({
        event_name: e.event_name,
        count: parseInt(e.count),
        avg_confidence: parseFloat(e.avg_confidence),
      })),
      behavioral_signal_summary: behavioralSignals.rows.map((b) => ({
        signal_category: b.signal_category,
        count: parseInt(b.count),
        avg_confidence: parseFloat(b.avg_confidence),
      })),
      risk_summary: riskSummary.rows.map((r) => ({
        risk_type: r.category_group,
        severity: r.severity,
        customer_count: parseInt(r.customer_count),
      })),
      top_merchants: topMerchants.rows.map((m) => ({
        merchant: m.merchant,
        transaction_count: parseInt(m.transaction_count),
        total_spend: parseFloat(m.total_spend),
        customer_count: parseInt(m.customer_count),
      })),
      segments: segments.rows.map((s) => ({
        segment: s.segment,
        display_name: SEGMENT_DISPLAY_NAMES[s.segment] || s.segment,
        customer_count: parseInt(s.customer_count),
        avg_confidence: parseFloat(s.avg_confidence),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── JOBS ─────────────────────────────────────────────────────────────────────
app.get('/v1/jobs', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { s3_key } = req.query;
    if (!s3_key)
      return res.status(400).json({ error: 's3_key query param required' });

    const job = await db.query(
      `SELECT batch_id, bank_id, customer_id, source_file,
              transaction_count, status, error_message,
              ingested_at, classified_at, pillar_analyzed_at,
              travel_detected_at, lifestyle_analyzed_at, risk_analyzed_at, completed_at
       FROM pipeline_runs
       WHERE source_file = $1 AND bank_id = $2
       ORDER BY ingested_at DESC`,
      [s3_key, req.bankId]
    );

    if (job.rows.length === 0)
      return res.status(404).json({ error: 'Job not found' });

    res.status(200).json({
      job_id: job.rows[0].batch_id,
      status: job.rows[0].status,
      bank_id: job.rows[0].bank_id,
      transaction_count: job.rows[0].transaction_count,
      source_file: job.rows[0].source_file,
      customers: job.rows.map((r) => ({
        customer_id: r.customer_id,
        status: r.status,
        error_message: r.error_message,
        timestamps: {
          ingested_at: r.ingested_at,
          classified_at: r.classified_at,
          pillar_analyzed_at: r.pillar_analyzed_at,
          travel_detected_at: r.travel_detected_at,
          lifestyle_analyzed_at: r.lifestyle_analyzed_at,
          risk_analyzed_at: r.risk_analyzed_at,
          completed_at: r.completed_at,
        },
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.get('/v1/jobs/:id', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Job ID required' });

    const job = await db.query(
      `SELECT batch_id, bank_id, customer_id, source_file,
              transaction_count, status, error_message,
              ingested_at, classified_at, pillar_analyzed_at,
              travel_detected_at, lifestyle_analyzed_at, risk_analyzed_at, completed_at
       FROM pipeline_runs
       WHERE batch_id = $1 AND bank_id = $2`,
      [id, req.bankId]
    );

    if (job.rows.length === 0)
      return res.status(404).json({ error: 'Job not found' });

    res.status(200).json({
      job_id: id,
      status: job.rows[0].status,
      bank_id: job.rows[0].bank_id,
      transaction_count: job.rows[0].transaction_count,
      source_file: job.rows[0].source_file,
      customers: job.rows.map((r) => ({
        customer_id: r.customer_id,
        status: r.status,
        error_message: r.error_message,
        timestamps: {
          ingested_at: r.ingested_at,
          classified_at: r.classified_at,
          pillar_analyzed_at: r.pillar_analyzed_at,
          travel_detected_at: r.travel_detected_at,
          lifestyle_analyzed_at: r.lifestyle_analyzed_at,
          risk_analyzed_at: r.risk_analyzed_at,
          completed_at: r.completed_at,
        },
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── ENRICH ───────────────────────────────────────────────────────────────────
app.post('/v1/enrich', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const bank_id = req.bankId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'transactions array required' });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);
    const batchId = `batch_${timestamp}_api_${bank_id}`;

    for (const txn of transactions) {
      await db.query(
        `INSERT INTO transactions_raw
          (transaction_id, customer_id, bank_id, batch_id, raw_merchant,
           amount, transaction_date, mcc_code, zip_code, source_file, processed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'api',false)
         ON CONFLICT (transaction_id) DO NOTHING`,
        [
          txn.transaction_id,
          txn.customer_id,
          bank_id,
          batchId,
          txn.merchant_name,
          txn.amount,
          txn.date,
          txn.mcc_code || null,
          txn.zip_code || null,
        ]
      );
    }

    const customerGroups = {};
    for (const txn of transactions) {
      const cid = txn.customer_id || 'unknown';
      if (!customerGroups[cid]) customerGroups[cid] = [];
      customerGroups[cid].push(txn);
    }

    for (const [customerId, txns] of Object.entries(customerGroups)) {
      await db.query(
        `INSERT INTO pipeline_runs
          (batch_id, bank_id, customer_id, source_file, transaction_count, status, ingested_at)
         VALUES ($1,$2,$3,'api',$4,'ingested',NOW())
         ON CONFLICT (batch_id, customer_id) DO NOTHING`,
        [batchId, bank_id, customerId, txns.length]
      );
    }

    for (const [customerId, txns] of Object.entries(customerGroups)) {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.CLASSIFY_QUEUE_URL,
          MessageBody: JSON.stringify({
            batch_id: batchId,
            customer_id: customerId,
            bank_id,
            transaction_count: txns.length,
          }),
        })
      );
    }

    res.status(202).json({
      batch_id: batchId,
      status: 'ingested',
      transaction_count: transactions.length,
      customers: Object.keys(customerGroups).length,
      message: `Pipeline triggered. Poll /v1/jobs/${batchId} for status.`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── WEBHOOKS ─────────────────────────────────────────────────────────────────
app.get('/v1/webhooks', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '50', 10) || 50, 1), 100);

    const result = await db.query(
      `SELECT webhook_id, bank_id, url, events, is_active, created_at, updated_at
       FROM webhook_registrations
       WHERE bank_id = $1
       ORDER BY updated_at DESC, created_at DESC
       LIMIT $2`,
      [req.bankId, limit]
    );

    res.status(200).json({
      bank_id: req.bankId,
      webhooks: result.rows,
      limit,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.get('/v1/webhook-deliveries', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '50', 10) || 50, 1), 100);

    // ── Decode keyset cursor ─────────────────────────────────────────────────
    // Cursor encodes { ts: ISO string, id: delivery_id } of the last item seen.
    let cursorTs = null;
    let cursorId = null;
    if (req.query.cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(req.query.cursor, 'base64').toString('utf8'));
        cursorTs = decoded.ts;
        cursorId = decoded.id;
        if (!cursorTs || !cursorId) throw new Error('incomplete');
      } catch {
        return res.status(400).json({ error: 'invalid cursor' });
      }
    }

    const filters = ['bank_id = $1'];
    const values = [req.bankId];

    if (req.query.webhook_id) {
      values.push(req.query.webhook_id);
      filters.push(`webhook_id = $${values.length}`);
    }

    if (req.query.status) {
      if (!['delivered', 'failed'].includes(req.query.status)) {
        return res.status(400).json({ error: 'status must be delivered or failed' });
      }
      values.push(req.query.status);
      filters.push(`status = $${values.length}`);
    }

    if (cursorTs && cursorId) {
      values.push(cursorTs, cursorId);
      filters.push(
        `(last_attempted_at, delivery_id) < ($${values.length - 1}::timestamptz, $${values.length})`
      );
    }

    // Fetch limit+1 to determine whether a next page exists.
    values.push(limit + 1);
    const result = await db.query(
      `SELECT delivery_id, webhook_id, bank_id, event_type, target_url,
              attempt_count, status, status_code, error_message, created_at,
              last_attempted_at, delivered_at, replay_of_delivery_id
       FROM webhook_delivery_attempts
       WHERE ${filters.join(' AND ')}
       ORDER BY last_attempted_at DESC, delivery_id DESC
       LIMIT $${values.length}`,
      values
    );

    const hasMore = result.rows.length > limit;
    const deliveries = hasMore ? result.rows.slice(0, limit) : result.rows;

    let nextCursor = null;
    if (hasMore) {
      const last = deliveries[deliveries.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({ ts: last.last_attempted_at, id: last.delivery_id })
      ).toString('base64');
    }

    res.status(200).json({
      bank_id: req.bankId,
      deliveries,
      limit,
      has_more: hasMore,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.post('/v1/webhook-deliveries/:delivery_id/replay', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const result = await db.query(
      `SELECT d.delivery_id, d.webhook_id, d.bank_id, d.event_type, d.target_url,
              d.status, d.payload_json, w.secret, w.is_active
       FROM webhook_delivery_attempts d
       LEFT JOIN webhook_registrations w
         ON w.webhook_id = d.webhook_id AND w.bank_id = d.bank_id
       WHERE d.delivery_id = $1 AND d.bank_id = $2`,
      [req.params.delivery_id, req.bankId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Webhook delivery not found' });

    const originalDelivery = result.rows[0];
    if (originalDelivery.status !== 'failed') {
      return res.status(409).json({ error: 'Only failed webhook deliveries can be replayed' });
    }
    if (!originalDelivery.payload_json) {
      return res.status(409).json({ error: 'Webhook delivery is missing replay payload' });
    }
    if (!originalDelivery.is_active) {
      return res.status(409).json({ error: 'Webhook registration is not active' });
    }

    const delivery = await deliverWebhookReplay({
      db,
      originalDelivery,
      webhook: { secret: originalDelivery.secret },
    });

    res.status(delivery.delivered ? 200 : 502).json({
      webhook_id: originalDelivery.webhook_id,
      event: originalDelivery.event_type,
      ...delivery,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.post('/v1/webhooks', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const bank_id = req.bankId;
    const { url, events, secret } = req.body;

    if (!url || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'url and events array required' });
    }

    if (!validateWebhookUrl(url)) {
      return res.status(400).json({ error: 'webhook url must be a valid https URL' });
    }

    const invalidEvents = events.filter((e) => !WEBHOOK_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`,
      });
    }

    const webhookId = `wh_${bank_id}_${Date.now()}`;

    const result = await db.query(
      `INSERT INTO webhook_registrations
        (webhook_id, bank_id, url, events, secret, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (bank_id, url) DO UPDATE SET
         events     = EXCLUDED.events,
         secret     = EXCLUDED.secret,
         is_active  = true,
         updated_at = NOW()
       RETURNING webhook_id, bank_id, url, events, is_active, created_at, updated_at`,
      [webhookId, bank_id, url, events, secret || null]
    );

    res.status(201).json({
      webhook_id: result.rows[0].webhook_id,
      bank_id: result.rows[0].bank_id,
      url: result.rows[0].url,
      events: result.rows[0].events,
      is_active: result.rows[0].is_active,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      message: 'Webhook registered successfully',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.delete('/v1/webhooks/:webhook_id', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const result = await db.query(
      `UPDATE webhook_registrations
       SET is_active = false, updated_at = NOW()
       WHERE webhook_id = $1 AND bank_id = $2
       RETURNING webhook_id, bank_id, url, events, is_active, updated_at`,
      [req.params.webhook_id, req.bankId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Webhook not found' });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

app.post('/v1/webhooks/:webhook_id/test', async (req, res) => {
  const db = await getDB();
  await db.connect();
  try {
    const result = await db.query(
      `SELECT webhook_id, bank_id, url, events, secret, is_active
       FROM webhook_registrations
       WHERE webhook_id = $1 AND bank_id = $2 AND is_active = true`,
      [req.params.webhook_id, req.bankId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Active webhook not found' });

    let delivery;
    try {
      delivery = await deliverWebhookTest({
        db,
        webhook: result.rows[0],
        bankId: req.bankId,
      });
    } catch (error) {
      console.warn('[WEBHOOK] Test delivery failed:', error.message);
      delivery = {
        delivery_id: crypto.randomUUID(),
        status_code: null,
        delivered: false,
      };
    }

    res.status(delivery.delivered ? 200 : 502).json({
      webhook_id: result.rows[0].webhook_id,
      event: 'webhook_test',
      ...delivery,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export const handler = serverless(app);
