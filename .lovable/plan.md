

## Update 3P Pillar Subtitles + Hint at ACH Movement

### Subtitle Copy

- **Profiling**: "Who are they, where do they spend & move money?"
- **Predictive**: "What will they spend on next & how do we reward it?"
- **Phase**: "Where are they in their journey & what's their next product?"

The Profiling subtitle now hints at ACH/money movement (e.g., transfers to Marcus, Ally) — signaling the bank can see deposit flight, not just card spend.

### Changes in `src/components/demo/DemoNetworkDiagram.tsx`

1. **Update `subtitle` text** in the 3 `PILLARS` entries (lines 54, 65, 76)
2. **Increase `PILLAR_HEIGHT`** from `58` → `78` to fit two-line question subtitles
3. **Subtitle rendering** (line 353): remove `truncate`, bump from `text-[8px]` to `text-[9px]` so the questions wrap and remain readable

Single file, 3 small edits.

