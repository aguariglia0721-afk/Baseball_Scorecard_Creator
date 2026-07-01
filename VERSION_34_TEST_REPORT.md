# Version 34 Test Report

**Build:** Guariglia Baseball Scorecard Builder Version 34, Revision 6  
**Focus:** Balls/strikes-to-completed-batter synchronization, lower scorecard/stat population, four-device verification, and retention of all Revision 5 duplex PDF and substitution corrections

## Results

- Full inherited and Version 34 automated regression suite: **Passed**
- New plate-appearance synchronization regression test: **Passed**
- JavaScript syntax validation: **Passed**
- iPhone 15 Pro browser emulation: **Passed**
- iPad Pro 11 browser emulation: **Passed**
- Android Pixel 7 browser emulation: **Passed**
- Desktop 1440 browser emulation: **Passed**
- Autosave after completed plate appearances: **Passed**
- Page-level horizontal overflow check on all four profiles: **Passed**

## Verified scoring sequence

The device audit recorded the same five completed plate appearances on every profile:

1. Four-ball walk — automatic completion
2. Swinging strikeout — automatic completion
3. Home run with a runner aboard — immediate completion and two runs/RBI
4. Single with empty bases — direct completion after field location
5. Single with a runner aboard — remained pending until **Save & Complete Batter**, then populated every lower field

## Fields verified after completion

- Plate Appearance result cell
- Current Scorecard inning notation
- AB, R, H, and RBI
- Team runs, hits, and inning line
- Pitcher pitches, strikes, balls, batters faced, hits, walks, and strikeouts
- Current count reset to 0–0
- Next batter advancement
- Base state and runner advancement
- Play log and pitch log
- Autosave persistence

## Revision 5 PDF work retained

- Two-page duplex PDF format
- Unified Game Notes & Events page
- Full-width six-row pitching tables
- Readable Replay/ABS summaries
- Substitution-safe player text
- ASCII `*` fallback
- Substitution boundary at the prior inning-box edge
