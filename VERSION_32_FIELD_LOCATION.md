# Version 32 — Batted-Ball Field Location

Version 32 remains the controlling production version. This maintenance update adds a required defensive field-location step whenever a ball is put in play.

## Defensive position numbering

| Number | Position | Code |
|---:|---|---|
| 1 | Pitcher | P |
| 2 | Catcher | C |
| 3 | First Base | 1B |
| 4 | Second Base | 2B |
| 5 | Third Base | 3B |
| 6 | Shortstop | SS |
| 7 | Left Field | LF |
| 8 | Center Field | CF |
| 9 | Right Field | RF |

## Scoring workflow

- Singles, doubles, triples, home runs, reached-on-error, fielder's choice, groundouts, flyouts, lineouts, popouts, sacrifice flies, sacrifice hits, double plays, and triple plays open the compact position selector before the play is saved.
- Walks, intentional walks, hit-by-pitch, strikeouts, catcher interference, and runner-only events do not open the selector because they are not ordinary batted-ball locations.
- The detailed play editor also includes the location field and prevents a batted-ball play from being saved without a valid selection from 1 through 9.
- The selected position is stored in the play record, continuous autosave, saved-game files, play log, scorecard notation, Excel output, and PDF output.
- Compact notation appends the selected number to the result, such as `1B7`, `2B8`, `GO6`, or `FO9`.

## Mobile and tablet behavior

- The selector uses a three-by-three grid in portrait layouts.
- Short phone landscape layouts use a five-column compact grid so all nine positions remain visible.
- Position buttons retain at least 44-pixel touch targets.
- The dialog is constrained to the dynamic viewport, remains scrollable when needed, and does not introduce page-level horizontal overflow.

## Verification

- All 47 automated regression files passed.
- JavaScript syntax checks passed for the application, baseball data, and service worker.
- Chromium browser testing passed at 11 representative iPhone and iPad portrait/landscape viewports.
- End-to-end save tests confirmed notation, the full location label, autosave persistence, dialog closure, and page containment on an iPhone-size viewport and an iPad-size viewport.
