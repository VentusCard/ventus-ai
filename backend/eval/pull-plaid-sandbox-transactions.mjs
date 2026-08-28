import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const outputRoot = resolve(
  process.env.PLAID_SANDBOX_OUTPUT_DIR ||
    join(backendRoot, 'artifacts', 'plaid-sandbox', timestampForPath())
);

const clientId = process.env.PLAID_CLIENT_ID;
const secret = process.env.PLAID_SECRET;
const baseUrl = process.env.PLAID_BASE_URL || 'https://sandbox.plaid.com';
const READY_STATUSES = new Set(['INITIAL_UPDATE_COMPLETE', 'HISTORICAL_UPDATE_COMPLETE']);

assert.ok(clientId, 'PLAID_CLIENT_ID is required');
assert.ok(secret, 'PLAID_SECRET is required');

const manifest = loadManifest();
mkdirSync(outputRoot, { recursive: true });

const runSummary = {
  run_id: manifest.run_id || timestampForPath(),
  generated_at: new Date().toISOString(),
  environment: 'sandbox',
  institution_id: manifest.institution_id,
  output_dir: outputRoot,
  users: [],
};

for (const [index, user] of manifest.users.entries()) {
  const label = user.customer_id || `sandbox_customer_${String(index + 1).padStart(3, '0')}`;
  console.log(`pulling Plaid sandbox transactions for ${label}`);

  const publicToken = await createSandboxPublicToken(user);
  const tokenExchange = await plaidRequest('/item/public_token/exchange', {
    public_token: publicToken,
  });
  const accessToken = tokenExchange.access_token;

  const syncResponse = await syncTransactions(accessToken);
  const safeUserId = label.replace(/[^a-zA-Z0-9_-]/g, '_');
  const rawPath = join(outputRoot, `${safeUserId}-transactions-sync-raw.json`);
  const metadataPath = join(outputRoot, `${safeUserId}-metadata.json`);

  writeFileSync(rawPath, `${JSON.stringify(redactPlaidResponse(syncResponse), null, 2)}\n`);
  writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        customer_id: label,
        institution_id: user.institution_id || manifest.institution_id,
        products: user.products || manifest.products,
        raw_transactions_path: rawPath,
        item_id: tokenExchange.item_id,
        request_ids: {
          exchange: tokenExchange.request_id,
          transactions_sync: syncResponse.request_id,
        },
        transactions_update_status: syncResponse.transactions_update_status || null,
        sync_attempts: syncResponse.sync_attempts || null,
        counts: {
          added: syncResponse.added?.length || 0,
          modified: syncResponse.modified?.length || 0,
          removed: syncResponse.removed?.length || 0,
          accounts: syncResponse.accounts?.length || 0,
        },
      },
      null,
      2
    )}\n`
  );

  runSummary.users.push({
    customer_id: label,
    item_id: tokenExchange.item_id,
    raw_transactions_path: rawPath,
    transactions_update_status: syncResponse.transactions_update_status || null,
    sync_attempts: syncResponse.sync_attempts || null,
    added: syncResponse.added?.length || 0,
    modified: syncResponse.modified?.length || 0,
    removed: syncResponse.removed?.length || 0,
    accounts: syncResponse.accounts?.length || 0,
  });
}

const summaryPath = join(outputRoot, 'run-summary.json');
writeFileSync(summaryPath, `${JSON.stringify(runSummary, null, 2)}\n`);

console.log(`Plaid sandbox pull complete: ${runSummary.users.length} user(s)`);
console.log(`summary: ${summaryPath}`);

function loadManifest() {
  if (process.env.PLAID_SANDBOX_USERS_PATH) {
    return normalizeManifest(readJson(resolve(process.env.PLAID_SANDBOX_USERS_PATH)));
  }

  const count = Number(process.env.PLAID_SANDBOX_USER_COUNT || 5);
  assert.ok(Number.isInteger(count) && count > 0 && count <= 50, 'PLAID_SANDBOX_USER_COUNT must be 1-50');
  return normalizeManifest({
    run_id: `plaid_sandbox_${timestampForPath()}`,
    institution_id: process.env.PLAID_SANDBOX_INSTITUTION_ID || 'ins_109508',
    products: ['transactions'],
    country_codes: ['US'],
    transactions: {
      start_date: process.env.PLAID_SANDBOX_START_DATE || daysAgo(120),
      end_date: process.env.PLAID_SANDBOX_END_DATE || today(),
    },
    users: Array.from({ length: count }, (_, index) => ({
      customer_id: `qa_plaid_sandbox_${String(index + 1).padStart(3, '0')}`,
      username: 'user_good',
      password: 'pass_good',
    })),
  });
}

function normalizeManifest(value) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'manifest must be an object');
  assert.ok(Array.isArray(value.users) && value.users.length > 0, 'manifest.users must be a non-empty array');
  assert.ok(value.users.length <= 50, 'manifest.users should be 50 or fewer for a single sandbox pull');
  assert.ok(value.institution_id, 'manifest.institution_id is required');

  return {
    products: ['transactions'],
    country_codes: ['US'],
    transactions: {
      start_date: daysAgo(120),
      end_date: today(),
    },
    ...value,
  };
}

async function createSandboxPublicToken(user) {
  const options = {
    override_username: user.username || 'user_good',
    override_password: user.password || 'pass_good',
    transactions: user.transactions || manifest.transactions,
  };

  if (user.custom_user) {
    options.override_username = user.username || 'user_custom';
    options.override_password = JSON.stringify(user.custom_user);
  }

  const response = await plaidRequest('/sandbox/public_token/create', {
    institution_id: user.institution_id || manifest.institution_id,
    initial_products: user.products || manifest.products,
    options,
  });
  return response.public_token;
}

// Pulls the full /transactions/sync history for a freshly created sandbox Item.
//
// Plaid fetches transactions for a new Item asynchronously, so the first sync
// after item creation returns `transactions_update_status: NOT_READY` with an
// empty `added[]` and an empty cursor. We nudge the Item with a refresh + a
// simulated SYNC_UPDATES_AVAILABLE webhook, then poll with backoff until the
// Item reports a completed update status (or starts returning data).
async function syncTransactions(accessToken) {
  const maxAttempts = Number(process.env.PLAID_SYNC_MAX_ATTEMPTS || 12);
  const baseDelayMs = Number(process.env.PLAID_SYNC_BASE_DELAY_MS || 1500);
  const maxDelayMs = Number(process.env.PLAID_SYNC_MAX_DELAY_MS || 8000);

  let cursor = null;
  const added = [];
  const modified = [];
  const removed = [];
  let latest = null;
  let attempt = 0;
  let nudged = false;

  while (attempt < maxAttempts) {
    attempt += 1;

    // Drain every available page for the current cursor before judging readiness.
    let hasMore = true;
    while (hasMore) {
      latest = await plaidRequest('/transactions/sync', {
        access_token: accessToken,
        cursor,
        count: 500,
        options: {
          include_personal_finance_category: true,
        },
      });
      added.push(...(latest.added || []));
      modified.push(...(latest.modified || []));
      removed.push(...(latest.removed || []));
      if (typeof latest.next_cursor === 'string' && latest.next_cursor.length > 0) {
        cursor = latest.next_cursor;
      }
      hasMore = latest.has_more === true;
    }

    const status = latest.transactions_update_status;
    const hasData = added.length > 0 || modified.length > 0 || removed.length > 0;
    if (READY_STATUSES.has(status) || hasData) {
      return { ...latest, added, modified, removed, sync_attempts: attempt };
    }

    // Item still initializing. Trigger a refresh + simulated webhook once, then
    // back off and poll again until data lands or we exhaust our attempts.
    if (!nudged) {
      await triggerTransactionsRefresh(accessToken);
      await fireSandboxWebhook(accessToken);
      nudged = true;
    }
    if (attempt < maxAttempts) {
      const delay = Math.min(baseDelayMs * attempt, maxDelayMs);
      console.log(
        `  transactions ${status || 'NOT_READY'}; retry ${attempt}/${maxAttempts} in ${delay}ms`
      );
      await sleep(delay);
    }
  }

  console.warn(
    `  WARNING: transactions still not ready after ${attempt} attempt(s) (status: ${
      latest?.transactions_update_status || 'unknown'
    }); writing what was returned`
  );
  return { ...latest, added, modified, removed, sync_attempts: attempt };
}

async function triggerTransactionsRefresh(accessToken) {
  try {
    await plaidRequest('/transactions/refresh', { access_token: accessToken });
  } catch (error) {
    console.warn(`  transactions/refresh failed (continuing): ${error.message}`);
  }
}

async function fireSandboxWebhook(accessToken) {
  try {
    await plaidRequest('/sandbox/item/fire_webhook', {
      access_token: accessToken,
      webhook_code: 'SYNC_UPDATES_AVAILABLE',
    });
  } catch (error) {
    console.warn(`  sandbox/item/fire_webhook failed (continuing): ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function plaidRequest(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': clientId,
      'PLAID-SECRET': secret,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${path} failed with HTTP ${res.status}: ${JSON.stringify(parsed)}`);
  }
  return parsed;
}

function redactPlaidResponse(value) {
  return JSON.parse(
    JSON.stringify(value, (key, innerValue) => {
      if (['access_token', 'public_token'].includes(key)) return '[redacted]';
      return innerValue;
    })
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function timestampForPath() {
  return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
