// Normalizes raw Plaid /transactions/sync (and /processor/transactions/sync)
// payloads into the Ventus enrichment input contract consumed by POST /v1/enrich.
//
// Inputs are the raw Plaid `payload` plus a `mapping_context` that supplies the
// bank-owned account -> customer and account -> home ZIP mappings (Ventus never
// receives PII directly from Plaid; the partner provides these maps).
//
// The output partitions every added/modified record into one of:
//   - transactions: accepted, enrichment-ready records
//   - rejected_records: records held back with reason codes (never silently dropped)
//   - removed_transaction_ids: Plaid "removed" ids that must not be re-enriched
//
// Heuristic note: the merchant-name and source-profile rules below are tuned to
// the current partner-ingest QA fixtures. The partner contract documents a
// longer-term merchant_name fallback order; revisit these once real Plaid
// distributions are available (see fixtures/evaluation/partner-ingest-contracts.json).

const SOURCE_SYSTEM = 'plaid';

export const RAILS = Object.freeze({
  CARD: 'card',
  ACH: 'ach',
  P2P: 'p2p',
  WIRE: 'wire',
});

const P2P_TEXT = /\b(zelle|venmo|cash\s?app|paypal)\b/i;
const WIRE_TEXT = /\b(wire|escrow)\b/i;

// Plaid personal_finance_category.primary -> Ventus source_profile suffix.
// Covers Plaid's full set of ~16 primary categories so source_profile carries
// real signal instead of collapsing to "_general".
const PFC_PRIMARY_TO_PROFILE = Object.freeze({
  INCOME: 'income',
  TRANSFER_IN: 'transfer',
  TRANSFER_OUT: 'transfer',
  LOAN_PAYMENTS: 'loan',
  BANK_FEES: 'fees',
  ENTERTAINMENT: 'entertainment',
  FOOD_AND_DRINK: 'dining',
  GENERAL_MERCHANDISE: 'retail',
  HOME_IMPROVEMENT: 'home_improvement',
  MEDICAL: 'medical',
  PERSONAL_CARE: 'personal_care',
  GENERAL_SERVICES: 'services',
  GOVERNMENT_AND_NON_PROFIT: 'government',
  TRANSPORTATION: 'transport',
  TRAVEL: 'travel',
  RENT_AND_UTILITIES: 'utilities',
});

// Finer-grained overrides keyed on personal_finance_category.detailed. Lets a
// specific detailed category win over its broad primary bucket (e.g. wages map
// to payroll, streaming maps to subscription).
const PFC_DETAILED_TO_PROFILE = Object.freeze({
  INCOME_WAGES: 'payroll',
  ENTERTAINMENT_TV_AND_MOVIES: 'subscription',
});

const DEFAULT_ALLOWED_CURRENCIES = ['USD'];

const RETRYABLE_REASON_CODES = new Set([
  'missing_account_customer_mapping',
  'missing_home_zip_mapping',
  'missing_merchant_or_counterparty',
  // Pending records re-arrive as posted, so holding them back is retryable.
  'pending_transaction_excluded',
]);

const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Title-cases an upper/mixed-case raw description, e.g.
// "ACME CORP PAYROLL" -> "Acme Corp Payroll".
export function titleCase(value) {
  return value
    .trim()
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ');
}

function firstCounterparty(txn) {
  return Array.isArray(txn.counterparties) && txn.counterparties.length > 0
    ? txn.counterparties[0]
    : null;
}

// Plaid sign convention: positive amounts are money OUT of the account (a debit /
// consumer spend), negative amounts are money IN (a credit such as payroll).
export function derivePlaidTransactionType(amount) {
  return typeof amount === 'number' && amount < 0 ? 'credit' : 'debit';
}

export function derivePlaidRail(txn, account) {
  const text = `${txn.name ?? ''} ${txn.original_description ?? ''}`;
  const counterparties = Array.isArray(txn.counterparties) ? txn.counterparties : [];

  if (counterparties.some((cp) => cp?.type === 'payment_app') || P2P_TEXT.test(text)) {
    return RAILS.P2P;
  }
  if (WIRE_TEXT.test(text)) {
    return RAILS.WIRE;
  }
  if (account?.type === 'credit') {
    return RAILS.CARD;
  }

  const pfcPrimary = txn.personal_finance_category?.primary ?? null;
  const isInflowCategory = pfcPrimary === 'INCOME' || pfcPrimary === 'TRANSFER_IN' || pfcPrimary === 'TRANSFER_OUT';
  if (!isInflowCategory && (txn.payment_channel === 'in store' || txn.payment_channel === 'online')) {
    return RAILS.CARD;
  }
  return RAILS.ACH;
}

export function derivePlaidSourceProfile(rail, txn) {
  const pfc = txn.personal_finance_category ?? null;
  const detailed = pfc?.detailed ?? null;
  const primary = pfc?.primary ?? null;
  const suffix =
    (detailed && PFC_DETAILED_TO_PROFILE[detailed]) ||
    PFC_PRIMARY_TO_PROFILE[primary] ||
    'general';
  return `${rail}_${suffix}`;
}

