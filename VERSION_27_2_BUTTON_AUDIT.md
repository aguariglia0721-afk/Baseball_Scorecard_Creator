# Version 27.2 — Complete Button Audit

Date: June 24, 2026

Every static, generated, delegated, dialog, game-management, and export control was inventoried and checked.

## Results

- 64 static HTML buttons inspected.
- 46 named button IDs verified as unique.
- 25 buttons generated at startup, producing 89 initial runtime buttons.
- Dynamic **Remove Error** and **Edit Challenge** controls verified.
- Every button has an explicit `button` or `submit` type.
- Direct click handlers, delegated handlers, form-submit handlers, and native dialog actions passed.
- 70 direct browser interaction scenarios passed without JavaScript errors.
- Header and duplicate Settings/Summary save and export controls were both tested.
- Full and blank PDF downloads, Excel downloads, game files, pitch-log CSV, uploads, and post-export decisions passed.
- No broken buttons were found.

A permanent regression test was added at:

`tests/version27-2-comprehensive-button-audit.test.js`

Version remains **27.2**.
