# Reframe Coworker Dashboard as an Email-to-Bank-Employees View

## Goal
Adjust the **Coworker Dashboard** sub-tab inside `/bankdemo` → AI Coworker so every destination is framed as **Email sent to people who work at the bank, carrying insights they need**. Remove the mixed-channel abstraction (CRM / Digital Banking / Ventus) and make the entire surface read like an internal email-intelligence system.

## What will change

### 1. Data layer — `src/components/tepilot/coworker-inbox/coworkerInboxData.ts`
- Set every team `channel` to **"Email"**.
- Rename team names where needed so they read as groups of bank employees receiving insight emails (e.g., keep "Bank Leadership", "Relationship Managers", etc., but ensure the framing is "emailed to").
- Update `insights` to be written as email brief topics, not system outputs.
- Update `WEEKLY_STATS` labels to be email-centric: emails sent, reply rate, threads, etc.

### 2. Dashboard UI — `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`
- Retitle "Team destinations" to **"Intelligence Delivery Destinations"** or similar.
- Update the KPI strip to emphasize: emails sent, reply rate, people covered, insights delivered.
- Replace channel chips with email-oriented badges (e.g., "Daily brief", "Alert", "Weekly pulse").
- Update capabilities panel copy so every bullet describes email-based assistance.
- Keep the existing layout and visual treatment; only copy and badge semantics change.

### 3. Header / tab framing — `src/components/tepilot/insights/BankwideWMCopilotView.tsx`
- Update subtitle / how-it-works to say the Coworker sends insight emails to bank colleagues and replies when they write back.
- Keep the four sub-tabs (Live Work Stream, Coworker Dashboard, Advisor Conv. Demo, Leadership Conv. Demo) unchanged.

## Out of scope
- No new backend or LLM calls.
- No new interactive behavior beyond existing cards.
- No changes to the Live Work Stream, Advisor Conv. Demo, or Leadership Conv. Demo sub-tabs.

## Verification
- Open `/bankdemo` → AI Coworker → Coworker Dashboard.
- Confirm every destination card shows "Email" as the channel.
- Confirm headings and KPIs describe emails to bank employees.
- Confirm no "CRM", "Digital Banking", or "Ventus" channel chips remain in the dashboard.