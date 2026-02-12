

# Add Animated Demo Sections to Capability Pages

## Overview
Add a dedicated "See It In Action" section to each of the 4 capability pages under /technology, embedding your custom HTML/CSS animation scripts as interactive demos. You have all 4 animations ready to paste in.

## Approach

### 1. Create a Reusable AnimatedDemo Component
Build a wrapper component at `src/components/technology/AnimatedDemo.tsx` that:
- Accepts raw HTML content as a prop
- Renders it safely using `dangerouslySetInnerHTML`
- Wraps it in a styled container that matches the existing page aesthetic (glassmorphic card with border, backdrop blur)
- Includes the "See It In Action" heading with the staggered `animate-fade-float` entrance animation consistent with other sections
- Scopes the injected CSS to avoid conflicts with the rest of the site

### 2. Create Per-Page Animation Data Files
Create 4 files under `src/components/technology/demos/`:
- `enrichment-demo.ts` -- your Transaction Enrichment HTML (the one you shared)
- `rewards-demo.ts` -- Smart Rewards animation HTML
- `engagement-demo.ts` -- Engagement animation HTML
- `wealth-demo.ts` -- Wealth Management animation HTML

Each file exports a string constant with the full HTML + scoped CSS for that demo. You will paste your animation HTML into each file.

### 3. Integrate Into Each Page
Add the AnimatedDemo component into each of the 4 pages as a new section placed between the "Overview" and "Key Features" sections:
- `src/pages/Enrichment.tsx`
- `src/pages/SmartRewards.tsx`
- `src/pages/Engagement.tsx`
- `src/pages/Wealth.tsx`

Each page imports its corresponding demo HTML and passes it to the AnimatedDemo wrapper.

### 4. CSS Scoping Strategy
The demo HTML uses its own scoped ID selectors (e.g., `#ventus-te-enterprise`), which already provides natural CSS isolation. The wrapper component will:
- Add `isolation: isolate` to prevent stacking context leaks
- Ensure the demo fonts don't override the site-wide Inter/DM Mono
- Apply the existing page animation delay pattern for the entrance

---

## Technical Details

### AnimatedDemo Component Structure
```text
+--------------------------------------------------+
| Section: "See It In Action"  (animate-fade-float) |
|                                                    |
|  +----------------------------------------------+ |
|  | Glassmorphic Card Container                   | |
|  | (border-white/20, bg-white/5, backdrop-blur)  | |
|  |                                               | |
|  |   [dangerouslySetInnerHTML = demo HTML]        | |
|  |                                               | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

### File Changes Summary
- **New**: `src/components/technology/AnimatedDemo.tsx` -- reusable wrapper
- **New**: `src/components/technology/demos/enrichment-demo.ts` -- your HTML pasted here
- **New**: `src/components/technology/demos/rewards-demo.ts` -- placeholder for your HTML
- **New**: `src/components/technology/demos/engagement-demo.ts` -- placeholder for your HTML
- **New**: `src/components/technology/demos/wealth-demo.ts` -- placeholder for your HTML
- **Modified**: `src/pages/Enrichment.tsx` -- add AnimatedDemo section
- **Modified**: `src/pages/SmartRewards.tsx` -- add AnimatedDemo section
- **Modified**: `src/pages/Engagement.tsx` -- add AnimatedDemo section
- **Modified**: `src/pages/Wealth.tsx` -- add AnimatedDemo section

### Implementation Steps
1. Create the AnimatedDemo wrapper component
2. Create the 4 demo data files (I will paste the Enrichment HTML you shared; the other 3 will be empty templates for you to paste your HTML into)
3. Import and add the demo section to each page between Overview and Key Features
4. Verify styling consistency and animation behavior
