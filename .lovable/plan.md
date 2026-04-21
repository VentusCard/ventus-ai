

## Sarah's CSV — 3 Gambling + 3 Financial Vulnerability transactions, woven into the timeline (clean renumbering)

Replace the single `txn_011` (DIGITAL ENT SVCS) and add 5 more rows so Sarah ends up with **3 gambling** + **3 financial vulnerability** transactions, woven chronologically across her 18-month timeline. Renumber every row after each insertion so IDs stay sequential — no `txn_011a` style suffixes. Final CSV grows from 50 → 55 rows.

Adult Entertainment row (`PRIVATE MEDIA GRP LLC`) stays untouched.

## Edit (single file: `src/lib/sampleData.ts`, lines ~220–271)

### The 6 risk rows (3 gambling + 3 distress), in chronological order

| New ID | merchant_name | description | mcc | amount | date | source | Subcategory |
|---|---|---|---|---|---|---|---|
| txn_011 | `DRAFTKINGS SPORTSBOOK` | Sportsbook deposit | 7995 | $250 | 2025-01-04 | Premium Card | **Sports Betting** (gambling 1) |
| txn_020 | `EARNIN ACTIVEHOURS` | Early wage access advance | 6051 | $100 | 2025-03-05 | Cashback Card | **Pawn Shops & Short-Term Credit** (distress 1) |
| txn_026 | `BELLAGIO CASINO LV` | Casino floor charge | 7995 | $480 | 2025-04-19 | Premium Card (zip 89109) | **Casino & Table Games** (gambling 2) |
| txn_032 | `WESTERN UNION*MTO 8821` | Money transfer fee | 4829 | $400 | 2025-05-28 | Cashback Card | **Check Cashing & Money Services** (distress 2 — *obfuscated*) |
| txn_044 | `STAKE.COM*PROC LV` | Online wager processor | 6051 | $185 | 2025-09-13 | Premium Card | **High-Risk / Offshore Gambling** (gambling 3 — *obfuscated*) |
| txn_049 | `PORTFOLIO RECOVERY ASSOC` | Past-due account payment | 6012 | $325 | 2025-10-25 | Checks | **Debt Collection & Debt Relief** (distress 3) |

### Renumbering map (50 → 55 rows, all dates already chronological)

```text
Old txn_011 (DIGITAL ENT SVCS) → REMOVED
Old txn_012..019 (Costco → Spotify)        →  txn_012..019 unchanged
NEW DRAFTKINGS                              →  txn_011 (Jan 4 2025)
                                              [shift later rows down by net +1 from this point]
Old txn_020..025 (intl proc → CVS)         →  txn_021..026 (becomes 022..027 after EARNIN insert)
NEW EARNIN ACTIVEHOURS                      →  txn_020 (Mar 5 2025)
Old txn_026..031 (Stanford → Hawaiian Air)  →  shifted +2
NEW BELLAGIO CASINO LV                      →  txn_026 (Apr 19 2025)
Old txn_032..037 (Grand Wailea → Lululemon) →  shifted +3
NEW WESTERN UNION*MTO 8821                  →  txn_032 (May 28 2025)
Old txn_038..043 (SF Tennis → Palisades)    →  shifted +4
NEW STAKE.COM*PROC LV                       →  txn_044 (Sep 13 2025) — sits between summer league & Chewy
Old txn_044..050 (Chewy → Hilton Waikoloa)  →  shifted +5
NEW PORTFOLIO RECOVERY ASSOC                →  txn_049 (Oct 25 2025) — between Petco & Zillow mortgage
Final row: HILTON WAIKOLOA VILLAGE          →  txn_055 (Jul 6 2026)
```

After renumbering: a single sequential `txn_001 … txn_055` block, fully chronological, with the 6 new rows organically interleaved among groceries, tennis, Chewy/Petco, ski trips, college prep, and the home-purchase arc.

## Why these picks

- **Three distinct gambling subcategories** (Sports Betting / Casino / Offshore) and **three distinct distress subcategories** (EWA / Money Services / Debt Collection) — surfaces the full new taxonomies in the demo, not three of the same flavor.
- **Woven, not clustered**: rows sprinkled Jan → Oct 2025, sandwiched between Sarah's existing tennis/Chewy/Petco/admissions cadence — reads like real life.
- **Obfuscated descriptors are realistic**: `STAKE.COM*PROC LV` and `WESTERN UNION*MTO 8821` mirror how processor-aggregated descriptors appear on actual bank statements (merchant + asterisk + reference suffix) — opaque to a human, but still contain the literal keyword the deterministic detector matches on.
- **Storyline tension**: EWA hit lands the same month as Kaplan SAT prep (Mar 8); debt collection lands two weeks after admissions consulting (Oct 5). Believable "parent stretching to fund college prep" narrative the FVI panel can build on.

## Out of scope

- No edge-function changes — gambling + distress detectors already shipped.
- `PRIVATE MEDIA GRP LLC` Adult Entertainment row stays.
- No client-side rendering changes.

## Verification

- Reload `/demo` → Sarah Mitchell → six new risk pills render: 3 gambling subcategories + 3 distress subcategories.
- Offshore (STAKE.COM) and Debt Collection (Portfolio Recovery) each fire **severity high** on single hit.
- Adult Entertainment pill from `PRIVATE MEDIA GRP LLC` still renders unchanged.
- Engine transaction list shows 55 rows numbered `txn_001 … txn_055` in chronological order, with the 6 new rows interleaved (not stacked together).
- Edge function logs show weighted scores: gambling ≈ 14.8 (high); distress ≈ 22.3 (high).

