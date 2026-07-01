# Guariglia Baseball Scorecard Builder

## Version 34.0.1 — Duplex PDF and Expanded Pitching Layout

Version 34 uses the approved Version 33 build as its source and preserves all scoring, field-map, autosave, saved-game, Excel, undo/rebuild, and mobile behavior.

### Version 34 Revision 6 scoring synchronization correction

- Balls and strikes now hand off cleanly to the completed plate appearance and the next batter.
- Once **In Play** is selected, every pitch button is locked until the batter is completed, preventing an extra ball, strike, foul, or second in-play pitch from corrupting the count.
- Automatic four-ball walks and third-strike outs immediately populate the lower Plate Appearances grid, Current Scorecard, batting totals, pitcher totals, play log, and autosave.
- Home runs complete immediately even when runners are aboard because every runner destination is fixed by the play.
- Results that require runner review remain clearly pending. The detail dialog now states that the batter is not complete and uses the explicit button **Save & Complete Batter**.
- After the final save, result notation, AB/R/H/RBI, runs, score, pitcher P/Str/B/BF/H/BB/K, count reset, and next-batter advancement update together.
- Verified independently on iPhone, iPad, Android, and desktop browser profiles.

### Version 34 PDF substitution boundary correction

- Every batting-order substitution now draws a strong vertical divider in the scoring grid.
- The divider marks the end of the outgoing player's scoring span and the beginning of the incoming player's future entries.
- The divider is placed at the right edge of the inning box immediately before the substitute's first scoring inning; it is never placed in the middle of a scoring box.
- Multiple substitutions in the same batting-order slot retain separate chronological boundaries when the innings permit.
- The complete substitution timeline remains available on page two.

### Version 34 PDF substitution readability correction

- Batting-order cells no longer force the starter and all substitutes onto one shrinking line.
- One substitution is displayed on a fixed second line with an ASCII `*` marker.
- Multiple substitutions use up to three clipped, fixed-size lines; if more than two substitutions occur, the latest two remain visible and the complete substitution timeline remains on page two.
- PDF text is now ellipsized and clipped at its column boundary rather than bleeding into adjacent inning columns.
- Unsupported star glyphs in Game Notes are exported as `*`, never `?`.

### Version 34 PDF changes

- The completed PDF is designed for two-sided printing. Page 1 is the scorecard; page 2 is a dedicated Game Notes and Reviews page with one unified **Game Notes & Events** area.
- Game Notes were removed from the lower-right corner of page 1. The recovered area is used to expand both pitching tables across the full page width.
- Each pitching table retains six pitcher rows and only the required columns: Pitcher / No., IP, H, R, ER, BB, K, HBP, and WP.
- The cryptic Replay/ABS token display was replaced with readable Away and Home availability summaries on page 1. Full manager replay and ABS totals and decision logs appear on page 2.
- Blank PDF exports also contain two pages: a clean scorecard and a reverse-side form with one continuous notes/events writing area plus a separate review log.
- Extra-inning games remain supported. Innings 11–20 receive a continuation scorecard followed by a continuation notes/review page so the file remains duplex-ready.
- The Version 34 service-worker revision was refreshed so installed devices receive the unified page-two notes layout.

## Version 33.0.2 — Follow-the-Ball Scoring

- Home runs save immediately without opening the field map.
- The baseball-field popup now records the complete defensive ball path in order, including repeated fielders.
- Examples: `GO6-3`, `DP6-4-3`, `DP4-3-1`, and `DP3-6-3`.
- The selected path is retained in autosave, game files, play editing, play logs, scorecard notation, Excel, PDF, and undo/rebuild workflows.
- Existing Version 33 plays containing only one field location remain compatible and are treated as one-step ball paths.

## Version 33.0.2 — Setup-First Launch and Verified Game Emulation

- Every app launch now opens **Step 1 — Setup**, including launches that recover an existing autosaved game.
- Restored teams, lineups, pitchers, pitches, plays, score, inning state, notes, and other game data remain intact and can be resumed from Live Scoring.
- Home runs now record immediately as `HR` without opening the field-location or ball-path dialog.
- Keeps the Current Scorecard line score inside its internal horizontal scroller on iPhone instead of widening the page.
- Passed all **51 automated regression test files** and complete game emulation on iPhone, iPad, and desktop.

