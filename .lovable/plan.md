## Differentiate Life Event vs Behavioral signals

Add a `type: "life-event" | "behavioral"` field to each signal in `PRODUCT_FLOWS`, then render a small colored pill next to each signal label in the expanded panel.

### 1. `src/lib/productAutomatedFlows.ts`
- Extend `FlowSignal` interface with `type: "life-event" | "behavioral"`.
- Classify every existing signal across all 10 flows:
  - **life-event**: newborn cluster, dependent age inference, college-age dependent, recent family formation, new mortgage holder, lease-end timing, long-term homeowner, pre-approval inquiry, stated savings intent
  - **behavioral**: home renovation spend, property tax payment, RSU/ESPP inflows, brokerage transfers, country club dues, private aviation, dealer visits, auto insurance shop-around, rent above median, down-payment accumulation, BNPL usage, cash-advance recovery, revolving creep, idle balance, yield-seeking ACH, multi-airline, hotel diversity, international tx, vendor ACH cluster, processor deposits, business-pattern card use, single-earner household

### 2. `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
- In the expanded signals `<ul>`, render a small pill before/after the signal label:
  - **Life Event** → amber pill (`bg-amber-50 text-amber-700 border-amber-200`)
  - **Behavioral** → blue pill (`bg-blue-50 text-blue-700 border-blue-200`)
- Pill style: `text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border`
- No changes to row layout, toggle, or chevron behavior.

Light theme preserved throughout.
