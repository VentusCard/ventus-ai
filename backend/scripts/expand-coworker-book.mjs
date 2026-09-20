/**
 * One-shot generator that widens the Coworker fixture book.
 *
 * The book was twelve households and, in practice, four products: only
 * card_cash_back, deposit_apy, loan_refinance and fee_avoidance price to a
 * dollar figure, so everything else lost on rank and never appeared. Seven of
 * the twelve best-matched the travel card, which left the digest pitching one
 * product in most rows and recycling the same names every few mornings.
 *
 * The households below are written against the catalog's `target_signals`
 * rather than invented and then checked, so each one has a reason to exist:
 * every product that can lead a row now has at least one household behind it.
 *
 * Two constraints shape every record here, both learned by building the book
 * wrong first:
 *
 *  - Idle cash above $25,000 raises the `idle_cash` token, which high-yield
 *    savings targets. Savings prices to a real dollar figure while planning
 *    and protection products price to an outcome, and the per-household
 *    product choice takes the more defensible figure. So a household meant to
 *    lead with a 529 or an IRA will silently lead with savings instead unless
 *    its cash sits below the threshold. Only the households genuinely about
 *    idle cash carry a balance above it.
 *  - `Pays card in full`, `Travel-heavy spend` and `Dining-led discretionary`
 *    all pull a household to the travel card, which none of these can price
 *    because they carry no ledger. None of them carry those signals.
 *
 * Two products still cannot lead a row: trust-account and home-insurance each
 * target exactly one signal, and that signal is shared with a product holding
 * strictly more evidence. That is a property of the catalog rather than of the
 * book, and inventing a household to force them up would misrepresent it.
 * None of them carry transactions, which is deliberate — the card is the only
 * product that needs a ledger to price, and the existing twelve already supply
 * the computed-benefit showpiece. These price from signals and report as
 * estimates, which is what a real book looks like before enrichment lands.
 *
 * Run once: node backend/scripts/expand-coworker-book.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, '..', 'shared', 'coworker', 'fixtures');

const read = (f) => JSON.parse(fs.readFileSync(path.join(fixtures, f), 'utf8'));
const write = (f, v) =>
  fs.writeFileSync(path.join(fixtures, f), `${JSON.stringify(v, null, 2)}\n`);

/**
 * @type {{household: object, signals: object}[]}
 * Ordered by the product each one is built to lead with, so the spread is
 * auditable by reading down the file.
 */
