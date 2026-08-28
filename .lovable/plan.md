# System Tab — Data Sources Column Visual Fix

## Problem
The "Data sources" column in `/bankdemo` → System tab currently uses a solid dark-blue background (`bg-[#141432]`) identical to the left sidebar. The intended design was a **blue border** on a light surface, not a dark fill.

## Goal
Convert the Data sources column (and its nested sections/cards) from a dark-blue-filled panel to a light-themed panel with a prominent blue border, while keeping text legible and maintaining visual hierarchy with the adjacent "Customer Intelligence Core" column.

## Changes

1. **Data sources column container** (`CapabilitiesView.tsx` ~line 1014)
   - Remove `bg-[#141432]`.
   - Keep/adjust the border to a visible blue (`border-blue-600` or `border-indigo-600`).
   - Use a light background (`bg-white` or `bg-slate-50`) consistent with the page's strict light theme.
   - Recolor header text from light indigo/white to dark slate (`text-slate-900` / `text-slate-600`).

2. **Internal section wrappers** (~lines 1027–1034)
   - Remove dark indigo fills (`bg-indigo-950/30`).
   - Apply subtle light backgrounds (`bg-slate-100` / `bg-white`) with blue-tinted borders.
   - Recolor section labels, taglines, and source counts to dark slate.

3. **`SourceGroupCard`** (~lines 403–434)
   - Remove dark indigo active/hover fills.
   - Use light surfaces with blue borders/rings for active state.
   - Recolor provider name, sublabel, and feed-count pill for light theme.

4. **Verify contrast**
   - Confirm all text meets the existing light-theme policy (no low-contrast greys on dark surfaces).
   - Ensure the active source state remains visually distinct.

## Out of scope
- No changes to the Customer Intelligence Core column or activation destinations column.
- No changes to the walkthrough flow logic.
- No dark-mode utilities.

## Acceptance criteria
- Data sources column shows a light background with a blue border, not a dark-blue fill.
- Text is fully legible on the light surface.
- Active/hover states still clearly indicate selection.
- Build passes and `/bankdemo` System tab preview reflects the change.
