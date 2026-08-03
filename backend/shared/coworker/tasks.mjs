// backend/shared/coworker/tasks.mjs
//
// The Coworker's task tools. Two flavors:
//
//  1. Deterministic, model-free logic (intent tool schema, evidence retrieval,
//     audience build). These are the auditable core: given the same portfolio,
//     they always produce the same ranked candidates, benefit bands, and
//     suppression decisions. Fully offline-testable.
//
//  2. Model-backed narration (prep, summary, reply prose). These wrap the model
//     gateway and are injected so tests can stub them.
//
// All external/inferred attributes are returned tagged so render.mjs can badge
// them; benefit figures are modeled estimates carrying an explicit assumption.

// ---------------------------------------------------------------------------
// Intent classification
// ---------------------------------------------------------------------------

export const COWORKER_TASK_TYPES = [
  'audience_build', // "who should I pitch product X to"
  'prep', // "prep me for my meeting with household Y"
  'evidence', // "what do we know about household Y"
  'summary', // "summarize this thread / recap"
  'other', // anything else -> polite clarification
];

export const INTENT_TOOL = [
  {
    type: 'function',
    function: {
      name: 'classify_intent',
      description:
        "Classify a wealth advisor's email to the AI coworker into a single task type and extract entities.",
      parameters: {
        type: 'object',
        properties: {
          task_type: {
            type: 'string',
            enum: COWORKER_TASK_TYPES,
            description: 'The single best-fit task for this message.',
          },
          product_id: {
            type: ['string', 'null'],
            description: 'Catalog product id if the advisor named/implied a product, else null.',
          },
          household_id: {
            type: ['string', 'null'],
            description: 'Household id if the advisor named a specific household, else null.',
          },
          confidence: {
            type: 'number',
            description: 'Confidence 0-1 in the task_type classification.',
          },
        },
        required: ['task_type', 'confidence'],
      },
    },
  },
];

export const INTENT_PROMPT = `You are the routing brain for a wealth-management AI coworker that advisors email.
Read the advisor's message and pick exactly one task_type:
- audience_build: they want a list/audience of households to target for a product.
- prep: they want to be prepared for a meeting/call with a specific household.
- evidence: they want to know what we already know about a household.
- summary: they want a recap of the conversation or prior work.
- other: greetings, unclear asks, or anything that needs clarification.
Extract product_id and household_id only if clearly identifiable. Never guess ids you were not given hints for; use null instead. Always call classify_intent.`;

/**
 * Classify an inbound message into a task. Model-backed but tolerant: on any
 * failure it falls back to task_type "other" with low confidence.
 * @param {object} gateway  model gateway
 * @param {object} msg      { subject, body, catalog }
 *   catalog (optional) lets us feed the known product ids into the prompt so the
 *   model returns an exact id rather than a free-text name.
 */
export async function classifyIntent(gateway, { subject = '', body = '', catalog = [] }) {
  const productLine = (catalog || []).length
    ? `\n\nKnown catalog products (set product_id to the exact id on the left, not the display name): ${catalog
        .map((p) => `${p.id} (${p.name})`)
        .join(', ')}.`
    : '';
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_intent_classification',
      label: 'COWORKER intent',
      maxRetries: 1,
      messages: [
        { role: 'system', content: `${INTENT_PROMPT}${productLine}` },
        { role: 'user', content: `Subject: ${subject}\n\n${body}` },
      ],
      tools: INTENT_TOOL,
      tool_choice: { type: 'function', function: { name: 'classify_intent' } },
    });
    if (!response.ok) return fallbackIntent();
    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return fallbackIntent();
    const args = JSON.parse(call.function.arguments);
    return {
      task_type: COWORKER_TASK_TYPES.includes(args.task_type) ? args.task_type : 'other',
      product_id: args.product_id ?? null,
      household_id: args.household_id ?? null,
      confidence: typeof args.confidence === 'number' ? args.confidence : 0.4,
    };
  } catch {
    return fallbackIntent();
  }
}

function fallbackIntent() {
  return { task_type: 'other', product_id: null, household_id: null, confidence: 0.2 };
}

