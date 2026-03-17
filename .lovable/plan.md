

## Analysis: Should the 3 Ps Live Inside the Engine Card?

**Short answer: No — keeping them separate is the stronger design.**

### Why they work better as distinct nodes outside the engine

1. **Visual storytelling** — The diagram's power is showing a *flow*: raw data enters the engine, gets processed by 3 capabilities (Semantic Enrichment, Cross-category Patterns, Deep Purchase Analysis), then *produces* three distinct intelligence streams (Profiling, Predictive, Phase). Collapsing the Ps into the engine removes that "transformation" narrative.

2. **The Ps are *outputs*, not *capabilities*** — The engine's 3 internal cards describe *how* it works (enrichment, pattern detection, analysis). The 3 Ps describe *what it produces* (spending profiles, predictive signals, life-phase intelligence). These are conceptually different layers.

3. **Diagram hierarchy gets lost** — If you put 3 capabilities + 3 Ps inside one card, that's 6 items in a single box. You'd lose the clean 1 → 3 → 3 → 6 cascade that makes the architecture legible at a glance.

4. **The current flow tells a better conference story:**

```text
[Customers] → [Engine: HOW we do it] → [3 Ps: WHAT it produces] → [6 Use Cases: WHERE it applies]
```

### Recommendation

Keep the approved structure:
- **Engine card** contains the 3 *capability* cards (Semantic Enrichment, Cross-category Patterns, Deep Purchase Analysis) — these explain the technology
- **3 Pillar nodes** sit outside as the next layer — these explain the intelligence categories
- **6 leaf nodes** fan out from the pillars — these are the products/features

This gives you a clean presenter narrative: *"Our engine uses these three techniques → to produce these three types of intelligence → which power these six products."*

If you'd still like to proceed with putting the Ps inside the engine, I can plan that — but I'd recommend keeping the current separation.

