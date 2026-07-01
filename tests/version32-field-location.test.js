const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.match(html, /id="fieldLocationDialog"[\s\S]*id="fieldLocationGrid"/, 'a dedicated field-location popup must exist');
assert.match(html, /id="fieldingSequenceTray"[\s\S]*id="useFieldingSequenceBtn"/, 'the popup must build and confirm a full ball path');
assert.match(html, /id="playFieldingSequence"[\s\S]*id="playFieldingSequenceDisplay"/, 'the detailed play form must retain and edit the full fielding sequence');

for (const [number, code, label] of [
  ['1','P','Pitcher'],['2','C','Catcher'],['3','1B','First Base'],['4','2B','Second Base'],
  ['5','3B','Third Base'],['6','SS','Shortstop'],['7','LF','Left Field'],['8','CF','Center Field'],['9','RF','Right Field']
]) {
  assert.match(app, new RegExp(`number:"${number}",code:"${code}",label:"${label}"`), `position ${number} must map to ${label}`);
}

assert.match(app, /const BATTED_BALL_OUTCOMES = new Set\(\["1B","2B","3B","ROE","FC","GO","FO","LO","PO","SF","SH","DP","TP"\]\)/,
  'fielded balls must use the field map while home runs bypass it');
assert.match(app, /if\(outcomeId==="HR"\)return recordQuickOutcome\(outcomeId,forceDirect,skipPitchPreparation,"",""\)/,
  'home runs must record without opening the field map');
assert.match(app, /pendingFieldingSequence\.push\(selected\);renderPendingFieldingSequence\(\)/,
  'each field tap must append the next fielder in the ball path');
assert.match(app, /fieldingSequence=sequence\.join\("-"\)/,
  'confirmed paths must be stored in standard hyphenated notation');
assert.match(app, /fieldLocation,fieldingSequence,pitcher:/,
  'the play record must store both backward-compatible primary location and full sequence');
assert.match(app, /normalizeFieldingSequence\(incoming\.fieldingSequence,incoming\.fieldLocation\)\.length/,
  'manual and edited fielded-ball plays must reject a missing path');
assert.match(app, /path=Array\.isArray\(play\.fieldingSequence\)[\s\S]*locationSuffix=play\.outcome==="HR"\?"":path\.join\("-"\)/,
  'scorecard, Excel, and PDF notation must use the full defensive sequence and omit it for a home run');
assert.match(app, /Ball path: \$\{fieldingSequenceLabel\(p\.fieldingSequence,p\.fieldLocation\)\}/,
  'the play log must spell out the complete selected path');
assert.match(app, /openFieldLocationDialog\("ROE"[\s\S]*showError:true/, 'Record Error must also request a fielding path');
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, 'the installed app cache must refresh');
assert.match(html, /styles\.css\?v=34-pa-sync-r6[\s\S]*app\.js\?v=34-pa-sync-r6/, 'updated assets must be cache-busted');
assert.match(css, /\.field-ball-path/, 'the popup must draw the selected path on the field');
assert.match(css, /\.fielding-sequence-tray/, 'the popup must display its ordered sequence');
assert.match(app, /class="field-location-button field-pos-\$\{position\.number\}"/, 'each field-location button must remain positioned on the baseball field');

console.log('Version 33 follow-the-ball field-location tests passed');
