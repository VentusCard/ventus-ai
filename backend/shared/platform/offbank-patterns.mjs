// Single source of truth for off-bank merchant recognition. Imported by the
// backend activation builders (.mjs) and the frontend classifier (src/lib/plaid.ts)
// so the banker brief and the demo screen can never disagree about what counts
// as money leaving the bank.

// Neobanks, P2P rails, and trading apps that indicate deposit-primacy erosion.
export const OFFBANK_CORE = ['chime', 'cash app', 'cashapp', 'venmo', 'sofi', 'varo', 'current', 'robinhood'];

// Brokerages and robo-advisors: off-bank for classification, but a wealth
// signal rather than a deposit-primacy one.
export const OFFBANK_INVESTMENT = ['coinbase', 'wealthfront', 'betterment', 'fidelity', 'vanguard', 'schwab'];

export const OFFBANK_ALL = [...OFFBANK_CORE, ...OFFBANK_INVESTMENT];

export const offbankRegex = (providers = OFFBANK_CORE) => new RegExp(providers.join('|'), 'i');
