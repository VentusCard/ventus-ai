# Tooltip Sizing & Position Tweak

Update the three Behavioral Intelligence tooltips in `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

- Change `side="top"` → `side="bottom"` so the tooltip always appears below the cursor.
- Increase width: `max-w-xs` → `max-w-md` (≈ 28rem).
- Bump text size: `text-xs` → `text-sm`, keep `leading-relaxed`.
- Add a touch more padding: `p-3.5`.

No copy or logic changes.
