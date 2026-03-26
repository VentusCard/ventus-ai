

## Fix sidebar to screen height, scroll only main content

### Problem
Currently the entire container (sidebar + content) scrolls together. The left sidebar should be fixed to the full screen height while only the right panel scrolls.

### Changes (single file: `src/components/tepilot/insights/AnalyticsContainer.tsx`)

1. **Outer container** (line 96): Change from `min-h-[600px]` to `h-screen flex flex-col` so it fills the viewport
2. **Inner flex wrapper** (line 124): Change `min-h-[560px]` to `flex-1 min-h-0` so it fills remaining space after the header
3. **Sidebar** (line 125-198): Add `h-full overflow-hidden` — the nav inside already has `overflow-y-auto` so sidebar nav scrolls independently if needed
4. **Content area** (line 201): Already has `overflow-y-auto` — just ensure it works with the new height constraint by keeping `flex-1 min-h-0`

This makes the sidebar stick to the viewport height while the main content panel scrolls independently.

