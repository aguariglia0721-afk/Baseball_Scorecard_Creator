const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

for(const id of ['runnerEventBtn','runnerEventDialog','runnerEventForm','runnerEventType','runnerEventResult','runnerEventPrimaryBase','runnerEventPitcher','runnerEventInning','runnerEventHalf','runnerEventRuns','runnerEventOuts','runnerEventRunner1Destination','runnerEventRunner2Destination','runnerEventRunner3Destination','runnerEventNotes','runnerEventLog','runnerEventSummary','droppedThirdStrikePanel','droppedThirdStrikeCause']){
  assert(html.includes(`id="${id}"`),`missing runner-event control ${id}`);
}
for(const type of ['steal','pickoff','wild-pitch','passed-ball','defensive-indifference']){
  assert(app.includes(`["${type}"`),`missing runner-event type ${type}`);
}
assert.match(app,/countsAsPlateAppearance:false/,'runner events must preserve the plate appearance');
assert.match(app,/if\(play\.countsAsPlateAppearance!==false\)state\.battingIndexes/,'runner events must not change the current batter');
assert.match(app,/if\(!existing&&incoming\.countsAsPlateAppearance!==false\)scoring\.count=initialCount\(\)/,'runner events must preserve the live count');
assert.match(app,/runnerEvent\.result==="stolen-base"\)st\.sb\+\+/,'stolen bases must populate batter statistics');
assert.match(app,/runnerEvent\.result==="caught-stealing"\)st\.cs\+\+/,'caught stealing must populate batter statistics');
assert.match(app,/s\.wildPitches\+\+/,'wild pitches must populate pitcher statistics');
assert.match(app,/s\.pickoffAttempts\+\+/,'pickoff attempts must be counted');
assert.match(app,/s\.pickoffs\+\+/,'successful pickoffs must be counted');
assert.match(app,/play\.runnerEvent\?\.type!=="passed-ball"&&play\.droppedThirdStrikeCause!=="passed-ball"/,'passed-ball runs, including an uncaught third strike, must not be credited as earned solely because of the passed ball');
assert.match(app,/play\.outcome==="D3K"&&play\.droppedThirdStrikeCause==="wild-pitch"/,'uncaught-third-strike wild pitches must populate pitcher statistics');
assert.match(app,/fieldingTeam===team/,'WP, PB, and pickoff totals must be attributed to the fielding team');
assert.match(app,/runnerEvents\?`Runner Events:/,'runner events must flow into Game Notes and exports');
assert.match(app,/setXmlCell\(doc,"I34","WP"\)/,'Excel must label the wild-pitch column');
assert.match(app,/headers=\["Pitcher \/ No\.","IP","H","R","ER","BB","K","HBP","WP"\]/,'PDF must retain only the required expanded pitching columns, including WP');
assert.match(app,/redrawExpandedPitchingArea/,'blank and completed PDFs must draw the expanded pitching headers');
assert.match(css,/Version 32 runner-event tracking/,'runner-event mobile styling must be present');

const start=app.indexOf('function emptyPitcherStats(');
const end=app.indexOf('function pitcherStatsTable(',start);
assert(start>=0&&end>start,'pitcher helper block missing');
const pitchers=[{num:'11',name:'Starter',throws:'RHP'},{num:'22',name:'Reliever',throws:'LHP'}];
const scoring={pitchLog:[],plays:[
  {team:'home',pitchingTeam:'away',pitcherKey:'away:0:Starter',pitcherRow:0,pitcher:'Starter',pitcherNumber:'11',outcome:'1B',outsOnPlay:0,runs:0,countsAsPlateAppearance:true,afterGameEnd:false,beforeState:{bases:{1:null,2:null,3:null}},destinations:{batter:'1',r1:'empty',r2:'empty',r3:'empty'}},
  {eventType:'runner',runnerEvent:{type:'wild-pitch',result:'advance',primaryBase:1,toBase:'2'},team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'WP',outsOnPlay:0,runs:0,countsAsPlateAppearance:false,afterGameEnd:false,beforeState:{bases:{1:{name:'Runner',responsiblePitcherKey:'away:0:Starter',responsiblePitcherRow:0,responsiblePitcherName:'Starter',responsiblePitcherNumber:'11',earnedRun:true},2:null,3:null}},destinations:{batter:'out',r1:'2',r2:'empty',r3:'empty'}},
  {eventType:'runner',runnerEvent:{type:'passed-ball',result:'advance',primaryBase:3,toBase:'home'},team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'PB',outsOnPlay:0,runs:1,countsAsPlateAppearance:false,afterGameEnd:false,beforeState:{bases:{1:null,2:null,3:{name:'Runner',responsiblePitcherKey:'away:0:Starter',responsiblePitcherRow:0,responsiblePitcherName:'Starter',responsiblePitcherNumber:'11',earnedRun:true}}},destinations:{batter:'out',r1:'empty',r2:'empty',r3:'home'}},
  {eventType:'runner',runnerEvent:{type:'pickoff',result:'safe',primaryBase:1,toBase:'hold'},team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'PK',outsOnPlay:0,runs:0,countsAsPlateAppearance:false,afterGameEnd:false,beforeState:{bases:{1:{name:'Runner'},2:null,3:null}},destinations:{batter:'out',r1:'hold',r2:'empty',r3:'empty'}},
  {eventType:'runner',runnerEvent:{type:'pickoff',result:'picked-off',primaryBase:1,toBase:'out'},team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'PO',outsOnPlay:1,runs:0,countsAsPlateAppearance:false,afterGameEnd:false,beforeState:{bases:{1:{name:'Runner'},2:null,3:null}},destinations:{batter:'out',r1:'out',r2:'empty',r3:'empty'}},
  {team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'D3K',droppedThirdStrikeCause:'wild-pitch',outsOnPlay:0,runs:0,countsAsPlateAppearance:true,afterGameEnd:false,beforeState:{bases:{1:null,2:null,3:null}},destinations:{batter:'1',r1:'empty',r2:'empty',r3:'empty'}},
  {team:'home',pitchingTeam:'away',pitcherKey:'away:1:Reliever',pitcherRow:1,pitcher:'Reliever',pitcherNumber:'22',outcome:'D3K',droppedThirdStrikeCause:'passed-ball',outsOnPlay:0,runs:1,countsAsPlateAppearance:true,afterGameEnd:false,beforeState:{bases:{1:null,2:null,3:{name:'Runner',responsiblePitcherKey:'away:0:Starter',responsiblePitcherRow:0,responsiblePitcherName:'Starter',responsiblePitcherNumber:'11',earnedRun:true}}},destinations:{batter:'1',r1:'empty',r2:'empty',r3:'home'}}
]};
const ctx={
  scoring,
  ensureScoringState:()=>{},
  collectData:()=>({away:{pitchers},home:{pitchers:[]}}),
  num:v=>Number(v)||0,
  defensiveTeamForBattingTeam:team=>team==='away'?'home':'away',
  pitcherKey:(team,row,name='')=>`${team}:${row}:${name}`,
  pitcherInfoFromRow:(team,row)=>({team,row,key:`${team}:${row}:${pitchers[row].name}`,name:pitchers[row].name,number:pitchers[row].num,throws:pitchers[row].throws}),
  resolvePitcherInfo:(team,name)=>{const row=pitchers.findIndex(p=>p.name===name);return {team,row,key:`${team}:${row}:${name}`,name,number:row>=0?pitchers[row].num:'',throws:''};},
  PITCH_TYPE_INFO:{},OUTCOME_MAP:{'1B':{hit:1}},
  pitcherRosterKey:p=>[String(p?.num||'').replace(/^#/,''),String(p?.name||'').trim().toLowerCase()].join('|'),
  scorecardPitchersForTeam:()=>pitchers
};
vm.createContext(ctx);
vm.runInContext(`${app.slice(start,end)}this.computePitcherTracking=computePitcherTracking;this.scorecardPitchingLinesForTeam=scorecardPitchingLinesForTeam;`,ctx);
const tracking=ctx.computePitcherTracking();
assert.equal(tracking.away[1].wildPitches,2,'reliever must receive the runner-event and uncaught-third-strike wild pitches');
assert.equal(tracking.away[1].pickoffAttempts,2,'reliever must receive both pickoff attempts');
assert.equal(tracking.away[1].pickoffs,1,'reliever must receive one successful pickoff');
assert.equal(tracking.away[0].runs,2,'passed-ball runners remain charged to the responsible pitcher');
assert.equal(tracking.away[0].earnedRuns,0,'passed-ball run must be unearned in this scoring event');
const lines=ctx.scorecardPitchingLinesForTeam('away');
assert.equal(lines[1].columns[7],2,'PDF/Excel WP column must receive all reliever wild-pitch totals');

console.log('Version 32 runner-event and WP-column tests passed.');
