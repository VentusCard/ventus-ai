

## Plan: Simplify Beat 5 personalization cards

### Current state
Beat 5 ("Behavioral Signal + Demographics = Personalization") has three staggered cards, each with:
- A descriptive subtitle ("— Delivered within deals page..." etc.)
- A 2x4 grid of sub-cards

### Changes (lines 662–765 of `DemoPasswordGate.tsx`)

Replace the three card blocks with simplified versions:

1. **Remove** the `<span className="text-xs text-slate-400">` descriptive text from each card
2. **Remove** the `grid` of sub-cards from each card
3. **Replace** each sub-card grid with a single descriptive sentence

#### Proposed one-liners:

| Card | Sentence |
|------|----------|
| 🎁 Personalized Rewards | Deliver national and local deals that help expecting mothers — e.g. baby monitors or local classes — with heart-warming messages |
| 🤝 Personalized Relationship | Notify the local advisor, auto-draft a 529 plan, and trigger a life-insurance review — all before the customer asks |
| 📱 Personalized AI & UX | Surface a "Family & Foundation" pillar with a baby budget tracker, milestone alerts, and contextual AI that orchestrates it all |

Each card keeps its emoji + bold title, staggered fade-in animation, and rounded border — just much shorter content.

### Technical detail
Single file edit: `src/components/demo/DemoPasswordGate.tsx`, lines ~662–765. Replace the three card `<div>` blocks with streamlined versions containing only the title row and a `<p>` sentence.

