# Rewrite example-customer signals

Make the five Personalization example customers use one consistent, Systems-tab-aligned signal set, and rename the first customer to Ricky.

## Signal composition (identical shape for all 5 customers)

Each customer gets exactly:

- 2-3 **Behavioral** signals (spending habits)
- 1 **Life Event — internal** (inferred from the bank's own transactions)
- 1 **Life Event — external** (bureau / external intelligence, e.g. auto-loan renewal window)
- 1 **Financial** signal
- 1 **Demographic** signal
- 1 **Risk** signal

Today the set is uneven (2 life events, 2-3 financial, 3-4 behavioral, 2 demographic, and two customers have zero risk). Every customer's signals get rewritten to this shape, in plain, evidence-backed language consistent with the rest of the demo.

## Order

Reorder the signal families everywhere signals render to match the Systems tab:

```text
Behavioral  →  Life Event  →  Financial  →  Demographic  →  Risk
```

This is a single shared ordering change, so the example-customer panel, the Customers directory list, and the customer detail panel all match the Systems tab.

## External vs internal

Life-event signals carry a source. The external one renders with a small "Ext" tag on the pill (same idea as the external-intelligence pill in /demo), so a banker can see at a glance which insight came from outside the bank's own data.

## Ricky

The first example customer (currently Sarah Mitchell) becomes **Ricky** — new name, city, segment, lifestyle, products, and a signal set built to the shape above. He stays the pre-fired default customer on /bankdemo load, so the phone mockup and deal generation keep working unchanged.

## Technical notes

- `src/lib/customerDirectoryData.ts`: add an optional `source: "internal" | "external"` field to `DirectorySignal`; reorder `SIGNAL_FAMILY_META` to spending_habit → life_event → financial → demographic → risk.
- `src/lib/personalizationExamples.ts`: rewrite all five customers' signal arrays to the fixed composition; rename `c1` to Ricky (keeps the `c1` id so the `DEMO_CUSTOMERS` mapping and prewarm path are untouched).
- `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`: render the "Ext" source tag on external pills.
- Verify the directory views that read `SIGNAL_FAMILY_META` pick up the new order without layout breakage.
- No LLM prompt or edge-function changes; all data is static mock.
