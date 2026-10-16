import { RICKY_SIGNAL_LABELS as L, RICKY_TRANSACTIONS, type RickyTransaction } from "./deckmoRickyTransactions";
import { RICKY_KYC_LOCATION, RICKY_KYC_PROFILE, RICKY_KYC_SIGNAL_LABEL, RICKY_LUXURY_AUTO_LABEL, RICKY_TOTAL_ASSETS_LABEL, RICKY_ESTIMATED_TOTAL_ASSETS_CENTS, RICKY_GENERAL_SPENDING_LABEL } from "./deckmoScript";
import { RICKY_CASH_FLOW_LABEL, RICKY_DEMO_BALANCE_CENTS, estimatedEoySurplusCents, rickyCashFlow, rickyGeneralSpending } from "./deckmoCashFlow";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const formatSignalMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function signalMonthlyPayments(label: string, transactions: RickyTransaction[] = RICKY_TRANSACTIONS) {
  const totals = new Map<string, number>();
  for (const row of transactions) {
    if (!row.signals.some((signal) => signal === label)) continue;
    const [month, , year] = row.date.split("/");
    const value = Number(row.amount.replace(/[^\d.]/g, ""));
    if (!month || !year || !Number.isFinite(value)) continue;
    const key = `${year}-${month}`;
    totals.set(key, (totals.get(key) ?? 0) + Math.round(value * 100));
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, cents]) => {
      const [year, month] = key.split("-");
      return { key, month: months[Number(month) - 1] ?? month, year: `20${year}`, cents };
    });
}

export function signalPaymentSummary(label: string, transactions: RickyTransaction[] = RICKY_TRANSACTIONS) {
  const monthly = signalMonthlyPayments(label, transactions);
  if (!monthly.length) return null;
  const totalCents = monthly.reduce((sum, row) => sum + row.cents, 0);
  return {
    monthly,
    totalCents,
    annualizedCents: Math.round((totalCents * 12) / monthly.length),
    fixed: monthly.every((row) => row.cents === monthly[0]?.cents),
    latest: monthly[monthly.length - 1],
  };
}

const context: Record<string, string[]> = {
  [RICKY_KYC_SIGNAL_LABEL]: [`Age ${RICKY_KYC_PROFILE.age}`, RICKY_KYC_LOCATION.city, RICKY_KYC_LOCATION.state, RICKY_KYC_LOCATION.postalCode, `${RICKY_KYC_PROFILE.relationshipTier} tier`],
  [L.income]: ["Semi-monthly", "HP Inc.", "Payroll", "Monthly income $22–26K", `Est. annual household income ${RICKY_KYC_PROFILE.estimatedHouseholdIncome}`],
  [L.business]: ["Cottage food business", "Square payouts", "Vendor fees · supplies"],
  "Small airplane co-owner": ["Cirrus SR22", "Shared ownership", "Annual obligations", "Likely"],
  [RICKY_LUXURY_AUTO_LABEL]: ["Luxury auto owner", "BMW X5", "Outside vehicle ownership", "Likely"],
  [RICKY_TOTAL_ASSETS_LABEL]: ["Estimated total assets", formatSignalMoney(RICKY_ESTIMATED_TOTAL_ASSETS_CENTS), "Illustrative external estimate"],
  [L.tennis]: ["About every 2 weeks", "Courts · coaching · gear"],
  [L.hawaii]: ["Annual · December", "Maui", "Flights · resort · car rental"],
  [L.media]: ["Streaming · music · live events", "Netflix · YouTube TV · Spotify"],
  "High pet expenditure": ["Monthly", "Premium food · supplies · care", "Likely"],
  [L.baby]: ["Nursery · hospital · childcare", "Bright Horizons"],
  [L.home]: ["Palo Alto", "Appraisal · escrow · moving"],
  [L.betting]: ["Increasing frequency", "DraftKings", "Sportsbook · wallet funding"],
  [RICKY_GENERAL_SPENDING_LABEL]: ["Annual estimate", `${formatSignalMoney(rickyGeneralSpending().annualCents)}/year`, "Everyday living expenses", "Estimate"],
};

export const FINANCIAL_PAYMENT_LABELS: string[] = [L.brokerage, L.marcus, L.amex];

export function signalAttributes(label: string): string[] {
  if (!FINANCIAL_PAYMENT_LABELS.includes(label)) return context[label] ?? [];
  const summary = signalPaymentSummary(label);
  if (!summary?.latest) return [];
  if (label === L.amex)
    return [
      "Annualized",
      `${formatSignalMoney(summary.annualizedCents)}/year`,
      "to Amex",
      "Credit card payments",
      "Estimate",
    ];
  const amount = summary.fixed
    ? formatSignalMoney(summary.latest.cents)
    : `${formatSignalMoney(summary.latest.cents)} latest · ${summary.latest.month}`;
  return [
    "Monthly",
    amount,
    label === L.marcus ? "to Goldman Marcus" : "to Fidelity",
    label === L.marcus ? "HYSA" : "Brokerage",
  ];
}

