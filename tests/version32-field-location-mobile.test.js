const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const reportPath = path.join(root, 'VERSION_32_FIELD_LOCATION_MOBILE_REPORT.json');

assert.match(css, /\.field-location-dialog\{width:min\(620px,calc\(100vw - 1rem\)\)\}/, 'desktop and tablet popup width must be bounded');
assert.match(css, /@media\(max-width:760px\)[\s\S]*\.field-location-dialog\{width:calc\(100vw - \.75rem\)\}/, 'phone popup must fit the viewport');
assert.match(css, /@media\(pointer:coarse\)[\s\S]*\.field-location-button\{min-width:44px;min-height:44px/, 'coarse-pointer field buttons must meet the 44px touch minimum');
assert.match(css, /\.play-dialog\{[\s\S]*max-height:calc\(100dvh/, 'dialogs must honor dynamic iPhone and iPad viewport height');
assert.ok(fs.existsSync(reportPath), 'the real-browser iPhone/iPad audit report must be included');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
assert.equal(report.passed, true, 'all real-browser mobile viewport checks must pass');
assert.ok(report.viewports.length >= 10, 'the audit must cover a broad iPhone and iPad size range');
for (const result of report.viewports) {
  assert.equal(result.passed, true, `${result.name} must pass the browser audit`);
  assert.equal(result.checks.dialogOpen, true, `${result.name} must open the popup`);
  assert.equal(result.checks.buttonCount, 9, `${result.name} must show all nine positions`);
  assert.equal(result.checks.touchTargets, true, `${result.name} must preserve finger-sized targets`);
  assert.equal(result.checks.noHorizontalOverflow, true, `${result.name} must avoid page-level horizontal overflow`);
  assert.equal(result.checks.dialogInsideViewport, true, `${result.name} popup must remain inside the viewport`);
}
assert.equal(report.flowChecks.phone.passed, true, 'the iPhone selection and save flow must pass');
assert.equal(report.flowChecks.tablet.passed, true, 'the iPad selection and save flow must pass');

console.log('Version 32 field-location mobile tests passed');
