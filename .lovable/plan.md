# Cleaner, more elegant Ask Ventus AI chat

Restyle the leadership chat screen in the bank demo so it feels calmer and more refined. Layout stays the same: prompt list on the left, conversation in the middle, data panel on the right — all three get quieter styling.

## Color direction

Soft indigo on a cool off-white base:

- Page base `#FBFCFE`, conversation surface white
- Tint `#EEF2FF` for subtle fills, `#C7D2FE` for hairlines and hover borders
- Accent `#4338CA` used sparingly: active prompt, focus ring, links, the Ventus mark
- Borders soften from slate-200 to a light indigo-tinted line
- Status colours (green "live", amber trends) drop to muted versions instead of bright chips

Stays strictly light theme, existing font unchanged.

## What changes

**Header**
- Replace the blue-to-indigo gradient badge with a flat indigo mark
- Quieter title/subtitle hierarchy, thinner divider
- "Live context" becomes a small muted dot + label instead of a green pill

**Left prompt list**
- Group labels lighter and smaller, more breathing room between groups
- Prompt rows lose the boxed hover; they get a soft indigo tint and indigo text on hover

**Conversation**
- Assistant replies sit directly on the surface with a small flat indigo avatar
- User message bubble changes from near-black to deep indigo with white text
- Markdown typography refined: calmer headings, tighter list rhythm, softer table lines, muted rules and quotes
- Copy/regenerate actions stay hover-revealed but in lighter grey

**Empty state**
- Single flat indigo mark instead of the gradient tile
- Priority briefing cards: thinner borders, softer tinted icon chips, less colour weight
- Three capability cards get a lighter hover (tint + border, no lift/shadow)
- Divider and footnote text lightened

**Composer**
- Softer rounded box, indigo focus ring instead of blue border
- Scope chip becomes a plain muted label
- Send button changes from black to indigo, with a soft disabled state

**Right data panel**
- Metric tiles on the pale indigo tint with lighter labels
- Hot trends as plain rows with a hairline separator rather than bordered boxes
- Jump links quieter, indigo on hover

## Technical notes

Files touched:
- `src/components/tepilot/insights/VentusAIChatPage.tsx`
- `src/components/tepilot/insights/ventus-chat/ChatMessage.tsx`
- `src/components/tepilot/insights/ventus-chat/PromptRail.tsx`
- `src/components/tepilot/insights/ventus-chat/ContextPanel.tsx`
- `src/components/tepilot/insights/ventus-chat/PriorityBriefing.tsx`

Presentation only — no changes to chat logic, prewarming, priority-card data, or navigation callbacks. Verified with a build and a screenshot pass of the chat tab.
