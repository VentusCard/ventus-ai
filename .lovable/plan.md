
# Light-Themed Popups for TePilot

## Overview

Add a CSS rule that ensures all popup windows (dialogs, modals, sheets, popovers) within TePilot are always light-themed, regardless of the global dark theme. This provides consistency with the existing white-themed TePilot interface.

## Current State

- TePilot pages use the `.tepilot-theme` class which overrides CSS variables for a light theme
- Some dialogs manually add `bg-white text-slate-900` inline, but it's inconsistent
- The global app uses a dark theme by default

## Proposed Solution

Add scoped CSS rules in `src/styles/base.css` that target Radix portal elements (which render dialogs outside the DOM tree) and force light-theme styling for TePilot-related popups.

## Technical Approach

Since Radix UI portals render outside the parent DOM tree, we need to use a global CSS approach with a `data-tepilot` attribute on the dialog components, or add CSS that applies when the `tepilot-theme` class is present on the body or a parent element.

The cleanest approach is to add CSS rules in `base.css` that:
1. Define a `.tepilot-popup` class for dialog content
2. Create CSS rules that override the dark theme variables for these popups

## Implementation

### File: `src/styles/base.css`

Add after the existing `.tepilot-theme` rules (around line 133):

```css
/* TePilot Popup Light Theme
   Forces all popups (dialogs, sheets, popovers) in TePilot to be light-themed */
.tepilot-popup,
.tepilot-theme [data-radix-popper-content-wrapper],
.tepilot-theme [role="dialog"] {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  color-scheme: light;
}

/* Direct styling for portal-rendered dialogs */
.tepilot-popup {
  background-color: white !important;
  color: hsl(222 47% 11%) !important;
}

.tepilot-popup * {
  border-color: hsl(214 32% 91%);
}
```

### Update Dialog Components in TePilot

Add the `tepilot-popup` class to all DialogContent instances in TePilot components:

| File | Change |
|------|--------|
| `src/components/tepilot/RecommendationsModal.tsx` | Add `tepilot-popup` class to DialogContent |
| `src/components/tepilot/CorrectionModal.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/TransactionDetailModal.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/insights/SubcategoryTransactionsModal.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/campaigns/CampaignDetailDialog.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/rewards-pipeline/MerchantPipelineTable.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/rewards-pipeline/PartnershipActionButtons.tsx` | Add `tepilot-popup` class |
| `src/components/tepilot/advisor-console/*.tsx` (multiple dialogs) | Already have `bg-white text-slate-900` - can add class for consistency |

### Example Update

```tsx
// Before
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

// After
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto tepilot-popup">
```

For dialogs that already have `bg-white text-slate-900`, the `tepilot-popup` class provides additional coverage for nested elements and border colors.

## Files to Modify

| File | Purpose |
|------|---------|
| `src/styles/base.css` | Add tepilot-popup CSS rules |
| `src/components/tepilot/RecommendationsModal.tsx` | Add tepilot-popup class |
| `src/components/tepilot/CorrectionModal.tsx` | Add tepilot-popup class |
| `src/components/tepilot/TransactionDetailModal.tsx` | Add tepilot-popup class |
| `src/components/tepilot/insights/SubcategoryTransactionsModal.tsx` | Add tepilot-popup class |
| `src/components/tepilot/campaigns/CampaignDetailDialog.tsx` | Add tepilot-popup class |
| `src/components/tepilot/rewards-pipeline/MerchantPipelineTable.tsx` | Add tepilot-popup class |
| `src/components/tepilot/rewards-pipeline/PartnershipActionButtons.tsx` | Add tepilot-popup class |
| Various advisor-console dialog files | Standardize with tepilot-popup class |

## Benefits

- Single CSS class provides consistent light theming for all popups
- Easy to maintain - new dialogs just need to add one class
- Overrides work even though dialogs render in portals outside the tepilot-theme container
- Existing inline styles (`bg-white text-slate-900`) can be kept or removed - the CSS class handles it