// ---------------------------------------------------------------------------
// Evidence retrieval (deterministic)
// ---------------------------------------------------------------------------

/**
 * Gather the modeled evidence we hold on a household: signals + a compact
 * transaction rollup. Returns plain strings ready to bullet in a reply; each is
 * a modeled attribute (the caller badges them).
 */
export function retrieveEvidence({ provider, householdId }) {
  const household = provider.getHousehold(householdId);
  if (!household) return { found: false, householdId, bullets: [], signals: null };

  const signals = provider.getSignals(householdId) || {};
  const bullets = [];

  for (const ev of signals.life_events || []) {
    bullets.push(`Life event: ${ev.type} (${ev.confidence_band} confidence) - ${ev.evidence}`);
  }
  for (const b of signals.behavioral || []) {
    bullets.push(`${b.name} [${b.level}] - ${b.evidence}`);
  }
  for (const r of signals.risk || []) {
    bullets.push(`Risk: ${r.type} [${r.band}] - ${r.evidence}`);
  }
  const fin = signals.financial || {};
  if (fin.idle_cash_usd != null) {
    bullets.push(
      `Financial posture: ${fin.posture}; idle cash ~$${Number(fin.idle_cash_usd).toLocaleString('en-US')}, monthly surplus ~$${Number(fin.monthly_surplus_usd).toLocaleString('en-US')}.`
    );
  }

  return { found: true, householdId, household, signals, bullets };
}

// ---------------------------------------------------------------------------
// Audience build (deterministic back-test) -- the auditable centerpiece
// ---------------------------------------------------------------------------

const IDLE_CASH_TOKEN_THRESHOLD = 25000;

