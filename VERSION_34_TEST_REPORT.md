# Version 34 Test Report

**Build:** Guariglia Baseball Scorecard Builder Version 34, Revision 5  
**Focus:** Prior-box substitution lines, unified page-two notes, readable PDF substitutions, column containment, ASCII star fallback, duplex PDF, expanded pitching layout, and clear Replay/ABS reporting

## Results

- Full inherited and Version 34 automated regression suite: **Passed**
- JavaScript syntax validation (`app.js`, `service-worker.js`, `baseball-data.js`): **Passed**
- Browser-generated substitution stress-test PDF: **2 US Letter portrait pages**
- PDF page 1 visual inspection at 200 DPI: **Passed**
- PDF page 2 visual inspection at 200 DPI: **Passed**
- PDFium and Poppler renderer verification: **Passed**
- Extracted PDF text check for accidental `?` star replacement: **Passed**

## Verified Revision 5 Substitution Boundary Correction

- A substitution divider is never placed in the middle of an inning scoring box.
- The divider is drawn at the right edge of the inning box immediately before the incoming player's first scoring inning.
- When an away-team defensive substitution is recorded in the bottom half, the boundary advances to the following inning because that is the team's next batting opportunity.
- Multiple substitutions in the same batting-order position retain separate boundaries when they begin in different innings.
- Starter and substitute names remain on separate, readable lines in the Player / No. column.

## Existing Version 34 Corrections Retained

- Player text is clipped and ellipsized within the Player / No. column.
- Unsupported star glyphs are converted to the ASCII `*` character.
- Manual notes and recorded game events remain combined in **Game Notes & Events**.
- Page 1 retains two full-width six-row pitching tables.
- Pitching columns remain Pitcher / No., IP, H, R, ER, BB, K, HBP, and WP.
- Replay and ABS status remains readable in Away/Home summaries.
- Regulation, blank, and extra-inning exports retain correct duplex page pairing and long-edge printing instructions.

## Regression Coverage

The complete suite passed through Version 34, including setup-first launch, autosave migration, substitution tracking, pitcher workflow, runner events, manager replay, ABS challenges, pitch tracking, mobile layout, field-location mapping, home-run bypass, defensive ball paths, undo/rebuild, Excel export, and PDF export.
