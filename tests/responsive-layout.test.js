const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

assert.match(html, /class="hero-copy"/, 'header text must have a responsive wrapper');
assert.match(css, /aspect-ratio:582\/900/, 'crest frame must use the portrait artwork proportion');
assert.match(css, /object-position:center center/, 'crest must be centered inside its frame');
assert.match(css, /html,body\{overflow-x:clip\}/, 'page-level horizontal overflow must be clipped without breaking sticky mobile controls');
assert.match(css, /@media \(max-width:760px\)[\s\S]*\.lineup-row,\.pitcher-row\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,
  'lineup and pitching rows must become responsive cards on phones');
assert.match(css, /@media \(max-width:360px\)[\s\S]*\.lineup-row,\.pitcher-row\{grid-template-columns:1fr\}/,
  'very narrow phones must use one-column entry cards');
assert.match(css, /env\(safe-area-inset-bottom\)/, 'iPhone safe-area support must be present');
assert.match(css, /max-height:94dvh/, 'dialog must use dynamic viewport height');
assert.match(app, /class="mini-field name-field"/, 'generated lineup and pitching controls must include responsive labels');
assert.match(html, /styles\.css\?v=34-pa-sync-r6/, 'responsive stylesheet must be cache-busted');
assert.match(app, /service-worker\.js\?v=34-pa-sync-r6/, 'service worker registration must be cache-busted');


assert.match(html, /class="entry-card lookup-card"/, 'scheduled game card must be a responsive container');
assert.match(css, /Version 20 reduced-window schedule control fix/, 'reduced-window schedule controls fix must be present');
assert.match(css, /grid-template-areas:\"date level\" \"refresh refresh\"/, 'refresh button must move to its own full-width row in constrained cards');
assert.match(css, /@container \(min-width:700px\)/, 'three-column schedule controls must only activate when the card itself is wide enough');
assert.match(css, /\.lookup-card #refreshGamesBtn\{[\s\S]*max-width:100%[\s\S]*min-width:0/, 'refresh button must stay inside the schedule card');

console.log('responsive layout tests passed');
