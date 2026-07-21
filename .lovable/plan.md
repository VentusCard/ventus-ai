## Goal

As soon as the user clears the `/bankdemo` password gate, silently pre-fire the entire Demo pipeline for the default customer (idx 0) so that by the time they click the **Demo** tab (or the **Behavioral Intelligence: Ready** button), results are already cached. All existing button clicks, tab flows, selection dialog, and reset behavior stay identical.

## Current state (verified)

- `BankAnalyticsDashboard` wraps `AnalyticsContainer` in `SimplePasswordGate`. After password success, `AnalyticsContainer` mounts.
- `AnalyticsContainer` already mounts `ExecDemoPage embedded` in a persistent, CSS-hidden div (not lazy-loaded), so its effects run immediately post-password.
- `ExecDemoPage` has two mount effects:
  1. `fireClassification(getCsvForCustomer(0))` — starts SSE classify → auto-chains `firePersonaSynthesis` → `fireLifeEventDetection` → `fireProductCards` + `fireNextOffers`.
  2. Embedded pre-fire effect calls `handleRunAnalysis()` which sets local profile + animation state.

The pipeline is already wired to pre-fire, but two issues weaken it:
- The embedded pre-fire effect is guarded by `!profileRef.current && !customCsv`, and `handleRunAnalysis` early-returns when `isRunning` is true — under React StrictMode / fast re-mounts these guards can cause the persona/offer chain to appear "not yet started" until the Demo tab is opened.
- `fireNextOffers` and `fireProductCards` only run inside `fireLifeEventDetection`, which is only invoked from the persona-synthesis `done` handler. If synthesis is slow or the classify SSE stalls, nothing downstream starts. There is no independent "kickoff coordinator" tied to the password-gate boundary.

## Changes

### 1. Add an explicit "prefire coordinator" at the container level
File: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- On first mount (post-password), set a `prefireArmed` flag in a ref and pass a new `prefireOnMount` prop to `<ExecDemoPage embedded active={...} prefireOnMount />`.
- No visible UI changes; container behavior otherwise identical.

### 2. Harden the pre-fire in ExecDemoPage
File: `src/pages/ExecDemoPage.tsx`
- Replace the existing embedded pre-fire `useEffect` with a single `useEffect` (mount-only, no deps) gated on the new `prefireOnMount` prop:
  - Call `fireClassification(getCsvForCustomer(0))` (already there — dedupe so it isn't called twice).
  - Call `handleRunAnalysis()` to build the local profile so the Demo tab renders instantly on first open.
  - Do **not** flip `revealedTabs`, `activeTab`, or open the selection dialog — the visible state stays exactly what it is today (systems tab, dialog opens on first Demo click if no run yet).
- Drop the `isRunning` short-circuit in `handleRunAnalysis` for the initial pre-fire path (guarded by a `didPrefireRef`) so the pipeline can't be skipped by a StrictMode double-invoke.

### 3. Ensure downstream generation doesn't wait on user interaction
File: `src/pages/ExecDemoPage.tsx`
- Inside `firePersonaSynthesis` (or the persona `done` branch), keep the existing auto-call to `fireLifeEventDetection` (which already fans out to `fireNextOffers` + `fireProductCards`). Confirm no code path requires a user click before these fire; if any early-return exists tied to `active` / tab visibility, remove it for the pre-fire path only.

### 4. Preserve the existing UX contract
- **Systems** stays the default tab.
- Selection dialog still auto-opens the first time the user clicks the **Demo** tab if no completed run exists (existing `hasRunOnce` logic untouched).
- **Behavioral Intelligence: Ready** stays a manual click gate — pre-fire just makes it appear sooner.
- Reset button, customer switching (`handleSelectCustomer`), and custom CSV upload keep their current re-fire behavior.

## Technical notes

- Guard the coordinator with a `useRef<boolean>` so StrictMode double-mount doesn't fire two full pipelines.
- The mount-time `fireClassification` in `ExecDemoPage` currently uses `useEffect(() => …, [])`. Keep it, but have the new prefire path skip re-calling it when the ref shows classification is already in flight (`classifyAbortRef.current`).
- No changes to edge functions, no changes to prompts, no changes to the visible pill/panel components.

## Files touched

- `src/components/tepilot/insights/AnalyticsContainer.tsx` — pass `prefireOnMount` prop.
- `src/pages/ExecDemoPage.tsx` — accept prop, add hardened prefire effect, dedupe with existing mount effect.
