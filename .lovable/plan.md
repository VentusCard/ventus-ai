
# Auto-Populate on Click for Presets and Saved Segments

## Overview
Make the preset template rows and saved segment rows clickable -- clicking anywhere on the row auto-populates the studio dimensions (and triggers brief generation), removing the need for the separate "Apply" button and dropdown "Edit" action.

## Changes (single file)

### `src/components/tepilot/campaigns/CampaignStudio.tsx`

**Preset Templates (lines 384-407):**
- Add `onClick={() => handleApplyTemplate(template)}` and `cursor-pointer` to the row div
- Remove the "Apply" `Button` -- the whole row is now the click target
- Also trigger `pendingGenerateRef.current = true` inside `handleApplyTemplate` so the brief auto-generates after applying

**Saved Segments (lines 436-475):**
- Add `onClick={() => handleEditSegment(segment)}` and `cursor-pointer` to the row div
- Remove the `DropdownMenu` with Edit/Export/Delete -- replace with just the click-to-load behavior (keep Export and Delete as small icon buttons if desired, or remove entirely for simplicity)
- Also trigger `pendingGenerateRef.current = true` inside `handleEditSegment` so the brief auto-generates after loading

**`handleApplyTemplate` function (lines 112-142):**
- Add `pendingGenerateRef.current = true;` before the toast so brief generation fires automatically

**`handleEditSegment` function (lines 145-167):**
- Add `pendingGenerateRef.current = true;` before the toast so brief generation fires automatically

## Result
- Clicking a preset template row: clears current state, loads template criteria, auto-generates campaign brief
- Clicking a saved segment row: clears current state, loads segment criteria, auto-generates campaign brief
- No extra buttons needed -- single click does everything
