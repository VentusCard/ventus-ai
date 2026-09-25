# Beat 8.4 — Three-phone rotating carousel

## Goal
Replace the cramped seven-phone grid with the earlier large-phone presentation, showing three readable AI conversations at a time.

## Changes
- Keep all seven conversations and their existing customer-/AI-initiated message order.
- Render three phones in one centered row using the original 8.4 phone proportions, navigation bars, chatbot styling, and larger readable scale.
- Rotate the conversations automatically in a continuous sequence so every example appears without adding carousel buttons.
- Keep the Hawaii assistant as one carousel item and preserve its existing conversation state when it leaves and returns.
- Preserve each phone’s independent typed conversation state throughout rotation.
- Pause rotation while a user is focused in or interacting with a chatbot, then resume afterward.
- Transition each group with a smooth right-to-left roll matching the established 8.4 motion; use a static three-phone view when reduced motion is enabled.
- Keep slide arrow navigation unchanged and ensure carousel timing never triggers slide navigation.

## Verification
- Check beat 8.4 at 1540×855 and 1920×1080.
- Confirm exactly three large phones are visible at once, all seven rotate through, and no content clips or overlaps the presentation header/footer.
- Confirm Hawaii and typed chat state survive rotation, interaction pauses the loop, and deck arrow navigation still works.
- Confirm the preview build is clean.
