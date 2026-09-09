// Production-fidelity capture for the merchant_classification task.
//
// Instead of prompting the model with an eval-authored prompt, this drives the
// SHARED production classification core (backend/shared/pipeline/classify-core.mjs) — the
// exact prompt, tool schema, input summarization, batching, retry/sub-batch
// fallback, and post-processing that the ventus-classify-transactions Lambda's
// HTTP path runs. The only thing that changes per run is the model.
//
// The model's raw output ({ normalized_merchant, pillar, subcategory, confidence })
// is mapped to the enrichment contract the golden scorer expects, mirroring how
// the Lambda writes transactions_enriched (writeEnrichedToRDS):
//   normalized_merchant -> clean_merchant_name  (partner_context stripped)
//   pillar              -> lifestyle_category   (fallback Miscellaneous & Unclassified)
//   subcategory         -> merchant_category    (fallback General)
//   confidence          -> confidence_score     (fallback 0.1)

import {
  classifyTransactionSummaries,
  stripPartnerContext,
  summarizeHttpTransaction,
} from '../../../shared/pipeline/classify-core.mjs';

/**
 * Map one raw transaction + its classification into an enrichment-contract row.
 * Fallbacks match the Lambda's writeEnrichedToRDS defaults.
 */
export function toEnrichmentPrediction(transaction, classification) {
  const cleanMerchant = classification?.normalized_merchant
    ? stripPartnerContext(classification.normalized_merchant)
    : stripPartnerContext(transaction.merchant_name);
  return {
    transaction_id: transaction.transaction_id,
    clean_merchant_name: cleanMerchant,
    lifestyle_category: classification?.pillar || 'Miscellaneous & Unclassified',
    merchant_category: classification?.subcategory || 'General',
    confidence_score:
      typeof classification?.confidence === 'number' ? classification.confidence : 0.1,
  };
}

/**
 * Turn the model's classification array into enrichment-contract predictions,
 * joined back to the input transactions by transaction_id.
 */
export function mapClassificationsToPredictions(transactions, classifications) {
  const byId = new Map((classifications || []).map((c) => [c.transaction_id, c]));
  return transactions.map((txn) => toEnrichmentPrediction(txn, byId.get(txn.transaction_id)));
}

/**
 * Capture predictions for the fidelity classify task by running the production core.
 *
 * @param {object} options
 * @param {object} options.gateway       model gateway (chatCompletion)
 * @param {string} options.model         model id to evaluate
 * @param {string} [options.provider]    provider override (e.g. 'gemini' to match prod, 'openrouter' to compare)
 * @param {object[]} options.transactions HTTP-shaped transactions from the enrich fixture
 * @param {string} [options.fallbackModel] defaults to model
 * @returns {Promise<{ predictions: object[], latency_ms: number, classified: number, total: number }>}
 */
export async function captureClassificationFidelity({
  gateway,
  model,
  provider,
  transactions,
  fallbackModel,
}) {
  if (!gateway) throw new Error('captureClassificationFidelity requires a gateway');
  if (!model) throw new Error('captureClassificationFidelity requires a model');
  if (!Array.isArray(transactions)) throw new Error('captureClassificationFidelity requires transactions[]');

  const summaries = transactions.map(summarizeHttpTransaction);
  const startedAt = Date.now();
  const classifications = await classifyTransactionSummaries(summaries, {
    modelGateway: gateway,
    model,
    fallbackModel: fallbackModel || model,
    ...(provider ? { provider } : {}),
    // Eval runs never publish CloudWatch metrics.
    onRateLimit: () => {},
  });
  const latencyMs = Date.now() - startedAt;

  const predictions = mapClassificationsToPredictions(transactions, classifications);
  return {
    predictions,
    latency_ms: latencyMs,
    classified: classifications.length,
    total: transactions.length,
  };
}
