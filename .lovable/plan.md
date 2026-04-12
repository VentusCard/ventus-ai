

## Two Chatbot Changes

### 1. Add disclaimer subtitle below "TCBY Bank · Sarah" header

Add a small text line "Using Bank of America product information as reference." directly below the header in both phone views:

- **`src/components/exec-demo/ExecDemoPhoneView.tsx`** (line ~107): Add `<span className="text-[8px] text-slate-400">Using Bank of America product information as reference.</span>` below the existing header span
- **`src/components/demo/DemoDetailOverlay.tsx`** (line ~228): Same subtitle below "TCBY Bank"

### 2. Remove disclaimer from chatbot system prompt & shorten responses

- **`supabase/functions/consumer-chat/index.ts`** (lines 32-33): Remove the "IMPORTANT DISCLAIMER" instruction since it's now shown in the UI header
- Same file, TONE & RULES section: Change "2-4 sentences max" to "1-3 sentences max" and add instruction "Keep responses extremely concise — 25% shorter than you normally would."

