## Goal

Trim each of the 4 context rows in `NextConversationRationale.tsx` from 12 pills down to **10 short pills** that fit on a single line, and force the row layout to no-wrap so it never spills onto a second line.

## Changes

### `src/components/exec-demo/NextConversationRationale.tsx`

**1. Replace the 4 pill arrays** (lines 18–94) — 10 short labels each:

- **Inputs** (10): `Transactions`, `Holdings`, `Demographics`, `Loans`, `Credit`, `KYC`, `Statements`, `Bill pay`, `Channel telemetry`, `Rewards history`
- **Capabilities** (10): `Balances`, `Spend tracking`, `Subscriptions`, `Offers`, `Product fit`, `Goals`, `Cash flow`, `Charge lookup`, `Card rewards`, `Advisor prep`
- **Routes To** (10): `Wealth advisors`, `Mortgage`, `Insurance`, `Business banking`, `Card services`, `Disputes`, `Lending`, `Retirement`, `Trust desk`, `Branch`
- **Out of Scope** (10): `Tax advice`, `Legal advice`, `Stock picks`, `Market calls`, `Silent transfers`, `Auto account opens`, `Compliance overrides`, `Credit approvals`, `Replace advisor`, `Third-party sharing`

**2. Force single-line layout** in `ContextPillRows` (line 115):
Change `flex flex-wrap items-center gap-1.5 flex-1` to `flex flex-nowrap items-center gap-1.5 flex-1 min-w-0 overflow-hidden`. Each row stays strictly on one line; if the panel ever narrows below the row width, the right-most pills are clipped rather than wrapping.

## Visual result

Each of Inputs / Capabilities / Routes To / Out of Scope shows exactly 10 compact pills in a single horizontal line. Out of Scope keeps its rose strikethrough styling.

## Out of scope

- Layout/style changes beyond no-wrap.
- Adding ellipsis to individual pills.
