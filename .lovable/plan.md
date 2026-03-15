

## Plan: Add Desktop-Only Blocker to /demo

Add a device check at the top of `DemoPasswordGate.tsx` (before the keynote slides and password form) that blocks mobile and small tablet users (< 1024px), matching the pattern used in TePilot.

### Changes

**File: `src/components/demo/DemoPasswordGate.tsx`**

1. Import `useIsMobile` and `useIsTablet` from `@/hooks/use-mobile` and `Monitor` from `lucide-react`.
2. At the top of the component (before the `granted` check on line 116), add a screen size check:
   - `const isSmallScreen = useIsMobile() || useIsTablet()`
   - If `isSmallScreen`, return a centered card with a Monitor icon, "Desktop Required" title, and a message saying the demo requires a larger screen. Include a "Return to Home" button linking to `/`.
3. Style the blocker to match the demo's existing aesthetic (Manrope font, slate palette, same gradient background as the password gate).

This ensures the blocker appears before any keynote content or password input on small devices.

