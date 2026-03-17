

## Plan: Adapt /demo UX Content into EngagementPreview (No Phone Frame)

Take the content from `DemoEngagementView`'s `PhoneMockup` but strip the phone frame/browser chrome. Render the app content directly into the preview area to fit naturally within the Platform tab dimensions.

### Changes

**File: `src/components/PlatformTabs.tsx`** (lines 161-291, `EngagementPreview`)

Replace entirely with static versions of the `/demo` UX elements, rendered directly (no phone border, no browser bar):

1. **Greeting + subtitle** — "Good morning, Sarah" / "Your personalized banking experience"
2. **Lifestyle banner** — blue gradient card with "Your Lifestyle" label, "WELLNESS EXPLORER" title, "Top spending: Dining & Wellness"
3. **"Your Lifestyle Spending" 2×2 grid** — 4 pillar cards (Dining, Wellness, Travel, Shopping) each with emoji icon, name, progress bar, spend/budget text. Expandable subcategories not needed (static preview).
4. **Achievement card** — amber gradient, Trophy icon, "Dining Streak: 5 weeks under budget", progress bar with score badge
5. **Coaching tip card** — blue gradient, Lightbulb icon, "Wellness spending is up 28%…" with "Got it" / "Need help" buttons

Remove: raw categories array, 3-column transformation grid, ArrowRight import (if unused elsewhere). Keep using the existing `categoryGroups` data for the 2×2 spending grid.

