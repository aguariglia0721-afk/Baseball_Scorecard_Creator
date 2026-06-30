# Version 32 Mobile App Audit

**Build:** Guariglia Baseball Scorecard Builder Version 32  
**Status:** Passed  
**Version number:** Remains Version 32

## Scope

The complete app was reviewed as a touch-first mobile application rather than only as a reduced desktop layout. The audit covered all seven primary sections, all eight dialogs, expandable panels, generated roster fields, and live-scoring controls.

Static interface inventory:

- 57 input fields
- 31 select fields
- 8 text areas
- 82 static buttons, plus dynamically generated buttons
- 8 dialogs
- 5 expandable detail panels
- 288 identified interface elements before generated lineup, pitcher, scorecard, and event controls are added

Tested touch viewports:

- 320 × 568 — compact phone / iPhone SE class
- 360 × 800 — narrow modern phone
- 390 × 844 — standard iPhone class
- 430 × 932 — large iPhone class
- 844 × 390 — phone landscape

## Corrections Made

### Mobile fields and touch targets

- All visible text, number, date, select, and text-area controls now use at least a 16-pixel font on touch devices, preventing unwanted iPhone focus zoom.
- Interactive scoring, dialog, event-log, challenge, quick-result, substitution, and navigation controls now provide a minimum 44-pixel touch height.
- Remaining small controls inside the play-error, interference, runner-event, replay, and ABS interfaces were enlarged.

### Sticky mobile controls

- Page-level horizontal containment now uses `overflow-x: clip` instead of `overflow-x: hidden`, preserving sticky positioning on mobile browsers.
- The autosave status, primary section navigation, and Plate Appearances/Current Scorecard switch now form a non-overlapping sticky stack below the iPhone safe area.
- The scoring-view switch remains accessible while moving through a long live scorebook.

### Plate Appearances / Current Scorecard switch

- Both buttons were verified by touch in each direction.
- The active view is reflected visually and through `aria-selected` and `aria-pressed` states.
- Current Scorecard tables retain horizontal swipe scrolling on narrow screens.
- The player-name column remains pinned while the inning columns scroll horizontally.
- Mobile guidance now explicitly tells the user to swipe the scorecard tables left or right.

### End-of-inning behavior and lines

- Three recorded outs correctly change the live state from the top to the bottom half-inning.
- The end-of-half-inning divider appears in both Plate Appearances and Current Scorecard views.
- The divider retains its strong bottom line at every tested mobile width.
- The Change Half-Inning correction control was exercised and correctly advanced the game state.

### Dialog and field behavior

The audit opened, populated, and closed or saved the following mobile workflows:

- Game setup and all editable game-information fields
- Both nine-player lineups and bench fields
- Starting pitchers and custom relief-pitcher entry
- Pitch controls, Undo Pitch, Reset Count, and Quick Results show/hide
- Complete Play, defensive error, and interference panels
- Runner events, stolen base, and caught stealing
- Manager replay and ABS challenge entry
- Substitution entry
- Pitch Tracking
- Summary and Game Notes
- Settings and Blank PDF choices

## Functional Results

- No page-level horizontal overflow at any tested viewport
- No visible field or control extended outside the phone viewport unless intentionally inside a horizontal table scroller
- No audited touch control remained below the target size
- No audited form field remained below 16-pixel text on a touch device
- Plate Appearances/Current Scorecard switch: passed
- Horizontal scorecard swipe: passed
- Sticky scorecard player column: passed
- End-of-inning divider in both views: passed
- Change Half-Inning control: passed
- Pitch, play, runner-event, replay, ABS, substitution, and note entry: passed
- JavaScript syntax validation: passed
- Complete automated regression suite: 44 test files passed

## Test Harness Note

The visual browser harness loads the application inline so it can operate in the restricted test environment. That creates an opaque test origin where browser `localStorage` is unavailable. Those harness-only security messages were excluded from the visual report. Version 32's inherited autosave rotation, recovery, roster persistence, and runtime tests all continue to pass separately.

The machine-readable results are stored in `VERSION_32_MOBILE_APP_AUDIT_REPORT.json`.
