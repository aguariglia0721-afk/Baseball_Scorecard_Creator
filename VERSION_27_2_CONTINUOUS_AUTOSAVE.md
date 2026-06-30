# Version 27.2 Continuous Autosave and Recovery

- Every game field, lineup edit, pitcher entry, pitch, play, note, substitution, challenge, and scoring change is saved automatically in browser storage after a 250 ms debounce.
- Critical lifecycle events (background, page hide, browser close) force an immediate save.
- Save Game File, Download Excel, Download PDF, and Pitch Log export create an autosave checkpoint before download.
- The current snapshot and one previous snapshot are retained.
- Startup restores the current game automatically; if that snapshot is invalid, the previous snapshot is attempted.
- Settings includes Save Now and Restore Previous Autosave.
- Explicit reset/blank-card actions remain the only operations that clear browser recovery data.
- Game File download remains the transfer method between devices; browser autosave protects the current device.
