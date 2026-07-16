## Changes

1. **`src/components/tepilot/insights/AnalyticsContainer.tsx`**
   - Default active tab on `/bankdemo` = **Systems** (not Demo).
   - Keep `ExecDemoPage` always mounted in the background so pre-fire and state persist.

2. **`src/pages/ExecDemoPage.tsx`**
   - Remove auto-open of the selection dialog on mount.
   - Track whether the demo has been run at least once (in-memory flag, persists for the session since the component stays mounted).
   - When user clicks the **Demo** tab:
     - If no run has completed yet → open the selection popup.
     - If a run already exists → skip the popup and show the cached results directly.
   - User can still manually reopen the selector via the existing "Change customer" control inside the Demo view.

## Behavior

- Land on `/bankdemo` → Systems tab, no popup. Pipeline pre-fires silently in background.
- First click on Demo tab before pre-fire finishes → popup opens (as today).
- Any subsequent visit to Demo tab after a run exists → no popup, cached results shown immediately.
