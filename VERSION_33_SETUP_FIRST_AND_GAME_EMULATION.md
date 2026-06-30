# Version 33.0.2 — Setup-First Launch and Game Emulation Audit

## Startup behavior

- Every fresh app launch now opens **Step 1 — Setup**.
- Existing browser autosave data is still restored before the Setup screen is shown.
- Teams, lineups, pitchers, pitches, plays, inning state, score, notes, challenges, and substitutions remain available.
- The user can move directly to Live Scoring and continue the restored game.
- Opening a saved game file remains an intentional action and continues to open the scoring workflow.

## Issues identified and corrected during emulation

1. **Home-run field location notation**
   - A home-run field location was selected and saved, but a legacy notation shortcut displayed only `HR`.
   - This behavior has been superseded by Version 33.0.2: home runs now record immediately as `HR` and do not open the field-location dialog.

2. **Current Scorecard mobile width**
   - The live line-score table could widen the iPhone page when Current Scorecard was opened.
   - The line score is now contained inside the same internal horizontal scroller used by the scorecard tables.

## Verification

- JavaScript syntax validation passed.
- All **51 automated regression test files** passed in the current Version 33.0.2 build.
- Full game emulation passed in Chromium at:
  - iPhone 15 Pro portrait — 390 × 844
  - iPad Pro 11 portrait — 834 × 1194
  - Desktop — 1440 × 1000
- Each emulation covered setup, lineups, pitchers, pitches, batted-ball field locations, hits, outs, home run, walk, double play, inning progression, undo/rebuild, Current Scorecard, summary, autosave, second launch, Setup-first recovery, and resuming Live Scoring.

See `VERSION_33_GAME_EMULATION_REPORT.json` for detailed machine-readable results.
