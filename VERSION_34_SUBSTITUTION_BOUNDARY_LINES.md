# Version 34 - PDF Substitution Boundary Lines

Version 34 remains the production version. Revision 5 refines the visual boundary used when a batting-order substitution occurs.

- A strong vertical divider is drawn for every substitution.
- The divider is never placed in the middle of an inning box.
- It is placed at the right edge of the inning box immediately before the incoming player's first scoring inning.
- If the incoming player has not yet batted, the recorded substitution inning determines the next scoring boundary; an away-team defensive substitution in the bottom half advances the boundary to the following inning.
- Multiple substitutions in one batting-order position can produce separate chronological dividers when they begin in different innings.
- Existing readable substitute lines, column clipping, ellipsizing, ASCII `*` markers, and the complete page-two substitution timeline remain unchanged.
- Service-worker cache revision: `v34-pdf-duplex-r5`.
