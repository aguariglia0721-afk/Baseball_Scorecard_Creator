const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.match(app, /if\(count\.inPlay&&allowAutomaticOutcome\)return false;/, 'pitch history must reject another pitch after In Play');
assert.match(app, /if\(scoring\.count\.inPlay\)\{renderPitchConsole/, 'live pitch controls must guard a pending ball in play');
assert.match(app, /button\.disabled=Boolean\(count\.inPlay\)/, 'all pitch buttons must lock while a batted-ball result is pending');
assert.match(app, /\["BB","IBB","HBP","K","KL","HR"\]\.includes\(outcomeId\)/, 'home runs must complete directly even with runners aboard');
assert.match(app, /Save & Complete Batter/, 'the final plate-appearance action must be explicit');
assert.match(app, /populate the scorecard and totals below/, 'pending results must explain why lower fields have not populated');
assert.match(html, /id="playCompletionNotice"/, 'the play dialog must display a completion notice');
assert.match(html, /id="savePlayBtn"[\s\S]*Save &amp; Complete Batter/, 'the play dialog submit button must explicitly complete the batter');
assert.match(css, /\.play-completion-notice\{/, 'the completion notice must be visually distinct');
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, 'installed apps must receive the synchronized scoring build');

console.log('Version 34 plate-appearance completion synchronization tests passed');
