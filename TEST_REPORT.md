# Version 27.2 Validation Report

- Complete inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Active-roster bullpen loading: PASS
- Starter-first Add Pitcher workflow: PASS
- Alphabetical unused-pitcher dropdown ordering: PASS
- PDF/Excel actual pitcher appearance order: PASS
- Unused roster pitchers excluded from printed pitching rows: PASS
- Full pitcher data preserved in export: PASS
- Pregame starter-only export fallback: PASS
- Legacy saved-game pitcher matching: PASS
- Quick Codes shared-font validation: PASS
- Strikeout-looking mirrored standard K validation: PASS
- Unicode reverse-K fallback excluded: PASS
- Version 27.2 cache refresh for corrected Quick Code assets: PASS

## Version 27.2 Complete Button Audit — June 24, 2026

- PASS: 64 static buttons inventoried.
- PASS: 89 initial runtime buttons verified.
- PASS: all direct, delegated, submit, and native-dialog handlers verified.
- PASS: 70 direct browser interaction scenarios.
- PASS: duplicate save, Excel, and PDF controls.
- PASS: dynamic Remove Error and Edit Challenge controls.
- PASS: no broken controls or JavaScript runtime errors found.
- Added `tests/version27-2-comprehensive-button-audit.test.js` to the permanent test suite.

## Version 28 Broadcast-Style Live Game Center — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Score, inning, outs, base diamond, and compact count consolidated inside Pitch-by-Pitch Scoring: PASS
- Dynamic MLB/manual team abbreviations: PASS
- Current batter and pitcher data: PASS
- On-deck and in-the-hole batting-order logic: PASS
- Desktop standalone visual render: PASS
- iPhone standalone visual render: PASS
- Version 27.2 autosave migration compatibility: PASS
- ZIP and duplicate-ID validation: PASS

## Version 29 Unified Live Scoring Center — June 25, 2026

- Full inherited automated suite: passed.
- New Version 29 structural, palette, control-order, ABS-toggle, and autosave-migration tests: passed.
- JavaScript syntax checks: passed.
- Desktop render at 1440 px: passed with no horizontal overflow.
- iPhone render at 390 px: passed with no horizontal overflow.
- Verified control order: Undo Pitch / Reset Count, then Record Error / Challenge.
- Verified Quick Result codes appear before the on-demand ABS challenge panel.

## Version 32 Manager Replay / ABS Separation — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Regular-season one-challenge starting allotment: PASS
- Postseason and All-Star two-challenge starting allotment: PASS
- Overturned manager challenge retained: PASS
- Confirmed or stands ruling consumes manager challenge: PASS
- Manager replay and ABS challenge pools remain independent: PASS
- Version 31 autosave and roster-mirror migration: PASS
- Manager replay status included in summaries, Game Notes, Excel, and PDF output: PASS
- MLB schedule game-type default selection with manual override: PASS

## Version 32 PDF Pitching Statistics Maintenance Update — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- PDF pitcher rows populate IP, H, R, ER, BB, K, and HP: PASS
- Innings-pitched baseball notation from recorded outs: PASS
- Starter and reliever appearance-order matching: PASS
- Inherited-runner responsibility across pitching changes: PASS
- Automatic extra-inning runner remains unearned: PASS
- Version 32 cache refresh for installed/browser copies: PASS
- Version number remains 32 as requested: PASS


## Version 32 Plate-Appearance RBI Display Correction — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- RBI text removed from plate-appearance scoring boxes: PASS
- Live Plate Appearances view uses compact outcome notation without RBI repetition: PASS
- Current Scorecard preview and PDF inning boxes use the same corrected notation: PASS
- Excel inning cells use the same corrected notation: PASS
- RBI play values, calculations, autosave data, and editing controls remain intact: PASS
- Dedicated on-screen, Excel, and PDF RBI columns remain populated: PASS
- Home-run notation remains `HR`: PASS
- Version number remains 32 as requested: PASS
## Version 32 ABS Batter-Initiator Correction — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Batter, pitcher, and catcher all remain visibly selectable: PASS
- Batter automatically maps to the batting team: PASS
- Pitcher and catcher automatically map to the fielding team: PASS
- Batter challenges automatically record a called-strike challenge: PASS
- Pitcher/catcher challenges automatically record a called-ball challenge: PASS
- Linked pitch filtering matches the selected initiator: PASS
- Immediate, player-only challenge rule guidance is visible: PASS
- ABS availability, success retention, unsuccessful loss, and extra-inning grant behavior preserved: PASS
- Version 32 cache refresh for installed/browser copies: PASS
- Version number remains 32 as requested: PASS

## Version 32 Runner Events and WP Pitching Column — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Stolen-base and caught-stealing recording: PASS
- Pickoff-attempt safe, picked-off, advancement, error/overthrow, and balk outcomes: PASS
- Wild-pitch and passed-ball recording: PASS
- Defensive-indifference recording without stolen-base credit: PASS
- Batter and pitch count remain unchanged after a runner event: PASS
- Runner destinations, runs, and outs rebuild correctly after edit/delete/undo: PASS
- Batting-team attribution for SB, CS, and DI: PASS
- Fielding-team attribution for pickoff attempts, pickoffs, WP, and PB: PASS
- Uncaught-third-strike WP/PB classification: PASS
- Pitcher WP, pickoff-attempt, and pickoff totals: PASS
- Passed-ball earned-run handling in the event path: PASS
- PDF and Excel WP column immediately after HP and before Game Notes: PASS
- Autosave, saved-game, summary, Game Notes, and export retention: PASS
- Version number remains 32 as requested: PASS


