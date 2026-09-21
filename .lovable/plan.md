# Minimal password gate for /deckmo

## Goal
Strip the /deckmo password screen down to a short two-line header and the password field. Remove the Ventus logo, old tagline, three bullet points, and the Problem / Team / Vision accordion cards.

The header shows exactly two lines:
1. "Interactive Presentation"
2. "Hyper-personalized banking orchestration to identify and capture high value financial moments"

## Current state (confirmed)
- `src/pages/DemoPage.tsx` wraps the deck in `SimplePasswordGate`, passing `tagline` ("A scripted customer intelligence story for bank leaders") and `gateBullets` from `src/lib/deckmoScript.ts` (lines 30-31), with `showSettings={false}` and `allowDemoBypass`.
- `src/components/demo/SimplePasswordGate.tsx` renders: settings gear (hidden for deckmo), Ventus logo, tagline, bullet row, the three accordion cards (Problem / Team / Vision) with expandable text, then the password form ("Enter password" input, error text, "Enter Demo" button).
- The same component serves `/demo`, so the shared component must not change for that route.

## Changes
1. `src/components/demo/SimplePasswordGate.tsx`
   - Add a `minimal?: boolean` prop.
   - When `minimal` is true, render only a centered "Interactive Presentation" heading (Manrope, slate-800, matching the deck's presentation typography) plus the existing password form (input + "Enter Demo" button + error text). Skip logo, tagline, bullets, accordion, and settings gear.
   - Leave all auth behavior untouched: same password, same sessionStorage key, same `?from=demo` bypass.
2. `src/pages/DemoPage.tsx`
   - Pass `minimal` to `SimplePasswordGate` and drop the `tagline`/`bullets` props (no longer used on this route).
3. `src/lib/deckmoScript.ts`
   - Remove the now-unused `gateTagline` and `gateBullets` fields from `DECKMO.chrome`.

## Out of scope
- `/demo` gate and all other `SimplePasswordGate` usages stay exactly as they are.

## Validation
- Playwright: load /deckmo signed out, confirm the gate shows only "Interactive Presentation", the password input, and "Enter Demo"; enter the password and confirm the deck opens.
- Confirm /demo's gate still shows its full layout (logo, tagline, bullets, accordions).
- Check build log and typecheck are clean.
