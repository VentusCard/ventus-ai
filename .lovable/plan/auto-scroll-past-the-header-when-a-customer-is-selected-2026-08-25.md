# Auto-scroll past the header when a customer is selected

On the three personalization tabs (Personalized Deals, Personalized Product, Personalized Relationship), selecting a customer will smoothly scroll the content area down so the page header scrolls out of view, giving the workspace full height. Deselecting or switching tabs scrolls back to the top.

## Behavior

- Selecting a customer (example customer or session customer): the content pane smooth-scrolls so the top of the customer workspace sits just under the top edge.
- Clearing the selection, or switching sub-tabs / main tabs: scroll returns to the top so the header is visible again.
- The user can still scroll up manually at any time to see the header — nothing is hidden or removed, only scrolled.
- No behavior change on non-personalization tabs.

## Technical notes

- The scrollable element is the content pane in `AnalyticsContainer.tsx` (already has a `contentRef`).
- Add a small shared hook (e.g. `useScrollIntoWorkspace`) that finds the nearest scrollable ancestor and scrolls it to the workspace anchor with `behavior: "smooth"`.
- In `CustomerMockupPanel.tsx`, attach a ref to the workspace root and run the scroll in an effect keyed on the active selection (`selectedId` / session customer), skipping the initial mount when nothing is selected.
- Guard with `prefers-reduced-motion` to fall back to an instant jump.