## Version 32 Plate-Appearance Result-Only Display — June 25, 2026

- Full inherited automated test suite: PASS
- JavaScript syntax validation: PASS
- Run totals removed from all plate-appearance and scorecard inning boxes: PASS
- RBI totals remain removed from those boxes: PASS
- Outcome, error, uncaught-third-strike, and runner-event notation preserved: PASS
- Dedicated R and RBI columns remain calculated and populated on screen, in Excel, and in PDF: PASS
- Saved-game data and scoring calculations unchanged: PASS
- Version number remains 32 as requested: PASS

## Version 32 Pitch-by-Pitch Operational Audit — June 25, 2026

- 43-file inherited and Version 32 Node regression suite: PASS
- JavaScript syntax validation: PASS
- 11 focused Chromium browser scenarios: PASS
- Brewers at Reds first-inning replay — 29 pitches and nine plate appearances: PASS
- Orioles at Angels full-count ABS reversal scenario: PASS
- Royals at Rays stolen-base and multi-steal scenarios: PASS
- Ball, swinging strike, called strike, foul, and in-play controls: PASS
- Automatic walk and swinging/looking strikeout behavior: PASS
- ABS batter, pitcher, and catcher initiators: PASS
- ABS overturned/upheld, retention/loss, edit/delete, autosave, and extra-inning behavior: PASS
- Terminal ball-four/strike-three correction and third-out half-inning restoration: PASS
- Manager replay record/edit/delete and separate challenge pool: PASS
- SB, CS, all pickoff results, WP, PB, DI, and D3K WP/PB: PASS
- Result-only PA notation and dedicated R/RBI totals: PASS
- PDF, Excel, saved-game, and pitch-log CSV exports: PASS
- Corrected overturned-ABS pitch/count mutation: PASS
- Corrected invalid terminal BB/KL replacement: PASS
- Corrected upheld-terminal challenge deletion count restoration: PASS
- Corrected `K+ WP/PB` to `K WP/PB`: PASS
- New permanent regression test: `tests/version32-pitch-by-pitch-audit.test.js`
- Known unresolved defects from this audit: NONE
- Version number remains 32: PASS

## Version 32 Mobile Application Audit — June 25, 2026

- Complete automated regression suite (44 test files): PASS
- JavaScript syntax validation: PASS
- Mobile viewport tests at 320×568, 360×800, 390×844, 430×932, and 844×390: PASS
- All visible mobile fields remain within the viewport or an intentional table scroller: PASS
- Form-field text at least 16 px on touch devices: PASS
- Touch controls at least 44 px high: PASS
- Plate Appearances / Current Scorecard toggle in both directions: PASS
- `aria-selected` and `aria-pressed` toggle states: PASS
- Sticky autosave/navigation/view-switch stack without overlap: PASS
- Current Scorecard horizontal swipe and pinned player column: PASS
- End-of-inning divider in both scorebook views: PASS
- Change Half-Inning mobile control: PASS
- Setup, lineups, bench, pitching, live scoring, play, error, interference, runner-event, replay, ABS, substitution, Pitch Tracking, Summary, Game Notes, Settings, and Blank PDF fields: PASS
- No unresolved mobile defect from this audit: PASS
- Version remains 32 as requested: PASS

## Version 32 Excel pitch-count formatting

- Confirmed that both Pitch Log count columns use Excel-safe text values.
- Confirmed that a UTF-8 byte-order mark is included.
- Confirmed that `0-1`, `1-2`, and `2-1` remain visible as ball-strike counts rather than dates.
- Full 45-file regression suite passed.
- JavaScript syntax validation passed.

## Version 34 Revision 4 - PDF Substitution Boundary Lines - June 30, 2026

- Complete inherited and Version 34 automated regression suite: PASS
- JavaScript syntax validation: PASS
- Vertical substitution divider generated for each affected batting-order row: PASS
- First incoming-player appearance used as the chronological boundary: PASS
- Same-inning outgoing/incoming plate appearances divided inside the inning cell: PASS
- Substitute without a later plate appearance divided after the outgoing player's last recorded cell: PASS
- Multiple substitutions in one lineup position: PASS
- Existing readable substitute-name lines, clipping, ellipsizing, and ASCII `*` markers: PASS
- Two-page letter-size duplex PDF render: PASS
- PDFium visual inspection: PASS
- Poppler visual inspection: PASS
- Version remains 34: PASS

## Version 34 Revision 5 - Prior-Box Substitution Lines - June 30, 2026

- Complete inherited and Version 34 automated regression suite: PASS
- JavaScript syntax validation: PASS
- Substitution divider placed at the right edge of the prior inning box: PASS
- Same-inning outgoing/incoming appearances no longer create an internal cell divider: PASS
- Away-team defensive substitution in the bottom half advances to the next batting inning: PASS
- Multiple substitutions in one lineup position: PASS
- Existing readable substitute-name lines, clipping, ellipsizing, and ASCII `*` markers: PASS
- Two-page letter-size duplex PDF render: PASS
- Version remains 34: PASS

