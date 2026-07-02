# Guariglia Baseball Scorecard Builder — Version 34 Revision 11

This is the cleaned GitHub and Netlify release package. It preserves the complete working application while excluding historical screenshots, sample PDFs, audit output, superseded release notes, and the development test suite.

## Deploy to GitHub

Place all files and folders from this package in the repository root. Keep the folder structure unchanged.

## Deploy to Netlify

Connect the GitHub repository to Netlify. The included `netlify.toml` publishes the repository root and deploys the MLB data function from `netlify/functions/mlb.mts`.

For a manual Netlify deployment, upload the extracted folder whose root contains `index.html` and `netlify.toml`.

## Required runtime structure

- `index.html`, `styles.css`, and the JavaScript application files
- `assets/` for the crest and installed-app icons
- `vendor/jszip.min.js` for Excel generation
- `netlify/functions/mlb.mts` and `netlify.toml` for MLB schedule/roster data
- `manifest.webmanifest` and `service-worker.js` for installed-app and offline behavior
- `package.json` for the Netlify Functions dependency

The Excel scorecard template and classic PDF background are embedded in `template_data.js` and `pdf_background_data.js`, so separate source copies are not required for operation.
