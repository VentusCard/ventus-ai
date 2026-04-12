

## Fix: Constrain AI Chat Response Formatting in Phone Mockup

### Problem
The AI assistant's markdown responses render with default prose sizing, causing text, lists, and headings to overflow the phone mockup's chat bubble, triggering scrollbars.

### Solution
Tighten the markdown prose styles inside the assistant message bubble in `ConsumerAIChatView.tsx` (line 252):

**File: `src/components/demo/ConsumerAIChatView.tsx`**

Update the prose wrapper div (line 252) to:
- Force smaller text: `text-xs` base, `[&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs`
- Compress spacing: `[&_p]:mb-0.5 [&_ul]:mt-0.5 [&_ul]:mb-0.5 [&_ol]:mt-0.5 [&_li]:text-xs [&_li]:leading-tight`
- Prevent table/code overflow: `[&_pre]:overflow-x-auto [&_pre]:text-[10px] [&_table]:text-[10px]`
- Remove excessive margins: `[&_h1]:mt-1 [&_h2]:mt-1 [&_h3]:mt-0.5 [&_p]:leading-snug`
- Add `overflow-hidden break-words` to the bubble container itself (line 244-249) to prevent horizontal overflow

One file, ~5 lines changed.

