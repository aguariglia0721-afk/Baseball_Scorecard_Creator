const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const data = fs.readFileSync(path.join(root, 'baseball-data.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));

assert.match(html, />Reset Card \/ Refresh Schedule List</, 'schedule reset button must use the approved label');
assert.match(html, /id="awayBenchInputs"/);
assert.match(html, /id="homeBenchInputs"/);
assert.match(html, /id="substitutionDialog"/);
assert.match(html, /id="awayPitchingChangeSelect"/);
assert.match(html, /id="homePitchingChangeSelect"/);
assert.match(html, /id="keyPlayBtn"/);
assert.match(html, /id="recordErrorQuickBtn"/);
assert.match(html, /id="errorAssignmentPanel"/);
assert.match(html, /id="addSecondErrorBtn"/);

assert.match(app, /const BENCH_ROWS = 10/);
assert.match(app, /substitutions:\[\]/);
assert.match(app, /pitcherChanges:\[\]/);
assert.match(app, /function activeBatter\(/);
assert.match(app, /function availableBenchPlayers\(/);
assert.match(app, /function computePlayerStats\(/);
assert.match(app, /function computeFielderErrors\(/);
assert.match(app, /function errorNotation\(/);
assert.match(app, /function recordCurrentError\(/);
assert.match(app, /fieldingErrors/);
assert.match(app, /locationSuffix=play\.outcome==="HR"\?"":path\.join\("-"\)/, 'Version 33 home-run notation must omit a fielding path');
assert.match(app, /function appearanceNoteLine\(/);
assert.match(app, /function gameManagementTimeline\(/);
assert.match(app, /function exportNotes\(/);
assert.match(app, /Final Score|Current Score/);
assert.match(app, /function openSubstitutionDialog\(/);
assert.match(app, /function saveSubstitution\(/);
assert.match(app, /function recordPitcherChange\(/);
assert.match(app, /KEY PLAY/);

assert.match(data, /function benchList\(/);
assert.match(data, /bench:\s*benchList\(/);
assert.match(css, /\.key-play-mark\{/);
assert.strictEqual(manifest.short_name, 'Scorecard V34');

console.log('Version 27 game-management tests passed.');
