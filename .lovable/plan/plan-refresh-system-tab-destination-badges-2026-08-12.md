# Plan: Refresh System Tab Destination Badges

## What we're changing

On the `/bankdemo` System tab, the activation-destination cards currently show a green "Live" badge on the right. We will replace that badge with a compact status indicator: a green dot followed by a bracketed team/channel abbreviation (e.g. `● [CRM]`).

## Proposed mapping


| Destination card            | New badge           |
| --------------------------- | ------------------- |
| Intelligence Database       | ● [Ventus]          |
| Ventus AI Coworker          | ● [Email]           |
| Automations Campaign        | ● [CRM]             |
| Custom Product Builder      | ● [CRM]             |
| Personalized Reward Program | ● [Digital Banking] |
| Local Merchant Deals        | ● [Ventus]          |


## Scope

- Edit only `src/components/tepilot/insights/CapabilitiesView.tsx` in the `NodeCard` / destination-card render area.
- Preserve card layout, hover states, typography, and the existing green-dot color.
- No functional changes; this is a visual label update only.

## Open question

Please confirm the bracket abbreviations above, or provide the exact set you want for each card.