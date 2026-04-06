

## Fix Pill Layout Jump + Blank Phone During Compilation

### Problem 1: Height Jump
During `scroll` phase, the persona card (`flex-1`) and the processing shimmer (`flex-1`, line 353) split vertical space ~50/50. When scroll ends and phase moves to `hold`, the shimmer unmounts and the persona card snaps to full height — visible layout jump.

**Fix in `ExecDemoIntelPanel.tsx`**: Remove the shimmer entirely (lines 352-367). The pills animating in already provide visual feedback that processing is happening. The persona card will have `flex-1` from the start and maintain consistent height throughout the scroll → hold transition.

### Problem 2: Phone Mockup Should Stay Blank
Currently `ExecDemoPhoneView` shows content when `phase === "cardCycle" || "cardScan" || "hold"`. Since we now go straight to `hold` after scroll, the phone populates immediately.

**Fix in `ExecDemoPhoneView.tsx`**: Add a new prop (e.g., `showContent`) controlled by the parent. The phone content stays blank until explicitly enabled (e.g., only after the user has navigated through all tabs, or a future trigger).

**Fix in `ExecDemoPage.tsx`**: Pass `showContent={false}` (or equivalent) to keep the phone blank. The phone frame renders but shows "Waiting for analysis..." or similar placeholder.

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — remove processing shimmer
- `src/components/exec-demo/ExecDemoPhoneView.tsx` — accept explicit `showContent` override prop
- `src/pages/ExecDemoPage.tsx` — pass prop to keep phone blank

