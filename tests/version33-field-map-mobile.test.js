const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const reportPath = path.join(root, 'VERSION_33_FIELD_MAP_MOBILE_REPORT.json');

assert.match(css, /\.field-location-dialog\{width:min\(620px,calc\(100vw - 1rem\)\)\}/, 'desktop and tablet field-map width must be bounded');
assert.match(css, /@media\(max-width:760px\)[\s\S]*\.field-location-dialog\{width:calc\(100vw - \.75rem\)\}/, 'phone field-map popup must fit the viewport');
assert.match(css, /@media\(pointer:coarse\)[\s\S]*\.field-location-button\{min-width:44px;min-height:44px\}/, 'touch devices must retain 44px minimum field buttons');
assert.match(css, /@media\(max-height:500px\) and \(min-width:600px\)[\s\S]*\.field-location-grid\{width:min\(340px,60vw\)/, 'short landscape screens must receive a compact field');
assert.ok(fs.existsSync(reportPath), 'the Version 33 iPhone/iPad browser audit report must be included');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
assert.equal(report.passed, true, 'the complete Version 33 mobile field-map audit must pass');
assert.ok(report.viewports.length >= 11, 'the audit must cover representative iPhones and iPads');
for (const result of report.viewports) {
  assert.equal(result.passed, true, `${result.name} must pass`);
  assert.equal(result.checks.fieldSvgPresent, true, `${result.name} must show the field artwork`);
  assert.equal(result.checks.buttonCount, 9, `${result.name} must show nine fielders`);
  assert.equal(result.checks.touchTargets, true, `${result.name} must preserve finger-sized targets`);
  assert.equal(result.checks.standardAlignment, true, `${result.name} must preserve standard defensive alignment`);
  assert.equal(result.checks.noButtonOverlap, true, `${result.name} must avoid overlapping position buttons`);
  assert.equal(result.checks.noHorizontalOverflow, true, `${result.name} must avoid page overflow`);
  assert.equal(result.checks.dialogInsideViewport, true, `${result.name} popup must stay inside the viewport`);
}
assert.equal(report.flowChecks.phone.passed, true, 'the iPhone select/save flow must pass');
assert.equal(report.flowChecks.tablet.passed, true, 'the iPad select/save flow must pass');

console.log('Version 33 visual field-map mobile tests passed');