// Resolves the cleanest merchant string available on the Plaid record.
// Returns null when no usable merchant/counterparty/description exists, which
// makes the record a reject candidate rather than letting the model infer a
// merchant from insufficient evidence.
export function derivePlaidMerchantName(txn) {
  if (isNonEmptyString(txn.merchant_name)) {
    return txn.merchant_name.trim();
  }
  const counterparty = firstCounterparty(txn);
  // Financial-institution counterparties (wires, escrow, transfers) are the
  // cleanest entity name; the raw `name` usually carries rail noise prefixes.
  if (counterparty?.type === 'financial_institution' && isNonEmptyString(counterparty.name)) {
    return counterparty.name.trim();
  }
  if (isNonEmptyString(txn.name)) {
    return titleCase(txn.name);
  }
  if (isNonEmptyString(txn.original_description)) {
    return titleCase(txn.original_description);
  }
  if (counterparty && isNonEmptyString(counterparty.name)) {
    return counterparty.name.trim();
  }
  return null;
}

function normalizeZip(value) {
  return typeof value === 'string' && ZIP_PATTERN.test(value) ? value : null;
}

function buildRawExcerpt(txn) {
  return {
    transaction_id: txn.transaction_id ?? null,
    account_id: txn.account_id ?? null,
    amount: txn.amount ?? null,
    date: txn.date ?? null,
    merchant_name: txn.merchant_name ?? null,
  };
}

function reasonForCodes(reasonCodes) {
  if (
    reasonCodes.includes('missing_account_customer_mapping') ||
    reasonCodes.includes('missing_home_zip_mapping')
  ) {
    return 'Plaid account_id is not present in the account-to-customer or account-to-home-ZIP mapping context. Do not enrich until the bank customer mapping is supplied.';
  }
  if (reasonCodes.includes('missing_merchant_or_counterparty')) {
    return 'Plaid record has no usable merchant_name, name, original_description, or counterparty fallback. Do not enrich because the model would be forced to infer a merchant from insufficient evidence.';
  }
  if (reasonCodes.includes('unsupported_currency')) {
    return 'Plaid record uses a currency Ventus does not enrich. Do not enrich until a supported-currency conversion or policy is defined.';
  }
  if (reasonCodes.includes('pending_transaction_excluded')) {
    return 'Plaid record is still pending. Hold it back until it posts so unsettled spend is not enriched twice; lineage is preserved via partner_metadata.source_transaction_id.';
  }
  return 'Plaid record failed normalization and was held back from enrichment.';
}

function evaluateRejectCodes(txn, options) {
  const { accountCustomerMap, accountHomeZipMap, allowedCurrencies, excludePending } = options;
  const reasonCodes = [];
  const accountId = txn.account_id;

  if (!isNonEmptyString(txn.transaction_id)) {
    reasonCodes.push('missing_transaction_id');
  }
  if (!isNonEmptyString(accountId)) {
    reasonCodes.push('missing_account_id');
    return reasonCodes;
  }
  if (!accountCustomerMap[accountId]) {
    reasonCodes.push('missing_account_customer_mapping');
  }
  if (!accountHomeZipMap[accountId]) {
    reasonCodes.push('missing_home_zip_mapping');
  }
  if (reasonCodes.length > 0) {
    return reasonCodes;
  }

  if (typeof txn.amount !== 'number' || !Number.isFinite(txn.amount)) {
    reasonCodes.push(txn.amount === undefined ? 'missing_amount' : 'invalid_amount');
  }
  if (!isNonEmptyString(txn.date)) {
    reasonCodes.push('missing_date');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(txn.date)) {
    reasonCodes.push('invalid_date');
  }
  if (derivePlaidMerchantName(txn) === null) {
    reasonCodes.push('missing_merchant_or_counterparty');
  }
  if (allowedCurrencies && !isSupportedCurrency(txn, allowedCurrencies)) {
    reasonCodes.push('unsupported_currency');
  }
  // Hold pending records until they post so unsettled spend is never enriched
  // (and never enriched twice when the posted version arrives in `modified`).
  if (excludePending && txn.pending === true) {
    reasonCodes.push('pending_transaction_excluded');
  }
  return reasonCodes;
}

// Plaid sets unofficial_currency_code for non-standard currencies (e.g. crypto)
// and iso_currency_code for ISO-4217 currencies; the two are mutually exclusive.
function isSupportedCurrency(txn, allowedCurrencies) {
  if (isNonEmptyString(txn.unofficial_currency_code)) {
    return false;
  }
  if (isNonEmptyString(txn.iso_currency_code)) {
    return allowedCurrencies.includes(txn.iso_currency_code);
  }
  // No currency declared: defer to amount/merchant checks rather than rejecting.
  return true;
}

