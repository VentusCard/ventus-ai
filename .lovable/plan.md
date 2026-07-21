Remove all gambling-related transactions from `src/lib/sampleData.ts`.

Rows to delete (7 total):
- Line 254: `txn_024` DRAFTKINGS SPORTSBOOK
- Line 272: `txn_038` BELLAGIO CASINO LV
- Line 332: `txn_s130` DRAFTKINGS SPORTSBOOK
- Line 670: `txn_sf340` BELLAGIO CASINO LV
- Line 919: `txn_ny330` DRAFTKINGS NJ
- Line 1235: `txn_ch340` BELLAGIO CASINO LV
- Line 1253: `txn_ch341` BET365 EU PROC

No other code changes — the risk detection function will naturally show no gambling signals for these customers going forward.