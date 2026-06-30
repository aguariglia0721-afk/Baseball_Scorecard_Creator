# Version 32 — PDF Pitching Statistics Maintenance Fix

This maintenance update remains Version 32.

## Correction

The classic PDF previously printed each pitcher in the correct appearance order but left the game-stat columns blank. The PDF now writes the calculated pitching line beside each pitcher in the proper columns:

- IP — innings pitched
- H — hits allowed
- R — runs allowed
- ER — earned runs
- BB — total walks, including intentional walks
- K — strikeouts
- HP — hit batters

## Scoring behavior

- Recorded outs are converted to baseball innings notation: one out is `.1`, two outs are `.2`, and three outs are `1.0`.
- A runner who remains on base during a pitching change stays assigned to the pitcher responsible for putting that runner on base.
- Runs are therefore charged to the responsible pitcher rather than automatically to the pitcher on the mound when the run scores.
- The automatic extra-inning runner is tracked as unearned.
- Reached-on-error and catcher-interference runners are treated as unearned for the app's calculated scorecard line.

## Compatibility

- No saved-game format or version-number change was required.
- Existing Version 32 saves rebuild runner and pitcher responsibility when loaded.
- A refreshed Version 32 cache key ensures deployed and installed copies retrieve the corrected JavaScript.

## Validation

- All inherited tests pass.
- A dedicated Version 32 PDF pitching-stat test verifies column mapping, innings-pitched formatting, pitcher changes, inherited runners, strikeouts, hits, runs, and earned runs.
