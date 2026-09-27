# Redesign “The Complete Picture” beat

## Goal
Recompose this beat as a clear three-part customer intelligence story: bank-held data on the left, the customer at the center, and external context on the right. The visual should feel balanced, precise, and suitable for a bank leadership presentation.

## Composition
- Keep the existing executive header, footer, title, subtitle, light theme, and two-step reveal behavior.
- Replace the current stacked source cards and empty convergence area with a wide, symmetrical left-to-right composition.
- Place **Inside the Walls** on the left and **Outside the Walls** on the right as equal-weight source panels.
- Place a strong customer portrait/identity node in the center, labeled **One Living Customer View**, with the existing question beneath it.
- Use restrained directional connectors from both source panels into the customer, making the customer—not a database—the visual outcome.

## Source content
- Keep the existing Inside the Walls title and pills: Checks, Wires, Zelle, Card swipes, P2P, and Digital telemetry.
- Keep the existing Outside the Walls title and pills: Credit bureaus, Data compilers, and National databases.
- Add **SKU-level purchase data** as a fourth Outside the Walls pill.
- Remove **For marketing and personalization only** completely.

## Presentation behavior
- First step: show both source panels and the centered customer in a calm, clearly structured state.
- Second step: strengthen the connectors and reveal the unified living-customer-view treatment without moving the overall layout.
- Use subtle, professional motion only; respect reduced-motion settings.

## Technical details
- Update the centralized beat copy in `deckmoScript.ts`.
- Rebuild only the `LivingView` scene and its small supporting presentation elements in `DeckmoDeck.tsx`.
- Reuse the deck’s existing semantic colors, typography, spacing, and border tokens; add no new visual theme.
- Keep the slide readable and unclipped at 1024×768, 1440×900, and 1920×1080.

## Verification
- Confirm the customer is visually centered between the two source panels.
- Confirm the removed disclaimer no longer appears anywhere on the beat.
- Confirm the new SKU-level purchase data pill appears on the outside panel.
- Check both reveal steps, keyboard/footer navigation, all supported presentation sizes, and preview diagnostics.

## Scope
Only “The Complete Picture” beat changes. Other `/deckmo` beats and `/bankdemo` remain unchanged.