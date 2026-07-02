# Version 34 Revision 11 Test Report

**Result: PASS**

Revision 11 was tested after moving **On Deck** and **In the Hole** into the compact strip beneath the live defensive field and balls/strikes display.

## Automated regression suite

- JavaScript syntax validation: **PASS**
- Complete Node regression suite: **56 of 56 test files passed**
- New Revision 11 layout and batting-team test: **PASS**
- Confirmed that On Deck and In the Hole are calculated from the team currently batting.
- Confirmed that each upcoming-batter field appears only once.
- Confirmed that Revision 11 uses updated browser and installed-app cache identifiers.

## Responsive browser audit

The revised live-scoring workspace passed on:

- iPhone 15 Pro Max — **PASS**
- iPad Pro 11 — **PASS**
- Android 360 × 800 — **PASS**
- Desktop 1440 × 1000 — **PASS**

The audit confirmed:

- The upcoming-batter strip is directly beneath the live field and count area.
- On Deck and In the Hole remain in a compact two-column layout.
- The displayed players come from the current offensive lineup.
- No horizontal overflow was introduced.
- The sticky top dock remains visible during scrolling.
- Defensive alignment, offensive base runners, pitcher selector, and prominent balls/strikes remain correct.

## End-to-end game audit

The existing Mets–Toronto game simulation also passed on iPhone, iPad, Android, and desktop after the Revision 11 change.
