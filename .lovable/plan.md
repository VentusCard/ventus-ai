# Merge Governance & Context into one tab

## What changes

In /bankdemo (and therefore Slide 9 of /deckmo), the VENTUS AI sidebar section currently has four items: System, Context, Ask Ventus AI, Governance. The **Context** and **Governance** items merge into a single tab.

New sidebar order in VENTUS AI section:
- System
- **Governance & Context** (new merged tab, ShieldCheck icon)
- Ask Ventus AI

## How it works

- New view `src/components/tepilot/governance/GovernanceContextView.tsx` following the same pattern as `AnalyticsView`: a `TabHeader` for the merged tab plus a `SubTabBar` with sub-tabs:
  1. **Governance** (default) — everything currently in `GovernanceView` (personalization dial, signal families, documents, guardrails, change history), minus its own TabHeader
  2. **Products** — existing `ProductsPanel` from BankContextView
  3. **Locations & Hours**
  4. **Departments**
  5. **Segments & Tiers**
- To reuse the existing code, both existing views get an optional `hideHeader` prop:
  - `GovernanceView` renders only its panel stack when `hideHeader`
  - `BankContextView` keeps its own sub-tab state but can be driven to a specific sub-tab and hides its own TabHeader/sub-tab bar when embedded — simplest is to export its four panels (`ProductsPanel`, etc., already in the file) and render them directly from the merged view
- `AnalyticsContainer.tsx`:
  - Add `governance-context` to `TabValue`
  - Replace the two nav items (`products`, `governance`) with one item `{ value: "governance-context", label: "Governance & Context", icon: ShieldCheck }` in the VENTUS AI group
  - `renderContent()` case for the merged view; keep the old `products` and `governance` cases as hidden fallbacks so deep links don't break

## Verification

- Playwright on /bankdemo: sidebar shows System → Governance & Context → Ask Ventus AI; the merged tab opens on Governance; all five sub-tabs render; Ask Ventus AI still works.
- Slide 9 of /deckmo unaffected in beat order (9.1 coworker, 9.2 flows, 9.3 copilot) — the merged tab just appears in the embedded sidebar.
- Typecheck clean, build log clean.
