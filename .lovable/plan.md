# Space out the /deckmo password page

## Goal
The minimal /deckmo password gate currently clusters everything tightly in the center. Restore the visual proportions of the original gate — bigger logo and type, more breathing room between blocks — while keeping only the logo, title, one-line description, and password form.

## Changes (src/components/demo/SimplePasswordGate.tsx, minimal branch only)

Match the original gate's scale and rhythm:
- Logo: `h-12 md:h-14` → `h-16 md:h-20` (same as original gate).
- Header block gaps: `gap-3` → `gap-5`.
- Title "Interactive Presentation": bump from `text-[26px] md:text-[32px]` to `text-[28px] md:text-[34px]`.
- Description line: `text-[13px] md:text-[14px]` → `text-[15px] md:text-[16px]`, drop the tight `whitespace-nowrap` in favor of a single natural line (it fits at these sizes) with `max-w-2xl`.
- Overall vertical rhythm: outer `gap-8` → `gap-14`, so the password form sits clearly below the header like the original layout.
- Password form: widen `w-72` → `w-80`, inputs `h-10` → `h-11` for proportion.

No changes to the non-minimal (/demo) branch, auth logic, or any other page.

## Verification
- Playwright at 1540×855 and 1920×1080: /deckmo gate shows the spaced layout; entering the password still opens the deck; /demo gate unchanged.
- Typecheck and build log clean.
