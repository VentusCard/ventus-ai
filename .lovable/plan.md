# Add "Demo" tab to /bankdemo

Add a new sidebar item labeled **Demo** in the **Home** nav group of `/bankdemo`, positioned directly below **System**. Selecting it renders the full `/demo` (ExecDemoPage) experience inside the bankdemo content area — no route navigation, no new browser tab.

## Changes

**`src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Extend `TabValue` union with `'exec-demo'`.
- Add nav item under the Home group, immediately after `capabilities` (System):
  ```
  { value: "exec-demo", label: "Demo", icon: Presentation }
  ```
  (Icon: `Presentation` or `Sparkles` from lucide-react.)
- In `renderContent()`, add `case 'exec-demo': return <ExecDemoEmbed />;`
- Import `ExecDemoPage` from `@/pages/ExecDemoPage`.

**Wrapper component (inline or small file)**
- `ExecDemoEmbed` renders `<ExecDemoPage />` inside a `h-full w-full overflow-auto -m-4` container so it fills the bankdemo content pane edge-to-edge (compensating for the `p-4` padding already on the content wrapper).
- Since the user is already past `SimplePasswordGate` at `/bankdemo`, the gate inside `ExecDemoPage` auto-passes via sessionStorage.

## Notes

- No route changes — `/demo` continues to work standalone.
- ExecDemoPage opens its `ExecDemoSelectionDialog` on mount, identical to the standalone /demo experience.
- The bankdemo top header ("Our Bank") and sidebar remain visible around the embedded demo; only the content pane changes.
- No data flows between the two — the demo is fully self-contained.

## Open question

The standalone `/demo` page renders edge-to-edge (its own full-screen chrome, logo top-left, etc.). Embedding it inside the bankdemo content pane will visually nest two chromes. If you'd prefer, I can instead render `/demo` in an `<iframe src="/demo">` so it stays pixel-identical to the standalone page. Confirm preference before I build, or I'll proceed with the inline React render described above.
