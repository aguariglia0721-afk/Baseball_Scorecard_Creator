const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const ids = [...html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);

const buttonTags = [...html.matchAll(/<button\b([^>]*)>/g)].map(m => m[1]);
for (const attrs of buttonTags) {
  const typeMatch = attrs.match(/\btype="([^"]+)"/);
  assert.ok(typeMatch, `every button must declare an explicit type: <button${attrs}>`);
  assert.ok(['button','submit'].includes(typeMatch[1]), `button type must be button or submit: ${typeMatch[1]}`);
}
assert.match(html, /data-terminal-outcome="D3K"/, 'third-strike-not-caught correction button must exist');
assert.match(html, /data-terminal-outcome="dismiss"/, 'caught/keep-strikeout confirmation button must exist');

const explicitlyWired = [
  'saveGameFileBtn','exportExcelBtn','printPdfBtn','refreshGamesBtn','lookupGameBtn','clearForManualBtn',
  'ballBtn','swingStrikeBtn','calledStrikeBtn','foulBtn','inPlayBtn','undoPitchBtn','resetCountBtn',
  'toggleQuickResultsBtn','undoBtn','manualHalfBtn','resetScoringBtn','downloadPitchLogBtn','exportExcelBtn2',
  'printPdfBtn2','downloadBlankBtn','saveGameFileBtn2','installBtn','closePlayDialogBtn','cancelPlayBtn',
  'deletePlayBtn','savePlayBtn'
];
for (const id of explicitlyWired) assert.ok(ids.includes(id), `${id} must exist`);
for (const id of explicitlyWired.filter(id => id !== 'savePlayBtn')) {
  assert.match(app, new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${id} must be referenced by app logic`);
}
assert.match(app, /\$\("closePlayDialogBtn"\)\.addEventListener\("click"/, 'close X must close without submitting');
assert.match(app, /\$\("cancelPlayBtn"\)\.addEventListener\("click"/, 'Cancel must close without submitting');
assert.match(app, /document\.querySelectorAll\("\.step"\).*addEventListener/, 'all navigation step buttons must be delegated');
assert.match(app, /document\.querySelectorAll\("\.next-panel"\).*addEventListener/, 'all next buttons must be delegated');
assert.match(app, /\$\("quickResultGrid"\)\.addEventListener/, 'all generated quick-result buttons must be delegated');
assert.match(app, /\$\("strikeoutChooser"\)\.addEventListener/, 'all third-strike correction buttons must be delegated');
assert.match(app, /\$\("playForm"\)\.addEventListener\("submit",recordPlay\)/, 'Save Play must submit through recordPlay');
console.log('button wiring tests passed');