export type SignalPhraseSegment = { kind: "attribute" | "connector"; text: string };
const attribute = (text: string): SignalPhraseSegment => ({ kind: "attribute", text });
const connector = (text: string): SignalPhraseSegment => ({ kind: "connector", text });

/** Structured deck-only wording; full evidence retains exact monthly history. */
export function signalInlineSegments(label: string): SignalPhraseSegment[] {
  if (FINANCIAL_PAYMENT_LABELS.includes(label)) {
    const summary = signalPaymentSummary(label);
    if (!summary?.latest) return [attribute(label)];
    const money = (cents: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
      }).format(cents / 100);
    if (label === L.amex)
      return [
        attribute("Annualized estimate"),
        connector(" "),
        attribute(`${money(summary.annualizedCents)}/year`),
        connector(" to "),
        attribute("Amex"),
        connector(" for "),
        attribute("credit card payments"),
      ];
    return [
      attribute("Monthly"),
      connector(" "),
      attribute(money(summary.latest.cents)),
      connector(" to "),
      attribute(label === L.marcus ? "Goldman Marcus" : "Fidelity"),
      connector(" a "),
      attribute(label === L.marcus ? "HYSA" : "brokerage account"),
    ];
  }
  const phrases: Record<string, SignalPhraseSegment[]> = {
    [RICKY_KYC_SIGNAL_LABEL]: [
      attribute(`Age ${RICKY_KYC_PROFILE.age}`),
      connector(" in "),
      attribute(RICKY_KYC_LOCATION.city),
      connector(" "),
      attribute(RICKY_KYC_LOCATION.state),
      connector(" "),
      attribute(RICKY_KYC_LOCATION.postalCode),
      connector(" with "),
      attribute(`${RICKY_KYC_PROFILE.relationshipTier} tier`),
      connector(" and his balance is "),
      attribute(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(RICKY_DEMO_BALANCE_CENTS / 100)),
    ],
    [RICKY_CASH_FLOW_LABEL]: [
      attribute("Estimated EOY surplus"), connector(" is "), attribute(formatSignalMoney(estimatedEoySurplusCents(rickyCashFlow().surplusCents))),
      connector(" and "), attribute("monthly idle cash"), connector(" is "), attribute(formatSignalMoney(rickyCashFlow().idleCents)),
    ],
    [RICKY_GENERAL_SPENDING_LABEL]: [
      attribute("Annual estimate"),
      connector(" "),
      attribute(`${formatSignalMoney(rickyGeneralSpending().annualCents)}/year`),
      connector(" in "),
      attribute("general spending"),
    ],
    [L.income]: [
      attribute("Stable $22K monthly income"),
      connector(" from "),
      attribute("HP Inc."),
      connector(" a "),
      attribute("Technology Company"),
      connector(" with "),
      attribute(`Est. annual household income ${RICKY_KYC_PROFILE.estimatedHouseholdIncome}`),
    ],
    [L.business]: [attribute("SMB Owner"), connector(" in "), attribute("Food and Beverage")],
    "Small airplane co-owner": [attribute("Airplane co-owner"), connector(" of a "), attribute("Cirrus SR22")],
    [RICKY_LUXURY_AUTO_LABEL]: [attribute("Luxury auto owner"), connector(" of a "), attribute("BMW X5")],
    [RICKY_TOTAL_ASSETS_LABEL]: [attribute("Estimated total assets"), connector(" of "), attribute(`$${RICKY_ESTIMATED_TOTAL_ASSETS_CENTS / 100000000}M`)],
    [L.tennis]: [attribute("$12,000"), connector(" annual spent in "), attribute("bi-weekly"), connector(" "), attribute("Tennis")],
    [L.hawaii]: [
      attribute("$9,000"),
      connector(" annual spent in "),
      attribute("Annual pre-holiday trip"),
      connector(" "),
      attribute("Q4"),
    ],
    [L.media]: [
      attribute("$6,000"),
      connector(" annual spent in "),
      attribute("Media, music and entertainment"),
      connector(" through "),
      attribute("streaming services"),
      connector(" and "),
      attribute("live events"),
    ],
    "High pet expenditure": [attribute("Monthly"), connector(" "), attribute("high pet expenditure")],
    [L.baby]: [attribute("New baby"), connector(" in "), attribute("Q3, 2026")],
    [L.home]: [
      attribute("Buying a home"),
      connector(" in "),
      attribute("Palo Alto"),
      connector(" for around "),
      attribute("$1.75M"),
    ],
    [L.betting]: [
      attribute("Increasing"),
      connector(" frequency at "),
      attribute("Online Sports Betting"),
      connector(" now "),
      attribute("bi-weekly deposits"),
    ],
  };
  return phrases[label] ?? [attribute(label)];
}
