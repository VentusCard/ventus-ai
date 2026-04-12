

## Fix: Uniform 13px Text in AI Chat Responses

### Problem
Mixed font sizes in chat bubbles — some text renders at 12px (`text-xs`), some at 14px (`text-sm`).

### Fix
**File: `src/components/demo/ConsumerAIChatView.tsx`**

1. **Line ~245** — Change bubble container from `text-sm` to `text-[13px]`
2. **Line ~252** — Replace `prose-sm` and `text-xs` with `text-[13px]`, and update all arbitrary variants to `text-[13px]`: `[&_p]:text-[13px] [&_li]:text-[13px] [&_h1]:text-[14px] [&_h2]:text-[13px] [&_h3]:text-[13px] [&_strong]:text-[13px] [&_em]:text-[13px] [&_pre]:text-[11px] [&_table]:text-[11px]`
3. **User message bubble** — already inherits from container, will be 13px

One file, two lines changed.

