# Version 32 — Excel Pitch Count Formatting Fix

Version 32 remains the controlling version.

## Problem corrected

When the Pitch Log CSV was opened directly in Microsoft Excel, ball-strike counts such as `0-1`, `1-2`, and `2-1` could be interpreted automatically as calendar dates.

## Correction

- The **Count Before** and **Count After** values are now exported as Excel-safe text formulas.
- Excel displays the values exactly as ball-strike counts, such as `0-1`, without converting them to dates.
- A UTF-8 byte-order mark was added to the CSV export for more reliable Excel character handling.
- Pitch sequence, inning, pitcher, batter, pitch type, timestamp, and all other exported fields remain unchanged.
- The application remains Version 32.
