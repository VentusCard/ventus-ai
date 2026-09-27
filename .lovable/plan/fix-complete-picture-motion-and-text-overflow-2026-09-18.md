# Fix Complete Picture motion and text overflow

## Goal
Make the animation immediately visible whenever the Complete Picture slide is shown, while keeping every heading and pill contained at the current 1494×855 presentation size and the supported desktop sizes.

## Changes
- Keep the customer node breathing continuously on both reveal steps instead of mounting the animation only after advancing.
- Keep subtle signal particles moving inward on both steps; the second step will strengthen the connectors and pulse rather than being the only animated state.
- Increase animation visibility with clearer ring opacity, a slightly stronger node pulse, and staggered left/right signal timing while retaining a restrained boardroom feel.
- Replace the rigid five-column sizing with a responsive composition that gives both source panels enough width and lets the connector lanes contract first.
- Constrain source-card headings and pills with safe wrapping, balanced line heights, and minimum-width guards so “SKU-level purchase data” and other long labels stay inside their panels.
- Tighten vertical spacing only on shorter presentation screens so the diagram remains above the footer without shrinking normal desktop layouts.
- Preserve reduced-motion support by showing a clear static active state when animation is disabled.

## Verification
- Open both Complete Picture steps and confirm motion is visible without waiting for another navigation action.
- Check for text clipping, horizontal spill, and footer overlap at 1024×768, 1494×855, 1440×900, and 1920×1080.
- Confirm keyboard, canvas, and footer navigation still advance the two-step reveal correctly.
- Confirm no preview errors or external requests are introduced.

## Scope
Only the Complete Picture beat and its presentation-specific motion styles will change. Other `/deckmo` beats and `/bankdemo` remain unchanged.