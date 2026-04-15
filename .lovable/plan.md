

## Unify Life Event & Risk Factor Pills with Behavioral Pill Styling

### Problem
Life event and risk factor pills currently use simple flat `<span>` elements with basic colors. They look different from the behavioral `PillarRollupChip` pills which have gradient backgrounds, `✦` icon, glow animations, cursor-pointer, and click-to-highlight-transactions behavior.

### Changes — Single file: `src/components/exec-demo/ExecDemoIntelPanel.tsx`

#### 1. Create shared pill components

- **`LifeEventChip`**: Reuse the exact `PillarRollupChip` visual pattern — gradient background, `✦` prefix, `1.5px solid` border, `rollup-entrance` + `rollup-glow` animations, `cursor-pointer`, scale on active. Color palette: amber tones. Shows `{event_name}` + `{confidence}%` + `{evidence.length} txns` stats.
  
- **`RiskFlagChip`**: Same visual pattern but with red/amber tones based on severity. Shows `⚠` prefix instead of `✦`, flag category, and severity level.

#### 2. Click-to-highlight behavior

Both new pill types will be clickable, calling the existing `onTriggerPillClick` prop (already wired up for transaction highlighting):

- **Life event pills**: Match `evidence[].merchant` against `transactions` to find indices, same logic already used in `NextProductRationale`.
- **Risk flag pills**: Match `flag.transactions` or `flag.merchant_patterns` (from the edge function response) against transaction merchants. If no transaction data in the flag, use keyword matching from the flag category.

#### 3. Active state tracking

Use `activeTriggerLabel` (already a prop) to track which pill is active, applying the same `scale(1.08)` + `boxShadow` glow effect used by behavioral pills.

#### 4. Replace current rendering (lines 299-361)

Replace the current simple `<span>` pills in both sections with the new chip components, keeping the section headers (`LIFE EVENT DETECTION`, `RISK FACTORS`) and staggered animation delays.

### No new props or page-level changes needed — all required data (`detectedLifeEvents`, `riskFlags`, `transactions`, `onTriggerPillClick`, `activeTriggerLabel`) are already passed in.

