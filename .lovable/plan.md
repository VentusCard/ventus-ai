## Skip password gate when arriving at /bank-analytics from /demo

The Next Steps dialog opens `/bank-analytics` in a new tab. Because `SimplePasswordGate` reads `sessionStorage` (which is per-tab), the new tab always re-prompts for the password — even though the user already unlocked the demo.

### Change

1. **`src/components/ContactFormDialog.tsx`** — append a token to the link:
   - Change `href="/bank-analytics"` to `href="/bank-analytics?from=demo"`.

2. **`src/components/demo/SimplePasswordGate.tsx`** — auto-unlock when that token is present:
   - On mount, if `new URLSearchParams(window.location.search).get("from") === "demo"`, set `sessionStorage[SESSION_KEY] = "true"` and `setAuthed(true)`.
   - Then strip the param from the URL via `window.history.replaceState` so it doesn't linger.

This keeps the gate intact for direct visits to `/bank-analytics`, but lets the demo flow pass through seamlessly. Safe because anyone clicking the button has already cleared the same gate on `/demo`.
