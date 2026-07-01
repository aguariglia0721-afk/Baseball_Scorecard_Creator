const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const buttonTags = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(match => ({
  attrs: match[1],
  body: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}));
assert.equal(buttonTags.length, 88, 'Version 33 must retain the complete 88-button static interface');

for (const button of buttonTags) {
  const type = button.attrs.match(/\btype="([^"]+)"/)?.[1];
  assert.ok(type, `every button must declare an explicit type: ${button.body}`);
  assert.ok(['button', 'submit'].includes(type), `unsupported button type ${type}: ${button.body}`);
}

const ids = [...html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 68, 'Version 33 must retain all 68 named buttons');
assert.equal(new Set(ids).size, ids.length, 'button ids must remain unique');

const expectedIds = [
  'plateAppearancesViewBtn','currentScorecardViewBtn','saveGameFileBtn','exportExcelBtn','printPdfBtn','refreshGamesBtn','lookupGameBtn','clearForManualBtn','saveNowBtn','restoreAutosaveBtn',
  'ballBtn','swingStrikeBtn','calledStrikeBtn','foulBtn','inPlayBtn','undoPitchBtn','resetCountBtn',
  'recordErrorQuickBtn','runnerEventBtn','challengeQuickBtn','toggleQuickResultsBtn','undoBtn','manualHalfBtn','resetScoringBtn','downloadPitchLogBtn',
  'exportExcelBtn2','printPdfBtn2','downloadBlankPdfBtn','downloadBlankBtn','saveGameFileBtn2','installBtn',
  'closeFieldLocationDialogBtn','cancelFieldLocationBtn','undoFieldingSequenceBtn','clearFieldingSequenceBtn','useFieldingSequenceBtn','chooseFieldLocationBtn','closePlayDialogBtn','closeRunnerEventDialogBtn','deleteRunnerEventBtn','cancelRunnerEventBtn','saveRunnerEventBtn','keyPlayBtn','recordErrorBtn','recordInterferenceBtn','closeErrorPanelBtn','closeInterferencePanelBtn','addSecondErrorBtn','deletePlayBtn',
  'cancelPlayBtn','savePlayBtn','closeSubstitutionDialogBtn','cancelSubstitutionBtn','closeChallengeDialogBtn',
  'deleteChallengeBtn','cancelChallengeBtn','saveChallengeBtn','closeManagerReplayDialogBtn','deleteManagerReplayBtn','cancelManagerReplayBtn','saveManagerReplayBtn','closeCustomPitcherDialogBtn','cancelCustomPitcherBtn',
  'blankPdfWithGuidesBtn','blankPdfCleanBtn','closePostExportDialogBtn','keepGameOpenBtn','clearAfterExportBtn'
];
assert.deepEqual(ids.sort(), expectedIds.sort(), 'named button inventory changed unexpectedly');

const directClickIds = [
  'plateAppearancesViewBtn','currentScorecardViewBtn','refreshGamesBtn','lookupGameBtn','clearForManualBtn','ballBtn','swingStrikeBtn','calledStrikeBtn','foulBtn',
  'inPlayBtn','undoPitchBtn','resetCountBtn','saveNowBtn','restoreAutosaveBtn','recordErrorQuickBtn','runnerEventBtn','challengeQuickBtn','toggleQuickResultsBtn','undoBtn','manualHalfBtn',
  'resetScoringBtn','downloadPitchLogBtn','closeFieldLocationDialogBtn','cancelFieldLocationBtn','undoFieldingSequenceBtn','clearFieldingSequenceBtn','useFieldingSequenceBtn','chooseFieldLocationBtn','downloadBlankPdfBtn','downloadBlankBtn','installBtn','closePlayDialogBtn','closeRunnerEventDialogBtn','deleteRunnerEventBtn','cancelRunnerEventBtn',
  'keyPlayBtn','recordErrorBtn','recordInterferenceBtn','closeErrorPanelBtn','closeInterferencePanelBtn','addSecondErrorBtn','deletePlayBtn','cancelPlayBtn',
  'closeSubstitutionDialogBtn','cancelSubstitutionBtn','closeChallengeDialogBtn','deleteChallengeBtn',
  'cancelChallengeBtn','closeManagerReplayDialogBtn','deleteManagerReplayBtn','cancelManagerReplayBtn','closeCustomPitcherDialogBtn','cancelCustomPitcherBtn','blankPdfWithGuidesBtn',
  'blankPdfCleanBtn','clearAfterExportBtn'
];
for (const id of directClickIds) {
  assert.match(app, new RegExp(`\\$\\("${id}"\\)\\.addEventListener\\("click"`), `${id} must have a direct click handler`);
}

