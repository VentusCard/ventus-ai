## Goal
Remove the "Example conversations" section from the Coworker Dashboard (`/bankdemo` → "Coworker Dashboard" tab).

## Scope
- Delete the entire **section 4. Example conversations** block (lines 210–237) from `CoworkerInboxView.tsx`.
- Remove now-unused imports (`ArrowUpRight`, `MessageBubble`) and the `ExampleThreadCard` sub-component (lines 300–340).
- Remove now-unused local variables (`advisorThread`, `leadershipThread`) that fed only that section.

## Out of scope
- No changes to `AdvisorNotificationsView.tsx`, `LeadershipNotificationsView.tsx`, or any other view.
- No changes to `coworkerInboxData.ts`.

## Expected result
The Coworker Dashboard page ends after the "Team status" panel, with no "Example conversations" cards visible and no orphaned code left behind.