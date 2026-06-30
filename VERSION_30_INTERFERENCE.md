# Version 30 — Comprehensive Interference Workflow

Version 30 adds a dedicated interference workflow to the unified Live Game Center while preserving every Version 29 feature and the fixed Guariglia palette.

## Scoring entry points

- **Interference** appears in Quick Results.
- **Record Interference** appears in the plate-appearance dialog.
- Selecting the existing **Catcher Interference** result opens the same detailed workflow with catcher-specific defaults.

## Supported interference types

1. Batter interference (`BI`)
2. Runner interference (`RI`)
3. Offensive team member or coach interference (`OI`)
4. Catcher/defensive interference (`CI`)
5. Umpire interference involving a fair batted ball (`UI`)
6. Umpire interference with a catcher’s throw (`UI`)
7. Fan or spectator interference (`FI`)
8. Authorized person on the field interference (`INT`)
9. Other/custom interference (`INT`)

## Recorded ruling and scoring data

The scorer can identify the person involved, select the umpire ruling, edit outs and runner destinations, enter details, and specify whether the event ends the plate appearance, charges an official at-bat, or credits a hit. This is necessary because interference rulings vary with the type of interference and the umpire’s judgment.

Non-plate-appearance interference preserves the current batter, batting-order position, balls, strikes, pitch history, and active pitcher. Completed interference plays advance or retain the batting order according to the selected setting.

## Output and recovery

Interference notation and details are included in live scoring, the play log, chronological Game Notes, saved-game files, continuous autosave, Excel, and PDF output. Undo Last Play rebuilds the interference ruling, bases, outs, score, batting order, and count correctly. Version 29 autosaves and roster mirrors migrate automatically.

## Rule design basis

The defaults reflect the Official Baseball Rules patterns for offensive interference, catcher interference, umpire interference, and spectator interference. All outcome fields remain editable so the scorer can record the umpire’s actual ruling. Obstruction remains separate from interference.
