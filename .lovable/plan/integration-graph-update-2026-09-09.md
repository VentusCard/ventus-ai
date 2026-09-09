# Integration Graph Update

## Goal
Make two small changes to the homepage Integration section graph:
1. Remove the Salesforce Financial Cloud destination card.
2. Rename the "Marketing Automation" destination card to "Marketing/CRM automation".

## Current state
`src/components/IntegrationSection.tsx` defines the `destinations` array with six cards:
- Ventus AI Database
- Marketing Automation
- AI Coworker
- Salesforce Financial Cloud
- Rewards Engine
- Digital Banking App

## Proposed changes
- Delete the `{ name: "Salesforce Financial Cloud", src: salesforceLogo }` entry from `destinations`.
- Change the `label` of the Marketing Automation tile from `"Marketing Automation"` to `"Marketing/CRM automation"`.
- Remove the now-unused `salesforceLogo` import.

## Files to change
- `src/components/IntegrationSection.tsx`

## Out of scope
- No other homepage sections.
- No layout or connector math changes beyond the natural SVG update that follows from one fewer destination card.
- No new assets or backend changes.
