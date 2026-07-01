# Version 34 - PDF Substitution Readability Fix

Version 34 remains the version number and production line. This revision corrects PDF lineup rendering after substitutions.

- Starter and substitute names use separate fixed lines in the Player / No. cell.
- Text never shrinks below a readable floor solely because a substitution was made.
- All lineup text is clipped to the Player / No. column and ellipsized when necessary.
- Up to two substitute entries can be shown beneath the starter. If additional substitutions occur, page one keeps the latest two visible and page two retains the complete substitution chronology.
- Key-play stars in PDF Game Notes use the ASCII `*` fallback and cannot become `?`.
- Service-worker cache revision: `v34-pa-sync-r6`.

## Revision 5 boundary-line refinement

- Each substitution creates a vertical boundary in the inning grid.
- The boundary is placed at the right edge of the prior inning box, never in the middle of the substitute's first inning box.
- Future substitute entries remain visually separated from the previous player's scoring record.
