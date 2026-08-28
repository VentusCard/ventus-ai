// Ingest-format dispatch for POST /v1/enrich.
//
// An API key carries an `ingest_format` (see api_keys.ingest_format). The API
// uses it to decide how the caller's request body is turned into the canonical
// list of enrichment transactions:
//   - 'normalized' : caller already sends Ventus-shaped { transactions }
//   - 'plaid'      : caller sends raw Plaid { mapping_context, payload }, which
//                    we normalize server-side via the Plaid normalizer.
//
// Adding a new partner source (e.g. jack_henry, fiserv) is a new case here plus
// a new normalizer module — no changes to the API plumbing or the pipeline.

import { normalizePlaidTransactionsSync } from './plaid-transactions-sync.mjs';

export const SUPPORTED_INGEST_FORMATS = ['normalized', 'plaid'];

export function isSupportedIngestFormat(format) {
  return SUPPORTED_INGEST_FORMATS.includes(format);
}

/**
 * Resolve a request body into enrichment transactions for the given ingest
 * format.
 *
 * @param {string} format - the caller's ingest_format
 * @param {object} body - the parsed request body
 * @returns {{ transactions: object[], report: object|null }}
 *   `transactions` is the canonical enrichment input; `report` carries the
 *   partner-format reject/removed details (null for already-normalized input).
 * @throws {Error} if the format is unsupported
 */
export function normalizeIngest(format, body = {}) {
  switch (format) {
    case 'normalized':
      return { transactions: body.transactions, report: null };

    case 'plaid': {
      const result = normalizePlaidTransactionsSync({
        payload: body.payload,
        mapping_context: body.mapping_context,
      });
      return {
        transactions: result.transactions,
        report: {
          rejected_records: result.rejected_records,
          removed_records: result.removed_records,
          removed_transaction_ids: result.removed_transaction_ids,
          next_cursor: result.next_cursor,
          has_more: result.has_more,
          summary: result.summary,
        },
      };
    }

    default:
      throw new Error(`unsupported ingest_format: ${format}`);
  }
}
