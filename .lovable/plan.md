I’ll tighten the layout specifically for the Orchestrate cards so the “Open AI Assistant” and “Open WM Copilot” buttons cannot overlap with the orchestration bullets.

Planned changes:

1. In `src/components/exec-demo/NextConversationRationale.tsx`, restructure both Orchestrate cards into a strict 3-part vertical layout:
   - Fixed header/label area
   - Flexible workflow/bullet area
   - Fixed CTA footer area

2. Replace the current `mt-auto` footer approach with an explicit reserved footer row:
   - Add a dedicated `shrink-0` footer with its own top border and spacing.
   - Keep the CTA button inside that footer only.
   - Ensure the bullet list cannot render underneath the footer.

3. Make the orchestration content area shorter and safer:
   - Wrap the title + bullets in a `flex-1 min-h-0 overflow-hidden` body.
   - Reduce vertical padding slightly inside the Orchestrate cards if needed.
   - Keep button height consistent and full-width.

4. Apply the exact same pattern to both cards:
   - Regular Client: “Open AI Assistant”
   - Wealth Client: “Open WM Copilot”

5. After implementation, visually verify the `/demo` layout at the current desktop viewport so the Orchestrate text and buttons are separated with no overlap.