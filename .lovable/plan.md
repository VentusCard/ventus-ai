## Goal
Redesign the interactive "Powered by Ventus AI" badge in the `/bankdemo` professional header so it feels like an active, in-service AI assistant: blue gradient pill, green live dot, and the label "Ventus AI".

## Where it lives
- `src/components/tepilot/insights/AnalyticsContainer.tsx` lines 324–339 (the header button + static badge).
- The badge is only interactive when the user is not already on an AI tab or in the chat panel.

## What I’ll change
1. **Visual redesign of the badge**
   - Replace the current slate/white pill with a blue gradient background (`bg-blue-metallic` project token or a `linear-gradient` utility class) and white text.
   - Add a small green dot with a subtle pulse animation to signal "live / in service."
   - Change label from "Powered by Ventus AI" to "Ventus AI".
   - Remove the `Sparkles` icon so the green dot becomes the primary status cue.
   - Keep rounded-full shape and compact sizing (similar height/padding).

2. **Interaction states**
   - Interactive version (opens chat): hover brightens/lightens the gradient, cursor pointer, focus ring.
   - Static version (when chat is open or on an AI tab): same gradient + dot styling, but no hover/click affordance.

3. **CSS / tokens**
   - Add a reusable `.ventus-ai-live-dot` utility in `src/styles/components.css` (or scoped inline) using a green HSL color and a soft pulse shadow.
   - Keep the change inside the existing `.tepilot-theme` light scope so it respects the strict light-theme policy.

4. **Accessibility**
   - Preserve `title` / `aria-label` text like "Open Ventus AI" on the interactive version.
   - Ensure contrast between white text and the blue gradient passes.

## Verification
- Run the Vite build/typecheck.
- Use Playwright to log into `/bankdemo` and capture a screenshot of the header badge in both interactive and static states.
- Confirm the green dot is visible, the gradient reads as blue, and the label says "Ventus AI".

## Out of scope
- No changes to chat behavior, routing, or other pages.
- No backend or data changes.

## Open design choice
Should the badge include a small sub-label like "Live" next to the dot, or is "Ventus AI" + the green dot enough? I’ll default to just "Ventus AI" + dot unless you say otherwise.