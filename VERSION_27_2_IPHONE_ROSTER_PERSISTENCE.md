# Version 27.2 — iPhone Team and Roster Persistence Fix

Version 27.2 now protects team and player information independently from the live scoring object.

- Team names, records, lineup players, bench players, and pitchers are held in a canonical in-memory field cache.
- If iPhone Safari or the installed web app clears visible form controls without sending an edit event, the cached values are used instead of saving blanks.
- A separate roster mirror is written to browser storage alongside the full autosave.
- Startup recovery merges missing team/roster fields from that mirror before rendering the game.
- Pageshow, focus, foreground return, pagehide, visibility, beforeunload, and freeze lifecycle paths are covered.
- Intentional user clearing and Reset Entire Game still clear the relevant values normally.
