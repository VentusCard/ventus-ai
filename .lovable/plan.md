The TePilot page checks `sessionStorage.getItem("tepilot_auth") === "authenticated"` to bypass its password screen. Since the dialog button is an authorized internal entry point, we can pre-authenticate the session before navigating.

## Change

- File: `src/components/ContactFormDialog.tsx`
- Replace the `<Link>` with a `<button>` (or keep `Link` with an `onClick`) that:
  1. Calls `sessionStorage.setItem("tepilot_auth", "authenticated")`
  2. Closes the dialog
  3. Navigates to `/tepilot?view=bankwide` (using `useNavigate` from react-router-dom)

No styling/label changes. No edits to TePilot itself.