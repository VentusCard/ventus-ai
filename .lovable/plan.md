<final-text>
Root cause identified: the bug is not in the “Ready” button itself. In `src/pages/ExecDemoPage.tsx`, the animation flow auto-runs `revealStep(0, p, true)` as soon as phase enters `hold`, and that immediately sets `activeTab = "analytics"` before you click anything. Because `activeTab` is already truthy:
- the intelligence card enters its collapsed/tab-selected state
- the evidence area starts behaving like a chosen action state
- the action/tab UI appears too early
- the intended “full evidence first, move only after click” flow never actually exists

## Fix plan

### 1) Stop auto-selecting any action during the hold state
In `src/pages/ExecDemoPage.tsx`:
- change the end of `runAnimationWithProfile()` so entering `hold` does **not** call `revealStep(0, p, true)`
- keep `activeTab` as `null` until the user explicitly clicks **Next-Offer**, **Next-Product**, or **Next Conversation**
- if needed, preserve any non-UI progress state separately (`stepIndex`, `revealedTabs`, accent color) without driving the layout

This is the main fix.

### 2) Make panel movement depend only on an explicit action click
Also in `src/pages/ExecDemoPage.tsx`:
- replace the repeated inline checks with a single boolean like:
  `const showPhone = activeTab === "analytics" || activeTab === "product" || activeTab === "relationship"`
- use `showPhone` for:
  - collapsing the left transaction panel
  - expanding the right phone panel
- include `"analytics"` here, because **Next-Offer** currently maps to `analytics`, and that click should trigger the screen move

Right now the page logic is inconsistent: the action button uses `analytics`, but the layout-collapse logic ignores it.

### 3) Keep the intelligence card fully expanded until an action is chosen
In `src/components/exec-demo/ExecDemoIntelPanel.tsx`:
- make the expanded/full-height state depend on `!activeTab`
- keep:
  - spending-pattern rollups
  - life event pills
  - risk factors
  - full evidence list
  - bottom action buttons
  visible when `synthesisTriggered && !activeTab`
- only apply the reduced height / tab-content state after `activeTab` becomes non-null

Most of this logic is already close; it should start working correctly once the parent stops pre-setting `activeTab`, but I would harden the conditions so they consistently key off an explicit `actionSelected` state.

### 4) Prevent keyboard navigation from accidentally re-triggering the broken flow
Still in `src/pages/ExecDemoPage.tsx`:
- update the ArrowLeft / ArrowRight handler so it does **not** auto-select an action while the user is still in the post-synthesis review state
- either disable that handler until an action is selected, or refactor it to use a separate non-layout state

This avoids a hidden edge case where keyboard navigation could collapse the layout even after the main click flow is fixed.

## Files to update
- `src/pages/ExecDemoPage.tsx`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

## Expected behavior after fix
1. Run enrichment
2. Click **Behavioral Intelligence: Ready**
3. The intelligence card stays tall and shows the full evidence / transaction-related detail state
4. The left transaction panel stays visible
5. The right phone panel stays hidden
6. Only when clicking **Next-Offer**, **Next-Product**, or **Next Conversation**:
   - the intelligence card shrinks
   - the left panel collapses
   - the right panel appears

## Validation I would do after implementation
- Click **Behavioral Intelligence: Ready** and confirm no action tab is auto-selected
- Confirm the left transaction list remains fully visible
- Confirm full evidence remains visible below the header
- Click **Next-Offer** and verify the screen moves only then
- Click **Next-Product** and **Next Conversation** and verify they trigger the same movement behavior
- Confirm no regression on rerun / customer change / custom CSV flows
</final-text>