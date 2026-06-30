# Version 32 — Runner Events and Wild-Pitch Column

Date: June 25, 2026

## Added scoring events

The live scoring center now includes a **Runner Event** control for events that occur during a plate appearance without advancing the batting order or resetting the pitch count.

Supported events:

- Stolen base
- Caught stealing
- Pickoff attempt — runner safe
- Successful pickoff
- Pickoff throw with advancement
- Pickoff error/overthrow with advancement
- Balk or disengagement violation on a pickoff attempt
- Wild pitch
- Passed ball
- Defensive indifference

Each event records the inning, half-inning, pitcher, primary runner, all runner destinations, runs, outs, and optional notes. Existing events can be edited or removed.

## Statistical handling

- SB and CS are credited to the appropriate runner.
- Defensive indifference is recorded separately and is not counted as a stolen base.
- Pickoff attempts and successful pickoffs are credited to the current defensive pitcher.
- Wild pitches are credited to the current defensive pitcher.
- Passed balls are recorded separately and are not added to the pitcher's WP total.
- The uncaught-third-strike workflow allows the scorer to classify the play as WP, PB, or not yet classified.
- Runner-event outs count toward the pitcher's innings pitched.
- Passed-ball runs recorded through this event path are not treated as earned solely because of the passed ball.

## Team attribution

- Batting team: SB, CS, DI
- Fielding team: pickoff attempts, successful pickoffs, WP, PB

## Scorecard output

A **WP** column now occupies the previously blank pitching-stat column immediately to the right of **HP** and before **Game Notes**. It is populated in both the classic PDF and Excel scorecard for every pitcher who appeared.

Runner-event notation and logs are retained in game summaries, notes, and exported files.

## Compatibility

- Version number remains 32.
- Existing Version 32 game files remain compatible.
- Continuous autosave, Undo Last Play, scoring-state rebuild, pitching changes, extra innings, PDF export, and Excel export remain operational.
