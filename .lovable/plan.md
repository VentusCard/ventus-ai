

# Shorten Action Items in the Next Steps Panel

## Problem
The action items that appear in the "Next Steps" panel are too verbose, making the sidebar feel dense and hard to scan. This affects items from two sources:
- AI-generated items (from chat responses via the `advisor-chat` backend function)
- Hardcoded items (from the Financial Planner's "Generate Timeline" feature)

## Changes

### 1. Update AI Prompt (`supabase/functions/advisor-chat/index.ts`)
Add an explicit length constraint to the action item formatting rules:
- Each checkbox item must be **10 words or fewer**
- Lead with a verb (e.g., "Review", "Schedule", "Discuss")
- Update the example in the prompt to show shorter items:
  - Before: `"- [ ] Discuss premium travel rewards card upgrade"`
  - After: `"- [ ] Discuss premium travel card upgrade"`
  - Before: `"- [ ] Review current credit card benefits vs spending patterns"`
  - After: `"- [ ] Review card benefits vs spending"`

### 2. Shorten Hardcoded Financial Planner Items (`src/components/tepilot/advisor-console/FinancialPlanner.tsx`)
Trim the `action` strings in `generateActionItems()`:
- `"Max out tax-advantaged accounts - $X remaining capacity"` --> `"Max tax-advantaged accounts ($X remaining)"`
- `"PRIORITY: Increase 401(k) contributions to capture full employer match"` --> `"Maximize 401(k) employer match"`
- `"Build emergency fund to 6 months expenses, establish Roth conversion strategy"` --> `"Build 6-month emergency fund; plan Roth conversions"`
- `"Review glide path, consider catch-up contributions (age 50+), optimize Social Security timing"` --> `"Review glide path; catch-up contributions"`
- And similar for remaining items

### 3. Add Truncation Safety Net (`src/components/tepilot/advisor-console/VentusChatPanel.tsx`)
In `extractActionItemsFromMessage`, truncate any extracted item over 60 characters to 60 chars + "..." as a safety net for overly long AI responses.

## Files
- **Modify**: `supabase/functions/advisor-chat/index.ts` -- tighten action item word limit in prompt
- **Modify**: `src/components/tepilot/advisor-console/FinancialPlanner.tsx` -- shorten hardcoded action strings
- **Modify**: `src/components/tepilot/advisor-console/VentusChatPanel.tsx` -- add truncation safety net
