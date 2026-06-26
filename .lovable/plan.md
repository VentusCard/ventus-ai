Plan to fix the broken System page:

1. Remove the duplicate Destinations column
   - `CapabilitiesView.tsx` currently renders the Destinations stack twice inside a 3-column grid.
   - The second copy creates an unintended fourth grid column, which pushes/wraps the layout and makes the network diagram appear broken.

2. Rework the diagram grid to be structurally stable
   - Keep one true 3-column layout: Sources → Ventus Core → Destinations.
   - Add `min-w-0` and overflow constraints to the outer grid children so long labels cannot expand columns.
   - Keep the Core card centered and bounded instead of letting it stretch unpredictably.

3. Tighten the Core interior without losing the concept
   - Preserve the two internal bands: Signal families → Applications.
   - Make the signal/application buttons compact and consistently sized.
   - Keep labels truncated where necessary, especially “Next-Conversation · Wealth”.

4. Verify the page visually after implementation
   - Check `/bankdemo` System tab at the current desktop viewport.
   - Confirm there is exactly one Destinations column, no wrapping/overflow, and clicking signals/applications still opens the detail panel.