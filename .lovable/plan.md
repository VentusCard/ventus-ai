# Plan: Enlarge Automated Flows Signal/Filter Rows

## Goal
Make the individual signal and risk-filter rows inside each Automated Flow easier to read and click by increasing their vertical/horizontal footprint and typography, without breaking the existing dense list layout.

## Changes

### 1. SignalRow sizing
In `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`:
- Increase row padding from `px-3 py-2` to `px-4 py-3`.
- Bump the signal label from `text-[12px]` to `text-[13px]`.
- Bump the evidence line from `text-[10.5px]` to `text-[12px]`.
- Increase the family badge from `text-[9px]` to `text-[10px]` and its padding slightly.
- Increase the audience/removes value from `text-[11px]` to `text-[13px]` and widen the right-hand number column (`w-20` → `w-24`).
- Slightly enlarge the chevron and switch hit area.

### 2. FilterRow sizing
Apply the same padding/typography scale to `FilterRow` so risk filters match signal rows.
- Keep the red "Risk Filter" badge styling; only increase its text/padding to match.
- Widen the removes column (`w-24` → `w-28`) so the larger `-22% · -1.2K` text does not wrap.

### 3. Expanded detail card
Inside `SignalDetail`:
- Increase outer padding from `p-3` to `p-4`.
- Bump section labels to `text-[10px]` and body text to `text-[12px]`.
- Increase the personalized message subject to `text-[13px]` and CTA button height to `h-8`.

### 4. Add-signal / add-filter placeholders
Scale the `AddSignalPicker` and `AddFilterPicker` trigger rows to match the new row height and font size so the list stays visually aligned.

### 5. Section labels and spacing
- Keep the "Signals that trigger this flow" and "Risk filters" headers, but add a touch more vertical gap between the signal list, filter list, and audience summary (`gap-1.5` → `gap-2`).
- Keep the existing light theme and slate/rose color tokens.

## Validation
Open `/bankdemo` → Automated Flows, expand a Lending flow (multiple signals + filters), a Card flow, and a Savings flow (no filters). Confirm:
- Signal and filter rows are visibly taller with larger text.
- The right-hand audience/removes numbers remain on one line.
- Expanded detail cards have more breathing room.
- Toggling and editing signals still works and the save animation still runs.
