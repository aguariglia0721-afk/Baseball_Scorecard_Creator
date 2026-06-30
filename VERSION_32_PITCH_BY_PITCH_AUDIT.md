# Version 32 Pitch-by-Pitch Operational Audit

**Audit date:** June 25, 2026  
**Application version:** 32.0.0 — version number retained  
**Browser:** Chromium, headless operational testing  
**Result:** PASS after corrections described below

## Scope

Every control added or modified during the Version 32 work session was exercised in live browser operation, not only checked for code wiring. The audit compared the recorded pitches and events with live count, inning/half, outs, bases, batting order, team totals, batter statistics, pitcher statistics, challenge availability, autosave recovery, and exported files.

## Game-Based Scenarios

1. **Milwaukee Brewers at Cincinnati Reds — June 24, 2026, first inning**
   - Replayed 29 pitches and nine completed plate appearances.
   - Outcomes entered: HBP, fielder's choice, swinging strikeout, single, looking strikeout, groundout, and walk.
   - Verified the 0–0 score, one Milwaukee hit, no Cincinnati hits, empty bases, no outs, and the top of the second inning after the replay.

2. **Baltimore Orioles at Los Angeles Angels — June 24, 2026 ABS scenario**
   - Reproduced a full-count player-challenge situation.
   - Tested a batter challenge that reversed called strike three to ball four.
   - Verified pitch correction, count recalculation, strikeout removal, walk creation, challenge retention, and edit/delete restoration.

3. **Kansas City Royals at Tampa Bay Rays — June 24, 2026 running-game scenarios**
   - Reproduced single- and multiple-steal sequences.
   - Exercised stolen base, caught stealing, pickoff attempts and all outcomes, wild pitch, passed ball, defensive indifference, and runner-event editing/undo.

## Controls and Results

### Pitch-by-Pitch Scoring

- Ball: PASS
- Swinging strike: PASS
- Called strike: PASS
- Foul: PASS
- In play: PASS
- Automatic walk and strikeout creation: PASS
- Undo Pitch and Reset Count interactions: PASS through inherited and operational regression suites
- Pitcher, batter, pitch count, pitch log, and half-inning transitions: PASS

### ABS Challenges

- Batter, pitcher, and catcher initiators: PASS
- Batter mapped to batting team/called strike: PASS
- Pitcher and catcher mapped to fielding team/called ball: PASS
- Overturned and upheld results: PASS
- Successful challenge retained: PASS
- Unsuccessful challenge consumed: PASS
- Extra-inning grant: PASS
- Linked-pitch filtering: PASS
- Edit and delete: PASS
- Autosave restoration: PASS
- Terminal ball-four and strike-three reversal: PASS
- Third-out reversal and half-inning restoration: PASS

### Manager Replay

- Record, save, edit, and delete: PASS
- Overturned ruling retains challenge: PASS
- Confirmed or stands ruling consumes challenge: PASS
- Regular-season and postseason/All-Star allotments: PASS
- Separation from ABS challenge pool: PASS

### Runner Events

- Stolen base: PASS
- Caught stealing: PASS
- Pickoff attempt — safe: PASS
- Pickoff attempt — picked off: PASS
- Pickoff attempt — runner advanced: PASS
- Pickoff attempt — error/overthrow: PASS
- Pickoff attempt — balk/disengagement violation: PASS
- Wild pitch: PASS
- Passed ball: PASS
- Defensive indifference: PASS
- Third strike not caught — wild pitch: PASS
- Third strike not caught — passed ball: PASS
- Edit, delete, and Undo Last Play: PASS
- Current batter and count preserved: PASS
- Correct batting-team/fielding-team attribution: PASS

### Result-Only Plate-Appearance Boxes

- Run text omitted: PASS
- RBI text omitted: PASS
- Dedicated R and RBI columns remain accurate: PASS
- `HR`, `K WP`, `K PB`, `SB2`, `CS3`, errors, and other essential play notation preserved: PASS

### Exports and Persistence

- Continuous autosave and restore: PASS
- Saved-game file: PASS
- Pitch-log CSV: PASS
- Excel scorecard: PASS
- PDF scorecard: PASS
- Pitcher IP, H, R, ER, BB, K, HP, and WP columns: PASS
- Runner-event notes and challenge summaries: PASS

## Defects Found and Corrected

1. **An overturned ABS challenge was logged but did not alter the linked pitch or live count.**
   - Corrected the pitch type and recalculated the complete pitch session.

2. **A terminal ABS reversal could leave the original automatic walk or strikeout in place.**
   - The app now removes the invalid terminal result and creates the correct replacement result. It also restores the proper inning, half, outs, bases, and batting order when strike three had ended the half-inning.

3. **Deleting an upheld ABS challenge on ball four could restore a live 4–0 count while the completed walk remained recorded.**
   - Rollback now recognizes completed plate appearances and does not resurrect a terminal count.

4. **A third strike not caught displayed `K+ WP` or `K+ PB`.**
   - Result-only notation is now `K WP` or `K PB`.

## Permanent Regression Coverage

A new automated test, `tests/version32-pitch-by-pitch-audit.test.js`, was added to protect:

- original-call tracking on linked ABS pitches;
- linked-pitch eligibility after inning/half advancement;
- called-strike/called-ball reversal;
- automatic BB/KL rebuilding;
- completed-plate-appearance rollback protection;
- `K WP` and `K PB` notation; and
- result-only plate-appearance notation.

## Final Validation

- 43 Node regression test files: PASS
- JavaScript syntax validation: PASS
- 11 focused Chromium browser scenarios: PASS
- ZIP integrity validation: PASS
- Known unresolved defects from this audit: **None**

The application remains **Version 32**.
