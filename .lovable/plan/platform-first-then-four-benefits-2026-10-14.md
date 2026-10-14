# Platform first, then four benefits

## Deck order
Move the current Section 9 platform experience directly after “Ricky, understood,” making it the new **Section 5**.

1. Thesis
2. The Visibility Gap
3. The Complete Picture
4. Ricky, understood
5. Platform / Tools for the Bank
6. Immediate: Lower Service Cost
7. Mid-Term: Profit
8. Mid-Term: Growth
9. Long-Term: Retention & NPS
10. The Ask

Keep the existing platform headline and description; this change does not introduce new marketing copy.

## Platform and benefit navigation
- Present Section 5 as one platform overview, initially showing the existing Ventus AI view, rather than three separate stops for Intelligence Database, Automated Flows, and AI Coworker.
- Keep the embedded platform fully clickable and scrollable. Its own sidebar continues to provide access to Intelligence Database, Automated Flows, AI Coworker, and the other tools.
- Replace the three labels above the platform with four benefit buttons: **Lower Service Cost**, **Profit**, **Growth**, and **Retention & NPS**.
- As requested, each button opens the first slide of its matching benefit section, rather than switching platform views.
- Keep the buttons compact and allow a separate row when necessary so they do not crowd the headline or reduce the platform’s usable space.
- Preserve every existing slide and internal reveal in the four benefit sections.

## Navigation safeguards
- Update slide numbers, header navigation, progress, and the table of contents to match the new order.
- Arrow buttons and Left/Right or A/D retain their existing navigation behavior.
- The four benefit buttons are explicit navigation controls; other canvas clicks and embedded platform interactions must not advance the deck.
- Preserve the password gate, desktop requirement, light theme, institution wording, Section 4 animations, and pop-ups.
- Do not change the standalone platform’s content or behavior.

## Technical details
- Update the ordered beats and platform step mapping in `src/lib/deckmoScript.ts`.
- Replace the three labels in `BankdemoBankTools` within `src/components/deckmo/DeckmoBankdemoScenes.tsx` with existing design-system buttons.
- Provide an explicit, deck-scoped navigation callback from `src/components/deckmo/DeckmoDeck.tsx`; resolve destinations by beat ID rather than hardcoded slide numbers.
- Record the explicit benefit-navigation exception in the project’s architecture guidance and update the task roadmap during implementation.

## Verification
- Add focused navigation tests for the new order, single platform stop, and all four benefit destinations; run the relevant deck tests.
- Verify the central flow in the live deck: enter Section 5, use the platform sidebar, click each benefit button, and confirm its destination and slide number.
- Check platform and button layout at 1903×1024 and a narrower desktop viewport, including headline fit and footer clearance.
- Confirm arrows and A/D still navigate correctly, typing inside the platform does not navigate, and unrelated clicks do not change slides.
- Inspect preview diagnostics before reporting completion.