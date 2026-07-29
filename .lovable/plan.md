Two changes to `src/components/solutions/CampaignStudioPreview.tsx`:

## 1. Personalize the subject line

Every segment's subject currently has a hardcoded number or plain claim ("earn you $237 more this year", "3% back on the aisle…"). Rewrite each of the 6 subjects to include an inline `$xx.xx` merge token so the personalization is visible in the email title itself.

To render a `<MergeToken />` inside the subject string, switch each segment's `subject` field from a plain string to a function returning JSX (`subject: (token) => <>…</>`) or, simpler, split it into `subjectLead` + `subjectTrail` around the token. The subject `<p>` then renders `{lead}<MergeToken />{trail}`.

Example rewrites (all 6):
- Dining-led → `Your dining habit could earn you [$xx.xx] more this year`
- Grocery-led → `About [$xx.xx] back a year on the aisle you visit every week`
- Commuter → `Roughly [$xx.xx] back a year at the pump and dinners out`
- New parents → `[$xx.xx] back a year on the new-baby budget`
- Just bought a home → `[$xx.xx] back a year on the aisle you'll live in`
- Empty-nest → `[$xx.xx] back a year on travel and dinners out`

## 2. Richer copy pulled from /bankdemo Customer-Choice card

The /bankdemo Campaign Studio has hand-crafted, sensory copy in `src/components/tepilot/campaigns/sections/buildMessageCards.ts` under `CUSTOMER_CHOICE_CARDS` (foodie, new-home, new-city, saving-toward-a-goal). Port that voice into the 6 segments so bodies read like real drafts instead of mechanic explainers:

- **Dining-led** — "The daily coffee, the Friday pizza, dinners out that just happen. Set 3% on Dining and 2% on Grocery — the food you're feeding yourself anyway, finally feeding your rewards too."
- **Grocery-led** — "The weekly cart, the school-week snack runs, the Costco Sunday. Set 3% on Grocery and keep 2% on Gas & Fuel for the commute in between."
- **Commuter** — "You're on the road daily — pump stops, drive-thru dinners on the way home. Set 3% on Gas & Fuel and 2% on Dining. Plus a $200 welcome bonus after $1,000 in 90 days."
- **New parents** — "New baby just rewrote the monthly budget: more grocery runs, more streaming for the 2 a.m. feeds. Pin 3% on Grocery and 2% on Streaming while everything settles."
- **Just bought a home** — "Congrats on the new place — now come the hardware-store weekends and warehouse runs. Set 3% on Home Improvement and 2% on Wholesale Clubs before the first big project."
- **Empty-nest** — "Kids are out, the calendar just cleared. Move 3% onto Travel and keep 2% on Dining for the trips and long dinners ahead."

Keep merge tokens: append the existing "Based on the last 90 days of spend, we estimate `$xx.xx` back per year on this card." sentence to each body.

## 3. Value-math strings — keep as-is

The existing `valueMath` chips (`~$280/mo dining + ~$650/mo grocery ≈ $237/yr…`) are illustrative averages, not personalization claims, so they stay. The personalized number is the `$xx.xx / yr` chip beside them, unchanged.

No changes to segment list, rotation, product band, angles, or reach numbers.
