
# Cleanup Plan: Keep Only TePilot and Contact Us

## Overview
This plan removes all pages, components, and related code not associated with the TePilot suite (`/tepilot` and its sub-routes) and the Contact Us page (`/contact`). All edge functions will be preserved.

## What Will Be Preserved

### Pages (7 total)
| Route | Page File | Purpose |
|-------|-----------|---------|
| `/` | Redirect to `/tepilot` | Entry point |
| `/tepilot` | TePilot.tsx | Main TePilot dashboard |
| `/tepilot/recommendations` | RecommendationsPage.tsx | Deal recommendations |
| `/tepilot/advisor-console` | AdvisorConsolePage.tsx | Wealth advisor console |
| `/tepilot/financial-planning` | FinancialPlanningPage.tsx | Financial planning tool |
| `/tepilot/rewards-pipeline` | RewardsPipelinePage.tsx | Rewards pipeline view |
| `/contact` | ContactUs.tsx | Contact form |
| `*` | NotFound.tsx | 404 page |

### All Edge Functions (11 total - all preserved)
- `advisor-chat`
- `analyze-lifestyle-signals`
- `analyze-pillar-transactions`
- `classify-transactions`
- `generate-city-deals`
- `generate-partner-recommendations`
- `parse-bank-statement-pdf`
- `search-deals`
- `semantic-deal-search`
- `send-feedback`
- `travel-detection`

### Components to Keep
- `src/components/tepilot/` - All TePilot components
- `src/components/ui/` - Shared UI components (shadcn)
- `src/components/ScrollToTop.tsx` - Utility component
- `src/components/Navbar.tsx` - Will be simplified
- `src/components/Footer.tsx` - Will be simplified

---

## Files to Delete

### Pages (~19 files)
```text
src/pages/Index.tsx
src/pages/OnboardingFlow.tsx
src/pages/JoinWaitlist.tsx
src/pages/Partners.tsx
src/pages/AboutUs.tsx
src/pages/BenefitsPage.tsx
src/pages/Gallery.tsx
src/pages/GolfDemo.tsx
src/pages/PgaDemo.tsx
src/pages/VentusAI.tsx
src/pages/Privacy.tsx
src/pages/TermsOfService.tsx
src/pages/AppDownload.tsx
src/pages/Archive.tsx
src/pages/Rewards.tsx
src/pages/VentusRewards.tsx
src/pages/ventus-app/ (entire folder - 11 files)
src/pages/ventus-rewards/ (entire folder)
```

### Components (~8 folders/files)
```text
src/components/Benefits.tsx
src/components/CTA.tsx
src/components/Features.tsx
src/components/Hero.tsx
src/components/Rewards.tsx
src/components/Testimonials.tsx
src/components/dashboard/ (entire folder)
src/components/gallery/ (entire folder)
src/components/onboarding/ (entire folder)
src/components/onboarding-flow/ (entire folder)
src/components/partners/ (entire folder)
src/components/ventus-app/ (entire folder)
```

### Contexts
```text
src/contexts/VentusAuthContext.tsx
```

### Hooks (consumer app related)
```text
src/hooks/useCityDeals.ts
src/hooks/useDealSearch.ts
src/hooks/useSemanticDealSearch.ts
src/hooks/useImagePreloader.ts
src/hooks/useAdvancedImagePreloader.ts
src/hooks/usePerformanceMonitor.ts
```

### Lib Files (consumer app related)
```text
src/lib/availableDealsData.ts
src/lib/ventusApi.ts
```

### Assets (marketing images)
```text
src/assets/app-hero.png
src/assets/app-screens-preview.png
src/assets/ventus-logo.png
```

---

## Files to Modify

### 1. App.tsx
- Remove all consumer route imports
- Remove VentusAuthProvider wrapper
- Redirect `/` to `/tepilot`
- Keep only: `/tepilot/*`, `/contact`, `*` routes

### 2. Navbar.tsx
- Simplify to show only: Logo (→ /tepilot), Contact link
- Remove: About Us, Smart Rewards, Ventus AI, Download App, Sign In/Sign Up

### 3. Footer.tsx
- Simplify to show only: Brand, Contact Us link, Copyright
- Remove: Quick Links section, Waitlist Access section

---

## Implementation Steps

1. **Modify App.tsx** - Remove unused imports, simplify routes, redirect `/` to `/tepilot`
2. **Simplify Navbar.tsx** - Keep only logo and Contact link
3. **Simplify Footer.tsx** - Remove marketing links
4. **Delete page files** - Remove all consumer-facing pages
5. **Delete component folders** - Remove 6 component directories
6. **Delete context/hooks/lib** - Remove unused utilities

---

## Summary
- **~50+ files deleted**
- **3 files modified**
- **0 edge functions deleted** (all 11 preserved)
- Result: Clean TePilot-focused codebase with Contact page
