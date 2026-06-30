When a team chip ("who we serve") is clicked in the /bankdemo Systems tab, the expanded detail panel currently shows both a workflow strip and a grid of icon-based capability cards below it. Remove the cards grid so only the workflow remains for teams.

Keep the cards intact for signal detections ("what we detect"), since the user only mentioned the team section.

### Change
In `src/components/tepilot/insights/CapabilitiesView.tsx`, wrap the `activeDetail.items` card grid (lines ~1096–1140) with a conditional so it renders when a signal is active but is skipped when a team is active. The workflow section just above it stays unconditional.

No other UI or data changes.