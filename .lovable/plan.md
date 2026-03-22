

## Add Two New Tabs: "Life Events Intelligence" & "WM Copilot"

### Tab 1: Life Events Intelligence (Bank-Wide Macro View)

**New file: `src/components/tepilot/insights/BankwideLifeEventsView.tsx`**
- A macro dashboard showing aggregate life event detection across the entire bank
- Top summary metrics row: Total Customers Scanned, Total Events Detected, Urgent (next 90 days), by-type breakdown
- A grid of cards — one per event type (Retirement, Family Formation, Home Purchase, Education, Wealth Transfer, Business Liquidity, Elder Care) — each showing:
  - Event type icon + label
  - Detected count (bank-wide mock numbers, e.g., Retirement: 4,200, Baby: 1,800)
  - Avg confidence, urgency distribution
- Below the grid: a flat list of example clients with detected events
  - **First card** always shows the person from the transaction enrichment flow (pulled from `userDemographics` + `lifestyleSignals` passed via props), labeled with a "From Transaction Enrichment" badge
  - Remaining cards are static mock clients labeled "Static Example"
- Reuses `LIFE_EVENT_CONFIG` from `@/types/dashboardClient` for icons/colors
- Reuses `LifeEventAlertCard` for the client list (with a new optional `sourceLabel` prop)

**Update: `src/components/tepilot/advisor-console/LifeEventAlertCard.tsx`**
- Add optional `sourceLabel?: string` prop
- When provided, render a small badge on the card (e.g., "From Transaction Enrichment" or "Static Example")

### Tab 2: WM Copilot

**New file: `src/components/tepilot/insights/BankwideWMCopilotView.tsx`**
- Embeds the existing `AdvisorConsolePage` experience inline (dashboard mode showing `LifeEventsAlertDashboard` with generated clients, with ability to click into a client and see the full `AdvisorConsole`)
- Generates its own `dashboardClients` via `generateDashboardClients(60)` 
- Mirrors the AdvisorConsolePage dashboard/client toggle but embedded within the analytics tab

### Update: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Add two new tabs: "Life Events Intelligence" (icon: `CalendarHeart`) and "WM Copilot" (icon: `Briefcase`)
- Add new tab values to `defaultTab` type
- Accept optional props: `userDemographics`, `lifestyleSignals`, `enrichedTransactions` to pass the enrichment flow person down to the Life Events view

### Update: `src/pages/TePilot.tsx`
- Pass `userDemographics`, `lifestyleSignals`, and `enrichedTransactions` as props to `<AnalyticsContainer>` so the life events tab can show the enriched person first

### What stays the same
- All existing 6 tabs unchanged
- `/demo` page untouched
- `AdvisorConsolePage.tsx` untouched

