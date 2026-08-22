# Remove the portfolio scale strip

The single line of scale stats on the Intelligence Database overview ("109.1M Total accounts · 68.2M Unique users · $32.7B Card spend · 4.74B Transactions · 78.5% Active acct rate · 38.4% Wallet share") adds no analytic value and will be deleted.

## Changes

- In the Intelligence Database overview (`AnalystDashboardView.tsx`):
  - Delete the portfolio-context row rendered under the date-range header.
  - Delete the `portfolioContext` array that feeds it.
  - Drop now-unused derived values (`rangeSpend`, `rangeTransactions`) and any imports/helpers (`fmtNum`, `fmtCurrency`) that become unused after the removal.
- Everything below the header (Ventus priority sliver, signal families, analytics panels) stays exactly as-is and shifts up.

No other pages or components reference this strip, so nothing else changes.
