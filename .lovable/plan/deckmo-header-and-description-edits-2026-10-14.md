# Deckmo header and description edits

## Goal and boundary

Sharpen the deck’s progression: partial visibility → unified intelligence → Ricky understood → service savings → rewards revenue → product growth → ongoing help → institution-wide tools → invitation.

**All wording below is a draft for your final edits. No deck copy changes happen during this planning step.** After you finalize the wording, apply only the approved text. Preserve layout, slide order, phone screens, animations, navigation, signal pills, evidence popups, and the embedded platform.

## Proposed section copy

### 1 · Thesis

Keep “Banking is personal.” and “Or at least, it used to be.”

Replace the equation’s opening phrases:

- Today: **Can't talk to and understand customer needs = Generic banking = Commoditization**
- With Ventus: **Understand and anticipate customer needs = Personalized banking = Differentiation**

This keeps the contrast without implying banks ignore customers or promising fulfillment of every need.

### 2 · The Visibility Gap

- Eyebrow: **THE VISIBILITY GAP**
- Headline: **Meet Ricky** — keep.
- 2.1 description: **Start with the transactions the institution can see.** — keep.
- 2.2 description: **But transactions alone reveal only part of Ricky’s life.** — keep.
- Left-panel caption: **Raw activity across payment rails**
- Right-panel caption: **Financial relationships and life context beyond the bank**
- Right-panel conclusion: **The wider picture remains out of view.**

Remove the premature “360-degree” claim from this introduction, not from any unrelated scene.

### 3 · The Complete Picture

- Eyebrow: **THE COMPLETE PICTURE** — keep.
- Headline: **Ventus AI: One living customer view**
- Description: **Internal activity and external context come together to show who each customer is, how they live, and what they may need next.**
- Inside-panel title: **Understand activity across payment rails**
- Outside-panel title: **Add context from external sources**
- Center label: **ONE LIVING CUSTOMER VIEW** — keep.
- Final question: **Who they are · What they do · What do they need next?** — keep.

### 4 · Customer Intelligence in Action

- Proposed section navigation label: **Ricky, understood**
- Eyebrow: **CUSTOMER INTELLIGENCE IN ACTION**
- Headline: **Ricky, understood**
- 4.1 description: **Internal activity reveals Ricky’s routines, financial relationships, and emerging needs.**
- 4.2 description: **External context adds the relationships and life details the bank cannot see on its own.**

Use separate descriptions for the internal and external reveals. Keep family headings and all signal content unchanged.

### 5 · Immediate: Lower Service Cost

- Section label and headline: keep.
- Description: **Help customers recognize charges, understand the context, and confirm the answer without calling the bank.**

### 6 · Mid-Term: Rewards Revenue

- Section label / eyebrow: **Mid-Term: Rewards Revenue** / **MID-TERM: REWARDS REVENUE**
- Headline: **Turn everyday interests into rewards revenue**
- Description: **Bring partner offers, rewards, and perks into collections shaped around each customer’s interests and plans.**

Keep this section focused on rewards and offers; banking-product growth belongs in Section 7. The revenue framing and metric label remain subject to your confirmation of what the displayed yield measures.

### 7 · Mid-Term: Growth

- Section label: keep **Mid-Term: Growth**; optional alternative for your edit: **Mid-Term: Product Growth**.
- Headline: **Build a relationship that evolves** — keep.
- Description: **Connect life events, routines, and future plans to timely banking products that deepen the customer relationship and grow share of wallet.**

### 8 · Long-Term: Retention & NPS

- Section label / eyebrow: keep.
- Headline: **Give customers more reasons to stay**
- Description: **An assistant with the customer’s wider financial context can offer useful answers today and more relevant help over time.**

Treat retention and NPS as the strategic ambition; do not imply the displayed engagement figure measures either.

### 8.4 · Assistant showcase

- Eyebrow: **COUNTLESS WAYS TO SERVE**
- Headline: **More context. More ways to help.**
- Description: **With a richer understanding of the customer’s financial life, your assistant can be proactive with everyday questions, future plans, and the moments in between.**

Keep all seven phone conversations and their labels unchanged.

