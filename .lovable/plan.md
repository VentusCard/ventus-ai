Add a navigation button below the Ventus AI logo in the ContactFormDialog that links to the Bank Analytics Dashboard.

## Changes

1. **File: `src/components/ContactFormDialog.tsx`**
   - Add a button below the Ventus AI logo (in the header section) that navigates to `/analytics`.
   - Use the existing `Link` component from react-router-dom.
   - Style it as a subtle, on-brand button matching the light theme (white bg, slate-200 border, blue-600 text on hover).
   - Button label: "Bank Analytics Dashboard →"

## Technical Details
- Import `Link` from `react-router-dom` if not already present.
- The button should sit between the logo image and the side-by-side comparison section, centered under the logo.
- No other dialog content or behavior changes.