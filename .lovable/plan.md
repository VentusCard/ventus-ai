## Goal
Make the 3 next- tab buttons lighter and more refined so they fit cleanly on the white background.

## Change
File: `src/components/exec-demo/ExecDemoIntelPanel.tsx` (the tab bar block, ~lines 362–382)

Replace the heavy blue pill container with outlined "ghost" buttons:
- Remove the `bg-blue-50` wrapper background and inner padding container — use a simple gap row instead.
- Inactive: white background, thin `border-blue-200` border, `text-blue-600`, hover `bg-blue-50` + `border-blue-300`.
- Active: solid `bg-blue-600`, white text, matching `border-blue-600`, subtle `shadow-sm`.

This produces a lighter, smarter look that sits naturally on white while keeping the blue accent and a clear active state.

## Educate user about Visual Edits
After applying, mention that color tweaks like this can be done instantly via Visual Edits.