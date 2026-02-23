
# Add Client Psychology to Follow-Up Email

## Problem
The follow-up email draft ignores the client's psychological profile (decision style, risk tolerance, communication preference, emotional state). This data is already available in `nextStepsData.psychologicalInsights` but is never passed to or used by the email dialog. The email should adapt its tone, word choice, and structure based on who the client is.

## How Psychology Will Adjust the Email

The `PsychologicalInsight` data contains aspects like:
- **Decision Style** (analytical vs. intuitive) -- affects how much detail/data to include
- **Risk Tolerance** (conservative vs. aggressive) -- affects framing of recommendations
- **Communication Preference** (formal vs. casual) -- affects overall tone, greeting, sign-off
- **Emotional State** (anxious vs. confident) -- affects reassurance level

Examples of tone adaptation:

| Psychology | Email Behavior |
|---|---|
| Analytical decision style (4-5/5) | More data points, specific numbers, structured lists |
| Intuitive decision style (1-2/5) | Big-picture language, fewer numbers, narrative flow |
| Conservative risk tolerance | "Protecting what you've built", "steady growth", cautious framing |
| Aggressive risk tolerance | "Opportunity", "growth potential", forward-leaning language |
| Formal communication pref | "Dear Mr. Thompson", "Respectfully", structured paragraphs |
| Casual communication pref | First name, conversational tone, shorter sentences |
| Anxious emotional state | Extra reassurance, "we're on track", "nothing to worry about" |

## Changes

### 1. Pass psychology insights to FollowUpEmailDialog
**File: `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx`**
- Add `psychologicalInsights={nextStepsData.psychologicalInsights}` as a prop to `FollowUpEmailDialog`

### 2. Accept and use psychology in email generation
**File: `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx`**
- Add `psychologicalInsights` to the props interface (type `PsychologicalInsight[]`)
- Import `PsychologicalInsight` from `sampleData`
- Pass insights into `buildEmailBody`
- Add a helper function `getToneConfig(insights)` that reads slider values and returns a tone configuration object:
  - `greeting`: formal ("Dear Mr./Ms. Last") vs. warm ("Dear FirstName") vs. casual ("Hi FirstName")
  - `detailLevel`: "high" (include numbers, percentages) vs. "low" (big-picture only)
  - `riskFraming`: "conservative" (protective language) vs. "aggressive" (opportunity language)
  - `reassurance`: boolean -- whether to add extra reassuring language
  - `signOff`: "Respectfully" vs. "Warm regards" vs. "Best"
- Adjust `buildEmailBody` to use the tone config:
  - Swap greeting based on communication preference
  - Add/remove data points in spending insight based on detail level
  - Frame product recommendations with appropriate risk language
  - Add reassurance sentences when emotional state indicates anxiety
  - Use matching sign-off

### Files Modified
1. `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx` -- pass psychology prop
2. `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx` -- consume psychology, adapt tone
