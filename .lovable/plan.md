

## Remove Deck Slide Buttons & Images, Keep "Learn More" Section

### Changes to `src/components/ContactFormDialog.tsx`

- Remove the 3 deck image imports (lines 5-7) and the `DECK_PAGES` array (lines 14-18)
- Remove `activeDeck` state and unused imports (`X`, `Users`, `Crosshair`, `Rocket`)
- Remove the full-screen deck viewer overlay (lines 87-106)
- Simplify the Dialog `open` prop (no `activeDeck` conditional needed)
- **Keep** the right-side "Learn More" panel container and heading — just empty the button list, leaving it as a placeholder section with the "Learn More" title and an empty area below it

