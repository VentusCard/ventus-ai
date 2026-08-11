Move the "Our Bank" brand into the top of the /bankdemo sidebar

## Goal
Relocate the "Our Bank" brand identity from the horizontal top header back into the top of the left sidebar so it sits above the navigation menu.

## Current State
- In `src/components/tepilot/insights/AnalyticsContainer.tsx`, the top horizontal header contains the "Our Bank" brand: a building icon, the title "Our Bank", and the subtitle "Customer Intelligence and Personalization Platform".
- The left sidebar currently begins with a collapse chevron button and then the "VENTUS AI" navigation group.

## Changes
1. **Remove the brand block from the top header**:
   - Keep the header bar for the right-side controls (date, Ventus AI button, Exit).
   - Replace the left-side "Our Bank" brand block with either the back button (when present) or leave it empty/clean.
2. **Add a brand header at the top of the sidebar**:
   - Place the building icon and "Our Bank" title at the top of the left sidebar, above the collapse button or integrated with it.
   - Use the dark-sidebar color scheme: white text, indigo/white icon, so it remains legible on the midnight gradient.
   - Keep the subtitle visible or condensed to fit the sidebar width.
3. **Adjust collapse button placement**:
   - Ensure the collapse chevron remains reachable and visually balanced, either as a separate row below the brand or as a small button within the brand row.
4. Verify the sidebar still works in both expanded and collapsed states and that the header area does not feel empty.

## Risks
- Removing the brand from the top header could make the header feel unbalanced; we may need to add a small title or leave it clean.
- The brand row in the sidebar consumes vertical space; we should keep it compact so navigation remains visible.
- Collapsed state must still show the brand icon or a recognizable mark.
