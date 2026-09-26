# Make Coworker sub-tabs clickable on section 9

## Problem
The embedded platform on section 9 allows clicks, but the AI Coworker screen (and the Automated Flows screen) block every click on their own whenever they're shown in presentation mode. So "Coworker Dashboard / User View / Persona Settings / Live Work Stream" can't be clicked.

## Fix
Pass the existing "interactive" setting down to those two screens so they only block clicks when the embed isn't interactive. Other places that show these screens as still pictures stay unchanged.

## Technical details
- `AnalyticsContainer.tsx`: pass `interactive` to `BankwideWMCopilotView` and to `ProductAutomatedFlowsView` (via whatever view renders it for `targeting-automated-flows`).
- `BankwideWMCopilotView.tsx`: add `interactive?: boolean`; class becomes `presentationMode && !interactive && "pointer-events-none select-none"`.
- `ProductAutomatedFlowsView.tsx`: same `interactive` prop and condition.
- Verify in the browser at 1376x1011: on 9.3, click each Coworker sub-tab and confirm the content switches; arrow keys still change slides.
