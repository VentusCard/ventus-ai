

## Plan: Rename `/demo` route to `/deckmo`

### Changes (single file: `src/App.tsx`)

1. Change the route path from `"/demo"` to `"/deckmo"`
2. Update the `isDemo` check from `location.pathname === "/demo"` to `location.pathname === "/deckmo"`

No other files reference the `/demo` route path directly — the `DemoPage` component import and all internal logic remain unchanged.

### Verification
- Navigate to `/deckmo` to confirm it loads the demo page
- Confirm `/demo` now shows the 404 page

