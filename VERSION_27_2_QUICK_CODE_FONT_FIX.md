# Version 27.2 — Backwards K Quick Code Font Fix

- The strikeout-looking Quick Code is now generated from the same standard `K` glyph, element type, font family, size, weight, line height, and spacing as the other Quick Codes.
- Only a horizontal mirror transform is applied to that standard glyph.
- This avoids the visibly different fallback font used by special Unicode reverse-K characters.
- At-bat notation and PDF notation continue to use the existing mirrored-K treatment.
- Version number and ZIP filename remain Version 27.2 as requested.
