

## Anonymize sample customer names → 9-digit User IDs + literal `{firstname}` placeholder

Replace each sample customer's full name with a random 9-digit user ID, and use the literal string `{firstname}` (curly braces included) wherever consumer-facing UI currently shows a first-name greeting.

### Changes

**1. `src/lib/sampleData.ts`** — rename all 6 sample profiles:

| Old name | New `name` |
|---|---|
| Sarah Mitchell | `User #482719356` |
| James Rodriguez | `User #519384207` |
| Emily Chen | `User #264158093` |
| Michael Thompson | `User #730895142` |
| Amanda Williams | `User #395672481` |
| Robert Garcia | `User #847203615` |

(IDs are random, fixed 9-digit numbers — no `firstName` field needed.)

**2. Replace consumer-facing first-name greetings with the literal string `{firstname}`** in these files. In every case, swap `customer.profile.name.split(" ")[0]` (or equivalent) for the literal `"{firstname}"`:

- `src/components/exec-demo/RelationshipPhoneView.tsx` line 57 → `Welcome, {firstname}`
- `src/components/exec-demo/ExecDemoPhoneView.tsx` line 150 → `TCBY Bank · {firstname}`
- `src/components/demo/DemoEngagementView.tsx` line 110
- `src/components/demo/DemoRewardsView.tsx` line 440
- `src/components/demo/DemoWealthView.tsx` line 92
- `src/components/demo/ConsumerAIChatView.tsx` line 336 → `Hi {firstname}! 👋`

Also update the inline quoted string in `RelationshipPhoneView.tsx` (line ~125) — `"Major milestone ahead? Let's plan together, {firstname}."` (replace `${firstName}` interpolation with the literal token).

**3. Update hard-coded literal labels** that currently embed the old names:

- `src/components/tepilot/ComparisonSetup.tsx` lines 22-27 — change dropdown labels to `"User #482719356 (1 mo)"`, `"User #519384207 (1 mo)"`, etc.
- `src/components/technology/demos/VentusWealthDemo.tsx` lines 42-43 — change the two hard-coded `name:` values to the matching new IDs.

**4. Leave `name` (the 9-digit ID) as-is everywhere else** — operator-facing surfaces (network diagram, engine profile, customer dropdown, selection dialog, left panel, detail overlay, advisor console, life-event PDF/toasts) will display `User #482719356`, which is the desired anonymized label.

**5. Out of scope** (unchanged):
- Edge function prompts — the LLM will receive `User #482719356` as the customer identifier.
- Merchant names, transaction descriptors, ZIPs in CSVs.
- Advisor persona "Emily Chen" in `RelationshipPhoneView.tsx` (bank employee, not a customer).

### Files touched
- `src/lib/sampleData.ts`
- `src/components/exec-demo/RelationshipPhoneView.tsx`
- `src/components/exec-demo/ExecDemoPhoneView.tsx`
- `src/components/demo/DemoEngagementView.tsx`
- `src/components/demo/DemoRewardsView.tsx`
- `src/components/demo/DemoWealthView.tsx`
- `src/components/demo/ConsumerAIChatView.tsx`
- `src/components/tepilot/ComparisonSetup.tsx`
- `src/components/technology/demos/VentusWealthDemo.tsx`

