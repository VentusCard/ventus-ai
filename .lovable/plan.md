## Goal

Add a new **Capabilities** tab in the Home nav group of `/bankdemo`, directly under **Ventus AI**. Renders a static 3-column diagram modeled on the uploaded slide.

## Layout

3 columns connected by curly braces (strict light theme — white bg, slate-200 borders, no `dark:`):

```text
   INPUTS                  CORE                     DOWNSTREAM
 ┌──────────┐      ┌─────────────────────┐      ┌────────────────────┐
 │ Card Txn │      │       VENTUS        │      │ Personalized       │
 │ ACH/Wire │      │  Behavioral Intel   │      │ Rewards            │
 │ Checks   │  ──▶ │ ─────────────────── │ ──▶  │ Next-Product Intel │
 │ Zelle    │      │ • Life Event        │      │ Semantic Budgeting │
 │ Digital  │      │ • Behavioral        │      │ AI Banking Asst    │
 │ Telemetry│      │ • Financial         │      │ Risk & Vulnerab.   │
 │ Credit   │      │ • Demographic       │      │ Segmentation       │
 └──────────┘      │ • Risk              │      └────────────────────┘
                   └─────────────────────┘
```

### Column contents

1. **Inputs (left)** — pill cards: Card Transaction, ACH/Wires, Checks, Zelle, Digital Telemetry, Credit Score.
2. **Core (center)** — single rounded card titled "VENTUS — Behavioral Intelligence Core" with a divider, then 5 signal rows inside (each row = colored dot + label):
   - Life Event Signals (amber)
   - Behavioral Signals (blue)
   - Financial Signals (emerald)
   - Demographic Signals (violet)
   - Risk Signals (rose)
   - Small caption above the list: "What the core produces"
3. **Downstream (right)** — pill cards: Personalized Rewards, Next-Product Intelligence, Semantic Budgeting, AI Banking Assistant, Risk and Vulnerability, Segmentation & Targeting.

Curly-brace SVG connectors between Inputs→Core and Core→Downstream (no per-item lines).

## Files

- **New:** `src/components/tepilot/insights/CapabilitiesView.tsx` — pure presentational, no data deps.
- **Edit:** `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Add `'capabilities'` to `TabValue`.
  - Insert nav item `{ value: 'capabilities', label: 'Capabilities', icon: Layers }` in the **Home** group, right after Ventus AI.
  - Add case in `renderContent()` returning `<CapabilitiesView />`.

## Style notes

- Manrope, white bg, slate-200 borders, semantic shadcn tokens.
- Signal dot colors reuse existing palette (amber/blue match `ProductAutomatedFlowsView` badges).
- `TabHeader` at top: "Platform Capabilities" / "How Ventus turns raw bank data into signals and downstream actions."

## Out of scope

- No click-through wiring between capability cards and other tabs.
- No backend/data changes.
