
# Update Site Content with Confirmed ventusai.com Information

## Overview
Update the site pages with verified content from the official ventusai.com website, including the Hero, About, Technology pages, adding a new FAQ page, and updating the navigation with a "Schedule Demo" CTA button.

---

## Content Updates from ventusai.com

### Confirmed Content to Use

**Main Headline:**
- "Turn transaction data into consumer intelligence"

**Main Description:**
- "Beyond basic enrichment—interpreting transaction data to reveal consumer intent, behavior, and life events. Designed for financial institutions seeking deeper customer engagement."

**What is Ventus AI (for About page):**
- "Ventus AI is a transaction intelligence platform designed for financial institutions. We go beyond basic enrichment, using advanced AI to interpret transaction data and reveal consumer intent, behavior, and life events. This helps banks, credit unions, and wealth managers create more personalized, proactive customer experiences."

**Four Core Capabilities:**
1. **Advanced Transaction Enrichment** - "Our semantic AI goes beyond basic merchant name cleaning. We extract deep, contextual signals from every transaction—merchant category, location patterns, spending velocity, and more—to build a complete picture of customer behavior."

2. **Intelligent Reward Personalization** - "Using AI-driven purchase personas, we help institutions deliver rewards, offers, and content that resonate with each customer's unique lifestyle and spending habits."

3. **Holistic Customer Engagement** - "We enable banks to offer a unified experience—combining rewards, perks, and educational content—in a way that feels seamless and personalized, not like a patchwork of products."

4. **Wealth Management CoPilot** - "For advisors and wealth managers, Ventus surfaces lifestyle events and behavioral insights that automate administrative tasks and create opportunities for proactive, meaningful client engagement."

**FAQ Content (6 confirmed FAQs):**
1. What is Ventus AI?
2. How does Ventus AI work with banks?
3. Is Ventus AI a credit card company or a fintech startup?
4. How secure is the platform?
5. How do customers access Ventus AI features?
6. What outcomes can we expect?

---

## Files to Modify

### 1. Hero Component (`src/components/Hero.tsx`)
**Current:** "Rewards, Made Smarter" with "AI-powered smart rewards personalized to you"
**Update to:**
- Main headline: "Turn transaction data into consumer intelligence"
- Subheading: "Beyond basic enrichment—interpreting transaction data to reveal consumer intent, behavior, and life events"
- Button text: "Schedule Demo" linking to contact page

### 2. About Page (`src/pages/About.tsx`)
**Current:** Generic placeholder content
**Update to:**
- Title: "About Ventus AI"
- Add "What is Ventus AI?" section with confirmed description
- Update "Our Mission" with bank-first collaboration approach
- Add "How We Work" section explaining integration approach

### 3. Technology Page (`src/pages/Technology.tsx`)
**Current:** Generic AI/tech capabilities
**Update to the 4 confirmed core capabilities:**
1. Advanced Transaction Enrichment
2. Intelligent Reward Personalization
3. Holistic Customer Engagement
4. Wealth Management CoPilot

Each with the confirmed descriptions from ventusai.com.

### 4. New FAQ Page (`src/pages/FAQ.tsx`)
Create a new page with the 6 confirmed FAQs using an accordion component:
- What is Ventus AI?
- How does Ventus AI work with banks?
- Is Ventus AI a credit card company or a fintech startup?
- How secure is the platform?
- How do customers access Ventus AI features?
- What outcomes can we expect?

### 5. Navbar (`src/components/Navbar.tsx`)
- Add "FAQ" navigation link
- Add "Schedule Demo" CTA button (styled prominently)
- Update mobile menu accordingly

### 6. App Router (`src/App.tsx`)
- Add route for `/faq` page

---

## Technical Details

### New Dependencies
None required - using existing Accordion component from `@radix-ui/react-accordion`

### File Changes Summary

| File | Action | Changes |
|------|--------|---------|
| `src/components/Hero.tsx` | Modify | Update headline, subheading, button text |
| `src/pages/About.tsx` | Modify | Complete content rewrite with confirmed info |
| `src/pages/Technology.tsx` | Modify | Replace capabilities with 4 confirmed ones |
| `src/pages/FAQ.tsx` | Create | New page with 6 FAQs in accordion |
| `src/components/Navbar.tsx` | Modify | Add FAQ link + Schedule Demo button |
| `src/App.tsx` | Modify | Add `/faq` route |

### Design Consistency
- All pages will maintain the existing dark theme and styling
- FAQ page will use the existing Accordion component for expandable questions
- "Schedule Demo" button will be styled as a primary CTA in the navbar
