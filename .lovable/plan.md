# Campaign Engine LLM — Section 3 (Personalized Message Previews)

Section 3 today renders 3 hardcoded angles per product (`getProductMessageVariants`). We replace that with an LLM-backed **Campaign Engine** that consumes the selected product + an enriched **15-card customer profile where every card has a 3-level reading (HIGH / MED / LOW)**, and emits a bank of personalized offer variations — 5 surfaced as previews.

## 1. The 3-level signal contract

Every one of the 15 dimension cards resolves to one of three discrete levels. This is what makes the variation math huge and the personalization legible.

| # | Family       | Card                          | LOW                  | MED                       | HIGH                          |
|---|--------------|-------------------------------|----------------------|---------------------------|-------------------------------|
| 1 | Behavioral   | What they spend on            | thin / sparse        | steady everyday           | heavy / concentrated          |
| 2 | Behavioral   | How they spend                | budget tier          | mainstream                | premium / luxury              |
| 3 | Behavioral   | What they don't spend on      | no gaps              | one notable gap           | major off-us leakage          |
| 4 | Life events  | New chapter fingerprints      | none                 | early signal              | confirmed event               |
| 5 | Life events  | Pattern breaks                | stable               | minor shift               | sharp inflection              |
| 6 | Life events  | Horizon events                | none visible         | forming                   | imminent                      |
| 7 | Demographics | Who they are                  | low-income band      | mid                       | high-income band              |
| 8 | Demographics | Where they live               | low-cost geo         | average                   | high-cost geo                 |
| 9 | Demographics | Profile with us               | single product / new | multi-product             | primary / deep                |
| 10| Financial    | Posture                       | tight / juggler      | balanced                  | accumulator / idle cash       |
| 11| Financial    | What they're reaching for     | no goal in motion    | goal forming              | goal imminent                 |
| 12| Financial    | Wallet share with us          | most spend off-us    | mixed                     | almost all on-us              |
| 13| Risk         | Capacity                      | over-extended        | room                      | wide eligibility              |
| 14| Risk         | Behavior flags                | recent stress / NSF  | one minor flag            | clean                         |
| 15| Risk         | Compliance & exposure         | full-stop flag       | watch                     | clear                         |

(Risk levels read inverted — LOW on 13/14/15 is the bad direction and gates the send.)

## 2. Variation math (shown to the model and in the UI)

Theoretical profile space across 15 ternary cards is **3¹⁵ = 14,348,907** distinct customer states. The engine never enumerates that; it collapses the profile into a finite **messaging variation bank** the playbook can justify:

```
plays    P  = product.plays whose trigger is satisfied by this profile      (1..N)
angles   A  = qualifying angles from cards {4,5,6} / {11} / {1}             (1..3)
anchors  K  = distinct offer_anchors derivable from cards 1, 3, 11, 12      (1..4)
voice    V  = card 2 tier  ×  card 9 tenure  →  2 registers                 (1..2)
proof    R  = card 12 HIGH/MED/LOW × product.proof_rules                    (1..2)

total_variations  =  P × A × K × V × R     (after Risk Gate + Spend Floor)
profile_space     =  3^15  (shown as a "1 of 14.3M states" context line)
```

A typical product yields **12–48 valid messaging variations** for a given profile; the UI surfaces 5 chosen for diversity.

## 3. New edge function: `generate-campaign-offers`

`supabase/functions/generate-campaign-offers/index.ts`

Input (POST JSON):
```jsonc
{
  productId: string,
  product: { id, name, category, plays[], floor, proof_rules, disclosures, tone_notes },
  profile: {
    behavioral:    [{card:1,level:"HIGH",note:"..."}, {card:2,...}, {card:3,...}],
    life_events:   [{card:4,...}, {card:5,...}, {card:6,...}],
    demographics:  [{card:7,...}, {card:8,...}, {card:9,...}],
    financial:     [{card:10,...},{card:11,...},{card:12,...}],
    risk:          [{card:13,...},{card:14,...},{card:15,...}]
  }
}
```

Backend: Lovable AI Gateway, `google/gemini-3-flash-preview`, structured `Output.object` schema (no free-form parsing).

## 4. System prompt (the LLM design)

We adapt the user-supplied Campaign Engine spec verbatim, with three additions:

1. Each card carries an explicit `level: HIGH|MED|LOW` and the playbook reads levels, not free text.
2. **Every variation's `cards_used` must cite ≥1 card from each of the 5 families** that influenced the choice.
3. Output is a **bank** (`total_variations`) + **5 diverse exemplars**, not a single send.

### Prompt body (final shape)

