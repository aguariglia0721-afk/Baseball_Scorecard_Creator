# Version 27.2 — PDF Game Notes Boundary Fix

- Moved PDF Game Notes text fully inside the lower-right notes box.
- Added a hard PDF clipping rectangle so notes can never draw into pitching or adjacent columns.
- Added character-level wrapping for unusually long unbroken text.
- Added safe truncation with an ellipsis when the notes exceed the physical box height.
- Added equivalent overflow protection to the browser print layout.
- Preserved the Version 27.2 filename and all existing scoring, roster, pitching, export, and saved-game behavior.
