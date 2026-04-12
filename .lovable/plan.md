

## Fix: Remove Horizontal Scrollbar from Quick Action Buttons

### Problem
The "next question" quick action buttons (line 286) use `overflow-x-auto` which creates a visible horizontal scrollbar when buttons exceed the container width.

### Fix
**File: `src/components/demo/ConsumerAIChatView.tsx`** — Line 286

Change `overflow-x-auto no-scrollbar` to `overflow-hidden flex-wrap` so buttons wrap to the next line instead of scrolling horizontally. This keeps everything within the chat window without any scrollbar.

One line change.