/** Normalize a product string for tolerant matching: lowercase, alnum-only, single-spaced. */
function normalizeProductMention(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolve a free-text product mention from the intent model (e.g. "travel card",
 * "High Yield Savings") to a catalog product. The model routinely returns a human
 * product name rather than the exact catalog id, so match tolerantly against the
 * id, the hyphen-normalized id, and the display name. Returns the product or null.
 * Ambiguous mentions (matching >1 product by containment) return null so the
 * caller can ask for clarification rather than guess.
 */
export function resolveProduct(catalog = [], mention) {
  if (!mention) return null;
  const q = normalizeProductMention(mention);
  if (!q) return null;
  // 1. Exact id, or id with hyphens normalized to spaces ("travel-card" ~ "travel card").
  const byId = catalog.find((p) => p.id === mention || normalizeProductMention(p.id) === q);
  if (byId) return byId;
  // 2. Exact normalized display-name match ("Travel Rewards Card").
  const byName = catalog.find((p) => normalizeProductMention(p.name) === q);
  if (byName) return byName;
  // 3. Containment either direction as a last resort; only when unambiguous.
  const contains = catalog.filter((p) => {
    const id = normalizeProductMention(p.id);
    const name = normalizeProductMention(p.name);
    return id.includes(q) || q.includes(id) || name.includes(q) || q.includes(name);
  });
  return contains.length === 1 ? contains[0] : null;
}

/**
 * Reduce a household's signals + financials to a flat token set used for fit
 * matching. Tokens include behavioral names, life-event types, risk types, and
 * a few derived financial tokens.
 */
export function householdTokens(signals = {}) {
  const tokens = new Set();
  for (const b of signals.behavioral || []) tokens.add(b.name);
  for (const ev of signals.life_events || []) tokens.add(ev.type);
  for (const r of signals.risk || []) tokens.add(r.type);
  const fin = signals.financial || {};
  if (Number(fin.idle_cash_usd) >= IDLE_CASH_TOKEN_THRESHOLD) tokens.add('idle_cash');
  if (fin.home_equity_usd != null) tokens.add('home_equity');
  if (fin.student_loan_balance_usd != null) tokens.add('student_loan_balance');
  if (Number(fin.monthly_surplus_usd) <= 0) tokens.add('no_monthly_surplus');
  return tokens;
}

/** Hard gates: any disqualifier present in the household's risk/derived tokens. */
function findDisqualifier(product, tokens, signals) {
  const riskTypes = new Set((signals.risk || []).map((r) => r.type));
  for (const dq of product.disqualifiers || []) {
    if (riskTypes.has(dq) || tokens.has(dq)) return dq;
  }
  return null;
}

/** Count of product target_signals satisfied by the household token set. */
function fitScore(product, tokens) {
  const matched = (product.target_signals || []).filter((s) => tokens.has(s));
  return { score: matched.length, matched };
}

/**
 * Modeled annual benefit for a household/product pair. Transparent, category-
 * driven heuristics; every branch returns an explicit assumption string. This
 * is a modeled estimate, never a promise.
 */
export function modeledBenefit({ product, household, signals, provider }) {
  const fin = signals.financial || {};
  const idle = Number(fin.idle_cash_usd) || 0;
  switch (product.category) {
    case 'Deposits': {
      if (product.id === 'high-yield-savings') {
        const delta = 0.0425 - 0.005; // HYSA APY vs typical checking yield
        return {
          usd: idle * delta,
          assumption: `Idle cash (~$${idle.toLocaleString('en-US')}) at 4.25% APY vs ~0.5% today.`,
        };
      }
      return { usd: 0, assumption: 'No direct dollar benefit modeled for this deposit product.' };
    }
    case 'Cards': {
      const spend = annualTravelDiningSpend({ provider, householdId: household.id });
      return {
        usd: spend * 0.02, // ~2% net reward uplift on category spend
        assumption: `~2% net rewards uplift on ~$${Math.round(spend).toLocaleString('en-US')}/yr travel & dining spend.`,
      };
    }
    case 'Wealth': {
      // Value of putting idle cash to work under advice vs sitting in cash.
      const delta = 0.04;
      return {
        usd: idle * delta,
        assumption: `~4% modeled annual return delta on ~$${idle.toLocaleString('en-US')} currently idle.`,
      };
    }
    case 'Lending': {
      if (product.id === 'student-loan-refi' && fin.student_loan_balance_usd) {
        const rate = Number(fin.student_loan_rate_pct) || 8.9;
        const refi = 6.5;
        const bal = Number(fin.student_loan_balance_usd);
        return {
          usd: (bal * (rate - refi)) / 100,
          assumption: `Refi ~$${bal.toLocaleString('en-US')} from ${rate}% to ~${refi}%.`,
        };
      }
      return { usd: 0, assumption: 'Benefit depends on draw amount/underwriting; not estimable here.' };
    }
    default:
      return { usd: 0, assumption: 'No dollar benefit modeled; value is planning/protection.' };
  }
}

function annualTravelDiningSpend({ provider, householdId }) {
  const txns = provider.getTransactions(householdId) || [];
  const windowDays = 90; // fixtures cover ~one quarter
  const inScope = txns.filter(
    (t) =>
      t.direction === 'debit' &&
      (/(travel|dining|restaurant|food)/i.test(t.pillar || '') ||
        /(dining|restaurant|flight|lodging|hotel)/i.test(t.subcategory || ''))
  );
  const sum = inScope.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  return (sum / windowDays) * 365;
}

/**
 * Build a ranked target audience for a product across an advisor's book.
 * Deterministic: fit score, then modeled benefit, breaking ties by household id.
 * Households hitting a hard disqualifier are suppressed with the reason.
 *
 * @returns {{ product, candidates, suppressed, considered }}
 */
export function buildAudience({ provider, advisorId, productId, minFit = 1 }) {
  const product = resolveProduct(provider.getCatalog() || [], productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  if (!advisor) throw new Error(`Unknown advisor: ${advisorId}`);

  const candidates = [];
  const suppressed = [];

  for (const householdId of advisor.household_ids) {
    const household = provider.getHousehold(householdId);
    if (!household) continue;
    const signals = provider.getSignals(householdId) || {};
    const tokens = householdTokens(signals);

    const dq = findDisqualifier(product, tokens, signals);
    if (dq) {
      suppressed.push({ household_id: householdId, household_name: household.name, reason: dq });
      continue;
    }

    const { score, matched } = fitScore(product, tokens);
    if (score < minFit) continue;

    const benefit = modeledBenefit({ product, household, signals, provider });
    candidates.push({
      household_id: householdId,
      household_name: household.name,
      fit_score: score,
      matched_signals: matched,
      modeled_annual_benefit_usd: Math.round(benefit.usd),
      benefit_assumption: benefit.assumption,
      rationale: matched.length
        ? `Matches ${matched.join(', ')}.`
        : 'Qualifies on product targeting.',
    });
  }

  candidates.sort(
    (a, b) =>
      b.fit_score - a.fit_score ||
      b.modeled_annual_benefit_usd - a.modeled_annual_benefit_usd ||
      (a.household_id < b.household_id ? -1 : 1)
  );

  return {
    product: { id: product.id, name: product.name, category: product.category },
    candidates,
    suppressed,
    considered: advisor.household_ids.length,
  };
}

/**
 * Build a proactive digest for an advisor: scan the whole catalog against their
 * book and, per household, keep the single best (highest modeled benefit)
 * non-suppressed opportunity. Deterministic; used by the scheduled digest sender.
 *
 * @returns {{ advisorId, items, scannedProducts }}
 */
export function buildAdvisorDigest({ provider, advisorId, maxItems = 5 }) {
  const catalog = provider.getCatalog() || [];
  const bestByHousehold = new Map();

  for (const product of catalog) {
    let audience;
    try {
      audience = buildAudience({ provider, advisorId, productId: product.id });
    } catch {
      continue;
    }
    for (const c of audience.candidates) {
      const item = {
        household_id: c.household_id,
        household_name: c.household_name,
        product: audience.product,
        fit_score: c.fit_score,
        modeled_annual_benefit_usd: c.modeled_annual_benefit_usd,
        rationale: c.rationale,
        benefit_assumption: c.benefit_assumption,
      };
      const existing = bestByHousehold.get(c.household_id);
      if (!existing || item.modeled_annual_benefit_usd > existing.modeled_annual_benefit_usd) {
        bestByHousehold.set(c.household_id, item);
      }
    }
  }

  const items = [...bestByHousehold.values()].sort(
    (a, b) =>
      b.modeled_annual_benefit_usd - a.modeled_annual_benefit_usd ||
      b.fit_score - a.fit_score ||
      (a.household_id < b.household_id ? -1 : 1)
  );

  return { advisorId, items: items.slice(0, maxItems), scannedProducts: catalog.length };
}

// ---------------------------------------------------------------------------
// Model-backed narration
// ---------------------------------------------------------------------------

/**
 * Generate meeting-prep prose for a household. Model-backed; on failure returns
 * a deterministic fallback built from evidence so a reply always goes out.
 */
export async function generatePrep({ gateway, provider, householdId }) {
  const evidence = retrieveEvidence({ provider, householdId });
  if (!evidence.found) {
    return { text: `I couldn't find a household matching "${householdId}" in your book.`, evidence };
  }
  const context = {
    household: evidence.household,
    signals: evidence.signals,
  };
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_prep',
      label: 'COWORKER prep',
      maxRetries: 1,
      messages: [
        {
          role: 'system',
          content:
            'You are a wealth-management coworker prepping an advisor for a client meeting. Be concise and peer-toned. Ground every claim in the provided modeled signals. End with one concrete talking point. Do not invent figures.',
        },
        { role: 'user', content: JSON.stringify(context) },
      ],
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, evidence };
    }
  } catch {
    /* fall through to deterministic fallback */
  }
  return {
    text: `Here's what we know going in:\n- ${evidence.bullets.join('\n- ')}`,
    evidence,
  };
}

/** Summarize a thread from its stored turns. Model-backed with a safe fallback. */
export async function summarizeThread({ gateway, turns = [] }) {
  const transcript = turns
    .map((t) => `[${t.direction || '?'}] ${t.summary || t.text || ''}`)
    .join('\n');
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_summary',
      label: 'COWORKER summary',
      maxRetries: 1,
      messages: [
        {
          role: 'system',
          content:
            'Summarize this advisor/coworker email thread in 3-5 crisp bullets: what was asked, what was delivered, and the open next step.',
        },
        { role: 'user', content: transcript || '(no prior turns)' },
      ],
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {
    /* fall through */
  }
  return `This thread has ${turns.length} turn(s). (Summary model unavailable.)`;
}
