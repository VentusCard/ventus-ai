## Change

Update the **Exit** button in `src/components/tepilot/insights/AnalyticsContainer.tsx` (line 340) so it fully resets the /bankdemo session, not just the password flag.

### Current behavior
```ts
sessionStorage.removeItem("demo_password_access");
window.location.reload();
```
Only the password key is removed. Cached pipeline state (`usePipelineStatus` STORAGE_KEY), tepilot_* keys, exec-demo selections, and any other sessionStorage from the demo persist across the reload.

### New behavior
- Call `sessionStorage.clear()` to wipe every cached key (password gate, pipeline statuses, tepilot_* selections, advisor context, etc.).
- Navigate to `/bankdemo` via `window.location.href = "/bankdemo"` so the page fully reloads and lands on the `SimplePasswordGate` (since `demo_password_access` is gone).

No other files change. Keep the button's icon, label, and styling as-is.
