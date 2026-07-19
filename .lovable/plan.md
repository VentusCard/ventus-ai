Add two horizontal button slivers below the intel panel on the Next Conversation tab to toggle between **Customers** and **Relationship Managers**. The toggle drives both the rationale card content below and the tablet mockup on the right.

### Current state
- The Next Conversation tab lives inside `/bankdemo` (`ExecDemoPage` → `ExecDemoIntelPanel` → `NextConversationRationale`).
- Today the rationale card shows both "Regular Client" and "Wealth Client" columns side-by-side, and the tablet mockup switches to WM CoPilot only when "Open WM CoPilot" is clicked.

### Changes

1. **`ExecDemoPage.tsx`**
   - Add state `relationshipAudience: "customer" | "rm"` (default `"customer"`).
   - Derive `wmCopilotOpen` for the relationship tab from this state so the tablet mockup switches automatically:
     - `customer` → customer app view
     - `rm` → WM CoPilot view
   - Pass `relationshipAudience` and its setter into `ExecDemoIntelPanel`.

2. **`ExecDemoIntelPanel.tsx`**
   - Accept new props `relationshipAudience` and `onRelationshipAudienceChange`.
   - When `activeTab === "relationship"` and synthesis is ready, render a two-button sliver directly below the intel panel:
     - "Customers" | "Relationship Managers"
     - Full-width, side-by-side, active button in blue-filled style, inactive in white/slate-outline style.
   - Pass the audience down into `NextConversationRationale`.

3. **`NextConversationRationale.tsx`**
   - Accept `audience: "customer" | "rm"`.
   - Render only one column at a time based on audience:
     - `customer` → the existing Regular Client column (AI Assistant Context + Personalized Outreach), expanded to full width.
     - `rm` → the existing Wealth Client column (Advisor Notification + Prep Brief + Actions), expanded to full width.
   - Remove the redundant bottom "Open AI Banking Assistant" / "Open WM CoPilot" footer buttons — the toggle above now controls both card content and the tablet mockup.

### Verification
- Open `/bankdemo`, run analysis, switch to Next Conversation.
- Sliver toggle appears below the intel panel with two buttons.
- Selecting "Customers": card shows customer-facing content, tablet shows customer app.
- Selecting "Relationship Managers": card shows advisor prep content, tablet shows WM CoPilot.
- Signal-pill selection still updates the rationale content.