## Version 33 — Visual Baseball-Field Location Selector

Version 33 preserves the complete Version 32 scoring, autosave, saved-game, undo, Excel, and PDF workflows while redesigning the batted-ball location popup as an interactive baseball field.

### Version 33 changes

- Replaces the former position grid with a true baseball-field diagram showing grass, dirt, foul lines, bases, the mound, and home plate.
- Places all nine standard defensive position buttons in their normal field alignment: **1 P, 2 C, 3 1B, 4 2B, 5 3B, 6 SS, 7 LF, 8 CF, 9 RF**.
- Keeps every field-location button finger-sized and clearly labeled with its number, abbreviation, and position name.
- Retains the selected position in autosave, saved game files, play editing, undo reconstruction, scorecard notation, the play log, Excel, and PDF exports.
- Uses a new Version 33 service-worker cache so installed phones and tablets receive the redesigned popup.
- Migrates the current Version 32 browser autosave into Version 33 when available.
- Passed all **49 automated regression test files**, JavaScript syntax validation, **11 iPhone/iPad viewport checks**, and end-to-end phone and tablet selection/save flows.

## Version 32 — Manager Replay, ABS, and Complete PDF Pitching Lines

Version 32 preserves the complete Version 31 live-scorecard workflow and adds a dedicated **Manager Replay** tracker that is independent from the existing **ABS ball-strike challenge** tracker.

### Version 32 Batted-Ball Field Location Update

- Every quick-result button for a ball put in play now opens a compact defensive-position selector before the play is committed.
- Uses standard baseball numbering: **1 P, 2 C, 3 1B, 4 2B, 5 3B, 6 SS, 7 LF, 8 CF, 9 RF**.
- Applies to hits, reached-on-error, fielder's choice, groundouts, airborne outs, sacrifices, double plays, and triple plays.
- Saves the location in continuous autosave and saved games and includes it in the play log, scorecard notation, Excel, and PDF output.
- Adds mobile-safe 44-pixel position buttons, dynamic-viewport containment, a compact phone-landscape layout, and no-horizontal-overflow checks.
- All 47 regression files, JavaScript syntax validation, 11 iPhone/iPad viewport checks, and two end-to-end mobile save-flow checks passed.
- This maintenance update remains **Version 32**.


### Version 32 Mobile Application Audit

- Audited every primary section, dialog, field type, and live-scoring control at 320, 360, 390, and 430-pixel portrait widths plus phone landscape.
- Standardizes touch fields and controls to mobile-safe 16-pixel form text and 44-pixel touch targets.
- Preserves sticky mobile navigation by replacing page-level horizontal hiding with clipping.
- Keeps the Plate Appearances / Current Scorecard selector visible below the autosave and section-navigation bars.
- Adds accessible pressed-state reporting to both scoring-view buttons.
- Verifies that end-of-inning divider lines appear in both mobile views.
- Keeps the player-name column fixed while the Current Scorecard innings scroll horizontally.
- Adds mobile scorecard swipe guidance and dynamic-viewport dialog sizing.
- Complete 44-file regression suite, JavaScript syntax validation, and five-viewport browser audit passed.
- This maintenance update remains **Version 32**.

### Manager Replay

- Defaults to **one challenge per team** for regular-season and most games.
- Supports **two challenges per team** for postseason and All-Star games.
- Retains a challenge whenever the challenged call is overturned.
- Consumes a challenge when the ruling is confirmed or the call stands.
- Records the inning, half-inning, challenged play, result, and optional notes.
- Includes manager replay status in browser autosave, saved game data, summaries, Game Notes, Excel output, and PDF output.
- Uses MLB schedule game type data to choose the ordinary-game or postseason/All-Star starting allotment when available; the setting remains editable.

### ABS Challenges

- Remain a separate system with their own team counts, event log, success retention, and extra-inning grant behavior.
- Manager replay outcomes never change ABS availability, and ABS outcomes never change manager replay availability.

### Version 32 ABS Batter-Initiator Maintenance Update

