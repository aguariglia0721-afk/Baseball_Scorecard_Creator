const fs=require('fs');
const path=require('path');
const assert=require('assert');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const pkg=require(path.join(root,'package.json'));

function functionBody(name){
  const start=app.indexOf(`function ${name}(`);assert(start>=0,`${name} is missing`);
  const brace=app.indexOf('{',start);let depth=0;
  for(let i=brace;i<app.length;i++){
    if(app[i]==='{')depth++;
    else if(app[i]==='}'&&--depth===0)return app.slice(start,i+1);
  }
  throw new Error(`Could not parse ${name}`);
}

assert.equal(pkg.version,'34.0.1');
assert.match(html,/Version 34/);
assert.match(worker,/guariglia-scorecard-v34-pa-sync-r6/);
assert.match(app,/const VERSION_NUMBER = 34;/);
assert.match(app,/label:"Version 33"[\s\S]*guariglia-scorecard-v33-autosave-current/,'Version 34 must migrate the approved Version 33 autosave');
assert.match(app,/function redrawExpandedPitchingArea\(/);
assert.match(app,/fullWidth=610\.4/,'pitching area must use the page width');
assert.match(app,/headers=\["Pitcher \/ No\.","IP","H","R","ER","BB","K","HBP","WP"\]/,'only the required pitching columns should remain');
assert.match(app,/for\(let row=0;row<6;row\+\+\)/,'six pitcher rows per team must remain');
assert.match(app,/function redrawPdfReviewArea\(/);
assert.match(app,/REPLAY \/ ABS STATUS/,'page one must have a readable review heading');
assert.match(app,/Replay \$\{replay\.available\}\/\$\{replay\.allotment\} \| ABS \$\{abs\.available\} left/,'page one must state availability rather than unexplained boxes');
assert.match(app,/pages=\[classicPdfOverlay\(1\),classicPdfNotesPage\(1,false\)\]/,'page two must always be the notes/review side');
assert.match(app,/if\(maxInning>=11\)pages\.push\(classicPdfOverlay\(11\),classicPdfNotesPage\(11,false\)\)/,'continuation scorecards must also remain duplex paired');
assert.match(app,/buildClassicPdfBytes\(image,\[classicPdfBlankOverlay\(\),classicPdfNotesPage\(1,true\)\]\)/,'blank PDFs must also contain two duplex pages');
const overlay=functionBody('classicPdfOverlay');
assert.doesNotMatch(overlay,/classicPdfNotes\(/,'Game Notes must not be drawn on page one');
assert.doesNotMatch(overlay,/x:432,top:611/,'the former lower-right notes box must not remain in page one logic');
assert.match(functionBody('classicPdfNotesPage'),/Game Notes & Events/);
assert.match(functionBody('classicPdfNotesPage'),/Replay and ABS Review Summary/);
assert.match(functionBody('classicPdfNotesPage'),/Review Decision Log/);
assert.doesNotMatch(functionBody('classicPdfNotesPage'),/Game Event Notes/,'the second standalone notes area must be removed');
assert.match(functionBody('classicPdfNotesPage'),/Recorded Game Events/,'game-event content must be retained inside the unified notes section');
assert.match(functionBody('classicPdfNotesPage'),/height:398/,'the unified notes section must use the combined vertical space');
assert.match(functionBody('classicPdfNotesPage'),/flip on the long edge/);
assert.match(app,/function classicPdfLineupCell\(/,'PDF lineup cells must use dedicated substitution-safe rendering');
assert.match(functionBody('classicPdfLineupCell'),/occupants.length===2/,'a single substitute must receive a separate line');
assert.match(functionBody('classicPdfLineupCell'),/re W n/,'lineup text must be clipped to the Player \/ No. column');
assert.match(app,/function classicPdfText\([^\n]+classicPdfEllipsize/,'overlong PDF text must ellipsize instead of bleeding into adjacent columns');
assert.doesNotMatch(overlay,/lineupOccupants\(team,r\)\.map\(formatLineupPlayer\)\.join\(" \/ "\)/,'substitutes must not be forced onto one shrinking line');
assert.match(functionBody('classicPdfSanitize'),/\\u2605\\u2606\\u2B50/,'unsupported star symbols must map to an ASCII asterisk');
assert.match(functionBody('appearanceNoteLine'),/\* KEY PLAY - /,'Game Notes must use an ASCII asterisk for key plays');
assert.match(app,/function classicPdfVerticalRule\(/,'PDF generator must support vertical substitution dividers');
assert.match(app,/function classicPdfSubstitutionBoundaries\(/,'PDF generator must calculate substitution boundaries');
assert.match(functionBody('classicPdfSubstitutionBoundaries'),/firstIncoming/,'the first incoming-player appearance must anchor the boundary');
assert.match(functionBody('classicPdfSubstitutionBoundaries'),/const x=inningX\(slot\)/,'substitution dividers must use the leading edge of the incoming inning cell, which is the right edge of the prior box');
assert.doesNotMatch(functionBody('classicPdfSubstitutionBoundaries'),/cellWidth\*fraction|playIndex\/Math\.max/,'substitution dividers must never be placed inside an inning box');
assert.match(functionBody('classicPdfSubstitutionBoundaries'),/team==="away"&&event\.half==="bottom"\)targetInning\+=1/,'away defensive substitutions in the bottom half must advance to the next batting inning');
assert.match(overlay,/classicPdfDrawSubstitutionBoundaries\(cmd,team,r,startInning,inningX,cellTop\)/,'every lineup row must draw its substitution boundaries after scoring notation');

const boundaryContext={
  scoring:{plays:[]},
  num:value=>Number.isFinite(Number(value))?Number(value):0,
  playerIdentity:(player,team)=>`${team}:${String(player?.num||'')}:${String(player?.name||'').toLowerCase()}`,
  substitutionEvents:()=>[],
  playsByBatterInning:()=>[]
};
vm.createContext(boundaryContext);
vm.runInContext(`${functionBody('classicPdfPlayMatchesPlayer')}
${functionBody('classicPdfSubstitutionBoundaries')}
this.classicPdfSubstitutionBoundaries=classicPdfSubstitutionBoundaries;`,boundaryContext);
const inningX=slot=>196.8+(slot-1)*28.55;
const outgoing={num:'10',name:'Starter'},incoming={num:'20',name:'Substitute'};
boundaryContext.substitutionEvents=()=>[{inning:5,outgoing,incoming}];
boundaryContext.scoring.plays=[
  {id:'old',seq:1,team:'away',playerIndex:0,inning:5,playerKey:'away:10:starter'},
  {id:'new',seq:2,team:'away',playerIndex:0,inning:5,playerKey:'away:20:substitute'}
];
boundaryContext.playsByBatterInning=(team,index,inning)=>boundaryContext.scoring.plays.filter(play=>play.team===team&&play.playerIndex===index&&play.inning===inning);
const sameInning=boundaryContext.classicPdfSubstitutionBoundaries('away',0,1,inningX);
assert.equal(sameInning.length,1);
assert(Math.abs(sameInning[0]-inningX(5))<0.01,'same-inning substitution line must be drawn at the right edge of the prior inning box');

boundaryContext.substitutionEvents=()=>[{inning:6,half:'top',outgoing,incoming:{num:'30',name:'Future'}}];
boundaryContext.scoring.plays=[];
const futureTop=boundaryContext.classicPdfSubstitutionBoundaries('away',0,1,inningX);
assert(Math.abs(futureTop[0]-inningX(6))<0.01,"a substitute who has not batted must be separated at the leading edge of the recorded batting inning");

boundaryContext.substitutionEvents=()=>[{inning:8,half:'bottom',outgoing,incoming:{num:'31',name:'Defensive Replacement'}}];
const awayDefense=boundaryContext.classicPdfSubstitutionBoundaries('away',0,1,inningX);
assert(Math.abs(awayDefense[0]-inningX(9))<0.01,"an away-team defensive substitution in the bottom half must place the line before the next batting inning");

console.log('Version 34 duplex PDF layout tests passed.');
