Update the "Bank Analytics Dashboard" button in `ContactFormDialog.tsx` to link to the actual bank-wide analytics dashboard at `/tepilot?view=bankwide` instead of the `/analytics` marketing page.

## Change

- File: `src/components/ContactFormDialog.tsx`
- Update the `<Link to="/analytics">` to `<Link to="/tepilot?view=bankwide">`. No styling or label changes.