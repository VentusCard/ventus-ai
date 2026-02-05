
# Plan: Enhance Ventus Insights and Recommended Next Steps

## Overview
Update both the `mockInsightsByEventType` and `recommendedStepsByEventType` to be more unique, detailed, and specific to each life event type. Each insight will paint a distinct lifestyle picture, and each set of steps will be tailored to the specific financial planning needs of that event.

## Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

### 1. Enhanced Ventus Insights (Lines 48-56)

Each insight will be rewritten with unique language, specific behavioral patterns, and personalized observations:

| Event | Key Differentiators |
|-------|---------------------|
| **Retirement** | Focus on lifestyle transition, travel aspirations, legacy mindset |
| **Education** | Parent investment in child's future, timeline pressure, college selection process |
| **Home Purchase** | Nesting behavior, neighborhood research, property investment mindset |
| **Wealth Transfer** | Multi-generational thinking, philanthropy, family governance |
| **Business Liquidity** | Entrepreneurial exit, deal momentum, post-sale identity transition |
| **Family Formation** | New parent preparation, protection instincts, long-term planning awakening |
| **Elder Care** | Sandwich generation pressure, caregiving responsibilities, family support role |

**New Content:**

```tsx
const mockInsightsByEventType: Record<DetectedLifeEvent['eventType'], string> = {
  retirement: "This client is actively architecting their next chapter. The combination of increased retirement contributions, cruise bookings, and estate planning activity reveals someone who envisions an active, travel-rich retirement. AARP enrollment signals they're embracing this life stage. Their trust account setup suggests they're thinking beyond themselves—legacy and family security are priorities. This is a client ready for comprehensive retirement income planning conversations.",
  
  education: "A focused parent preparing for a major milestone. The SAT prep investment and campus visit flights show hands-on involvement in their child's college journey. Early tuition deposits indicate they've likely identified top-choice schools and are moving decisively. The 529 contribution timing suggests tax-aware planning. This client values education highly and is willing to invest significantly—they'll be receptive to comprehensive education funding strategies.",
  
  home_purchase: "This client is in active home acquisition mode. The pattern of home improvement purchases before closing suggests they're preparing a new property for move-in, indicating deal momentum. Earnest money and closing cost payments confirm an imminent transaction. The moving rental booking shows a firm timeline. Expect questions about mortgage optimization, down payment sourcing, and how this purchase fits their broader wealth picture.",
  
  wealth_transfer: "A sophisticated wealth holder thinking intergenerationally. Goldman Sachs Private Wealth engagement and Northern Trust administration indicate institutional-grade planning. The Sotheby's appraisal suggests significant collectibles or art in the estate—assets requiring specialized transfer strategies. Donor-advised fund activity reveals charitable intentions. This client is building a deliberate legacy and will appreciate nuanced estate planning discussions.",
  
  business_liquidity: "An entrepreneur approaching a transformational exit. The Merrill DataSite subscription and Deloitte advisory engagement indicate a sophisticated seller running a structured M&A process. IP valuation activity suggests they understand their business's intangible assets. The significant escrow deposit signals deal progression past LOI stage. This client needs holistic guidance on life after exit—investment of proceeds, tax minimization, and finding purpose post-business.",
  
  family_formation: "A growing family preparing thoughtfully for a new arrival. Baby registry activity and nursery purchases show nesting behavior in full swing. The early 529 plan setup is notable—this parent is already thinking 18+ years ahead. Hospital pre-registration indicates timeline clarity. This life event triggers a cascade of planning needs: life insurance, disability coverage, guardianship designations, and emergency fund expansion.",
  
  elder_care: "This client is stepping into a caregiver role for an aging family member. Medical alert system purchases and home accessibility modifications suggest a parent or in-law is transitioning to needing daily support. The assisted living deposit indicates they're exploring residential care options. Medicare supplement payments show active healthcare management. This is often emotionally complex—approach with empathy while addressing Medicaid planning, long-term care costs, and potential real estate decisions.",
};
```

### 2. Enhanced Recommended Next Steps (Lines 257-307)

Each set of steps will be more specific, actionable, and unique to the event:

```tsx
const recommendedStepsByEventType: Record<DetectedLifeEvent['eventType'], string[]> = {
  retirement: [
    'Model retirement income scenarios using current 401k trajectory and Social Security timing',
    'Propose Roth conversion strategy during lower-income years before RMDs begin',
    'Review healthcare bridge options between employer coverage and Medicare eligibility',
    'Discuss travel budget integration into sustainable withdrawal rate planning',
    'Confirm estate documents reflect current wishes and beneficiary designations are updated',
  ],
  education: [
    'Calculate projected college costs for target schools vs. current 529 balance',
    'Review financial aid implications—discuss FAFSA timing and asset positioning',
    'Model parent loan vs. student loan scenarios with long-term cost comparison',
    'Explore grandparent superfunding strategy for additional 529 contributions',
    'Discuss post-graduation cash flow: how tuition payments affect retirement savings rate',
  ],
  home_purchase: [
    'Analyze liquid asset positioning for optimal down payment without disrupting investments',
    'Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed, points vs. no points',
    'Model post-purchase cash flow including PITI, maintenance reserves, and reduced savings rate',
    'Discuss home equity as part of overall net worth and retirement planning',
    'Review homeowners insurance options and umbrella liability coverage needs',
  ],
  wealth_transfer: [
    'Map current estate structure and identify gaps in beneficiary designations',
    'Model gift tax exclusion strategy: annual gifts vs. lifetime exemption usage',
    'Discuss trust options: revocable vs. irrevocable, generation-skipping considerations',
    'Review charitable giving vehicles: DAF timing, CRT for appreciated assets, private foundation',
    'Schedule family governance conversation to align heirs on wealth transfer intentions',
  ],
  business_liquidity: [
    'Model after-tax proceeds under different deal structures: asset vs. stock sale, earnout scenarios',
    'Develop 12-month post-close investment plan for sudden liquidity',
    'Discuss identity and purpose planning—many founders struggle after exit',
    'Review non-compete terms and implications for future entrepreneurial activity',
    'Coordinate with CPA on installment sale, QSBS exclusion, and opportunity zone deferrals',
  ],
  family_formation: [
    'Benchmark life insurance needs: 10-12x income replacement plus future education costs',
    'Review disability insurance coverage—often overlooked but critical for new parents',
    'Update wills to include guardianship designations for the child',
    'Model childcare costs and reduced income scenarios into long-term financial plan',
    'Discuss parental leave cash flow: ensure emergency fund covers income gap',
  ],
  elder_care: [
    'Assess long-term care insurance options or Medicaid planning if coverage is lacking',
    'Review the care recipient\'s assets for Medicaid look-back period implications',
    'Discuss caregiver tax benefits: dependent care FSA, medical expense deductions',
    'Confirm power of attorney and healthcare proxy documents are in place and accessible',
    'Model scenarios for assisted living vs. in-home care cost trajectories',
  ],
};
```

## Summary

| Section | Before | After |
|---------|--------|-------|
| **Ventus Insights** | Generic, similar language across events | Unique behavioral observations, specific merchant references, personalized lifestyle picture |
| **Recommended Steps** | Generic planning steps | Specific, actionable tasks with concrete examples and calculations to perform |