- The ABS challenge dialog now always displays all three MLB-authorized initiators: **Batter, Pitcher, and Catcher**.
- Selecting **Batter** automatically assigns the batting team and records the challenged umpire call as a **called strike**.
- Selecting **Pitcher** or **Catcher** automatically assigns the fielding team and records the challenged umpire call as a **called ball**.
- The linked pitch is filtered to the proper type: a batter challenge links only to a called strike, while a pitcher/catcher challenge links only to a called ball.
- The dialog explains that the request must be immediate and cannot come from a manager, coach, dugout, or uninvolved player.
- Successful challenges remain available; unsuccessful challenges are lost, and the existing extra-inning grant behavior remains intact.
- This maintenance update remains **Version 32** and refreshes the browser/service-worker cache key so installed copies receive the correction.

### Version 32 PDF Pitching-Line Maintenance Update

- The PDF now places each pitcher's calculated game line beside the correct pitcher in the dedicated **IP, H, R, ER, BB, K, and HP** columns.
- Innings pitched are calculated from recorded outs using baseball notation such as `6.0`, `6.1`, and `6.2`.
- Pitcher appearance order remains starter first, followed by relievers in the order they entered.
- Hits, walks, intentional walks, strikeouts, hit batters, runs, and earned runs are derived from the live scoring record.
- Runners retain responsibility when a pitching change occurs, so an inherited runner is charged to the pitcher who put that runner on base.
- The automatic extra-inning runner remains an unearned run when scored.
- The maintenance update remains **Version 32** and uses a refreshed Version 32 browser cache key so installed copies receive the correction.

### Compatibility

- Version 31 browser autosaves and roster mirrors migrate automatically.
- All Version 31 plate-appearance/current-scorecard views, half-inning dividers, interference, substitutions, pitching changes, pitch tracking, game management, Excel export, and PDF export remain intact.
- Version 32 adds dedicated structural and runtime tests for the manager replay rules and for manager replay/ABS separation.

**Version 28 update:** The ABS challenge tracker is consolidated inside the Live Game Center, with compact team controls and an expandable challenge log. — Version 28

## Version 28 — Broadcast-Style Live Game Center

- Moves the score, inning, outs, base diamond, and ball-strike count into the Pitch-by-Pitch Scoring console.
- Uses a compact two-team score display with dynamic team abbreviations and full team names.
- Displays top/bottom inning direction with `▲` or `▼`, plus the current inning number.
- Reduces the ball-strike count to approximately half the visual size of the prior oversized count.
- Keeps base occupancy prominent in the center of the scorebox.
- Integrates the current batter and pitcher, including full available player data and live game statistics.
- Adds the next batter **On Deck** and the following batter **In the Hole**, updated automatically as the batting order advances and substitutions occur.
- Places the Live Game Center before the ABS challenge area so the primary scoring controls and game situation are immediately visible.
- Includes dedicated desktop, tablet, and iPhone layouts.
- Migrates existing Version 27.2 browser autosaves into Version 28 on first opening.

## Version 30 Interference Scoring

- Adds an **Interference** Quick Result and a **Record Interference** control inside every play dialog.
- Supports batter interference, runner interference, offensive team member or coach interference, catcher/defensive interference, umpire interference involving a fair batted ball, umpire interference with a catcher’s throw, fan/spectator interference, authorized-person interference, and a custom category.
- Records the person involved, the umpire’s ruling, outs, runs, runner placements, whether the batting order advances, whether an official at-bat is charged, and whether a hit is credited.
- Defaults follow the applicable MLB rule pattern but remain editable because the umpire’s placement and scoring ruling depend on the specific play.
- Preserves the live count for interference events that do not end the plate appearance.
- Uses compact notation (`BI`, `RI`, `OI`, `CI`, `UI`, `FI`, or `INT`) in the scorecard and carries full details into the play log, Game Notes, saved game, Excel, and PDF.
- Catcher interference can also be assigned to the responsible defensive player as an individual error.
- Obstruction remains a separate result because MLB rules distinguish obstruction from interference.

## Game Notes and Key Plays

