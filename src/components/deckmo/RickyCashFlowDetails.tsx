import { rickyCashFlow } from "@/lib/deckmoRickyCashFlow";
import { formatSignalMoney } from "@/lib/deckmoSignalAttributes";

const columns = ["Payroll", "Spending", "After spending", "Savings", "Investing", "After spending + saving + investing"];
export function RickyCashFlowDetails() {
  const summary = rickyCashFlow();
  return <div data-cash-flow-details>
    <h5 className="ricky-story-popover-heading text-[10px] font-bold uppercase text-deck-muted">Observed monthly comparison · January–September 2026</h5>
    <p className="mt-2 text-sm text-deck-muted">Payroll minus observed expenses, then minus Marcus savings and Fidelity investing. Sample transactions only—not a complete statement or checking-account balance. September is observed through September 18.</p>
    <div className="mt-3 overflow-x-auto overscroll-x-contain scrollbar-light rounded-lg border border-deck-rule" role="region" aria-label="Monthly payroll and spending comparisons" tabIndex={0}>
      <table className="w-full min-w-[1060px] border-collapse text-left text-xs tabular-nums">
        <thead><tr className="ricky-story-table-group border-b border-deck-rule"><th className="px-3 py-3">Month</th>{columns.map((column) => <th key={column} className="px-3 py-3 text-right">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-deck-rule">{summary.monthly.map((row) => <tr key={row.key}><th scope="row" className="px-3 py-3 font-semibold">{row.month}</th>{[row.payroll, row.spending, row.afterSpending, row.savings, row.investing, row.afterSavingInvesting].map((cents, index) => <td key={index} className="whitespace-nowrap px-3 py-3 text-right">{formatSignalMoney(cents)}</td>)}</tr>)}</tbody>
        <tfoot><tr className="ricky-story-table-group border-t border-deck-rule font-semibold"><th className="px-3 py-3">9-month average</th><td colSpan={2} /><td className="whitespace-nowrap px-3 py-3 text-right">{formatSignalMoney(summary.afterSpending)}</td><td colSpan={2} /><td className="whitespace-nowrap px-3 py-3 text-right">{formatSignalMoney(summary.afterSavingInvesting)}</td></tr></tfoot>
      </table>
    </div>
    <h5 className="ricky-story-popover-heading mt-4 text-[10px] font-bold uppercase text-deck-muted">Calculation basis and exceptions</h5>
    <p className="mt-2 text-sm text-deck-muted">Spending includes observed card purchases, bills, taxes, business expenses, coaching, and home-purchase outlays. Amex settlements are excluded from spending to avoid counting card purchases twice; this does not imply every Amex payment matches a visible purchase. Wallet funding and Zelle transfers without an expense description are excluded. Business receipts and refunds do not increase the payroll basis.</p>
    <ul className="mt-2 space-y-1 text-xs text-deck-muted">{summary.monthly.filter((row) => row.otherIncome || row.homeOutlays || row.transfers).map((row) => <li key={row.key}>{row.month}: other receipts {formatSignalMoney(row.otherIncome)} (outside payroll); home outlays {formatSignalMoney(row.homeOutlays)} (included); unclassified transfers/funding {formatSignalMoney(row.transfers)} (excluded).</li>)}</ul>
  </div>;
}