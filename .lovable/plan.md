## Goal

In `/bankdemo` → **Next Conversation** tab, when the audience toggle is on **Ventus AI Coworker**, the right-hand tablet mockup should display the full example email thread between the advisor and Ventus AI (the same 7-message flow that lives in `AdvisorNotificationsView`) with prev/next and pill navigation so the presenter can step through every message.

Today the tablet shows `WMCopilotPhoneView` (a PDF-packet card), which is unrelated to the conversation shown on the left.

## Changes

1. **Extract the conversation data + navigator** from `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` into a new shared module so both the full-page advisor view and the compact tablet view render the same thread from one source of truth.

   New file: `src/components/tepilot/advisor-console/AdvisorConversationThread.tsx`
   - Exports a `<AdvisorConversationThread clients={...} density="full" | "compact" />` component.
   - Owns: `SECTIONS`, `EVIDENCE`, `EVENT_OFFER`, `TRAVEL_CARD_ROTATION`, `REPLY_MESSAGES`, `ADVISOR`, `VENTUS`, `bucketFor`, digest/travel/name derivation, active-index state, pill/prev-next nav, ribbon, subject block, sender block, digest body, and reply body (all currently inline in `AdvisorNotificationsView`).
   - `density="compact"` tightens paddings, hides the Outlook ribbon, drops the sticky max-width wrapper, and shrinks the pill row so the whole shell fits in a ~500 px tablet column. `density="full"` keeps the current layout.
   - `AdvisorNotificationsView` becomes a thin wrapper: renders the section heading + `<AdvisorConversationThread clients={clients} density="full" />`.

2. **New tablet view**: `src/components/exec-demo/AdvisorConversationTabletView.tsx`
   - Generates a stable client roster once via `generateDashboardClients(60)` (matches `BankwideWMCopilotView`).
   - Renders `<AdvisorConversationThread clients={clients} density="compact" />` inside a purple-accent header ("Ventus AI ↔ Wealth Advisor · Example Thread") with a close button that calls `onClose`.
   - Fills the tablet content area (`h-full flex flex-col`, internal scroll on the message body only so the nav pills stay pinned).

3. **Wire it into the tablet slot** in `src/components/exec-demo/ExecDemoPhoneView.tsx`:
   - Replace the `<WMCopilotPhoneView …/>` render inside the `wmCopilotMode` branch with `<AdvisorConversationTabletView onClose={() => onCloseWMCopilot?.()} />`.
   - Keep the status-bar swap (`· Advisor` label) as-is.
   - `WMCopilotPhoneView` and its `wmCopilotSignal` / `wmCopilotSecondarySignal` / persona props are no longer read by the tablet; leave the props on the component for now (unused) to avoid touching `ExecDemoPage` wiring, but stop importing `WMCopilotPhoneView`.

4. **No changes** to:
   - The left-hand `NextConversationRationale` panel (still shows `CoworkerInboxView` in `audience="rm"` mode).
   - `AdvisorNotificationsView`'s public API — `BankwideWMCopilotView` keeps working unchanged.
   - `synthesize-persona`, signal ladder, or any other backend logic.

## Technical notes

- The extracted module keeps the exact 7 messages (Digest 9:14 → Advisor 9:22 → Ventus 9:23 → Advisor 9:44 → Ventus 9:45 → Advisor 10:07 → Ventus 10:08) and the same `nameA/nameB/labelA/labelB/eventTypeA/eventTypeB/travelCardCohort/digestRows` derivations, so the tablet renders identical content to what advisors see in the full view.
- Compact density knobs: `px-3 py-3` shells (vs `p-6`), pill row uses `text-[11px]` + `py-1`, ribbon hidden, subject line `text-sm`, sender avatar `w-8 h-8`, body uses `text-[12px] leading-snug`.
- Pill row keeps horizontal overflow scroll (`overflow-x-auto`, `[scrollbar-width:none]`) and auto-centers the active pill via the existing `pillRefs` `scrollIntoView` effect.
- Prev/Next buttons become icon-only (`ChevronLeft`/`ChevronRight`) in compact mode to preserve pill room.
- `AdvisorConversationTabletView` mounts once per `wmCopilotMode` toggle, so the active-message index resets each time the RM toggle is turned on — matches "start from the top of the thread" expectation.

## Files touched

- new: `src/components/tepilot/advisor-console/AdvisorConversationThread.tsx`
- new: `src/components/exec-demo/AdvisorConversationTabletView.tsx`
- edit: `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` (delete extracted code, render `<AdvisorConversationThread density="full" />`)
- edit: `src/components/exec-demo/ExecDemoPhoneView.tsx` (swap `WMCopilotPhoneView` → `AdvisorConversationTabletView` in the `wmCopilotMode` branch)
