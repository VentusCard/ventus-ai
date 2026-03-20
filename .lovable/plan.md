

## Plan: Wire Up Wealth Management Tab Buttons in Demo

### Context
The Wealth Management tab (`DemoLifeEventsView.tsx`) has three action buttons per life event card that currently only show toast messages. The goal is to make them functional, matching the behavior in `/tepilot`.

### What Changes

**1. "Download PDF" — generate and download a real PDF**

- In `DemoLifeEventsView.tsx`, import `exportEventPreparationPDF` from `@/lib/eventPreparationPdfExport`
- Build an `EventPreparationData` object by adapting the `DetectedLifeEventResult` + `DemoCustomer` data:
  - Map `event_name` → `eventName`, `confidence` → `confidence`, derive `eventType` from the event name using a lookup
  - Map `evidence` array → `CardTransaction[]` (the fields align: merchant, amount, date, relevance)
  - Map `talking_points` (slice 1+) → `recommendedSteps`
  - Construct a minimal `DashboardClient` from the `DemoCustomer.profile`
- Call `exportEventPreparationPDF(preparedData)` on click — this triggers a browser download

**2. "Email Me Summary" — open the existing email dialog**

- Import `EventSummaryEmailDialog` from `@/components/tepilot/advisor-console/EventSummaryEmailDialog`
- Add state for `emailDialogOpen` and `emailDialogData` in the `LifeEventCard` component
- On "Email Me Summary" click, build the same `EventPreparationData` as above, set it as dialog data, and open the dialog
- Render `<EventSummaryEmailDialog>` within each card

**3. "Prepare with Ventus" — navigate to WM Copilot with both profiles**

- Use `useNavigate` from react-router-dom
- On click, navigate to `/tepilot/advisor-console` with both customer profiles passed via router state: `navigate('/tepilot/advisor-console', { state: { customerA, customerB, activeCustomerId: customer.id } })`
- In `AdvisorConsolePage.tsx`, read `location.state` and initialize the client selector with the passed profiles (if state exists)

### Files Modified

| File | Change |
|------|--------|
| `src/components/demo/DemoLifeEventsView.tsx` | Add PDF download, email dialog, and navigate logic; build adapter to convert demo types → EventPreparationData |
| `src/pages/AdvisorConsolePage.tsx` | Accept optional router state to pre-load customer profiles |

### Technical Detail: Type Mapping

`DetectedLifeEventResult` (demo) → `EventPreparationData` (copilot) requires:
- Deriving `eventType` enum from `event_name` string via a name-to-type mapping
- Wrapping `DemoCustomer.profile` into a `DashboardClient` shape with sensible defaults for `id`, `lastContactDate`, `engagementStatus`, `detectedEvents`
- Converting `evidence[]` to `CardTransaction[]` (adding a default `cardType`/`cardLast4`)

