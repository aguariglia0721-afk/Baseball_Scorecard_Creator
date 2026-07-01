const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const manifest = fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = fs.readFileSync(path.join(root, 'VERSION.txt'), 'utf8');

assert.match(html, /Version 34/, 'the visible application must identify Version 33');
assert.match(manifest, /Version 34/, 'the install manifest must identify Version 33');
assert.equal(pkg.version, '34.0.1', 'the package must be Version 34.0.1');
assert.match(version, /Version 34 — Duplex PDF and Expanded Pitching Layout/, 'VERSION.txt must identify the Version 33 feature');
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, 'the Version 33 service-worker cache must be unique');
assert.match(html, /styles\.css\?v=34-pa-sync-r6[\s\S]*app\.js\?v=34-pa-sync-r6/, 'Version 33 assets must be cache-busted');
assert.match(app, /service-worker\.js\?v=34-pa-sync-r6/, 'installed copies must request the Version 33 worker');

assert.match(app, /<svg class="field-map-art" viewBox="0 0 600 500"/, 'the popup must render a true baseball-field SVG');
assert.match(app, /fieldGrassV33[\s\S]*fieldDirtV33[\s\S]*fieldStripeV33/, 'the field must include grass, dirt, and mowing-stripe artwork');
assert.match(app, /field-location-button field-pos-\$\{position\.number\}/, 'all position choices must be placed on the field');
assert.match(css, /Version 33 visual baseball-field location selector/, 'Version 33 field-map styling must be documented');
assert.match(css, /\.field-pos-8\{left:50%;top:17%\}/, 'center field must appear in deep center');
assert.match(css, /\.field-pos-7\{left:19%;top:29%\}/, 'left field must appear in left field');
assert.match(css, /\.field-pos-9\{left:81%;top:29%\}/, 'right field must appear in right field');
assert.match(css, /\.field-pos-4\{left:63%;top:50%\}[\s\S]*\.field-pos-6\{left:37%;top:50%\}/, 'shortstop and second base must be aligned across the middle infield');
assert.match(css, /\.field-pos-3\{left:76%;top:68%\}[\s\S]*\.field-pos-5\{left:24%;top:68%\}/, 'third base and first base must be aligned at the infield corners');
assert.match(css, /\.field-pos-1\{left:50%;top:63%\}[\s\S]*\.field-pos-2\{left:50%;top:87%\}/, 'pitcher and catcher must align down the center of the diamond');
assert.match(app, /Tap each fielder in the order the ball traveled\. Example: shortstop to first base is 6–3\./, 'the popup must provide clear follow-the-ball instructions');

assert.match(app, /guariglia-scorecard-v34-autosave-current/, 'Version 34 must use its own current autosave key');
assert.match(app, /label:"Version 33"[\s\S]*guariglia-scorecard-v33-autosave-current/, 'Version 34 must migrate the Version 33 autosave');
assert.match(app, /const VERSION_NUMBER = 34;/, 'saved game files must identify Version 34');

console.log('Version 33 visual baseball-field selector tests passed');
