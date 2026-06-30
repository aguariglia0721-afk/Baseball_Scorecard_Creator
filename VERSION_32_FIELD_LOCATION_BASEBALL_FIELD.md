# Version 32.10 — Baseball-Field Location Selector

## What changed

The batted-ball location popup has been redesigned from a compact numbered grid into a visual baseball field.

Users now tap the defensive position directly on a field-style layout:

- **1** Pitcher
- **2** Catcher
- **3** First Base
- **4** Second Base
- **5** Third Base
- **6** Shortstop
- **7** Left Field
- **8** Center Field
- **9** Right Field

This applies to all batted-ball outcomes that require a location, including:

- Single, Double, Triple, Home Run
- Reached on Error
- Fielder's Choice
- Groundout, Flyout, Lineout, Popout
- Sacrifice Fly, Sacrifice Bunt
- Double Play, Triple Play

## Preserved behavior

The selected field position still flows through the full app:

- live score notation (example: `1B7`, `GO6`, `FO9`)
- play log details
- autosave
- saved game files
- undo and game-state rebuild
- Excel export
- PDF export

## Internal testing completed

### Automated regression
- **All 47 automated tests passed**
- JavaScript syntax checks passed

### Real-browser mobile audit
The redesigned baseball-field popup was retested in Chromium-based browser automation across:

- iPhone SE portrait
- iPhone compact portrait
- iPhone standard portrait
- iPhone Pro Max portrait
- iPhone landscape
- iPad mini portrait
- iPad 10th gen portrait
- iPad Pro 11 portrait
- iPad landscape
- iPad Pro 12.9 portrait
- iPad Pro 12.9 landscape

Verified:

- popup opens correctly
- all 9 positions display
- 44px minimum touch targets maintained
- no horizontal overflow
- popup remains within viewport
- field buttons remain inside the visible field graphic
- selection/save flow works on both phone and tablet

## Cache refresh

The installed-app cache key and asset version strings were updated so devices receive the redesigned popup after deployment.
