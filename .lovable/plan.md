

## Two Changes: Page-Level Logo + Engine Card Rename

### 1. Add Ventus logo + one-liner to top-left of the page
**File: `src/pages/DemoPage.tsx`**

Add a persistent top-left branding element (visible whether panel is expanded or collapsed) showing:
- Ventus logo image (`ventus-logo-blue.png`, ~28px)
- One-liner: *"AI-powered transaction intelligence"* in muted text

Position it as an absolute element at `top-4 left-4` (when panel collapsed) or inside the right panel area top-left (when panel expanded, offset to clear the panel). Use `z-50` so it floats above content. Adjust the existing "Show Panel" button position so they don't overlap.

### 2. Rename engine card from "Ventus AI Engine" to "Advanced Enrichment"
**File: `src/components/demo/DemoNetworkDiagram.tsx`**

- Remove the indigo "V" square icon entirely (the `<div>` with rounded-xl bg-indigo-50 and the `<span>V</span>`)
- Change the title text from `"Ventus AI Engine"` to `"Advanced Enrichment"`
- Keep everything else (capabilities list, processing/ready states, click behavior) unchanged

