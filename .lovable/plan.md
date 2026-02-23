
# Personalize the Follow-Up Email Draft

## Problem
The follow-up email currently uses placeholder data ("Client Name", "Advisor Name", "client@email.com") from `sampleClientData` instead of the real randomly-generated or selected client profile. The email body is also generic and doesn't reference any client-specific context like their occupation, family status, detected life events, or spending patterns.

## Changes

### 1. Pass real client profile to ActionWorkspacePanel
**File: `src/components/tepilot/advisor-console/AdvisorConsole.tsx`**
- Pass `clientProfile` as a new prop to `ActionWorkspacePanel`

### 2. Use real client data in ActionWorkspacePanel
**File: `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx`**
- Accept `clientProfile` prop (type `ClientProfileData | null`)
- When rendering `FollowUpEmailDialog`, use `clientProfile.name`, `clientProfile.contact.email`, etc. instead of `sampleClientData`, falling back to `sampleClientData` if null

### 3. Enrich the email body with client context
**File: `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx`**
- Accept optional new props: `clientProfile` (for demographics/holdings), `lifeEvents` (detected events), and `spendingOverview` (spending data)
- Update `buildEmailBody` to smartly insert personalized sections:
  - **Greeting**: Use first name (split from full name) -- e.g., "Dear Sarah,"
  - **Context paragraph**: Reference their occupation and family status naturally -- e.g., "Given your role as a Senior Product Manager and your growing family..."
  - **Life events section**: If detected events exist, add a "Life Changes We Discussed" section referencing them -- e.g., "We touched on your upcoming home purchase and the new addition to your family."
  - **Spending insight**: If spending data is available, reference the top over-budget category -- e.g., "I also noticed your Travel spending is trending above budget this quarter, which we may want to revisit."
  - **Holdings reference**: Reference relevant holdings naturally -- e.g., "Your investment portfolio continues to perform well, and we should discuss rebalancing options."
- Keep the subject line personalized with actual client name

### 4. Pass life events and spending data through the chain
**File: `src/components/tepilot/advisor-console/AdvisorConsole.tsx`**
- Pass `dashboardEvents` and `clientProfile.spendingOverview` down through `ActionWorkspacePanel` to `FollowUpEmailDialog`

**File: `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx`**
- Accept and forward `dashboardEvents` and spending data to `FollowUpEmailDialog`

## Files Modified
1. `src/components/tepilot/advisor-console/AdvisorConsole.tsx` -- pass real profile + events
2. `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx` -- accept and forward new props
3. `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx` -- use real data, add personalized sections

## What the Email Will Look Like

```text
Dear Sarah,

Thank you for taking the time to meet today. Given your role as a
Senior Product Manager and your growing family, I wanted to follow up
with a tailored summary of our discussion.

LIFE CHANGES & PRIORITIES
--------------------------
We discussed your upcoming home purchase and the recent addition to
your family. These are exciting milestones, and I want to ensure your
financial plan supports each one.

SPENDING INSIGHTS
--------------------------
Your Travel spending is currently 18% above your monthly budget. We
may want to revisit your allocation strategy to keep things on track.

ACTION ITEMS & NEXT STEPS
--------------------------
[Chat]
  * Review 529 plan options for education savings
  * Schedule mortgage pre-approval consultation

PRODUCTS & SOLUTIONS DISCUSSED
--------------------------
  * Mortgage Solutions - Learn more at ...
  * 529 Education Savings - Learn more at ...

Please don't hesitate to reach out if you have any questions.

Best regards,
James Mitchell
Senior Wealth Advisor
```
