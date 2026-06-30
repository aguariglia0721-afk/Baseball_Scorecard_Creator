# Version 26.1 — Game Management Update

This build consolidates the approved Version 26 game-management changes.

## Game Notes
- Keeps the final/current score at the top of the lower-right Game Notes area.
- Builds chronological notes from completed plate appearances.
- Includes inning, batter, at-bat result, appearance note, key-play status, and assigned errors.
- Preserves manually entered Game Notes.
- Adds substitutions, pitching changes, and ABS challenge events to the game-management timeline.

## Key Plays
- Adds a compact Key Play toggle to the plate-appearance dialog.
- Prefixes the appearance note with `KEY PLAY` without destroying existing note text.
- Marks the plate appearance and includes it in exported Game Notes.

## Position-Player Substitutions
- Adds a bench roster for each team with number, name, position, bats, AVG, and OBP.
- Adds substitution dropdowns beside live lineup entries.
- Offers only unused bench players.
- Records reason, defensive position, inning/half-inning, and optional note.
- Keeps starters and substitutes as separate player identities with separate histories and statistics.

## Pitching Changes
- Adds pitching-change dropdowns in the Pitching section.
- Uses available unused pitchers from the six-row staff.
- Preserves number, name, throwing hand, record, ERA, and strikeouts.
- Maintains separate pitch and appearance statistics for every pitcher.

## Error Assignment
- Adds a compact Record Error workflow.
- Selects only currently active defensive players.
- Supports fielding, throwing, catching, dropped-fly, missed-catch, and other errors.
- Supports a second error on the same play and optional details.
- Stores the individual fielder, position, type, notation, and play relationship.
- Displays standard notation such as E6 and combined notation such as 1B/E9.
- Requires a fielder assignment for Reached on Error.
- Updates individual and team error totals and rebuilds correctly after Undo Last Play.

## Display and Controls
- Renames the schedule button to `Reset Card / Refresh Schedule List`.
- Home-run scoring boxes display only `HR`; underlying RBI and run statistics remain recorded.
- Retains Undo Last Play, Change Half-Inning, Reset Entire Game, ABS challenges, pitch tracking, Excel export, and one-page PDF export.
