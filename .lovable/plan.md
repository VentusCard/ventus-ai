## Goal
Update the /bankdemo Systems tab so the final destination card reads **"AI Coworker"** instead of **"Advisor Console"", with a sublabel that conveys it serves every team around the clock.

## Changes
1. In `src/components/tepilot/insights/CapabilitiesView.tsx`:
   - Update the `DESTINATIONS` array entry at line 392 from `label: "Advisor Console"` to `label: "AI Coworker"`.
   - Update the matching workflow chip at line 328 from `"Advisor Console"` to `"AI Coworker"` so the team workflow diagrams stay consistent.
   - Update the `sublabel` from `"Banker Workstation"` to `"Every team, 24/7"`.

## Verification
- Type-check the file.
- Open `/bankdemo` → Systems tab and confirm the last card is labeled **AI Coworker** with sublabel **Every team, 24/7**, and the workflow arrows reference the same name.