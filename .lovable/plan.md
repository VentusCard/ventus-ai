## Responsive Left Navigation

Make the left nav in `AnalyticsContainer.tsx` adapt to viewport width while keeping a wider, more comfortable desktop layout.

### Breakpoints & behavior

| Viewport | Width | Behavior |
|---|---|---|
| Desktop (`lg`, ≥1024px) | `w-[280px]` (up from 240px) | Full labels + group headers, manual collapse toggle still works to shrink to icon rail |
| Tablet (`md`, 768–1023px) | `w-[56px]` icon rail | Icons only, group labels hidden, tooltips on hover via `title` |
| Mobile (`<md`) | Hidden by default | Hamburger button in the header opens an offcanvas drawer (`Sheet`) showing the full 280px nav; tap an item to navigate and auto-close |

Note: the `/tepilot` and `/deckmo` desktop-required overlays already block real mobile use, but `/bankdemo` and other entry points still benefit. The mobile drawer is a graceful fallback rather than a primary UX.

### Implementation in `src/components/tepilot/insights/AnalyticsContainer.tsx`

1. **State**
   - Replace single `collapsed` boolean with viewport-aware logic:
     - `mobileOpen` state for the drawer.
     - Use existing `useIsMobile` hook (`@/hooks/use-mobile`) + a new `useBreakpoint`-style check (or inline `window.matchMedia('(min-width: 1024px)')` via a small `useMediaQuery` hook) to know if we're on desktop.
   - Keep the manual `collapsed` toggle, but only show the toggle button on desktop. On tablet the sidebar is force-collapsed; on mobile the sidebar lives inside a Sheet.

2. **Render branches**
   - Extract nav body (header toggle row + nav + footer items) into a local `NavBody({ collapsed })` render function so we don't duplicate JSX between desktop sidebar and mobile Sheet.
   - Desktop / tablet: render an inline `<aside>` with responsive classes
     - `hidden md:flex shrink-0 border-r border-slate-200 bg-slate-50/80 transition-all duration-200 flex-col`
     - Width: `collapsed || isTablet ? 'w-[56px]' : 'w-[280px]'` (tablet = `md` but not `lg`)
   - Mobile: render a hamburger `Button` (in the existing top header, left of the bank logo cluster, visible only `md:hidden`) that opens a shadcn `Sheet` with `side="left"`, `className="w-[280px] p-0 bg-white"` containing `<NavBody collapsed={false} />`. Clicking a nav item calls `setMobileOpen(false)` after `setActiveTab`.

3. **Toggle button visibility**
   - The chevron collapse/expand row stays, but only renders `lg:flex hidden` so tablet users can't expand past the icon rail.

4. **Light theme guardrail**
   - The Sheet uses `bg-white` + `border-slate-200`, no `dark:` utilities, per the Dialog/Popup Light Theme memory.

### Files

- **Edit** `src/components/tepilot/insights/AnalyticsContainer.tsx` — all changes above.
- **No changes** to `src/components/ui/sidebar.tsx` (we're not switching to the shadcn Sidebar component; the existing custom nav stays, just made responsive). Reusing `Sheet` from `@/components/ui/sheet`.
- Add a tiny `useMediaQuery` helper inline (or just `useEffect` + `matchMedia`) — no new file needed.

### Out of scope

- No changes to chat panel layout, header content, or any tab views.
- Not migrating to the shadcn `Sidebar` primitive — would be a much bigger refactor and unnecessary for this request.
