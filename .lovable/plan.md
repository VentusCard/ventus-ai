Open the Bank Analytics Dashboard in a new browser tab from the ContactFormDialog button instead of replacing the current page.

## Change

- File: `src/components/ContactFormDialog.tsx`
- In the button's `onClick`, replace `window.location.href = ...` with `window.open("/tepilot?view=bankwide", "_blank", "noopener,noreferrer")`. Keep the `sessionStorage.setItem("tepilot_auth", "authenticated")` call and the `onOpenChange(false)` close.

Note: `sessionStorage` is per-tab, so setting it in the current tab won't bypass the password gate in the new tab. The new tab will land on the password screen unless we switch to `localStorage`. Two options:

1. Switch the auth check to read from `localStorage` (and write there from both the dialog and the existing password form). Affects `src/pages/TePilot.tsx` (the auth read on line 170 and the write on line 296).
2. Append a one-time auth token to the URL (e.g. `?view=bankwide&auth=<token>`) and have TePilot accept it.

Recommended: option 1 (localStorage) — simplest, persistent across tabs, matches user expectation that they "stay logged in" once entered.