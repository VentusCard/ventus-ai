

## Add Life Events & Risk Factors to Executive Demo Intelligence Panel

### What Changes
After clicking "Behavioral Intelligence: Ready" in the `/demo` executive demo, the intelligence panel currently shows only **Behavioral Intelligence** (persona rollup pills). We'll add two new sections below it: **Life Event Detection** and **Risk Factors**, each calling their respective edge functions (`analyze-lifestyle-signals` and `detect-risk-transactions`).

### Layout After Clicking "Ready"

```text
┌──────────────────────────────────────────┐
│ Behavioral Intelligence:                 │
│ Personas = Multi-category patterns       │
│ [✦ Wellness Explorer] [✦ Travel Hub]     │
│                                          │
│ Life Event Detection:                    │
│ [College Planning 92%] [Growing Family]  │
│                                          │
│ Risk Factors:                            │
│ [⚠ Subscription Creep] [⚠ Cash Adv.]   │
│ "No significant risks detected" fallback │
└──────────────────────────────────────────┘
```

### Files Changed

#### 1. `src/pages/ExecDemoPage.tsx`
- Add `riskFlags` state (`{ flags: any[]; summary: string } | null`) and `riskLoading` boolean
- Add `fireRiskDetection` callback that calls `detect-risk-transactions` with `classifiedRef.current`, triggered alongside `fireLifeEventDetection()` after persona synthesis completes (line ~275)
- Pass `riskFlags`, `riskLoading`, `detectedLifeEvents`, and `productsLoading` to `ExecDemoIntelPanel`

#### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Accept new props: `riskFlags`, `riskLoading`
- After the existing "Behavioral Intelligence" rollup pills section (around line 294), add two new sections that appear **only when `synthesisTriggered` is true**:
  - **Life Event Detection** section: Shows `detectedLifeEvents` as amber-toned pills with confidence percentages, or a loading shimmer. Already available via props.
  - **Risk Factors** section: Shows `riskFlags.flags` as red/amber-toned pills with severity badges, or `riskFlags.summary` as a green "clean" message if no flags. Loading shimmer while `riskLoading`.
- Each section has a tiny uppercase label (`BEHAVIORAL INTELLIGENCE`, `LIFE EVENT DETECTION`, `RISK FACTORS`) consistent with existing styling
- Stagger entrance animations: behavioral → life events (200ms delay) → risk factors (400ms delay)
- All three sections are inside the scrollable persona card area, collapsible with the existing chevron

### No edge function changes needed — both `analyze-lifestyle-signals` and `detect-risk-transactions` already accept the enriched transaction format used in the exec demo.

