

# Connect Meeting Notes with WM Co-Pilot Functions

## Overview
Enhance the Meeting Notes dialog so that on submit, it intelligently connects with other co-pilot features -- auto-triggering relevant chips, pre-filling Ventus AI chat context, scheduling life event planning, and feeding data into the Client Snapshot panel.

## Connections to Build

### 1. Auto-Send Meeting Summary to Ventus AI Chat
After notes are saved, construct a summary prompt and inject it into the chat so the AI can analyze the meeting and suggest additional actions.

**How it works:**
- On submit, build a text summary from all filled fields (sentiment, discussion points, products discussed, etc.)
- Use the existing `pendingMessage` mechanism (call a new prop like `onSendToChat`) to inject the summary as a chat message
- The AI then responds with analysis, additional recommendations, and follow-up suggestions
- Any checkbox-formatted action items in the AI response automatically flow into Next Steps (existing behavior)

### 2. Auto-Open Life Event Planner When Life Event Detected
If the meeting type is "Life Event Follow-up" or discussion points mention life events (retirement, baby, home purchase, etc.), automatically open the Financial Timeline Tool after notes are saved.

**How it works:**
- Check `meetingType === "Life Event Follow-up"` or scan discussion points for keywords
- If detected, trigger `onPlanEvent` (existing cross-panel callback) or set `financialTimelineOpen = true`
- Pass context from the notes (e.g. "Client discussed upcoming retirement") to pre-seed the timeline

### 3. Feed Products Discussed into Product Recommendations
When products are checked in the notes, use them as context for the "Product Recommendations" chip.

**How it works:**
- Store the products discussed in a shared state (via a new prop callback `onProductsDiscussed`)
- When "Product Recommendations" chip is clicked afterward, append these products to the AI prompt: "Client recently discussed: Mortgage, 529 Plan. Based on this and their profile..."
- This makes the AI recommendation contextually aware of the meeting

### 4. Update Client Psychology from Sentiment
Map the sentiment selection to the Client Psychology panel's emotional state slider.

**How it works:**
- On submit, if sentiment is filled, call `onExtractNextSteps` with a `PsychologicalInsight` for "Emotional State" mapped from the sentiment value
- Very Positive/Positive -> high slider, Neutral -> mid, Concerned/Anxious -> low
- This updates the right panel's psychology section automatically

### 5. Schedule Next Meeting as Calendar Action Item with Priority
If a next meeting date is set, create a higher-visibility action item that includes the date and topic, and also surface it in the Action Workspace's meeting section.

**How it works:**
- Already partially implemented (creates an action item)
- Enhance: pass the next meeting date/topic to the `ActionWorkspacePanel` via a new prop so it can update the "Upcoming Meeting" card at the top of the right panel
- The meeting card currently shows hardcoded sample data -- replace with real data from notes

## Files to Modify

| File | Change |
|---|---|
| `src/components/tepilot/advisor-console/MeetingNotesDialog.tsx` | Expand `onSubmitNotes` to return full meeting data (not just action items). Add sentiment-to-psychology mapping. Build chat summary string. |
| `src/components/tepilot/advisor-console/VentusChatPanel.tsx` | After notes submit: inject summary into chat via pending message, conditionally open Life Event Planner, store products discussed for future prompts. |
| `src/components/tepilot/advisor-console/AdvisorConsole.tsx` | Add state for meeting context (products discussed, next meeting info). Pass next meeting data to ActionWorkspacePanel. Wire up new callbacks. |
| `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx` | Accept optional `nextMeeting` prop to override the hardcoded meeting card with real data from notes. |
| `src/components/tepilot/advisor-console/sampleData.ts` | Add `MeetingNotesResult` type that includes action items, sentiment, products, next meeting date, and summary text. |

## Technical Details

### New Type: `MeetingNotesResult`
```typescript
interface MeetingNotesResult {
  actionItems: NextStepsActionItem[];
  sentiment?: string;
  productsDiscussed: string[];
  meetingType: string;
  nextMeetingDate?: Date;
  nextMeetingTopic?: string;
  chatSummary: string; // pre-built prompt for Ventus AI
}
```

### Chat Summary Construction
```text
"Meeting notes summary - Type: Quarterly Review. 
Sentiment: Positive. 
Discussion: [key points]. 
Products discussed: Mortgage, 529 Plan. 
Client requests: [requests]. 
Decisions: [decisions]. 
Please analyze this meeting and suggest any additional action items or opportunities I may have missed."
```

### Sentiment to Psychology Mapping
| Sentiment | Slider Value | Assessment |
|---|---|---|
| Very Positive | 5 | "Highly engaged and optimistic" |
| Positive | 4 | "Comfortable and receptive" |
| Neutral | 3 | "Balanced, no strong signals" |
| Concerned | 2 | "Showing worry, needs reassurance" |
| Anxious | 1 | "Elevated anxiety, handle with care" |

### Life Event Detection Keywords
Scan `discussionPoints` + `meetingType` for: retirement, baby, child, wedding, marriage, home purchase, house, college, inheritance, divorce, job change, relocation

### Flow Diagram
1. Advisor fills out meeting notes and clicks Save
2. Action items are added to Next Steps (existing)
3. Sentiment updates Client Psychology panel
4. Products discussed are stored for future recommendation context
5. Chat summary is injected into Ventus AI for analysis
6. If life event detected, Financial Timeline Tool opens with context
7. Next meeting date updates the Upcoming Meeting card in Action Workspace

