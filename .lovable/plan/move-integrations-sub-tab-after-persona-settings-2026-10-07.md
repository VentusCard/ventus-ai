# Move Integrations sub-tab after Persona Settings

## Problem
The Integrations button was added at the end of the row (after Live Work Stream). On your screen width, the row probably runs past the visible area, so the button is cut off.

## Fix
- New order: Coworker Dashboard, User View, Persona Settings, **Integrations**, Live Work Stream.
- Let the button row scroll sideways if it doesn't fit, so no button is ever hidden.

## Technical details
- `BankwideWMCopilotView.tsx`: move the `integrations` entry in `toggles` above `stream`; add `overflow-x-auto max-w-full` to the toggle container.
- Check with Playwright at 1375x842 on /bankdemo AI Coworker tab: Integrations button visible right after Persona Settings and clicking it shows the six cards.
