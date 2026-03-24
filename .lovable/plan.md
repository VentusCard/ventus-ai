

## Update Analytics Signal → Personalized UX

Replace the static "Analytics Signal" card (lines 624–639) with a "Personalized UX" card that shows a mini spending pillar tracker for a new "Family & Foundation" category, visualizing baby/pregnancy-related spending as a trackable lifestyle pillar.

### Changes to `src/components/demo/DemoPasswordGate.tsx`

**Lines 624–639** — Replace the Analytics Signal card content:

- Rename to **Personalized UX** with a 📱 icon
- Subtitle: "New lifestyle pillar activated from detected signal"
- Show a mini pillar card labeled **"Family & Foundation"** with:
  - A spending bar showing e.g. `$1,840 / $3,200` (57%) with a green progress fill
  - 3–4 sub-line items showing categorized baby/pregnancy spend:
    - 🍼 Baby & Nursery — $680
    - 🏥 Prenatal Care — $520  
    - 📚 Parenting Resources — $380
    - 🛡️ Family Protection — $260
  - A subtle "Pillar auto-created from life event signal" label at the bottom

This transforms the card from a vague "cluster updated" message into a concrete demonstration: the detected signal creates a new trackable spending pillar in the customer's personalized UX, grouping all family-related transactions together.

**File**: `src/components/demo/DemoPasswordGate.tsx` (lines 624–639)