const ADDITIONS = [
  // ── 529 education savings ────────────────────────────────────────────────
  {
    household: {
      id: 'hh_rasmussen',
      advisor_id: 'adv_okoro',
      name: 'Rasmussen Household',
      primary_contact: 'Ingrid Rasmussen',
      segment: 'mass affluent',
      age_band: '31-37',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Minneapolis', state: 'MN', zip: '55408', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 4,
        products_held: ['everyday-checking', 'high-yield-savings'],
        aum_usd: 96000,
        wallet_share: 0.38,
      },
      accounts: [
        { type: 'checking', balance_usd: 12400 },
        { type: 'savings', balance_usd: 9800 },
      ],
      goals: ['Get ahead of childcare costs', 'Start saving for school early'],
    },
    signals: {
      life_events: [
        {
          type: 'new_child_expected',
          confidence_band: 'high',
          evidence: 'Maternity-care copays and a nursery furniture order in the last two months.',
        },
      ],
      behavioral: [
        {
          name: 'Rising family spend',
          level: 'HIGH',
          evidence: 'Grocery and household spend up 34% over the trailing quarter.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 12400,
        monthly_surplus_usd: 1400,
        wallet_share: 0.38,
        posture: 'accumulator',
      },
    },
  },
  {
    household: {
      id: 'hh_villanueva',
      advisor_id: 'adv_reyes',
      name: 'Villanueva Household',
      primary_contact: 'Rosa Villanueva',
      segment: 'affluent',
      age_band: '38-45',
      communication_tone: 'direct_concise',
      communication_tone_source: 'advisor',
      region: { city: 'San Diego', state: 'CA', zip: '92103', cost_of_living: 'high' },
      relationship: {
        tenure_years: 9,
        products_held: ['everyday-checking', 'travel-card', 'mortgage'],
        aum_usd: 288000,
        wallet_share: 0.51,
      },
      accounts: [
        { type: 'checking', balance_usd: 13800 },
        { type: 'brokerage', balance_usd: 274200 },
      ],
      goals: ['Two children through college without loans'],
    },
    signals: {
      life_events: [
        {
          type: 'new_child_expected',
          confidence_band: 'medium',
          evidence: 'Pediatric registration and a second car-seat purchase in the last 45 days.',
        },
      ],
      behavioral: [
        {
          name: 'Rising family spend',
          level: 'MED',
          evidence: 'Childcare debits began three months ago and now run $1,850 a month.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 13800,
        monthly_surplus_usd: 2100,
        wallet_share: 0.51,
        posture: 'accumulator',
      },
    },
  },

  // ── Term life insurance ──────────────────────────────────────────────────
  {
    household: {
      id: 'hh_achebe',
      advisor_id: 'adv_okoro',
      name: 'Achebe Household',
      primary_contact: 'Nneka Achebe',
      segment: 'mass affluent',
      age_band: '31-37',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Charlotte', state: 'NC', zip: '28203', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 3,
        products_held: ['everyday-checking'],
        aum_usd: 64000,
        wallet_share: 0.29,
      },
      accounts: [
        { type: 'checking', balance_usd: 15200 },
        { type: 'savings', balance_usd: 48800 },
      ],
      goals: ['Protect the family before the house closes'],
    },
    signals: {
      life_events: [
        {
          type: 'new_child_expected',
          confidence_band: 'high',
          evidence: 'Obstetric billing across four consecutive months.',
        },
        {
          type: 'home_purchase_intent',
          confidence_band: 'medium',
          evidence: 'Two mortgage-application fees and an inspection payment in six weeks.',
        },
      ],
      behavioral: [
        {
          name: 'Building emergency fund',
          level: 'HIGH',
          evidence: 'Savings balance up $18,000 over ten months with no withdrawals.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 15200,
        monthly_surplus_usd: 1750,
        wallet_share: 0.29,
        posture: 'accumulator',
      },
    },
  },

  // ── HELOC ────────────────────────────────────────────────────────────────
  {
    household: {
      id: 'hh_montoya',
      advisor_id: 'adv_reyes',
      name: 'Montoya Household',
      primary_contact: 'Elena Montoya',
      segment: 'affluent',
      age_band: '46-55',
      communication_tone: 'direct_concise',
      communication_tone_source: 'advisor',
      region: { city: 'Denver', state: 'CO', zip: '80206', cost_of_living: 'high' },
      relationship: {
        tenure_years: 12,
        products_held: ['everyday-checking', 'mortgage', 'flat-cashback-card'],
        aum_usd: 154000,
        wallet_share: 0.44,
      },
      accounts: [
        { type: 'checking', balance_usd: 22100 },
        { type: 'brokerage', balance_usd: 131900 },
      ],
      goals: ['Finish the kitchen without touching investments'],
    },
    signals: {
      life_events: [
        {
          type: 'home_renovation',
          confidence_band: 'high',
          evidence: 'Contractor deposits of $12,000 and $9,400 to the same builder in eight weeks.',
        },
      ],
      behavioral: [
        {
          name: 'Large discretionary outlays',
          level: 'HIGH',
          evidence: 'Four single purchases above $3,000 in the trailing quarter.',
        },
        {
          name: 'Avoids liquidating investments',
          level: 'MED',
          evidence: 'No brokerage sales in 24 months despite two large cash outlays.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 22100,
        home_equity_usd: 412000,
        monthly_surplus_usd: 2600,
        wallet_share: 0.44,
        posture: 'balanced',
      },
    },
  },
  {
    household: {
      id: 'hh_lindgren',
      advisor_id: 'adv_okoro',
      name: 'Lindgren Household',
      primary_contact: 'Marcus Lindgren',
      segment: 'affluent',
      age_band: '46-55',
      communication_tone: 'formal_precise',
      communication_tone_source: 'advisor',
      region: { city: 'Seattle', state: 'WA', zip: '98112', cost_of_living: 'high' },
      relationship: {
        tenure_years: 15,
        products_held: ['everyday-checking', 'mortgage'],
        aum_usd: 402000,
        wallet_share: 0.58,
      },
      accounts: [
        { type: 'checking', balance_usd: 19400 },
        { type: 'brokerage', balance_usd: 382600 },
      ],
      goals: ['Add a rental unit above the garage'],
    },
    signals: {
      life_events: [
        {
          type: 'home_renovation',
          confidence_band: 'medium',
          evidence: 'Permit fees to the city and an architect retainer inside the last month.',
        },
      ],
      behavioral: [
        {
          name: 'Large discretionary outlays',
          level: 'MED',
          evidence: 'Two payments above $8,000 to design and survey firms this quarter.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 19400,
        home_equity_usd: 548000,
        monthly_surplus_usd: 3900,
        wallet_share: 0.58,
        posture: 'balanced',
      },
    },
  },

  // ── Managed portfolio (an estate, not a retirement) ──────────────────────
  // Written for trust-account first, which cannot win: trust targets only
  // estate_inflow, managed targets that plus three more, and managed therefore
  // holds the row on every tiebreak. Left as a managed household rather than
  // contorted into proving a product the catalog will not surface.
  {
    household: {
      id: 'hh_barros',
      advisor_id: 'adv_reyes',
      name: 'Barros Household',
      primary_contact: 'Teresa Barros',
      segment: 'high net worth',
      age_band: '56-65',
      communication_tone: 'formal_precise',
      communication_tone_source: 'advisor',
      region: { city: 'Boston', state: 'MA', zip: '02116', cost_of_living: 'high' },
      relationship: {
        tenure_years: 18,
        products_held: ['everyday-checking', 'managed-portfolio'],
        aum_usd: 1240000,
        wallet_share: 0.63,
      },
      accounts: [
        { type: 'checking', balance_usd: 18600 },
        { type: 'brokerage', balance_usd: 1221400 },
      ],
      goals: ['Pass the estate on without probate'],
    },
    signals: {
      life_events: [
        {
          type: 'estate_inflow',
          confidence_band: 'high',
          evidence: 'A $480,000 settlement credit posted from an estate administrator.',
        },
        {
          type: 'elder_care',
          confidence_band: 'medium',
          evidence: 'Recurring payments to a long-term care facility began four months ago.',
        },
      ],
      behavioral: [
        {
          name: 'Avoids liquidating investments',
          level: 'HIGH',
          evidence: 'No sales in 36 months; distributions taken in cash instead.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 18600,
        monthly_surplus_usd: 5200,
        wallet_share: 0.63,
        posture: 'preservation',
      },
    },
  },

  // ── IRA ──────────────────────────────────────────────────────────────────
  {
    household: {
      id: 'hh_tanaka',
      advisor_id: 'adv_okoro',
      name: 'Tanaka Household',
      primary_contact: 'Hiro Tanaka',
      segment: 'affluent',
      age_band: '56-65',
      communication_tone: 'formal_precise',
      communication_tone_source: 'advisor',
      region: { city: 'Portland', state: 'OR', zip: '97210', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 21,
        products_held: ['everyday-checking', 'high-yield-savings'],
        aum_usd: 486000,
        wallet_share: 0.47,
      },
      accounts: [
        { type: 'checking', balance_usd: 16400 },
        { type: 'brokerage', balance_usd: 469600 },
      ],
      goals: ['Consolidate three old employer plans'],
    },
    signals: {
      life_events: [
        {
          type: 'retirement_horizon',
          confidence_band: 'high',
          evidence: 'Pension-estimate requests and a benefits-counseling appointment on file.',
        },
      ],
      behavioral: [
        {
          name: 'Automated investing',
          level: 'HIGH',
          evidence: 'Recurring $1,200 monthly brokerage purchases running for three years.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 16400,
        monthly_surplus_usd: 3100,
        wallet_share: 0.47,
        posture: 'preservation',
      },
    },
  },
  {
    household: {
      id: 'hh_osei',
      advisor_id: 'adv_reyes',
      name: 'Osei Household',
      primary_contact: 'Kwame Osei',
      segment: 'mass affluent',
      age_band: '46-55',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Atlanta', state: 'GA', zip: '30309', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 7,
        products_held: ['everyday-checking'],
        aum_usd: 132000,
        wallet_share: 0.33,
      },
      accounts: [
        { type: 'checking', balance_usd: 18900 },
        { type: 'brokerage', balance_usd: 113100 },
      ],
      goals: ['Retire at 62 with the mortgage cleared'],
    },
    signals: {
      life_events: [
        {
          type: 'retirement_horizon',
          confidence_band: 'medium',
          evidence: 'Retirement-calculator sessions and a catch-up contribution enquiry this quarter.',
        },
      ],
      behavioral: [
        {
          name: 'Automated investing',
          level: 'MED',
          evidence: 'Standing $450 monthly transfer to a brokerage account for 19 months.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 18900,
        monthly_surplus_usd: 1650,
        wallet_share: 0.33,
        posture: 'accumulator',
      },
    },
  },

  // ── Robo-advisor ─────────────────────────────────────────────────────────
  {
    household: {
      id: 'hh_novak',
      advisor_id: 'adv_okoro',
      name: 'Novak Household',
      primary_contact: 'Petra Novak',
      segment: 'mass affluent',
      age_band: '25-30',
      communication_tone: 'direct_concise',
      communication_tone_source: 'advisor',
      region: { city: 'Chicago', state: 'IL', zip: '60614', cost_of_living: 'high' },
      relationship: {
        tenure_years: 2,
        products_held: ['everyday-checking'],
        aum_usd: 38000,
        wallet_share: 0.22,
      },
      accounts: [
        { type: 'checking', balance_usd: 20800 },
        { type: 'savings', balance_usd: 200 },
      ],
      goals: ['Stop leaving everything in checking'],
    },
    signals: {
      life_events: [],
      behavioral: [
        {
          name: 'Idle cash accumulation',
          level: 'HIGH',
          evidence: 'Checking balance has grown every month for 11 months and never been swept.',
        },
        {
          name: 'Automated investing',
          level: 'LOW',
          evidence: 'A single $100 monthly transfer to an outside brokerage.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 21000,
        monthly_surplus_usd: 2300,
        wallet_share: 0.22,
        posture: 'accumulator',
      },
    },
  },
  {
    household: {
      id: 'hh_qureshi',
      advisor_id: 'adv_reyes',
      name: 'Qureshi Household',
      primary_contact: 'Sana Qureshi',
      segment: 'mass affluent',
      age_band: '31-37',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Houston', state: 'TX', zip: '77006', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 5,
        products_held: ['everyday-checking', 'flat-cashback-card'],
        aum_usd: 71000,
        wallet_share: 0.36,
      },
      accounts: [
        { type: 'checking', balance_usd: 20400 },
        { type: 'savings', balance_usd: 50600 },
      ],
      goals: ['Put the savings balance to work without picking stocks'],
    },
    signals: {
      life_events: [],
      behavioral: [
        {
          name: 'Idle cash accumulation',
          level: 'MED',
          evidence: 'Combined balances up $22,000 across the year with no investment activity.',
        },
        {
          name: 'Automated investing',
          level: 'LOW',
          evidence: 'A $200 monthly transfer to an outside robo account, unchanged for a year.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 20400,
        monthly_surplus_usd: 1900,
        wallet_share: 0.36,
        posture: 'accumulator',
      },
    },
  },

  // ── Mortgage ─────────────────────────────────────────────────────────────
  {
    household: {
      id: 'hh_ferreira',
      advisor_id: 'adv_okoro',
      name: 'Ferreira Household',
      primary_contact: 'Paulo Ferreira',
      segment: 'mass affluent',
      age_band: '31-37',
      communication_tone: 'direct_concise',
      communication_tone_source: 'advisor',
      region: { city: 'Tampa', state: 'FL', zip: '33606', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 3,
        products_held: ['everyday-checking', 'high-yield-savings'],
        aum_usd: 88000,
        wallet_share: 0.31,
      },
      accounts: [
        { type: 'checking', balance_usd: 20800 },
        { type: 'savings', balance_usd: 67200 },
      ],
      goals: ['Buy before the lease ends in the spring'],
    },
    signals: {
      life_events: [
        {
          type: 'home_purchase_intent',
          confidence_band: 'high',
          evidence: 'Earnest-money transfer and two appraisal fees in the last three weeks.',
        },
        {
          type: 'relocation',
          confidence_band: 'medium',
          evidence: 'Payroll deposit switched to a new employer in a different metro.',
        },
      ],
      behavioral: [
        {
          name: 'Building emergency fund',
          level: 'HIGH',
          evidence: 'Savings up $40,000 over 18 months, untouched.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 20800,
        monthly_surplus_usd: 2450,
        wallet_share: 0.31,
        posture: 'accumulator',
      },
    },
  },

  // ── Mortgage (a second mover, further along) ─────────────────────────────
  // Written for home-insurance first, which cannot win: it targets only
  // home_purchase_intent, and every household that has that signal also has a
  // reason to see a mortgage or a life policy, both of which carry more
  // evidence. Kept as a mortgage household at a later stage than Ferreira.
  {
    household: {
      id: 'hh_haddad',
      advisor_id: 'adv_reyes',
      name: 'Haddad Household',
      primary_contact: 'Rami Haddad',
      segment: 'affluent',
      age_band: '38-45',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Phoenix', state: 'AZ', zip: '85018', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 8,
        products_held: ['everyday-checking', 'mortgage', 'flat-cashback-card'],
        aum_usd: 176000,
        wallet_share: 0.49,
      },
      accounts: [
        { type: 'checking', balance_usd: 24100 },
        { type: 'brokerage', balance_usd: 151900 },
      ],
      goals: ['Close on the second property cleanly'],
    },
    signals: {
      life_events: [
        {
          type: 'home_purchase_intent',
          confidence_band: 'high',
          evidence: 'Title-company payment and a homeowners quote debit inside two weeks.',
        },
        {
          type: 'relocation',
          confidence_band: 'high',
          evidence: 'A moving-company deposit and a utility transfer to a new service address.',
        },
      ],
      behavioral: [
        {
          name: 'Large discretionary outlays',
          level: 'MED',
          evidence: 'Three payments above $4,000 to moving and title services this quarter.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 24100,
        monthly_surplus_usd: 3050,
        wallet_share: 0.49,
        posture: 'balanced',
      },
    },
  },

  // ── High-yield savings ───────────────────────────────────────────────────
  {
    household: {
      id: 'hh_sorensen',
      advisor_id: 'adv_okoro',
      name: 'Sorensen Household',
      primary_contact: 'Lena Sorensen',
      segment: 'affluent',
      age_band: '38-45',
      communication_tone: 'direct_concise',
      communication_tone_source: 'advisor',
      region: { city: 'Nashville', state: 'TN', zip: '37203', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 6,
        products_held: ['everyday-checking'],
        aum_usd: 119000,
        wallet_share: 0.34,
      },
      accounts: [
        { type: 'checking', balance_usd: 83500 },
        { type: 'brokerage', balance_usd: 35500 },
      ],
      goals: ['Earn something on the operating cash'],
    },
    signals: {
      life_events: [],
      behavioral: [
        {
          name: 'Accelerating savings velocity',
          level: 'HIGH',
          evidence: 'Deposits outpaced withdrawals in 11 of the last 12 months.',
        },
        {
          name: 'Recurring savings transfers',
          level: 'MED',
          evidence: 'A standing $1,500 monthly transfer running for two years.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 83500,
        monthly_surplus_usd: 2800,
        wallet_share: 0.34,
        posture: 'accumulator',
      },
    },
  },

  // ── Student loan refinance ───────────────────────────────────────────────
  {
    household: {
      id: 'hh_iqbal',
      advisor_id: 'adv_reyes',
      name: 'Iqbal Household',
      primary_contact: 'Omar Iqbal',
      segment: 'mass affluent',
      age_band: '25-30',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'Philadelphia', state: 'PA', zip: '19146', cost_of_living: 'medium' },
      relationship: {
        tenure_years: 2,
        products_held: ['everyday-checking'],
        aum_usd: 27000,
        wallet_share: 0.24,
      },
      accounts: [
        { type: 'checking', balance_usd: 12300 },
        { type: 'savings', balance_usd: 14700 },
      ],
      goals: ['Get the loan rate down before the next raise'],
    },
    signals: {
      life_events: [],
      behavioral: [
        {
          name: 'Steady student-loan servicing',
          level: 'HIGH',
          evidence: '$740 paid to the same servicer on the same day for 24 consecutive months.',
        },
        {
          name: 'Volatile income',
          level: 'LOW',
          evidence: 'Contract income varied by about 20% month to month across the year.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 14700,
        student_loan_balance_usd: 61200,
        student_loan_rate_pct: 7.4,
        monthly_surplus_usd: 900,
        wallet_share: 0.24,
        posture: 'deleveraging',
      },
    },
  },

  // ── Overdraft protection ─────────────────────────────────────────────────
  {
    household: {
      id: 'hh_dubois',
      advisor_id: 'adv_okoro',
      name: 'Dubois Household',
      primary_contact: 'Camille Dubois',
      segment: 'mass market',
      age_band: '31-37',
      communication_tone: 'warm_personal',
      communication_tone_source: 'advisor',
      region: { city: 'New Orleans', state: 'LA', zip: '70115', cost_of_living: 'low' },
      relationship: {
        tenure_years: 4,
        products_held: ['everyday-checking'],
        aum_usd: 9400,
        wallet_share: 0.19,
      },
      accounts: [
        { type: 'checking', balance_usd: 1800 },
        { type: 'savings', balance_usd: 7600 },
      ],
      goals: ['Stop paying overdraft fees on irregular pay weeks'],
    },
    signals: {
      life_events: [],
      behavioral: [
        {
          name: 'Volatile income',
          level: 'HIGH',
          evidence: 'Deposits ranged from $1,100 to $4,800 a month across the year.',
        },
      ],
      risk: [
        {
          type: 'nsf_overdraft_cluster',
          band: 'high',
          evidence: 'Three overdraft and returned-item charges in the last 60 days.',
        },
      ],
      financial: {
        idle_cash_usd: 7600,
        monthly_surplus_usd: 240,
        wallet_share: 0.19,
        posture: 'stabilizing',
      },
    },
  },

  // ── Managed portfolio ────────────────────────────────────────────────────
  {
    household: {
      id: 'hh_marchetti',
      advisor_id: 'adv_reyes',
      name: 'Marchetti Household',
      primary_contact: 'Giulia Marchetti',
      segment: 'high net worth',
      age_band: '56-65',
      communication_tone: 'formal_precise',
      communication_tone_source: 'advisor',
      region: { city: 'New York', state: 'NY', zip: '10023', cost_of_living: 'high' },
      relationship: {
        tenure_years: 16,
        products_held: ['everyday-checking', 'high-yield-savings'],
        aum_usd: 870000,
        wallet_share: 0.55,
      },
      accounts: [
        { type: 'checking', balance_usd: 22800 },
        { type: 'brokerage', balance_usd: 847200 },
      ],
      goals: ['Hand the day-to-day management to someone else'],
    },
    signals: {
      life_events: [
        {
          type: 'retirement_horizon',
          confidence_band: 'high',
          evidence: 'Social Security estimate requested and a partial-retirement date discussed on file.',
        },
      ],
      behavioral: [
        {
          name: 'Idle cash spike',
          level: 'HIGH',
          evidence: 'A $96,000 distribution landed in checking three weeks ago and has not moved.',
        },
        {
          name: 'Idle cash accumulation',
          level: 'MED',
          evidence: 'Checking ran above $100,000 for six of the last nine months.',
        },
      ],
      risk: [],
      financial: {
        idle_cash_usd: 22800,
        monthly_surplus_usd: 6400,
        wallet_share: 0.55,
        posture: 'preservation',
      },
    },
  },
];

const households = read('households.json');
const signals = read('signals.json');

const existing = new Set(households.households.map((h) => h.id));
const added = [];
for (const { household, signals: sig } of ADDITIONS) {
  if (existing.has(household.id)) continue;
  households.households.push(household);
  signals.signals[household.id] = sig;
  added.push(household.id);
}

// Every demo advisor carries the whole book. The two fictional advisors keep
// their own slices, which is what makes a per-advisor screen meaningful.
for (const advisor of households.advisors) {
  const ownsWholeBook = advisor.mailbox !== 'fictional';
  for (const { household } of ADDITIONS) {
    const mine = ownsWholeBook || household.advisor_id === advisor.id;
    if (mine && !advisor.household_ids.includes(household.id)) {
      advisor.household_ids.push(household.id);
    }
  }
}

households.note = households.note.replace(
  /As of v2 the book is 12 households[\s\S]*?communication_tone that drives outreach voice\./,
  `As of v3 the book is ${households.households.length} households. v2 was twelve, which was too thin for a daily digest: five rows a morning exhausted it in three days, and seven of the twelve best-matched the travel card, so the mail pitched one product in most rows. The households added in v3 are written against the catalog's target_signals so that every product able to lead a row has a household behind it. They carry no transactions, deliberately — the card is the only product needing a ledger to price, and the original twelve already provide the computed-benefit showpiece. Each household carries an advisor-entered communication_tone that drives outreach voice.`
);

write('households.json', households);
write('signals.json', signals);

console.log(`added ${added.length} households -> ${households.households.length} total`);
console.log(added.join(', '));
