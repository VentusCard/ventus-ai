
# Cleanup Implementation Plan

## Summary
Remove all consumer-facing marketing pages and mobile app code while keeping:
- **Home page** (`/`) - with simplified Hero and CTA
- **Contact Us** (`/contact`) - fully functional contact form
- **TePilot suite** (5 routes) - complete product functionality

---

## Files to Modify

### 1. App.tsx
Remove all unused route imports and definitions:
- Remove VentusAuthProvider wrapper and all ventus-app imports
- Remove routes: `/smartrewards`, `/join-waitlist`, `/partners`, `/about`, `/benefits`, `/gallery`, `/demo/golf`, `/ventus-ai`, `/privacy`, `/terms`, `/download`, `/archive`, and all `/app/*` routes
- Keep only: `/`, `/tepilot/*`, `/contact`, `*` (NotFound)

### 2. Index.tsx  
Simplify to minimal home page:
- Keep Navbar and Footer imports
- Replace Hero/CTA with a clean placeholder section ready for rebuild
- Remove unused state management and refs

### 3. Hero.tsx
Update CTA button:
- Change "Learn More" link from `/smartrewards` to `/contact`

### 4. CTA.tsx
Update CTA button:
- Change "Join Waitlist" link from `/smartrewards` to `/contact`
- Update button text to "Contact Us"

### 5. Navbar.tsx
Simplify navigation:
- Remove: About Us, Smart Rewards, Ventus AI, Download App links
- Remove: Sign In/Sign Up buttons and user menu logic
- Keep: Logo (links to `/`), Contact link only

### 6. Footer.tsx
Simplify links:
- Remove: Quick Links section (About, How It Works, Privacy, Terms)
- Remove: Waitlist Access section (Card Users, Benefits, Merchant Partners)
- Keep: Brand section, Contact button, Copyright notice

### 7. supabase/config.toml
Remove entries for deleted edge functions

---

## Files to Delete

### Pages (17 files + 2 folders)
```text
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
src/pages/ventus-app/ (11 files)
src/pages/ventus-rewards/ (4 files)
```

### Components (6 folders + 4 files)
```text
src/components/Benefits.tsx
src/components/Rewards.tsx
src/components/Testimonials.tsx
src/components/Features.tsx
src/components/dashboard/ (6 files)
src/components/gallery/ (5 files)
src/components/onboarding/ (folder)
src/components/onboarding-flow/ (folder)
src/components/partners/ (7 files)
src/components/ventus-app/ (10 files)
```

### Context
```text
src/contexts/VentusAuthContext.tsx
```

### Hooks (6 files)
```text
src/hooks/useCityDeals.ts
src/hooks/useDealSearch.ts
src/hooks/useSemanticDealSearch.ts
src/hooks/useImagePreloader.ts
src/hooks/useAdvancedImagePreloader.ts
src/hooks/usePerformanceMonitor.ts
```

### Lib Files (2 files)
```text
src/lib/availableDealsData.ts
src/lib/ventusApi.ts
```

### Edge Functions (5 folders)
```text
supabase/functions/generate-city-deals/
supabase/functions/generate-partner-recommendations/
supabase/functions/search-deals/
supabase/functions/semantic-deal-search/
supabase/functions/send-feedback/
```

---

## Post-Cleanup Result

| Category | Before | After |
|----------|--------|-------|
| Routes | ~20 | 4 |
| Page files | ~35 | 8 |
| Edge functions | 11 | 6 |

### Preserved Routes
- `/` - Home page (minimal, ready for rebuild)
- `/contact` - Contact form
- `/tepilot` - TePilot dashboard
- `/tepilot/recommendations` - Recommendations
- `/tepilot/advisor-console` - Advisor Console
- `/tepilot/financial-planning` - Financial Planning
- `/tepilot/rewards-pipeline` - Rewards Pipeline

All TePilot functionality remains fully operational with its 6 edge functions intact.
