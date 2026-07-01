const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.match(app, /type==="ball"&&count\.balls>=4[\s\S]*recordQuickOutcome\("BB",true,true\)/, 'four balls must automatically record a walk');
assert.match(app, /else if\(type==="foul"&&count\.strikes<2\)count\.strikes\+\+/, 'ordinary foul balls must not create strike three');
assert.match(app, /const outcomeId=type==="calledStrike"\?"KL":"K"/, 'called strike three must become looking K and swinging strike three must become swinging K');
assert.match(app, /const batterMayRun=!before\[1\]\|\|outsBefore>=2/, 'uncaught-third-strike eligibility must follow first-base/two-out rule');
assert.match(app, /if\(!batterMayRun\)\{d\.batter="out";d\.outs=1;\}/, 'ineligible batter must be out on uncaught third strike');
assert.match(app, /if\(before\[1\]\)\{d\.r1="2"/, 'with two outs and first occupied, safe forced advancement must be representable');
assert.match(app, /Under MLB rules, a half-inning normally ends after three outs/, 'manual half-inning override must warn about the three-out rule');
assert.match(html, /Third Strike Not Caught/, 'the app must use the MLB-accurate uncaught-third-strike wording');
assert.match(html, /The normal swinging or looking strikeout was recorded automatically/, 'normal strikeouts must be automatic while preserving the exception workflow');
console.log('MLB rules alignment tests passed');
