const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(html, /id="ballCount"/, 'live ball count must be visible');
assert.match(html, /id="strikeCount"/, 'live strike count must be visible');
assert.match(html, /id="ballBtn"[\s\S]*<kbd>B<\/kbd>/, 'phone and keyboard ball control must be present');
assert.match(html, /id="swingStrikeBtn"[\s\S]*Swinging[\s\S]*Strike[\s\S]*<kbd>S<\/kbd>/, 'swinging strike control must be present');
assert.match(html, /id="calledStrikeBtn"[\s\S]*Called[\s\S]*Strike[\s\S]*<kbd>C<\/kbd>/, 'called strike control must be present');
assert.match(html, /id="foulBtn"[\s\S]*<kbd>F<\/kbd>/, 'foul control must be present');
assert.match(html, /id="inPlayBtn"[\s\S]*<kbd>I<\/kbd>/, 'in-play control must be present');
assert.match(html, /id="strikeoutChooser"/, 'third-strike correction panel must be present');
assert.match(html, /data-terminal-outcome="D3K"/, 'third-strike-not-caught option must be present');
assert.match(html, /data-terminal-outcome="dismiss"/, 'caught-third-strike confirmation must be present');
assert.match(app, /type==="ball"&&count\.balls>=4[\s\S]*recordQuickOutcome\("BB",true,true\)/, 'ball four must record a walk');
assert.match(app, /\["strike","swingingStrike","calledStrike"\]\.includes\(type\)/, 'both new strike types and legacy strikes must increment the count');
assert.match(app, /const outcomeId=type==="calledStrike"\?"KL":"K";[\s\S]*recordQuickOutcome\(outcomeId,true,true\)/, 'third strike must automatically record swinging or looking strikeout from pitch type');
assert.match(app, /pitchCount=existing\?\.pitchCount\|\|countSnapshot\(\)/, 'completed plays must retain the final count');
assert.match(app, /pitchSequence:/, 'completed plays must retain the pitch sequence');
assert.match(app, /document\.addEventListener\("keydown",handleScoringKeyboard\)/, 'keyboard shortcuts must be enabled');
assert.match(app, /const pitchKeys=\{b:"ball",s:"swingingStrike",c:"calledStrike",f:"foul",i:"inplay"\}/, 'ball, swinging strike, called strike, foul, and in-play keyboard shortcuts must be mapped');
assert.match(app, /labels=\{ball:"B",strike:"S",swingingStrike:"SW",calledStrike:"C"/, 'pitch history must distinguish swinging and called strikes while preserving legacy strike codes');
assert.match(app, /const resultKeys=\{[\s\S]*"1":"1B"[\s\S]*w:"BB"[\s\S]*k:"K"/, 'quick result keyboard shortcuts must be mapped');
assert.match(css, /\.pitch-button-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/, 'desktop pitch controls must use four columns');
assert.match(css, /\.strike-button-pair\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'the original strike control footprint must be divided into equal swinging and called halves');
assert.match(css, /@media \(max-width:760px\)[\s\S]*\.pitch-button-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'phone pitch controls must use two columns');
assert.match(html, /app\.js\?v=34-pa-sync-r6/, 'updated Version 27 app JavaScript must be cache-busted');

console.log('pitch count and quick scoring tests passed');