- The lower-right Game Notes area begins with the final/current score.
- Appearance notes are assembled chronologically from the first recorded plate appearance through the last.
- Each note includes the inning, batter, at-bat result, and the note entered for that appearance.
- A compact **Key Play** toggle prefixes the note with `KEY PLAY`, marks the scoring cell, and identifies the event in Game Notes.
- Manual Game Notes, substitutions, pitching changes, manager replay reviews, and ABS challenge information are retained in the exported timeline.

## Position-Player Substitutions

- Each team has a ten-player bench area with the same fields used for starters: number, name, position, bats, AVG, and OBP.
- Each live lineup row includes a substitution dropdown.
- Only unused available bench players appear.
- The substitution dialog records the reason, defensive position, inning, half-inning, and optional note.
- Starters and substitutes retain separate identities, histories, and individual batting statistics while sharing the correct batting-order slot.

## Pitching Changes

- Each team’s Pitching section includes an available-pitcher/reliever dropdown.
- Every pitcher retains number, name, throwing hand, record, ERA, and strikeouts.
- Pitchers already used are removed from the available-reliever list.
- Pitch history, batters faced, hits, walks, strikeouts, and other totals remain separate for each pitcher.

## Individual Error Assignment

- A compact **Record Error** button opens an error-assignment panel for the current plate appearance.
- The fielder dropdown lists only players currently on defense.
- Error types include fielding, throwing, catching, dropped fly, missed catch, and other.
- A second error can be assigned to the same play, with optional details.
- Reached on Error requires a defensive player assignment before it can be saved.
- Standard notation such as `E6` is generated automatically. Combined plays can display notation such as `1B/E9`.
- Individual fielder totals and team error totals are maintained and rebuilt correctly after Undo Last Play.

## Display and Control Refinements

- The schedule button is labeled **Reset Card / Refresh Schedule List**.
- A home run displays only **HR** in every at-bat box, while the underlying run and RBI statistics remain accurate.
- Undo Last Play, Change Half-Inning, and Reset Entire Game remain beneath the scoring instructions.
- The consolidated live matchup area continues to show current batter and pitcher data, prior batter appearances, and live pitcher statistics.

## Preserved Features

- MLB ABS challenge tracking
- Permanent pitch history and pitcher totals
- Automatic walks and swinging/looking strikeouts
- Dropped-third-strike correction
- Full game-state undo and rebuild
- MLB/MiLB schedule and game-data lookup
- Sharpened 300-DPI classic one-page PDF
- One consistent Guariglia brown, burnt-orange, gold, and cream palette across the app and PDF
- Excel, PDF, saved-game, and pitch-log CSV exports
- Optional traditional guides on blank PDFs

Version 33 is the current production and controlling baseline.



## Version 27.2

- Shows the starting pitcher first and adds each selected reliever beneath that starter only when used.
- Loads every available active-roster pitcher up to the app's 15-pitcher capacity internally.
- Keeps the probable/current pitcher identified separately.
- Uses one compact Add Pitcher dropdown, sorted by last name and then first name, for all unused eligible pitchers.
- Shows full pitcher information: uniform number, name, throwing hand, record, ERA, and strikeouts.
- Removes pitchers from availability after they enter while preserving their game history and statistics.
- PDF and Excel pitching rows now list only pitchers who actually entered the game, in exact first-appearance order.
- Unused roster pitchers no longer fill blank scorecard pitching lines.
- Each exported pitcher retains uniform number, name, throwing hand, record, ERA, and strikeouts.

## Version 27.1

- Corrects online bullpen and reliever loading by using each team’s active roster.
- Loads the full active-roster pitching pool internally without displaying the entire bullpen at once.
- Populates pitching-change dropdowns with all unused active pitchers and relievers.
- Keeps PDF and Excel pitching sections limited to the starter and up to five pitchers who appeared.

## Version 27

- Ends regulation games correctly after the top or bottom of the ninth and immediately on a home-team walk-off.
- Uses the MLB regular-season automatic-runner rule in extra innings: the batting-order player immediately preceding the leadoff hitter begins each half-inning on second, with a pinch-runner available through the existing substitution workflow.
- Provides a postseason/traditional extra-inning option with empty bases.
- Preserves innings 1–10 on PDF page 1 and automatically adds a continuation scorecard for innings 11–20 on page 2.
- Save Game File, Download Excel, and Download PDF retain all on-screen data and then offer a deliberate, double-confirmed Clear Card option.

