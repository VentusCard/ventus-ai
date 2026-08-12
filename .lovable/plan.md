# Plan: Refresh System Tab Destination Badges

## What we're changing
On the `/bankdemo` System tab, the activation-destination cards currently show a green "Live" badge on the right. We will replace that badge with a compact status indicator: a green dot followed by a bracketed team/channel abbreviation (e.g. `● [CRM]`).

## Proposed mapping
| Destination card | New badge |
|------------------|-----------|
| Intelligence Dashboard | ● [BI] |
| Ventus AI Coworker | ● [AI] |
| Automations Campaign | ● [CRM] |
| Custom Product Builder | ● [GROWTH] |
| Personalized Reward Program | ● [REWARDS] |
| Local Merchant Deals | ● [DEALS] |

## Scope
- Edit only `src/components/tepilot/insights/CapabilitiesView.tsx` in the `NodeCard` / destination-card render area.
- Preserve card layout, hover states, typography, and the existing green-dot color.
- No functional changes; this is a visual label update only.

## Open question
Please confirm the bracket abbreviations above, or provide the exact set you want for each card.