function normalizeOne(txn, context) {
  const { accountsById, accountCustomerMap, accountHomeZipMap } = context;
  const account = accountsById[txn.account_id] ?? null;
  const rail = derivePlaidRail(txn, account);
  const counterparty = firstCounterparty(txn);

  const partnerMetadata = {
    source_system: SOURCE_SYSTEM,
    source_transaction_id: txn.transaction_id,
  };
  if (isNonEmptyString(txn.pending_transaction_id)) {
    partnerMetadata.pending_transaction_id = txn.pending_transaction_id;
  }
  partnerMetadata.account_id = txn.account_id;
  partnerMetadata.payment_channel = txn.payment_channel ?? null;
  partnerMetadata.personal_finance_category = txn.personal_finance_category?.detailed ?? null;
  partnerMetadata.counterparty_type = counterparty?.type ?? null;

  return {
    transaction_id: txn.transaction_id,
    customer_id: accountCustomerMap[txn.account_id],
    merchant_name: derivePlaidMerchantName(txn),
    amount: txn.amount,
    date: txn.date,
    mcc_code: null,
    zip_code: normalizeZip(txn.location?.postal_code ?? null),
    home_zip: accountHomeZipMap[txn.account_id] ?? null,
    rail,
    source_profile: derivePlaidSourceProfile(rail, txn),
    transaction_type: derivePlaidTransactionType(txn.amount),
    partner_metadata: partnerMetadata,
  };
}

/**
 * Normalize a raw Plaid /transactions/sync payload into Ventus enrichment input.
 *
 * @param {object} input
 * @param {object} input.payload - raw Plaid sync payload (accounts/added/modified/removed/...)
 * @param {object} input.mapping_context - bank-supplied account_customer_map & account_home_zip_map
 * @param {object} [options]
 * @param {boolean} [options.excludePending=true] - hold pending records out of enrichment until they post
 * @param {string[]|null} [options.allowedCurrencies=['USD']] - reject other currencies; null disables the check
 * @returns {{transactions: object[], rejected_records: object[], removed_records: object[], removed_transaction_ids: string[], next_cursor: string|null, has_more: boolean, summary: object}}
 */
export function normalizePlaidTransactionsSync({ payload, mapping_context } = {}, options = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('normalizePlaidTransactionsSync requires a payload object');
  }
  const excludePending = options.excludePending !== false;
  const allowedCurrencies =
    options.allowedCurrencies === undefined ? DEFAULT_ALLOWED_CURRENCIES : options.allowedCurrencies;
  const accountCustomerMap = mapping_context?.account_customer_map ?? {};
  const accountHomeZipMap = mapping_context?.account_home_zip_map ?? {};

  const accountsById = {};
  for (const account of payload.accounts ?? []) {
    if (account && isNonEmptyString(account.account_id)) {
      accountsById[account.account_id] = account;
    }
  }

  const context = { accountsById, accountCustomerMap, accountHomeZipMap };
  const added = Array.isArray(payload.added) ? payload.added : [];
  const modified = Array.isArray(payload.modified) ? payload.modified : [];

  const evalOptions = { accountCustomerMap, accountHomeZipMap, allowedCurrencies, excludePending };
  const transactions = [];
  const rejectedRecords = [];

  for (const txn of [...added, ...modified]) {
    const reasonCodes = evaluateRejectCodes(txn, evalOptions);
    if (reasonCodes.length > 0) {
      rejectedRecords.push({
        source_record_id: txn.transaction_id ?? null,
        account_id: txn.account_id ?? null,
        reason_codes: reasonCodes,
        reason: reasonForCodes(reasonCodes),
        retryable: reasonCodes.every((code) => RETRYABLE_REASON_CODES.has(code)),
        raw_excerpt: buildRawExcerpt(txn),
      });
      continue;
    }
    transactions.push(normalizeOne(txn, context));
  }

  // Plaid "removed" ids must be superseded/deleted downstream, never enriched as
  // new transactions. We surface a structured instruction plus the bare id list.
  const removedRecords = (Array.isArray(payload.removed) ? payload.removed : [])
    .map((entry) => ({
      source_transaction_id: typeof entry === 'string' ? entry : entry?.transaction_id,
      account_id: typeof entry === 'string' ? null : entry?.account_id ?? null,
      reason_code: 'removed_transaction_not_enriched',
    }))
    .filter((record) => isNonEmptyString(record.source_transaction_id));
  const removedTransactionIds = removedRecords.map((record) => record.source_transaction_id);

  return {
    transactions,
    rejected_records: rejectedRecords,
    removed_records: removedRecords,
    removed_transaction_ids: removedTransactionIds,
    next_cursor: typeof payload.next_cursor === 'string' ? payload.next_cursor : null,
    has_more: payload.has_more === true,
    summary: {
      total_raw_records: added.length + modified.length + removedTransactionIds.length,
      accepted_records: transactions.length,
      rejected_records: rejectedRecords.length,
      removed_records: removedTransactionIds.length,
    },
  };
}
