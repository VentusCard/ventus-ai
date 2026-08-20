# Signal families: collapsed cards → expanded segment panel → export to Customers

## What changes

On the Intelligence Database overview (`/bankdemo` → Customer Intelligence → Intelligence Dashboard → Overview), the five signal family cards become a two-state control.

**Collapsed (default)**
Each of the five cards shows only the identity and the headline numbers: family chip, customer count, 24h delta, and a compact trend sparkline plus a one-line confidence bar. The per-signal list currently rendered inside each small card is removed from the collapsed state, so the row gets shorter and much easier to scan.

**Expanded (on click)**
Clicking a card opens a full-width panel that replaces the five-card row in place (same section, taller), so nothing else on the page shifts sideways. The panel contains:
- Header: family chip, total customers, 24h delta, confidence split (strong / likely / emerging), and a close control. The other four families appear as small switch chips in the header so the user can move between families without collapsing first.
- Signal rows: the family's signals (expanded from today's 4 to 6-8 per family), each with customers on that signal, 24h delta, a confidence pill, and a short evidence line ("what Ventus saw").
- Each signal row is clickable and reads as an export action ("Open segment →").

**Clicking a signal**
Switches the dashboard to the **Customers** sub-tab (or **Risk** sub-tab for the risk family) with that signal pre-applied as a filter: the family filter is checked and the signal label is seeded into the search box, so the directory immediately lists the matching customers. A dismissible "segment" banner above the results names the source signal and the portfolio size it came from, with a "Clear segment" action that returns the directory to its unfiltered state.

## Technical notes

- `src/lib/intelligenceSignalStats.ts`: extend `SignalRollup` with `evidence`, `confidence` (`strong | likely | emerging`) and a small `trend` number array; grow each family's signal list to 6-8 entries. Add a `sparkline` series per family. All values stay deterministic mock math derived from the existing seeds — no LLM, no backend.
- `SignalFamilyBoard.tsx`: hold `expandedFamily` state. When null, render the current 5-up grid in the new compact form; when set, render a single full-width `SignalFamilyPanel` in the same grid slot (`col-span-full`). Keep it a controlled, purely presentational component; expose `onOpenSignal(family, signalLabel)` upward.
- New `src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx` for the expanded view.
- `AnalystDashboardView.tsx`: pass a new `onOpenSignalSegment` prop through alongside the existing `onOpenSection`.
- `VentusAIDashboardView.tsx`: add `signalSegment` state (`{ family, label } | null`). On `onOpenSignalSegment`, set it and switch `section` to `customers` (or `risk`), then pass it into `CustomersDirectoryView`.
- `CustomersDirectoryView.tsx`: accept optional `segment` prop; a `useEffect` keyed on it seeds `query` with the signal label and adds the family to the `families` set, and renders the segment banner. Clearing the banner resets those filters and the segment state upstream.
- Risk family routes to `FVIDashboard`, which has no filter surface today; for the risk family the signal click still opens the Risk sub-tab, without a seeded filter (called out so it isn't mistaken for a bug).
- Styling stays strict light theme, existing chip/dot tokens from `SIGNAL_FAMILY_META`, no `dark:` utilities.
