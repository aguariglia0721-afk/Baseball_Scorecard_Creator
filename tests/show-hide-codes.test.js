const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(html, /id="toggleQuickResultsBtn"[\s\S]*aria-expanded="true"[\s\S]*aria-controls="quickResultGrid"[\s\S]*Hide Codes/, 'toggle button must expose accessible state and target');
assert.match(app, /function setQuickResultsVisible\(visible\)/, 'a single visibility helper must control the quick-code panel');
assert.match(app, /grid\.hidden=!show/, 'visibility helper must update the hidden attribute');
assert.match(app, /grid\.classList\.toggle\("is-collapsed",!show\)/, 'visibility helper must apply a browser-independent collapsed class');
assert.match(app, /grid\.setAttribute\("aria-hidden",String\(!show\)\)/, 'visibility helper must update aria-hidden');
assert.match(app, /button\.setAttribute\("aria-expanded",String\(show\)\)/, 'button state must remain synchronized');
assert.match(app, /button\.textContent=show\?"Hide Codes":"Show Codes"/, 'button label must follow the actual panel state');
assert.match(app, /function toggleQuickResults\(\)[\s\S]*setQuickResultsVisible\(!isVisible\)/, 'the toggle must switch through the visibility helper');
assert.match(app, /if\(type==="inplay"\)setQuickResultsVisible\(true\)/, 'ball in play must reopen the codes through the same helper');
assert.match(app, /renderQuickResults\(\);[\s\S]*setQuickResultsVisible\(true\);[\s\S]*initEvents\(\)/, 'the panel must initialize in the visible state');
assert.match(css, /\.quick-result-grid\[hidden\],\.quick-result-grid\.is-collapsed\{display:none!important\}/, 'collapsed codes must be visually removed in every browser');
assert.match(html, /styles\.css\?v=34-pa-sync-r6/, 'updated stylesheet must be cache-busted');
assert.match(html, /app\.js\?v=34-pa-sync-r6/, 'updated JavaScript must be cache-busted');

console.log('show/hide codes tests passed');
