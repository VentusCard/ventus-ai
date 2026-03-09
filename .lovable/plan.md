

## Problem

Each automated flow and campaign currently has no customizable CTA section. The AI-generated `PersonalizedMessage` already includes a `cta` field, but it's never rendered. Users need to see and customize the call-to-action (button text, link, style) per flow/campaign.

## Plan

### 1. Add a CTA configuration to each automated flow in `AutomatedFlowsSection.tsx`

- Add local state `flowCTAs: Record<string, { text: string; link: string; style: 'primary' | 'outline' | 'soft' }>` to track per-flow CTA settings.
- Initialize defaults from a new `DEFAULT_FLOW_CTAS` map (e.g., "New Parents" → "Start Saving Today" / "/savings", "Pre-Retirees" → "Plan Your Retirement" / "/wealth").
- In the expanded flow detail section, add an editable CTA card below the personalization preview with:
  - **CTA Text** — editable input field
  - **CTA Link** — editable input field  
  - **CTA Style** — toggle between Primary (filled), Outline, and Soft (muted) button styles
  - A live **CTA Preview** button rendered in the selected style

### 2. Render CTA buttons on each persona card in `PersonalizationPreviewPanel.tsx`

- Below the AI-generated message, render the `message.cta` text as a styled button preview.
- When a parent-provided `ctaOverride` prop exists (from the flow's customized CTA), use that instead of the AI-generated CTA text.
- Add a new optional prop: `ctaConfig?: { text: string; link: string; style: 'primary' | 'outline' | 'soft' }`.

### 3. Add CTA section to the Campaign Studio right panel (`CampaignStudio.tsx`)

- Below the `AICampaignPreview` component, add a dedicated "CTA Customization" card with:
  - CTA text and link inputs (pre-filled from the AI brief's `cta_text` / `cta_link` when available)
  - Style selector (3 visual button previews to pick from)
  - Live preview of the CTA button

### 4. Wire CTA config through to persona preview

- `AutomatedFlowsSection` passes `ctaConfig` to `PersonalizationPreviewPanel` for each flow.
- `CampaignStudio` passes `ctaConfig` to `PersonalizationPreviewPanel` from its local CTA state.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tepilot/campaigns/AutomatedFlowsSection.tsx` | Add per-flow CTA state, default CTA map, editable CTA card in expanded section |
| `src/components/tepilot/campaigns/PersonalizationPreviewPanel.tsx` | Accept `ctaConfig` prop, render CTA button on each persona card |
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Add CTA customization state, pass to `PersonalizationPreviewPanel` |

