# Dark Blue Full-Height Sidebar for /bankdemo

## Goal
Transform the left sidebar in `/bankdemo` into a full-height, dark-blue surface with an intelligent, AI-grade hue, while keeping the rest of the application strictly light-themed.

## Current State
- `src/components/tepilot/insights/AnalyticsContainer.tsx` renders the sidebar as a sub-header flex child (`flex-1 min-h-0`) with a light gray background (`bg-slate-50/80`) and slate text/accents.
- The sidebar is bordered with `border-slate-200` and uses a light-blue active state (`bg-blue-50 text-blue-700`).
- The collapse button, resize handle, group labels, and footer items all inherit the light theme.

## Selected Design Direction
- **Palette:** Intelligent Midnight — deep navy/indigo gradient (#0a0a1a → #141432 → #1e1e5a) with #4f46e5 accent glow.
- **Surface treatment:** Subtle top-to-bottom gradient for depth and an intelligent sheen.
- **Theme scope:** Sidebar only; the main content, header, and all page chrome remain strict light theme.

## Changes
1. **Make sidebar full height**
   - Move the sidebar out of the inner flex container so it spans the full viewport height from the top of the page chrome to the bottom, or visually stretch it by removing the header border separation.
   - Keep the header separate and light-themed; the sidebar sits flush against it or underneath it without a visible top border break.

2. **Apply dark blue gradient background**
   - Replace `bg-slate-50/80` and `border-slate-200` with a custom gradient background (`bg-gradient-to-b from-[#0a0a1a] via-[#141432] to-[#1e1e5a]`) or a semantic CSS variable mapped to the same palette.
   - Remove the right border or replace it with a very subtle dark border (`border-white/5` or `border-slate-900/50`).
   - Add a faint ambient glow / sheen (e.g., a small radial gradient accent or a `bg-[radial-gradient(...)]` overlay) to reinforce the "intelligent hue."

3. **Recolor all sidebar elements for dark mode**
   - Group labels: `text-slate-400` → `text-indigo-200/70` or `text-slate-300`.
   - Nav items: `text-slate-600` → `text-slate-300` or `text-indigo-100/80`.
   - Icons: `text-slate-400` → `text-indigo-200/60`.
   - Hover state: `hover:bg-slate-100 hover:text-slate-900` → `hover:bg-white/5 hover:text-white`.
   - Active state: `bg-blue-50 text-blue-700 border-blue-600` → `bg-white/10 text-white border-indigo-400` with a subtle indigo glow (`shadow-[0_0_12px_rgba(79,70,229,0.15)]`).
   - Active icon: `text-blue-600` → `text-indigo-400`.

4. **Update collapse button and resize handle**
   - Collapse button: dark transparent background, light icon, hover `bg-white/5`, remove or darken the border.
   - Resize handle: hover/active color `bg-indigo-400/50` or `bg-white/20` instead of `bg-blue-300/50`/`bg-blue-400`.

5. **Footer items and dividers**
   - Footer section matches the same dark treatment as the nav items.
   - Dividers: `border-slate-200` → `border-white/10`.

6. **Preserve existing behavior**
   - Keep draggable resize behavior and collapse behavior unchanged.
   - Keep the white/light main content area and the top application header unchanged.
   - Ensure the sidebar text remains readable at all supported widths (220px–420px).

## Verification
- Open `/bankdemo` in the preview and confirm the sidebar runs full height and displays the dark blue gradient.
- Confirm group labels, nav items, icons, hover states, and the active tab are visible and readable.
- Resize and collapse the sidebar to ensure no visual regressions.
- Confirm the main content area remains white/light and unaffected by the sidebar theme change.
