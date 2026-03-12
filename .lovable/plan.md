

## Make Ventus AI Engine Clickable → Show Dynamic Customer Profile JSON

### Approach

Add `"engine"` as a new `DemoNodeType`. When the center engine node is clicked, it triggers `onNodeClick("engine")`. The overlay renders a new `DemoEngineProfileView` showing a stylized, animated JSON-like deep customer profile for both customers side by side.

### Changes

**1. `src/components/demo/DemoNetworkDiagram.tsx`**
- Update `DemoNodeType` to include `"engine"`
- Make the center engine `div` a `button` with `onClick={() => onNodeClick("engine")}` and add hover/cursor styles

**2. `src/components/demo/DemoDetailOverlay.tsx`**
- Add `"engine"` to `NODE_TITLES` (title: "Deep Customer Intelligence Profile", color: indigo)
- Route `"engine"` to a new `DemoEngineProfileView`

**3. New file: `src/components/demo/DemoEngineProfileView.tsx`**
- Side-by-side view (matching existing overlay pattern) showing a dynamic JSON-style customer profile for each customer
- Profile object includes: demographics, spending summary (top pillars with amounts), behavioral patterns (frequency, avg transaction, preferred merchants), lifestyle signals, detected life events, and risk/opportunity flags
- Rendered as a syntax-highlighted JSON tree with collapsible sections, using the customer's demo data (`DemoCustomer` fields: `topPillars`, `lifeEvents`, `pillarBreakdown`, `sampleTransactions`, `profile`)
- Subtle typewriter/stagger animation on mount to feel "live-generated"

