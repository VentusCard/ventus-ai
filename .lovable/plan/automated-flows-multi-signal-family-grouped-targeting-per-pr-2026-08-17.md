# Automated Flows: multi-signal, family-grouped targeting per product

## What changes

Today each flow on `/bankdemo` → Automated Flows carries exactly 3 signals and expands into 3 microsegment cards. That is too thin: a real product qualifies off several signals within the same family plus supporting signals from other families.

New model, per product flow:

1. Signals are grouped into the **five signal families** already used across the platform: Life Event, Behavioral, Financial, Demographic, Risk.
2. A family can hold **multiple signals** (529: "Newborn in household" and "College-bound dependent" are both Life Events; "Education spend spike" and "External 529 funding" are both Behavioral).
3. Each signal has its own **on/off toggle**.
4. Clicking a signal opens its **hyper-personalization detail** inline.

## Expanded signal catalog

Every one of the 76 products gets a re-authored signal set, typically 5-9 signals spread across 3-5 families. Each signal keeps the existing shape (label + transaction-grounded evidence) plus a new `family` field.

Example — 529 College Savings Plan:

```text
LIFE EVENT
  Newborn / toddler expense cluster      baby retail + pediatric copays + daycare ACH
  College-bound dependent                test fees, application fees, campus-town travel
  Grandchild born                        gift-registry + juvenile retail with no childcare spend

BEHAVIORAL
  Education spend spike                  YoY jump in tuition / tutoring / test-prep outflow
  External 529 funding                   ACH to outside 529 administrators
  K-12 private tuition payer             recurring school ACH outside public calendar

FINANCIAL
  Surplus cash after obligations         stable deposit growth net of fixed outflows
  Investable assets tier                 idle balances above operating-cash needs

DEMOGRAPHIC
  Parent of school-age kids
  Dual-income household
```

The same treatment is applied product by product across Wealth, Lending, Deposits, Cards, and Insurance — including the business-owner flows, where Demographic signals become owner-type signals (Stripe/Square settlements, IRS estimated tax, payroll runs) and Risk signals cover underwriting-readiness (clean overdraft history, healthy DTI, stable tenure).

Rules used when authoring:
- Family assignment follows the existing platform definitions; no signal is duplicated across families.
- Every signal names transaction-level evidence, never a demographic guess alone.
- Money-transfer rails (Zelle, wire, Western Union) are never used as life-event evidence.
- Risk signals are framed as eligibility/readiness, not customer stress.

## Expanded flow UI

Collapsed flow row: shows total signal count and family mix, e.g. `9 signals · 4 families`.

Expanded flow: family sections, each with a header (family name, count, "toggle all"), then signal rows.

```text
LIFE EVENT · 3 signals                                  [toggle all]
  [on]  Newborn / toddler expense cluster      Audience 9.5M   >
        baby retail + pediatric copays + daycare ACH
  [on]  College-bound dependent                Audience 6.2M   >
  [off] Grandchild born                        Audience 2.1M   >
```

- Toggling a signal off dims the row and removes its audience from the flow total.
- The flow header's audience number and signal chip reflect only enabled signals; all-off shows the flow as Paused.
- Only one signal detail open at a time per flow.

## Hyper-personalization detail

Opens inline beneath the clicked signal:

- Microsegment name and audience size
- **Why this fires** — full evidence string plus the family badge
- **Personalized message** — subject, body with `{{first_name}}` merge token, CTA
- **Delivery** — channel chips (Email / In-app / Advisor brief)

Signals that don't yet have authored copy fall back to a product-level message template, so no signal ever opens an empty panel.

## Technical notes

- `src/lib/productAutomatedFlows.ts`: add `SignalFamily` type (`life-event | behavioral | financial | demographic | risk`), add `family` to `FlowSignal`, and rewrite the `signals` array for all 76 flows. Existing `type` field is folded into `family`.
- `src/lib/productMicrosegments.ts`: keyed by signal label rather than array index, so added signals map cleanly; existing entries are re-keyed and new entries authored for the added signals.
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`: replace the microsegment card grid with family sections + `SignalRow` list + inline `SignalDetail`.
- Enabled-signal state: `Record<flowId, Set<signalLabel>>`, defaults to all enabled, session-only.
- Family colors reuse the platform palette (Life Event amber, Behavioral blue, Financial emerald, Demographic violet, Risk slate). No mock/live data or backend calls change.
- Strict light theme — white surfaces, `slate-200` borders, no `dark:` utilities.
