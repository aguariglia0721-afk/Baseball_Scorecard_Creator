const fs=require('fs');
const assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));

assert.equal(pkg.version,'34.0.1');
assert.equal(manifest.short_name,'Scorecard V34');
assert.match(html,/Version 34/);
assert.match(app,/const VERSION_NUMBER = 34/);
assert.match(app,/guariglia-scorecard-v34-autosave-current/);
assert.match(app,/Version 28/,'Version 28 autosave migration must remain supported');

const scoreStart=html.indexOf('<div class="scoreboard-card broadcast-scorebox"');
const scoreEnd=html.indexOf('\n        <div class="scoring-help">',scoreStart);
const pitchStart=html.indexOf('<div class="pitch-button-grid compact-pitch-button-grid"',scoreStart);
const toolsStart=html.indexOf('<div class="live-action-grid"',scoreStart);
const quickStart=html.indexOf('<div class="quick-results-card compact-quick-results"',scoreStart);
const absStart=html.indexOf('<section id="absChallengePanel"',scoreStart);
assert(scoreStart>=0&&scoreEnd>scoreStart,'unified scorebox boundaries must exist');
assert(pitchStart>scoreStart&&pitchStart<scoreEnd,'pitch controls must be inside the visible scorebox');
assert(toolsStart>pitchStart&&toolsStart<scoreEnd,'undo/reset/error/challenge tools must be inside the visible scorebox');
assert(quickStart>toolsStart&&quickStart<absStart,'Quick Results must appear before ABS controls');
assert(absStart>quickStart&&absStart<scoreEnd,'ABS panel must remain inside the scorebox after Quick Results');

for(const id of ['undoPitchBtn','resetCountBtn','recordErrorQuickBtn','challengeQuickBtn'])assert(html.includes(`id="${id}"`),`missing ${id}`);
assert.match(html,/id="challengeQuickBtn"[^>]*aria-controls="absChallengePanel"/);
assert.match(html,/id="absChallengePanel"[^>]*hidden/,'ABS panel should be closed until Challenge is selected');
assert.match(app,/function setChallengePanelVisible/);
assert.match(app,/function toggleChallengePanel/);
assert.match(app,/\$\("challengeQuickBtn"\)\.addEventListener\("click",toggleChallengePanel\)/);
assert.match(app,/challengePanelVisible:/,'challenge panel state must be autosaved');

assert.match(css,/Version 32 unified live-scoring workspace/);
assert.match(css,/background:linear-gradient\(145deg,var\(--brown\)/,'scoreboard must use the approved brown palette');
assert.match(css,/compact-pitch-button-grid \.pitch-button\{[\s\S]*min-height:40px/,'pitch buttons must be compact');
assert.match(css,/live-action-grid\{[\s\S]*grid-template-columns:repeat\(2/,'action controls must use the requested two-by-two layout');
assert.match(css,/compact-quick-results/,'Quick Results compact styling missing');
assert.match(css,/#absChallengePanel\[hidden\]/,'hidden ABS behavior missing');
assert.match(css,/@media \(max-width:430px\)[\s\S]*live-action-grid button/,'mobile action sizing missing');

console.log('Version 32 unified palette-matched live scoring tests passed');
