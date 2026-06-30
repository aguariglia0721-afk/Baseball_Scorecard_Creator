# Version 33 — Follow-the-Ball Scoring

Internal maintenance build: **33.0.2**

## MLB scoring basis

This update follows the 2026 Official Baseball Rules for fielding credit:

- Rule 9.09 defines the fielder who completes an out as receiving the putout.
- Rule 9.10 credits assists to fielders whose throws or effective deflections contribute to a putout.
- Rule 9.11 credits double- and triple-play participation to every fielder who earns a putout or assist during the continuous play.

Official source: Major League Baseball, *2026 Official Baseball Rules*, Rules 9.09–9.11.

## User workflow

- **Home Run:** Records immediately as `HR`; no field-location dialog opens.
- **Single-fielder play:** Tap one position and choose **Use This Fielder**, such as `FO7`.
- **Follow the ball:** Tap every fielder in order, then choose **Use Ball Path**.
  - Shortstop to first: `GO6-3`
  - Second baseman to first baseman to pitcher double play: `DP4-3-1`
  - First baseman to shortstop and back to first: `DP3-6-3`
- **Repeated fielders are allowed** because a fielder may participate more than once in the physical path even though official assist credit is limited by the scoring rules.
- **Undo Last** removes the most recent position from the path.
- **Clear** starts the path over.

## Persistence and exports

The complete defensive sequence is retained in continuous autosave, saved-game files, play editing, the play log, scorecard notation, Excel output, PDF output, and undo/rebuild operations. Existing Version 33 games that stored only one field position remain compatible.

## Verification

- 51 automated regression test files passed.
- JavaScript syntax validation passed.
- Full game emulation passed at iPhone 15 Pro, iPad Pro 11, and desktop viewports.
- Verified home-run bypass, `GO6-3`, `DP4-3-1`, repeated-field sequence `3-6-3`, undo, exports, autosave recovery, and setup-first relaunch behavior.