## Continuous autosave and recovery

Version 27.2 now continuously saves the live game in the browser. Every field edit, pitch, completed play, substitution, pitcher change, ABS challenge, error, Key Play, and note is written to a current recovery snapshot, with the immediately previous snapshot retained as a backup. The app restores the current game automatically after refresh, browser restart, or reopening the installed app.

The Settings section includes **Save Now** and **Restore Previous Autosave**. Save Game File remains the portable backup for moving a game to another device. Explicit reset and blank-card commands are the only actions that clear browser recovery data.

### Version 27.2 iPhone roster persistence
Team names, lineup and bench players, and pitchers now have a protected field cache and an independent browser-storage roster mirror. This prevents iPhone Safari or the installed web app from replacing restored roster fields with blanks while retaining scoring data. Intentional edits and resets still work normally.


## Version 30 iPhone date-field correction

The Setup screen date controls are now constrained to the available mobile card width. The scheduled-game and manual date inputs use iPhone-safe sizing, preserve the native calendar picker, and no longer widen or overflow the startup screen.

## Version 32 plate-appearance RBI display correction

Plate-appearance scoring boxes no longer repeat RBI text. RBI values are still calculated normally and continue to populate each batter's dedicated RBI column in the app, Excel export, and PDF scorecard. Run totals are also omitted from the scoring box, so each box contains only the recorded play result and essential play detail. Home runs continue to display simply as `HR`.

## Version 32 Runner Events and Wild-Pitch Column

- Adds a dedicated **Runner Event** workflow that does not end or reset the current plate appearance.
- Records stolen bases and caught stealing, including the responsible runner and destination.
- Records every pickoff attempt and its result: safe, picked off, advanced, advanced on an error/overthrow, or balk/disengagement violation.
- Records wild pitches, passed balls, and defensive indifference with all affected runner destinations, runs, and outs.
- Attributes SB, CS, and defensive indifference to the batting team; attributes pickoff attempts, successful pickoffs, WP, and PB to the fielding team.
- Supports WP or PB classification when a batter reaches on a third strike that was not caught.
- Adds SB and CS to batter totals; adds WP, pickoff attempts, and successful pickoffs to pitcher tracking.
- Adds a dedicated **WP** pitching column immediately to the right of HP and before Game Notes in the classic PDF and Excel scorecard.
- Preserves runner events through autosave, saved-game files, Undo Last Play, editing, summaries, Game Notes, Excel, and PDF export.
- Passed-ball runs recorded through this workflow are not credited as earned solely because of the passed ball.
- Version number remains **32**.


## Version 32 Plate-Appearance Result-Only Display

Plate-appearance boxes now contain only the play result and essential play detail. Run and RBI totals no longer appear inside the boxes; those values continue to populate their dedicated columns in the app, Excel export, and PDF scorecard.

## Version 32 Pitch-by-Pitch Operational Audit

Version 32 was replay-tested in Chromium with game-based pitch and runner-event sequences. The audit covered pitch controls, automatic walks and strikeouts, ABS challenges by batter/pitcher/catcher, manager replay, steals, every pickoff result, wild pitches, passed balls, defensive indifference, third strikes not caught, undo/edit/delete, autosave, and all exports.

Corrections made during the audit:

- An overturned ABS challenge now changes the linked pitch and recalculates the live count.
- A terminal overturned call now removes the invalid automatic walk or looking strikeout and creates the correct replacement result.
- Reversing strike three that ended a half-inning restores the correct half, outs, bases, and batting order.
- Deleting an upheld terminal challenge no longer resurrects a completed 4–0 or 0–3 count.
- Third-strike-not-caught notation is now `K WP` or `K PB`.

The permanent regression suite now includes `tests/version32-pitch-by-pitch-audit.test.js`. See `VERSION_32_PITCH_BY_PITCH_AUDIT.md` for the complete test matrix and findings. The version number remains **32**.

## Version 32 Excel pitch-count formatting correction

The Pitch Log CSV now protects the **Count Before** and **Count After** columns from Microsoft Excel's automatic date conversion. Counts such as `0-1`, `1-2`, and `2-1` open and display as ball-strike counts. All other pitch-log fields remain unchanged.