### 9 · Tools for the Bank

- Section label / eyebrow: keep.
- Proposed headline: **The same intelligence, across your bank**
- Optional alternative: **From Ricky to every customer.**
- Description: **A modular, governed intelligence and personalization platform with 45 tools and workflows.** — keep.
- Keep the three screen labels unchanged.

### 10 · Closing invitation

Default proposal: rename **The Ask** to **The Invitation**, preserving the closing headline, equation, ticker, invitation, and contact details.

If you prefer an actual ask, keep **The Ask** and replace the invitation with **Let’s explore a pilot together.** This is an option for your final edit, not an approved offer or commitment.

Optional ticker wording: **grow customer lifetime value** instead of “lift LTV,” only if it fits without changing the design.

## Proposed step-caption edits

Keep captions not listed here unchanged.


| Slide | Proposed title                               | Proposed description                                                                                    |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 5.1   | Clear merchant names and locations           | Keep existing description.                                                                              |
| 5.5   | Confirmed by the customer                    | One tap confirms the charge and helps improve future explanations.                                      |
| 6.1   | Deals, rewards and perks in one place        | Partner offers and local experiences sit alongside the bank’s own benefits.                             |
| 6.2   | Offers from multiple partners                | Bring partner catalogs together in one customer experience.                                             |
| 6.3   | Search by meaning, not keywords              | Keep existing description.                                                                              |
| 6.4   | Collections shaped by customer context       | Group offers around interests, routines, and upcoming plans.                                            |
| 6.5   | A collection for the next trip               | Travel gear, clothing, and airport benefits come together around Ricky’s upcoming getaway.              |
| 7.1   | Life context informs product recommendations | Home plans, routines, and future trips inform mortgage, card, and savings recommendations.              |
| 7.2   | Make the benefit concrete                    | Show how each recommendation could support the customer’s routine or next goal.                         |
| 7.3   | Give the customer a next step                | Each recommendation pairs a clear benefit with an action the customer can take.                         |
| 8.1   | Understand the context                       | Keep existing description.                                                                              |
| 8.3   | Earn the next interaction                    | Useful, relevant help gives customers a reason to return and can support stronger engagement over time. |


Section 7’s draft captions deliberately work with the independently rotating product cards. Synchronizing products to slide steps is not part of this copy edit.

## Decisions reserved for your final edits

- Choose Section 9’s headline and whether Section 10 is an invitation or a concrete pilot ask.
- Confirm whether Section 6’s yield represents revenue before finalizing its revenue framing.
- Confirm the definitions and sources of **-9%, $20 per user/year, +5.5%, and +4.5%**, including relative change versus percentage points where applicable.
- Confirm **45 tools and workflows** and the diagram’s taxonomy counts before changing or qualifying those claims.

Until confirmed, preserve all numeric values and metric labels. Do not invent sources or label figures “modeled,” “illustrative,” or “measured.”

## Technical details for the approved implementation

- Update active section labels, shared copy, and captions in `src/lib/deckmoScript.ts`.
- Separate the Visibility and Ricky Story headers in `src/components/deckmo/DeckmoDeck.tsx`; the active scenes currently share Ricky’s eyebrow and title. Give the story its two step-specific descriptions without altering reveal behavior.
- Adjust `src/components/deckmo/DeckmoBankdemoScenes.tsx` only if needed to render the finalized copy. Do not rewrite unused alternative scene strings or embedded-platform copy.
- Preserve the existing bank/customer → credit union/member wording conversion; review both versions for grammar and fit.
- Verify the finalized headers and captions across all 36 slides, check shorter and wider desktop viewports, run relevant deck regression tests, and check current preview errors before reporting completion.

## Acceptance criteria

- Only your finalized copy is applied; unresolved options remain unchanged.
- Sections 2 and 4 clearly distinguish raw visibility from enriched understanding.
- Sections 6, 7, and 8 distinguish rewards revenue, product growth, and ongoing relationship value.
- 4.1 and 4.2 descriptions match their respective reveals.
- No changed slide behavior, new claims, altered metrics, or edits to phone conversations and signal evidence.