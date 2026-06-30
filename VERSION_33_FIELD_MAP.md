# Version 33 — Visual Baseball-Field Location Selector

## Purpose

Version 33 redesigns the batted-ball location popup so the scorer selects a defensive player directly from a baseball-field diagram rather than from a generic grid.

## Defensive alignment

- 1 — Pitcher
- 2 — Catcher
- 3 — First Base
- 4 — Second Base
- 5 — Third Base
- 6 — Shortstop
- 7 — Left Field
- 8 — Center Field
- 9 — Right Field

## Preserved behavior

The selected field location remains part of the play record and continues through continuous autosave, Version 32 autosave migration, saved game files, play editing, undo and state reconstruction, play-log notation, scorecard notation, Excel export, and PDF export.

## Responsive design

The field uses an inline SVG diagram and absolutely aligned touch controls. Dedicated portrait, compact-phone, and short-landscape rules preserve 44-pixel touch targets, keep all nine players inside the field, prevent position overlap, and avoid page-level horizontal overflow.

## Validation

- 49 automated regression test files passed.
- JavaScript syntax validation passed.
- Chromium browser audit passed at 11 representative iPhone and iPad sizes in portrait and landscape.
- End-to-end field selection and autosave persistence passed on phone and tablet viewports.
