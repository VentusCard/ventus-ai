## Goal

Broaden the **Routes To** row so it reflects that the AI assistant can hand off not only to people but also to digital destinations (application portals, account opening flows, etc.).

## Change

In `src/components/exec-demo/NextConversationRationale.tsx`, replace the `pills` array on the **Routes To** row (currently all human teams) with a mix of human teams and digital/system destinations, kept short and parallel in wording to the other rows.

Proposed new pills (8 total, same count as today):

- `Account opening flows`
- `Loan & card application portals`
- `Wealth advisors`
- `Mortgage specialists`
- `Fraud operations`
- `Perks and Benefits Pages`
- `Branch appointment booking`
- `Customer support`

Notes:

- Mixes human routes (Wealth advisors, Mortgage specialists, Fraud operations, Customer support) with digital routes (Account opening flows, Application portals, Appointment booking, Document upload).
- Drops some redundancies (Insurance specialists, Business banking, Branch staff, Card services) to make room without growing the row. Happy to keep any of these — just say which.

## Out of scope

- No layout, color, icon, or styling changes.
- No changes to Inputs / Capabilities / Out of Scope rows or to anything below the context band.