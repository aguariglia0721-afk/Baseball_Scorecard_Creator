const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync('app.js','utf8');
const html = fs.readFileSync('index.html','utf8');

const start = app.indexOf('function playNotation(');
const end = app.indexOf('function playsByBatterInning(', start);
assert(start >= 0 && end > start, 'playNotation must remain extractable');
const context = { interferenceCode:()=> 'INT', errorNotation:error=>error?.code||'' };
vm.createContext(context);
vm.runInContext(`${app.slice(start,end)}this.playNotation=playNotation;`, context);

assert.equal(context.playNotation({outcome:'GO',outcomeCode:'GO',fieldingSequence:'6-3',fieldingErrors:[]}), 'GO6-3', 'shortstop-to-first groundout must follow the ball as 6-3');
assert.equal(context.playNotation({outcome:'DP',outcomeCode:'DP',fieldingSequence:'4-3-1',fieldingErrors:[]}), 'DP4-3-1', 'custom three-fielder double-play path must be preserved');
assert.equal(context.playNotation({outcome:'DP',outcomeCode:'DP',fieldingSequence:'3-6-3',fieldingErrors:[]}), 'DP3-6-3', 'repeated fielders must be allowed in a valid double-play path');
assert.equal(context.playNotation({outcome:'FO',outcomeCode:'FO',fieldingSequence:'7',fieldingErrors:[]}), 'FO7', 'one-fielder flyout must remain compact');
assert.equal(context.playNotation({outcome:'HR',outcomeCode:'HR',fieldingSequence:'8-4',fieldLocation:'8',fieldingErrors:[]}), 'HR', 'home-run notation must ignore any stale legacy field location');
assert.equal(context.playNotation({outcome:'GO',outcomeCode:'GO',fieldLocation:'6',fieldingErrors:[]}), 'GO6', 'legacy one-location plays must remain compatible');

assert.match(app, /if\(outcomeId==="HR"\)return recordQuickOutcome\(outcomeId,forceDirect,skipPitchPreparation,"",""\)/, 'home-run quick scoring must bypass the popup');
assert.match(app, /pendingFieldingSequence\.push\(selected\)/, 'field buttons must append to the current path');
assert.match(app, /pendingFieldingSequence\.pop\(\)/, 'the scorer must be able to undo the last fielder');
assert.match(app, /pendingFieldingSequence=\[\]/, 'the scorer must be able to clear the path');
assert.match(app, /FIELD_POSITION_COORDS/, 'the selected path must be drawn on the field');
assert.match(html, /Undo Last[\s\S]*Clear[\s\S]*Use Ball Path/, 'ball-path controls must be visible in the popup');

console.log('Version 33 MLB-aligned follow-the-ball tests passed');
