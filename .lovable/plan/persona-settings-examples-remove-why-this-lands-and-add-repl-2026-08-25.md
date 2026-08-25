# Persona Settings Examples: remove "Why this lands" and add reply options

## Change

In the Persona Settings sub-tab's **Examples** column:

1. **Remove** the "Why this lands" explanation card from `ExamplesPanel`.
2. **Expand** each coworker's `replyPrompts` from 2 to 4–5 contextually relevant reply options.

## Files touched

- `src/components/tepilot/coworker-inbox/coworkerPersonaData.ts`
  - Drop the `why` field from `CoworkerExample`.
  - Add 2–3 extra reply prompts per role, tailored to what that coworker would realistically be asked next.
- `src/components/tepilot/coworker-inbox/CoworkerPersonaSettingsView.tsx`
  - Remove the "Why this lands" card block from `ExamplesPanel`.
  - Keep the subject/body email card and the "Reply and it will…" chip list.
  - Optionally widen the reply chip area now that the card above it is gone.

## Out of scope

- No changes to rule editing, left rail, save/reset behavior, or other tabs.
- No backend or data model changes beyond the local demo content object.
