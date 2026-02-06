

# Separate White Theme for TePilot Pages

## Overview
Create a dedicated light theme scope for all TePilot pages to prevent theme conflicts. This will ensure that:
- **Marketing/Corporate pages** use the existing dark theme (black background, light text)
- **TePilot demo pages** use a consistent white/light theme (white background, dark text)

## Approach: CSS Scoped Theme Class

Instead of manually fixing colors across 50+ files, we'll create a `.tepilot-theme` CSS class that overrides the CSS variables to use light mode values. All TePilot pages will wrap their content in this class.

## Files to Update

### 1. Create Light Theme Variables in base.css
Add a new `.tepilot-theme` class that defines light mode CSS variables:

```css
/* TePilot Light Theme - scoped override */
.tepilot-theme {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;
  
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 217 91% 60%;
  
  color-scheme: light;
}
```

### 2. Update TePilot Pages to Use the Theme Wrapper

Each TePilot page needs to add the `tepilot-theme` class to its root container:

**TePilot.tsx** (main demo page)
- Already uses `bg-white` - add `tepilot-theme` class to root

**FinancialPlanningPage.tsx**
- Line 89: `<div className="flex flex-col h-screen bg-white">` 
- Change to: `<div className="tepilot-theme flex flex-col h-screen bg-background">`

**AdvisorConsolePage.tsx**
- Line 198: `<div className="flex flex-col h-screen bg-white">`
- Change to: `<div className="tepilot-theme flex flex-col h-screen bg-background">`

**RecommendationsPage.tsx**
- Line 49: `<div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">`
- Change to: `<div className="tepilot-theme min-h-screen bg-background p-6">`

**RewardsPipelinePage.tsx**
- Line 8: `<div className="min-h-screen bg-white">`
- Change to: `<div className="tepilot-theme min-h-screen bg-background">`

### 3. Simplify Component Colors

After adding the theme scope, we can safely replace hardcoded slate colors with semantic CSS variable-based classes:

| Current | New (uses CSS vars) |
|---------|---------------------|
| `text-slate-900` | `text-foreground` |
| `text-slate-700` | `text-foreground/80` |
| `text-slate-600` | `text-muted-foreground` |
| `text-slate-500` | `text-muted-foreground` |
| `bg-white` | `bg-background` |
| `bg-slate-50` | `bg-muted` |
| `border-slate-200` | `border-border` |

This is optional but recommended for future maintainability.

## Benefits

1. **Single source of truth** - Theme colors defined in one place
2. **No more conflicts** - TePilot pages are isolated from the dark theme
3. **Easy maintenance** - Future TePilot components automatically get the right colors
4. **Semantic colors** - Components use `text-foreground` instead of `text-slate-900`

## Implementation Order

1. Add `.tepilot-theme` CSS class to `src/styles/base.css`
2. Update the 5 TePilot page files to wrap content in `tepilot-theme`
3. Verify all pages render correctly with proper dark text on white backgrounds

## Technical Notes

- The CSS scoped theme approach uses CSS custom property inheritance
- Child components automatically inherit the light theme variables
- No changes needed to shared UI components (Button, Card, etc.) - they already use CSS variables
- The `color-scheme: light` ensures browser UI elements (scrollbars, inputs) match

