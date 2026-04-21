

## Change

Mirror what we did for Adult Entertainment: split the single **"Gambling"** label into the six subcategories you listed (plus a generic fallback), with merchant-keyword detection across any MCC and severity that scales with risk weight × frequency × volume.

## Subcategory taxonomy & detection (most-specific wins)

Order matters — the detector checks high-risk buckets first so a transaction like `STAKE.COM` doesn't fall back to generic Gambling.

| Label | Risk weight | Examples (merchant keyword surface) |
|---|---|---|
| **High-Risk / Offshore Gambling** | 5 (highest) | Bovada, BetOnline, MyBookie, Sportsbetting.ag, BetUS, 5Dimes, Heritage Sports, Stake.com, Roobet, Cloudbet, Nitrogen Sports, Curaçao Gaming, "OFFSHORE GAMING", crypto sportsbooks |
| **Sports Betting** | 3 | DraftKings Sportsbook, FanDuel Sportsbook, BetMGM, Caesars Sportsbook, PointsBet, BetRivers, WynnBet, Barstool, Fanatics Bet, ESPN Bet, Hard Rock Bet, PrizePicks, Underdog Fantasy |
| **Casino & Table Games** | 3 | MGM/Bellagio/Aria/Mandalay Bay/Park MGM, Caesars Palace/Harrah's/Horseshoe, Wynn/Encore, Venetian/Palazzo, Foxwoods, Mohegan Sun, Borgata, Parx, Rivers, Pechanga; regulated online: BetMGM Casino, FanDuel Casino, DraftKings Casino, Golden Nugget Casino |
| **Horse Racing & Pari-mutuel** | 2 | TVG, TwinSpires, Xpressbet, NYRA Bets, AmWager, Churchill Downs, Belmont Park, Saratoga, Santa Anita, Del Mar, Pimlico, "OFF TRACK BETTING", "PARI-MUTUEL" |
| **Casual / Social Gaming** | 1 | DraftKings DFS / Fantasy, FanDuel DFS, Yahoo Fantasy, Sleeper, Chumba Casino, Stake.us, LuckyLand Slots, Funzpoints, Global Poker, Pulsz, High 5 Casino, Zynga Poker, WSOP App, PokerStars Play |
| **Lottery & Raffles** | 1 (lowest) | Powerball, Mega Millions, scratch off / scratchers, state lottery, Jackpocket, "RAFFLE", "CHARITY RAFFLE", "50/50 RAFFLE" |
| **Gambling** (generic fallback) | 2 | MCC 7995 with unrecognized merchant, or merchant containing CASINO/POKER/SLOTS/WAGER/BOOKIE without matching a specific bucket |

**Disambiguation rules baked into the detector:**
- `DRAFTKINGS` / `FANDUEL` alone are ambiguous → must include `SPORTSBOOK`/`SB` for Sports Betting, `CASINO` for Casino, or `DFS`/`FANTASY`/`DAILY` for Casual. A bare `DRAFTKINGS` falls through to generic Gambling.
- `MGM` / `CAESARS` strings need property/casino qualifiers — a hotel-only stay (`MGM HOTEL` MCC 7011) shouldn't be flagged. Detector requires the casino-context keywords listed above OR MCC 7995/7993.
- `STAKE.COM` → Offshore. `STAKE.US` → Casual / Social (sweepstakes). Order of checks handles this.

## Severity scaling (per customer, applied per flag)

```
weightedScore = Σ (riskWeight × txCount per subcategory) + (totalSpend / 500)

severity:
  high   if weightedScore ≥ 12  OR  any single offshore hit  OR  totalSpend ≥ $2,000
  medium if weightedScore ≥ 4   OR  ≥ 2 sports/casino hits   OR  totalSpend ≥ $500
  low    otherwise (e.g. one Powerball ticket, one Chumba deposit)
```

- One Powerball ticket → **low** Lottery flag (entertainment, weak signal alone).
- 4 DraftKings Sportsbook deposits totaling $1.2k → **medium** Sports Betting flag.
- Any single Bovada hit → **high** Offshore flag (strong FVI signal as you called out).
- Mixed pattern (sports + casino + offshore) upgrades all flags together via weightedScore.

## Reason strings

Each flag's `reason` references the bucket and matched keyword, e.g.:
- `"Sports Betting — regulated sportsbook deposit. Matched 'DRAFTKINGS SPORTSBOOK'. 3 of 5 gambling transactions ($1,250 total) sit in this subcategory."`
- `"High-Risk / Offshore Gambling — offshore / unregulated sportsbook. Matched 'BOVADA'. Strong financial-distress / AML correlate."`
- `"Lottery & Raffles — scratch ticket / state lottery. Matched 'POWERBALL'. Low-stakes; weak signal in isolation."`

## Files Changed

**`supabase/functions/detect-risk-transactions/index.ts`**
1. Add the seven keyword arrays + `detectGambling(merchant, mcc)` resolver, next to the existing adult-entertainment detector.
2. Replace the gambling branch in `deterministicFlags`: pre-compute `gamblingHits` across ALL transactions (any MCC), aggregate per-subcategory counts/amounts, compute `weightedScore`, emit one flag per matched transaction with the specific `category_label`. Drop the old single-label MCC-7995 path.
3. System prompt: replace the "Gambling" mention in the vice paragraph with the full subcategory list; update `category_label` examples to include all six new labels; add *"Always pick the most specific gambling subcategory; only fall back to generic 'Gambling' when no merchant context disambiguates."*
4. Extend `LABEL_ALIASES` so model-emitted variants collapse to canonical labels (`"sports betting"`, `"offshore gambling"`, `"crypto sportsbook"`, `"casino"`, `"table games"`, `"horse racing"`, `"pari-mutuel"`, `"lottery"`, `"raffle"`, `"scratch ticket"`, `"daily fantasy"`, `"dfs"`, `"sweepstakes casino"`, `"social poker"`).

**`supabase/functions/generate-product-actions/index.ts`** + **`supabase/functions/generate-product-cards/index.ts`** — extend the risk-card label lists in both prompts to include the new gambling subcategories, so downstream product cards show e.g. "Sports Betting" or "High-Risk / Offshore Gambling" instead of generic "Gambling" when applicable. Tone guidance unchanged.

## Out of scope (intentionally)

- FVI dashboard — separate feature with its own gambling categories; leave untouched.
- No CSV / sample-data changes.
- No client-side rendering changes — risk panels render `category_label` verbatim.

## Verification

- /demo → any customer with MCC 7995 transactions → flags now show specific subcategory.
- Insert `BOVADA LV` row → flag fires as **High-Risk / Offshore Gambling**, severity **high** even on a single hit.
- Insert `POWERBALL TICKET` row → flag fires as **Lottery & Raffles**, severity **low**.
- Insert `DRAFTKINGS SPORTSBOOK` + `DRAFTKINGS DFS` rows → two distinct flags (Sports Betting and Casual / Social Gaming).
- Insert `MGM HOTEL LV` MCC 7011 → NOT flagged (hotel context, no casino/MCC qualifier).
- Edge function logs: no duplicate flags per transaction; `weightedScore` math visible in console.

