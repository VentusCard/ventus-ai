

## Plan: Merge Automated Flows into Campaign Studio with Mode Switcher

### What
Add a full-width two-button toggle switcher ("Automated Flows" / "Campaigns") inside `CampaignStudio.tsx`, placed between the header and the semantic intent input. When "Automated Flows" is selected, show the `AutomatedFlowsSection` content. When "Campaigns" is selected, show the current campaign builder (semantic input + resizable panel layout).

### Changes

**`src/components/tepilot/campaigns/CampaignStudio.tsx`**
- Add `activeMode` state: `'campaigns' | 'automations'` (default: `'campaigns'`)
- After the header div (line ~302), insert a full-width two-button switcher using styled `Button` components (one primary/filled for active, one outline/ghost for inactive)
- Conditionally render:
  - `'automations'` → `<AutomatedFlowsSection />`
  - `'campaigns'` → existing semantic input + Card with resizable panels
- Import `AutomatedFlowsSection`

**`src/components/tepilot/campaigns/SegmentTargetingView.tsx`**
- Remove `AutomatedFlowsSection` import and rendering — just render `<CampaignStudio />` directly

### Switcher UI
Two equal-width buttons in a `grid grid-cols-2` container with a subtle border/background. Active button gets `bg-primary text-white`, inactive gets `bg-muted/50 text-muted-foreground hover:bg-muted`. Icons: `Zap` for Automations, `Megaphone` for Campaigns.

