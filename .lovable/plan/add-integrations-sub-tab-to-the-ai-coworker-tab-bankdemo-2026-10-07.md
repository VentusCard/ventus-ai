# Add "Integrations" sub-tab to the AI Coworker tab (/bankdemo)

## What you'll see
A fifth button next to Coworker Dashboard / User View / Persona Settings / Live Work Stream, called **Integrations**. It shows six cards, one for each existing coworker, each naming the system that coworker sends its output to:

| Coworker | Destination | What gets delivered |
|---|---|---|
| Bank Leadership | Microsoft Outlook / Teams | Weekly pulse posted to the leadership channel |
| Product & Growth | Salesforce Financial Services Cloud | Product-gap opportunities created as records |
| Risk & Compliance | ServiceNow (risk case queue) | Flags opened as review cases |
| Rewards & Deals | Bank rewards engine | Offer refreshes pushed as eligible perks |
| Relationship Managers | Salesforce FSC advisor tasks | Next-outreach tasks with talking points |
| Marketing / Campaign Ops | Adobe Marketo | Segment-of-one audiences and draft copy |

Each card shows: coworker name (same color as elsewhere), destination name, status pill ("Connected"), last sync time, items sent this week, and a one-line "what gets sent" description. Simple flow line per card: Coworker → arrow → Destination.

All mock data, strict light theme (white cards, slate-200 borders), works in the /deckmo slide 9 embed too since it reuses the same screen.

## Technical details
- `coworkerInboxData.ts`: add `COWORKER_INTEGRATIONS` keyed by `TEAM_DESTINATIONS` ids (destination, deliverable, lastSync, weeklyItems).
- New `CoworkerIntegrationsView.tsx` in `coworker-inbox/`: 3-column card grid.
- `BankwideWMCopilotView.tsx`: add `"integrations"` view mode + toggle (Plug icon) and render the new view.
- Verify with Playwright at 1375x842 on /bankdemo: tab switches, six cards render.

Destination choices are my suggestion — tell me if your banks use different tools.
