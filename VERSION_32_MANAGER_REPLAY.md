# Version 32 — MLB Manager Replay Challenge Tracking

## Verified rule implemented

For regular-season and most MLB games, each club begins with one manager challenge. A club retains the challenge whenever at least one challenged call is overturned. A confirmed ruling or a ruling that stands consumes the challenge. The current rule therefore does not impose a two-successful-challenge ceiling; a club can continue challenging after each successful overturn.

For the All-Star Game and postseason games, each club begins with two manager challenges.

Manager replay is independent from the Automated Ball-Strike (ABS) challenge system introduced league-wide for 2026. ABS begins with two challenges per club, retains a challenge after a successful ABS challenge, and can grant a club one challenge at the start of an extra inning when it enters that inning with none.

## App changes

- Added an editable game-level manager replay allotment:
  - Regular season / most games: one per team.
  - Postseason / All-Star: two per team.
- Added separate Manager Replay controls for the away and home teams.
- Added replay outcomes:
  - Overturned — retained.
  - Confirmed — lost.
  - Call stands — lost.
- Added a separate manager replay event log with editing and deletion.
- Prevented recording a new manager challenge when that team has no challenge available.
- Kept manager replay and ABS state completely independent.
- Added manager replay information to autosave, game files, summaries, Game Notes, Excel, and PDF output.
- Added schedule-based default allotment detection while keeping the field manually editable.
- Added migration from Version 31 browser autosaves and roster mirrors.

## Scope note

The tracker records challenges initiated by a manager. Crew-chief-initiated replay reviews are not deducted from a club's manager challenge allotment and should not be entered as a manager challenge.
