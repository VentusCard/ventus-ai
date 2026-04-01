

## New `/demo` — Executive-Focused Short Demo

A streamlined, single-screen demo for bank executives, adapted from the hero's `EnrichmentMockup` animation. Two-column layout: left for customer data selection, right for an iPhone mockup showing personalized banking outcomes.

### Layout

```text
┌──────────────────────────────────────────────────────────┐
│  Logo + tagline                                    Exit  │
├──────────────────┬───────────────────────────────────────┤
│                  │                                       │
│  CUSTOMER DATA   │         iPhone Frame                  │
│  SELECTION       │  ┌───────────────────────┐            │
│                  │  │ Dynamic Persona        │            │
│  [Customer 1]    │  │  pills...              │            │
│  [Customer 2]    │  ├───────────────────────┤            │
│  [Customer 3]    │  │ [Analytics] [Rewards] [Rel.]│      │
│                  │  │                         │            │
│  Transaction     │  │  Tab content area       │            │
│  preview feed    │  │  (shared space)         │            │
│  (animated       │  │                         │            │
│   scroll)        │  └───────────────────────┘            │
│                  │                                       │
│  [Run Analysis]  │                                       │
├──────────────────┴───────────────────────────────────────┤
│  "Next Step →"                                           │
└──────────────────────────────────────────────────────────┘
```

### Key Differences from `/deckmo`

- **No network diagram** — no node graph, no overlays
- **No password gate** — or reuse the same gate with shared session key
- **Left column** = customer selector + animated transaction feed (from `EnrichmentMockup`)
- **Right column** = iPhone device frame containing:
  - **Dynamic Persona** card at top (pills animate in progressively)
  - **3 tabbed intelligence cards** below sharing the same space:
    - Analytics Intelligence
    - Smart Rewards
    - Relationship Intelligence
  - Tabs auto-cycle during animation, or user can click to switch

### Files to Create/Modify

1. **`src/pages/ExecDemoPage.tsx`** — New page component
   - Reuses `EnrichmentMockup` customer data (3 profiles with transactions + cards)
   - Left panel: customer selector cards + transaction feed with animated scroll
   - Right panel: iPhone frame with persona + tabbed intelligence
   - Reuses `DemoPasswordGate` for access control
   - Bottom-right "Next Step" opens `ContactFormDialog`

2. **`src/components/exec-demo/ExecDemoLeftPanel.tsx`** — Customer selection + transaction feed
   - 3 clickable customer cards (name, demographics, tx count)
   - Animated transaction scroll (reuse animation logic from `EnrichmentMockup`)
   - "Run Analysis" button triggers the right-panel animation

3. **`src/components/exec-demo/ExecDemoPhoneView.tsx`** — iPhone frame + content
   - iPhone device chrome (notch, status bar, home indicator)
   - Dynamic Persona section with progressive pill reveal
   - 3 tabs (Analytics / Rewards / Relationship) sharing a content area
   - Each tab shows the intelligence card content for the selected customer
   - Tabs auto-advance during animation sequence, remain interactive after

4. **`src/App.tsx`** — Add route
   - Add `/demo` route pointing to `ExecDemoPage`
   - Add `isExecDemo` check to hide Navbar/Footer

### Animation Flow

1. User selects a customer → left panel shows their transactions
2. Click "Run Analysis" → transaction feed starts animated scroll
3. Right panel: persona pills appear progressively
4. Tabs auto-cycle: Analytics tab activates with card reveal → Rewards → Relationship
5. Each tab's content animates in with the same slide+fade from `EnrichmentMockup`
6. After all 3 revealed, user can freely click tabs to review

### Visual Style

- White background (matching current site), not dark theme
- iPhone frame: light silver bezel per existing iPad mockup pattern
- Manrope font throughout
- Reuse the same customer data from `EnrichmentMockup` (Michael R., Sarah & David L., Emily & James W.)

