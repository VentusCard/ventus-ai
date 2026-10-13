import { RICKY_SIGNAL_LABELS as L, RICKY_TRANSACTIONS, type RickyTransaction } from "./deckmoRickyTransactions";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const formatSignalMoney = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

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
  return [...totals].sort(([a], [b]) => a.localeCompare(b)).map(([key, cents]) => {
    const [year, month] = key.split("-");
    return { key, month: months[Number(month) - 1] ?? month, year: `20${year}`, cents };
  });
}

export function signalPaymentSummary(label: string, transactions: RickyTransaction[] = RICKY_TRANSACTIONS) {
  const monthly = signalMonthlyPayments(label, transactions);
  if (!monthly.length) return null;
  const totalCents = monthly.reduce((sum, row) => sum + row.cents, 0);
  return { monthly, totalCents, annualizedCents: Math.round(totalCents * 12 / monthly.length), fixed: monthly.every((row) => row.cents === monthly[0]?.cents), latest: monthly[monthly.length - 1] };
}

const context: Record<string, string[]> = {
  [L.income]: ["Semi-monthly", "HP Inc.", "Payroll", "Monthly income $22–26K"],
  [L.business]: ["Cottage food business", "Square payouts", "Vendor fees · supplies"],
  "Small airplane co-owner": ["Cirrus SR22", "Shared ownership", "Annual obligations", "Likely"],
  "BMW X5 loan ending in ~4 months": ["Auto financing", "Maturity ~4 months", "Likely"],
  [L.tennis]: ["About every 2 weeks", "Courts · coaching · gear"],
  [L.hawaii]: ["Annual · December", "Maui", "Flights · resort · car rental"],
  [L.media]: ["Streaming · music · live events", "Netflix · YouTube TV · Spotify"],
  "High pet expenditure": ["Monthly", "Premium food · supplies · care", "Likely"],
  [L.baby]: ["Nursery · hospital · childcare", "Bright Horizons"],
  [L.home]: ["Palo Alto", "Appraisal · escrow · moving"],
  [L.betting]: ["Increasing frequency", "DraftKings", "Sportsbook · wallet funding"],
};

export const FINANCIAL_PAYMENT_LABELS: string[] = [L.brokerage, L.marcus, L.amex];

export function signalAttributes(label: string): string[] {
  if (!FINANCIAL_PAYMENT_LABELS.includes(label)) return context[label] ?? [];
  const summary = signalPaymentSummary(label);
  if (!summary?.latest) return [];
  if (label === L.amex) return ["Annualized", `${formatSignalMoney(summary.annualizedCents)}/year`, "to Amex", "Credit card payments", "Estimate"];
  const amount = summary.fixed ? formatSignalMoney(summary.latest.cents) : `${formatSignalMoney(summary.latest.cents)} latest · ${summary.latest.month}`;
  return ["Monthly", amount, label === L.marcus ? "to Goldman Marcus" : "to Fidelity", label === L.marcus ? "HYSA" : "Brokerage", ...(summary.fixed ? [] : ["Variable amount"])];
}

export type SignalPhraseSegment = { kind: "attribute" | "connector"; text: string };
const attribute = (text: string): SignalPhraseSegment => ({ kind: "attribute", text });
const connector = (text: string): SignalPhraseSegment => ({ kind: "connector", text });

/** Structured deck-only wording; full evidence retains exact monthly history. */
export function signalInlineSegments(label: string): SignalPhraseSegment[] {
  if (FINANCIAL_PAYMENT_LABELS.includes(label)) {
    const summary = signalPaymentSummary(label);
    if (!summary?.latest) return [attribute(label)];
    const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
    if (label === L.amex) return [attribute("Annualized estimate"), connector(" "), attribute(`${money(summary.annualizedCents)}/year`), connector(" to "), attribute("Amex"), connector(" for "), attribute("credit card payments")];
    return [attribute("Monthly"), connector(" "), attribute(money(summary.latest.cents)), connector(" to "), attribute(label === L.marcus ? "Goldman Marcus" : "Fidelity"), connector(" a "), attribute(label === L.marcus ? "HYSA" : "brokerage account"), ...(summary.fixed ? [] : [connector(" · "), attribute("variable")])];
  }
  const phrases: Record<string, SignalPhraseSegment[]> = {
    [L.income]: [attribute("Stable $22–26K monthly income"), connector(" from "), attribute("HP Inc."), connector(" via "), attribute("semi-monthly payroll")],
    [L.business]: [attribute("Small food business"), connector(" with "), attribute("Square payouts"), connector(" and "), attribute("vendor fees · supplies")],
    "Small airplane co-owner": [attribute("Small airplane co-owner"), connector(" of a "), attribute("Cirrus SR22"), connector(" · "), attribute("likely")],
    "BMW X5 loan ending in ~4 months": [attribute("BMW X5"), connector(" with "), attribute("auto financing"), connector(" ending in "), attribute("~4 months"), connector(" · "), attribute("likely")],
    [L.tennis]: [attribute("Tennis"), connector(" every "), attribute("~2 weeks"), connector(" with "), attribute("courts · coaching · gear")],
    [L.hawaii]: [attribute("Annual pre-holiday trip"), connector(" to "), attribute("Maui"), connector(" in "), attribute("December")],
    [L.media]: [attribute("Media, music and entertainment"), connector(" through "), attribute("Netflix · YouTube TV · Spotify"), connector(" and "), attribute("live events")],
    "High pet expenditure": [attribute("Monthly"), connector(" "), attribute("high pet expenditure"), connector(" on "), attribute("premium food · supplies · care"), connector(" · "), attribute("likely")],
    [L.baby]: [attribute("New baby ~6 months ago"), connector(" with "), attribute("nursery · hospital · childcare")],
    [L.home]: [attribute("Buying a $1.5M+ home"), connector(" in "), attribute("Palo Alto"), connector(" with "), attribute("appraisal · escrow · moving")],
    [L.betting]: [attribute("Increasing betting frequency"), connector(" at "), attribute("DraftKings"), connector(" via "), attribute("sportsbook · wallet funding")],
  };
  return phrases[label] ?? [attribute(label)];
}