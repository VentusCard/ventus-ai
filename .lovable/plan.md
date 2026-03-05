

## Plan: Add Announcement Bar Above Navbar

Create a sticky announcement bar above the navbar promoting Finovate Spring.

### Changes

**1. Create `src/components/AnnouncementBar.tsx`**
- Full-width bar with blue-600 background
- Text: "🎉 Ventus AI is demoing at Finovate Spring — May 5–7, San Diego"
- CTA link: "Schedule a Meeting →" linking to `/contact`
- Dismissible with an X button (state-driven, no persistence needed)
- Small text, compact height (~36-40px)

**2. Update `src/App.tsx`**
- Render `AnnouncementBar` above `Navbar` (outside the `isTepilot` check, or inside it so it only shows on marketing pages)

**3. Update `src/components/Navbar.tsx`**
- Adjust top positioning: the navbar is `absolute top-0`, so if the announcement bar is present, content below needs to account for the extra height
- Alternatively, make the announcement bar part of the navbar component itself, rendered above the nav content

The simplest approach: render the announcement bar inside `Navbar.tsx` at the very top, before the nav element, so positioning stays self-contained.

