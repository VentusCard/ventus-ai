import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEPOSIT_PRIMACY_CUSTOM_USER,
  depositPrimacyReady,
  pullPlaidTransactions,
} from './plaid-source.mjs';

const payroll = {
  transaction_id: 'tx_payroll',
  name: 'Renamed employer deposit',
  amount: -4800,
  personal_finance_category: { primary: 'INCOME' },
};
const offbank = {
  transaction_id: 'tx_offbank',
  name: 'Renamed external movement',
  amount: 2100,
  personal_finance_category: { primary: 'TRANSFER_OUT' },
};

test('deposit primacy readiness requires corroborated payroll and off-bank evidence', () => {
  assert.equal(depositPrimacyReady([payroll]), false);
  assert.equal(depositPrimacyReady([offbank]), false);
  assert.equal(depositPrimacyReady([payroll, offbank]), true);
});

test('Plaid custom-user pull waits through partial settlement and returns the ready batch', async () => {
  const pulls = [[payroll], [payroll, offbank]];
  let transactionCalls = 0;
  const requestPlaid = async (path) => {
    if (path === '/sandbox/public_token/create') return { public_token: 'public-token' };
    if (path === '/item/public_token/exchange') return { access_token: 'access-token' };
    transactionCalls += 1;
    return { transactions: pulls.shift() ?? [payroll, offbank] };
  };

  const result = await pullPlaidTransactions({
    clientId: 'client',
    secret: 'secret',
    customUser: DEPOSIT_PRIMACY_CUSTOM_USER,
    requestPlaid,
    waitForNextAttempt: async () => {},
    maxAttempts: 3,
  });

  assert.equal(transactionCalls, 2);
  assert.equal(result.mode, 'plaid_custom_user');
  assert.equal(result.ready, true);
  assert.deepEqual(result.transactions, [payroll, offbank]);
});

test('Plaid pull labels a non-qualifying fallback as not ready', async () => {
  const generic = [{ transaction_id: 'tx_coffee', name: 'COFFEE SHOP', amount: 6 }];
  let publicTokenCalls = 0;
  const requestPlaid = async (path) => {
    if (path === '/sandbox/public_token/create') {
      publicTokenCalls += 1;
      return { public_token: `public-token-${publicTokenCalls}` };
    }
    if (path === '/item/public_token/exchange') return { access_token: 'access-token' };
    return { transactions: publicTokenCalls === 1 ? [payroll] : generic };
  };

  const result = await pullPlaidTransactions({
    clientId: 'client',
    secret: 'secret',
    requestPlaid,
    waitForNextAttempt: async () => {},
    maxAttempts: 2,
  });

  assert.equal(result.mode, 'plaid_default_institution');
  assert.equal(result.ready, false);
  assert.deepEqual(result.transactions, generic);
});
