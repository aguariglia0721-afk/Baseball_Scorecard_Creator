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
assert.match(app,/label:"Version 29"/,'Version 29 autosaves must migrate forward');

for(const id of ['interferencePanel','interferenceType','interferencePerson','interferenceRuling','interferenceEndsPa','interferenceAtBat','interferenceHit','interferenceDetails','recordInterferenceBtn','closeInterferencePanelBtn']){
  assert(html.includes(`id="${id}"`),`missing Version 32 interference control ${id}`);
}
for(const type of ['batter','runner','offensive-team','catcher','umpire-batted','umpire-catcher','spectator','authorized-person','other']){
  assert(app.includes(`id:"${type}"`),`missing interference type ${type}`);
}
for(const fn of ['interferenceTypeRecord','interferenceCode','interferenceDetailsText','showInterferencePanel','applyInterferenceDefaults','toggleInterferencePanel']){
  assert(app.includes(`function ${fn}`),`missing ${fn}`);
}
assert.match(app,/\{id:"INT", label:"Interference", code:"INT", ab:false\}/);
assert.match(app,/\["INT","Interference"\]/,'Interference must be available in Quick Results');
assert.match(app,/\["INT","CI"\]\.includes\(outcome\)/,'result dropdown must open the interference panel');
assert.match(app,/countsAsPlateAppearance:interferenceActive/,'interference must preserve whether the plate appearance ended');
assert.match(app,/if\(play\.countsAsPlateAppearance!==false\)after\.battingIndexes/,'non-PA interference must not advance the batting order');
assert.match(app,/if\(!existing&&incoming\.countsAsPlateAppearance!==false\)scoring\.count=initialCount\(\)/,'non-PA interference must preserve the live count');
assert.match(app,/hitOverride/,'interference hit credit override missing');
assert.match(app,/abOverride/,'interference at-bat override missing');
assert.match(app,/interferenceDetailsText\(play\)/,'interference must flow into Game Notes');
assert.match(app,/\$\("recordInterferenceBtn"\)\.addEventListener\("click",toggleInterferencePanel\)/);
assert.match(app,/\$\("interferenceType"\)\.addEventListener\("change"/);
assert.match(css,/Version 32 interference workflow/);
assert.match(css,/\.interference-panel\{/);
assert.match(css,/\.checkbox-field\{/);
console.log('Version 32 comprehensive interference workflow tests passed');