for (const id of ['saveGameFileBtn','saveGameFileBtn2']) {
  assert.match(app, /\["saveGameFileBtn","saveGameFileBtn2"\]\.forEach\(id=>\$\(id\)\.addEventListener\("click",saveGameFile\)\)/, `${id} must use saveGameFile`);
}
for (const id of ['exportExcelBtn','exportExcelBtn2']) {
  assert.match(app, /\["exportExcelBtn","exportExcelBtn2"\]\.forEach\(id=>\$\(id\)\.addEventListener\("click",exportExcel\)\)/, `${id} must use exportExcel`);
}
for (const id of ['printPdfBtn','printPdfBtn2']) {
  assert.match(app, /\["printPdfBtn","printPdfBtn2"\]\.forEach\(id=>\$\(id\)\.addEventListener\("click",exportClassicPdf\)\)/, `${id} must use exportClassicPdf`);
}

assert.match(app, /\$\("playForm"\)\.addEventListener\("submit",recordPlay\)/, 'Save Play must submit through recordPlay');
assert.match(app, /\$\("runnerEventForm"\)\.addEventListener\("submit",saveRunnerEvent\)/, 'Save Runner Event must submit through saveRunnerEvent');
assert.match(app, /\$\("substitutionForm"\)\.addEventListener\("submit",saveSubstitution\)/, 'Confirm Substitution must submit through saveSubstitution');
assert.match(app, /\$\("challengeForm"\)\.addEventListener\("submit",saveChallenge\)/, 'Save Challenge must submit through saveChallenge');
assert.match(app, /\$\("managerReplayForm"\)\.addEventListener\("submit",saveManagerReplay\)/, 'Save Manager Replay must submit through saveManagerReplay');
assert.match(app, /\$\("customPitcherForm"\)\.addEventListener\("submit",saveCustomPitcher\)/, 'Add Pitcher must submit through saveCustomPitcher');

assert.match(app, /document\.querySelectorAll\("\.step"\).*addEventListener\("click"/, 'all seven section-navigation buttons must be delegated');
assert.match(app, /document\.querySelectorAll\("\.next-panel"\).*addEventListener\("click"/, 'all three Next buttons must be delegated');
assert.match(app, /\$\("quickResultGrid"\)\.addEventListener\("click"/, 'all twenty generated Quick Code buttons must be delegated');
assert.match(app, /\$\("fieldLocationGrid"\)\.addEventListener\("click"/, 'all nine generated field-map buttons must be delegated');
assert.match(app, /\$\("strikeoutChooser"\)\.addEventListener\("click"/, 'both third-strike decision buttons must be delegated');
assert.match(app, /document\.querySelector\("\.abs-challenge-card"\)\.addEventListener\("click"/, 'challenge tokens, record buttons, and Edit buttons must be delegated');
assert.match(app, /\$\("errorAssignmentRows"\)\.addEventListener\("click"/, 'dynamic Remove Error buttons must be delegated');
assert.match(app, /\["away","home"\]\.forEach\(team=>\$\(`\$\{team\}PitchingChangeSelect`\)\.addEventListener\("change"/, 'both Add Pitcher controls must be wired');

assert.match(html, /<form method="dialog">[\s\S]*id="blankPdfWithGuidesBtn"[\s\S]*id="blankPdfCleanBtn"[\s\S]*value="cancel" type="submit">Cancel<\/button>/, 'blank PDF close and cancel buttons must use native dialog behavior');
assert.match(html, /id="closePostExportDialogBtn"[\s\S]*type="submit"/, 'post-export close X must close the dialog');
assert.match(html, /id="keepGameOpenBtn"[\s\S]*type="submit"/, 'Keep Game Open must close the dialog without clearing');
assert.match(app, /\$\("clearAfterExportBtn"\)\.addEventListener\("click",clearAfterExport\)/, 'Clear Card must require its dedicated confirmation handler');

const quickOutcomes = [...app.matchAll(/\["(1B|2B|3B|HR|BB|HBP|K|KL|GO|FO|LO|PO|ROE|FC|SF|SH|DP|IBB|INT|OTHER)",/g)].map(match => match[1]);
assert.equal(new Set(quickOutcomes).size, 20, 'all twenty Quick Code outcomes must remain available');
assert.match(app, /data-record-challenge="\$\{team\}"/g, 'challenge token buttons must be generated for both teams');
assert.match(app, /class="danger compact remove-error-button"/, 'dynamic Remove Error button must still be generated');
assert.match(app, /data-edit-challenge="\$\{event\.id\}"/, 'dynamic Edit Challenge button must still be generated');

console.log('Version 32 comprehensive button inventory and wiring audit passed');
