## Keep Next Steps dialog open after clicking Bank Analytics Dashboard

In `src/components/ContactFormDialog.tsx`, the Bank Analytics CTA currently calls `onOpenChange(false)` on click, which closes the dialog as the new tab opens.

### Change
Remove the `onClick={() => onOpenChange(false)}` handler from the `<a href="/bank-analytics" target="_blank">` element. The link still opens the dashboard in a new tab; the dialog stays open on the current tab so the user can keep navigating its pages.
