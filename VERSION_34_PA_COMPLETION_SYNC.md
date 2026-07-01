# Version 34 Revision 6 — Plate-Appearance Synchronization

## Corrected behavior

- A live count cannot accept another pitch after the ball is marked **In Play**.
- A four-ball walk and third-strike result complete automatically and immediately update every lower scorecard/stat field.
- A home run completes immediately with empty or occupied bases.
- A batted-ball result that needs runner review stays pending until **Save & Complete Batter** is selected.
- The pending dialog explicitly explains that the scorecard will not populate until the final save.
- Completing the batter synchronizes the Plate Appearances grid, Current Scorecard, AB/R/H/RBI, line score, pitcher tracking, play log, count reset, next batter, and autosave.

## Device verification

The same five-play test sequence passed on:

- iPhone 15 Pro — 390 × 844
- iPad Pro 11 — 834 × 1194
- Android Pixel 7 — 412 × 915
- Desktop — 1440 × 1000

The sequence was BB, K, HR with a runner aboard, a direct single, and a single requiring runner-detail confirmation. Each device finished with five completed plays, a 2–0 score, and pitcher totals of 10 pitches, 6 strikes, 4 balls, 5 batters faced, 3 hits, 1 walk, and 1 strikeout.
