const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.match(html, /styles\.css\?v=34-pa-sync-r6/, 'mobile-audited CSS must be cache-busted');
assert.match(html, /app\.js\?v=34-pa-sync-r6/, 'mobile-audited JavaScript must be cache-busted');
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, 'mobile-audited service worker cache must be unique');
assert.match(app, /service-worker\.js\?v=34-pa-sync-r6/, 'mobile-audited service worker registration must refresh installed apps');

assert.match(css, /html,body\{overflow-x:clip\}/, 'page clipping must preserve sticky positioning');
assert.match(css, /@media\(pointer:coarse\)[\s\S]*font-size:16px;min-height:44px/, 'coarse-pointer fields must avoid iPhone zoom and meet touch-size requirements');
assert.match(css, /\.scoring-view-switcher\{top:calc\(env\(safe-area-inset-top,0px\) \+ 100px\);z-index:18\}/, 'the view switcher must remain below the mobile navigation stack');
assert.match(css, /th\.current-player-column,[\s\S]*td\.current-player-column\{[\s\S]*position:sticky;[\s\S]*left:0/, 'the scorecard player column must stay visible while horizontally scrolling');
assert.match(css, /\.play-note-tools button,[\s\S]*#addSecondErrorBtn,[\s\S]*\.runner-event-log-item button[\s\S]*min-height:44px/, 'dialog and event-log actions must be finger-sized');

assert.match(app, /plateButton\.setAttribute\("aria-pressed",String\(!showScorecard\)\)/, 'Plate Appearances toggle must expose its pressed state');
assert.match(app, /cardButton\.setAttribute\("aria-pressed",String\(showScorecard\)\)/, 'Current Scorecard toggle must expose its pressed state');
assert.match(html, /On a phone, swipe the tables left or right to view every inning and total\./, 'mobile scorecard scrolling guidance must be visible');
assert.match(css, /\.half-inning-ending-cell::after\{[\s\S]*height:3px;[\s\S]*background:var\(--brown\)/, 'half-inning ending lines must remain visible on mobile');

console.log('Version 32 mobile app audit tests passed');
