

## Goal
Make the **Next-Offer** tab persona-pill-led, just like Next-Conversation. Default to the first (highest-value) lifestyle rollup pill. Disable risk pills on this tab. Replace the seasonal timeline graph with a shopping cadence/pattern card. Show only one persona's deal set at a time, controlled by the selected pill.

## Changes

### 1. `ExecDemoIntelPanel.tsx` — extend pill selection to Next-Offer
- Today `selectedSignal` activates only on `relationship` tab. Extend it so it ALSO activates on `analytics` (Next-Offer) tab.
- Default selection logic per tab:
  - **Next-Offer**: first lifestyle rollup pill (rollupStats[0]) — never a risk or life-event pill
  - **Next-Conversation**: unchanged (first signal in priority order)
- Risk pills on Next-Offer tab: render with `opacity-40`, `cursor-not-allowed`, no click handler, tooltip "Not applicable for offer targeting"
- Lifestyle rollup pills + life-event pills: clickable, drive `selectedSignal`
- When `activeTab === "analytics"`, pass `selectedSignal` down to `PurchaseCycleTimeline`

### 2. `PurchaseCycleTimeline.tsx` — replace timeline with cadence card; filter offers
Rename internal usage but keep the file (it's the Next-Offer container). Two changes:

**A. Replace the seasonal bar-chart block with a "Shopping Cadence" card**

For the selected persona/rollup, derive 1–3 pattern bullets from its transactions:
- **Cadence**: detect interval between transactions in the rollup (e.g. "~30 days between visits → monthly")
- **Seasonality**: detect month concentration (e.g. "annually in July" if ≥50% spend in one month; "summer-heavy" if 3-month bucket ≥40%)
- **Top merchant**: most-frequent merchant in the rollup
- **Plain-English summary line** at top: e.g. "Monthly vet visits at Banfield" or "Annual Hawaiian getaway every July"

Card layout:
```text
┌────────────────────────────────────────────────────┐
│ ✦ Pet Care · Shopping Pattern                      │
│ ─────────────────────────────────────────────────  │
│ "Monthly vet checkups, mostly at Banfield"         │
│                                                    │
│ 🗓  Cadence: every ~28 days (12 visits/yr)          │
│ 📍  Top merchant: Banfield Pet Hospital (8 of 12)  │
│ 📈  Recent: +18% vs prior quarter                  │
└────────────────────────────────────────────────────┘
```

Light theme, color-coded top border by pillar (reuses `getColor`).

**B. Filter offers to selected persona only**
- `NextOfferRationale` currently renders ALL `generatedOffers` groups. Add an `activeRollupLabel` prop and filter `offers` to only the group whose `rollup === activeRollupLabel`.
- If life event is selected, show the matching life-event offer group.
- If no match, show empty-state: "No offers generated for this segment yet."

### 3. `NextOfferRationale.tsx` — single-persona view
- Add prop `activeRollupLabel: string | null`
- Filter `offers` by `group.rollup === activeRollupLabel` before render
- Drop the multi-cluster header line ("3 behavioral clusters → 12 deals") since only one cluster is shown; replace with a slim header echoing the active rollup name

## Files to update
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — extend pill selection state to analytics tab; disable risk pills on Next-Offer; pass `selectedSignal` into timeline
- `src/components/exec-demo/PurchaseCycleTimeline.tsx` — replace bar-chart with cadence card; pass `activeRollupLabel` down
- `src/components/exec-demo/NextOfferRationale.tsx` — filter offers by `activeRollupLabel`; simplify header

## Out of scope
- No edge function / data changes
- No changes to Next-Product or Next-Conversation tabs (other than shared pill state behaving correctly per tab)
- No changes to pill animations or styling beyond risk-pill disabled state on this tab

## Expected result for Sarah
- Open Next-Offer → first lifestyle rollup pill (e.g. "Pet Care") is auto-selected and highlighted
- Risk pills (Gambling) appear dimmed and non-clickable
- Cadence card reads: "Monthly vet visits at Banfield · every ~28 days · 12 visits/yr"
- Offers section shows only Pet Care deals
- Click "Frequent Traveler" pill → cadence card switches to "Annual Hawaiian getaway every July", offers swap to travel deals
- Click life-event pill (e.g. Home Buyer) → cadence card shows the life-event evidence summary, offers swap to home-buyer deal group

