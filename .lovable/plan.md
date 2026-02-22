

# Add "Note Taking" Chip to Wealth Management Co-Pilot

## Overview
Add a "Note Taking" chip to the primary chips row in the Ventus AI Chat panel. Clicking it opens a dialog with structured sections relevant to an advisor-client meeting. On submit, the notes are parsed into action items and added to the Next Steps panel.

## Note Taking Dialog Sections

| Section | Field Type | Purpose |
|---|---|---|
| Meeting Context | Dropdown (Quarterly Review, Annual Review, Ad-hoc, New Client Onboarding, Life Event Follow-up) | Categorize the meeting |
| Attendees | Text input | Who was present |
| Client Sentiment | 5-point radio (Very Positive, Positive, Neutral, Concerned, Anxious) | Quick mood gauge |
| Key Discussion Points | Multi-line textarea | Free-form meeting notes |
| Client Requests | Multi-line textarea | Specific asks from the client |
| Decisions Made | Multi-line textarea | Agreed-upon outcomes |
| Products Discussed | Checkbox group (Checking, Savings, Mortgage, Investment Portfolio, Insurance, 529 Plan, IRA, Credit Card) | Track cross-sell/upsell topics |
| Follow-up Actions | Repeatable text inputs (add/remove rows) | Specific tasks with owner assignment |
| Next Meeting | Date picker + text input for topic | Schedule follow-up |

## Behavior on Submit
1. Each "Follow-up Action" row becomes a Next Steps action item with source `'notes'`
2. If "Client Requests" has content, parse each line into an action item prefixed with "Client request:"
3. If "Decisions Made" has content, parse each line into an action item prefixed with "Decision:"
4. Toast confirmation: "Meeting notes saved - X action items added"
5. Dialog closes

## Files to Create/Modify

| File | Change |
|---|---|
| `src/components/tepilot/advisor-console/MeetingNotesDialog.tsx` | **New file** - Dialog component with all sections, form state, and submit logic |
| `src/components/tepilot/advisor-console/VentusChatPanel.tsx` | Add "Note Taking" to `primaryChips`, add dialog state, handle chip click to open dialog, pass `onExtractNextSteps` to dialog |
| `src/components/tepilot/advisor-console/sampleData.ts` | Add `'notes'` to the `NextStepsActionItem.source` union type |

## Technical Details

### VentusChatPanel changes
- Add `"Note Taking"` to the `primaryChips` array (line 205)
- Add `meetingNotesOpen` state
- In `handleChipClick`, add a case for `"Note Taking"` that sets `meetingNotesOpen = true` and returns (same pattern as "Tax Planning")
- Render `<MeetingNotesDialog>` with `open={meetingNotesOpen}` and pass `onExtractNextSteps` as the submit handler

### MeetingNotesDialog component
- Uses existing `Dialog`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`, `RadioGroup` UI components
- Local form state for all fields
- `handleSubmit` function that:
  - Collects follow-up action rows into `NextStepsActionItem[]` with source `'notes'`
  - Splits "Client Requests" and "Decisions Made" by newlines into additional action items
  - Calls `onSubmitNotes(actionItems)` prop
  - Resets form and closes dialog

### sampleData.ts type update
- Change `source: 'chat' | 'transcript' | 'manual' | 'timeline'` to include `| 'notes'`

### Action item source badge
- The existing `ActionWorkspacePanel` already renders a source badge per item, so items with source `'notes'` will automatically show a "notes" badge
