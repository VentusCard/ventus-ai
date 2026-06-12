The "Behavioral Intelligence Ready" CTA at the bottom of the intel panel is positioned with `mt-auto` inside an `h-full` flex column. When `ExecDemoPage` is embedded in `/bankdemo`, its root is `h-screen` (100vh), which is taller than the available `/bankdemo` content pane (the pane sits below the bankdemo top bar). The embed wrapper's `overflow-auto` lets the page scroll, but the bottom button ends up below the visible fold — making it appear missing.

**Fix:** make `ExecDemoPage` size to its container instead of the viewport, and have the standalone `/demo` route give it a viewport-tall container.

**Files to edit:**

1. `src/pages/ExecDemoPage.tsx` (line 1301)
   - Change root `<div className="h-screen ...">` to `<div className="h-full min-h-0 ...">` so the page fills whichever parent provides height.

2. `src/App.tsx` (line 66)
   - Wrap the `/demo` route element in an `h-screen` container so the standalone route still gets full viewport height:
     `<Route path="/demo" element={<div className="h-screen"><ExecDemoPage /></div>} />`

3. `src/components/tepilot/insights/AnalyticsContainer.tsx` (line 159-163)
   - Simplify the embed wrapper so ExecDemoPage gets a real fixed height to fill (no need for the `calc(100% + 2rem)` trick once `h-full` works):
     `<div className="-m-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] bg-white overflow-hidden"><ExecDemoPage /></div>`
   - Removing the outer `overflow-auto` prevents the double-scroll that was hiding the button; ExecDemoPage already manages its own internal scroll regions.

After this, the full ExecDemoPage flow (top bar → 3 columns → "Behavioral Intelligence Ready" bottom CTA) is visible inside the bankdemo Demo tab without scrolling the whole page.