```
SYSTEM
You are the Campaign Engine for a retail bank. You receive ONE selected product and
ONE enriched profile of 15 dimension cards across 5 families:
  BEHAVIORAL 1–3 · LIFE EVENTS 4–6 · DEMOGRAPHICS 7–9 · FINANCIAL 10–12 · RISK 13–15.

Every card arrives with a discrete level: HIGH, MED, or LOW. You read levels — never
invent a signal, never fabricate a number, never imply surveillance of off-us accounts.

[…full 6-level playbook from the user's spec, unchanged:
   L1 Risk Gate (13,14,15)  →  L2 Spend Floor (1,3,12)  →  L3 Play (12 then 1+3)
   →  L4 Angle (4/5/6 then 11 else 1)  →  L5 Message (2,7,8,9,10 + anchor + 11)
   →  L6 Priority (1).
 Writing rules unchanged: prove with on-us, profit from off-us; offer-to-choose
 framing for inferred gaps; subject ≤9w, body ≤60w, cta ≤5w; honor product.disclosures.]

VARIATION CONTRACT
Compute and return:
  profile_space    = 14,348,907       (3^15, constant)
  total_variations = P × A × K × V × R after L1/L2 pruning
  variation_space  = {plays_qualified, angles_qualified, anchors_available,
                      voice_registers, proof_modes}

Then surface 5 examples chosen for diversity:
  • span all 3 angles when supported (one BEHAVIORAL, one LIFE_EVENT, one FINANCIAL)
  • include ≥2 distinct plays when ≥2 plays qualify
  • include ≥2 distinct anchors
  • each example.cards_used MUST cite ≥1 card from EACH family —
    at minimum one of {1,2,3}, one of {4,5,6}, one of {7,8,9},
    one of {10,11,12}, one of {13,14,15}.
  • rank by priority desc.

OUTPUT
Strict JSON per schema. No prose, no markdown, no backticks.
```

### Output schema (strict)

```jsonc
{
  "decision": "SEND" | "SUPPRESS" | "TRIM",
  "profile_space": 14348907,
  "total_variations": number,
  "variation_space": {
    "plays_qualified":   string[],
    "angles_qualified":  ("BEHAVIORAL"|"LIFE_EVENT"|"FINANCIAL")[],
    "anchors_available": string[],
    "voice_registers":   string[],
    "proof_modes":       string[]
  },
  "examples": [                          // exactly 5 when SEND, else []
    {
      "play": string,
      "angle": "BEHAVIORAL" | "LIFE_EVENT" | "FINANCIAL",
      "offer_anchor": string,
      "subject": string,                 // ≤ 9 words
      "body": string,                    // ≤ 60 words
      "cta": string,                     // ≤ 5 words
      "proof": string | null,
      "priority": number,                // 0.0–1.0
      "why": string,                     // one sentence
      "cards_used": number[],            // ≥1 from each family
      "levels_read": { "1":"HIGH", "5":"MED", "8":"LOW", … }
    }
  ],
  "suppress_reason": string | null
}
```

## 5. Frontend wiring (`MessagePreviewsSection.tsx`)

- Replace `getProductMessageVariants(...)` with a `useQuery` that calls the edge function with the selected product + a mock 15-card profile.
- Header line: **`{total_variations.toLocaleString()} valid variations · 5 shown`** with a small subline `1 of 14.3M profile states`.
- Grid expands from 3 → **5 cards** (`lg:grid-cols-5`, collapses to 2 then 1).
- Each card shows: angle pill, play badge, subject, body, CTA, "Why this angle" line, and a footer chip listing `cards_used` like `B1·L5·D8·F11·R14` colour-coded by family so the demo audience sees the five-family touch at a glance.
- Existing staggered reveal + skeleton kept; extended to 5 slots.
- SUPPRESS / TRIM returns render a single full-width explanation card instead of the grid.

## 6. Mock profile source

No new data files. The 15-card profile with HIGH/MED/LOW levels is assembled per-product from existing mocks:

- Behavioral 1–3 ← `productAutomatedFlows` signals + `lifestyleAssetSignals.detectionRate`
- Life events 4–6 ← life-event triggers already in the product catalog
- Demographics 7–9 ← `sampleDemographics` / persona generator outputs
- Financial 10–12 ← wallet-share / posture fields on the persona
- Risk 13–15 ← deterministic mock (defaults to HIGH/clear) so SUPPRESS only fires when explicitly demoed

A new helper `buildProfileForProduct(productId)` in `productCatalogExtras.ts` does the assembly and the HIGH/MED/LOW bucketing.

## 7. Files touched

- **NEW** `supabase/functions/generate-campaign-offers/index.ts` — Lovable AI Gateway, structured `Output.object` schema, system prompt above.
- **EDIT** `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — swap static variants for the edge function, render 5 cards + variation/profile-space counts + suppression states.
- **EDIT** `src/lib/productCatalogExtras.ts` — keep `getProductMessageVariants` as a synchronous fallback; export `buildProfileForProduct(productId)` returning the 15-card profile with HIGH/MED/LOW.

## 8. Out of scope

- No DB persistence (pure preview).
- No new tables, no auth changes.
- Strict light theme preserved; no `dark:` utilities introduced.
