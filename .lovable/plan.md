

## Goal
Replace the old Ventus logo with the new wordmark in the executive demo (`/demo`) header and selection dialog, keeping the existing `h-5` height.

## Changes

**1. `src/pages/ExecDemoPage.tsx`** (header at top of page)
- Line 18: change import from `ventus-logo-blue.png` → `ventus-ai-wordmark.png`
- Line 805: keep `className="h-5 w-auto"` (unchanged height)

**2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx`** (selection dialog header)
- Line 8: change import from `ventus-logo-blue.png` → `ventus-ai-wordmark.png`
- Line 116: keep `className="h-5 w-auto"` (unchanged height)

No other files touched. The password gate (`SimplePasswordGate.tsx`) already uses the new wordmark from earlier turns.

