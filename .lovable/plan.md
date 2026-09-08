# Move Hero Pop-Up Panel to the Right of the Animation (Desktop)

## Goal
On desktop, reposition the "Ventus Orchestrate" pop-up panel so it appears to the right of the dark transaction card instead of above it. Narrow the headline/CTA column to make room. Keep the existing mobile/tablet layout unchanged.

## Proposed Changes

### 1. Update `src/components/ScrollDrivenHero.tsx`

#### Adjust the hero grid on desktop
- Change the sticky hero flex layout so the left text column narrows and the right visual column widens on `xl` screens.
- Current: left `xl:w-[62%]`, right `xl:w-[38%]`.
- Proposed: left `xl:w-[55%]`, right `xl:w-[45%]` (or similar ratio that keeps text readable while giving the animation + panel enough room).

#### Reposition the Orchestrate panel
- Move the desktop-only `hidden xl:block` Orchestrate panel out of its current position above the dark card.
- Wrap the dark card and the panel in a horizontal flex container on desktop so they sit side-by-side.
- The panel should be vertically centered with the dark card, with a fixed width (e.g., 220–260px) and a small gap from the card.

#### Preserve mobile/tablet behavior
- Keep the existing `xl:hidden` mobile/tablet panel that sits inside the bottom-right of the dark card.
- Do not change the stage logic, scroll-driven animations, or persona cycling.

#### Update connecting lines
- Redirect the SVG dashed connecting lines so they run from the panel (right) toward the dark card (left) instead of downward into the card.
- Keep the same animated dash offset and color theming tied to the active persona.

#### Polish spacing and alignment
- Ensure the panel's three output cards remain readable at the new width.
- Adjust margins/gaps so the right column no longer needs the extra top margin previously used to make room for the panel above the card.
- Keep the stage indicator below the dark card; it should span only the card width, not the combined card + panel width.

## Outcome
On desktop, the hero animation shows the dark transaction card on the left and the "Ventus Orchestrate" pop-up panel on the right, creating a clearer left-to-right flow from raw data → intelligence → orchestrated actions. Mobile and tablet layouts stay exactly as they are.
