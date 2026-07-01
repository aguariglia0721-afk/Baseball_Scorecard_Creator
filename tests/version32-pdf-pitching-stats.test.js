const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const app=fs.readFileSync('app.js','utf8');
assert.match(app,/function scorecardPitchingLinesForTeam\(/,'PDF pitching-line mapper must exist');
assert.match(app,/statStart=240\.8,statWidth=46\.3/,'PDF must use the expanded full-width IP, H, R, ER, BB, K, HBP, and WP columns');
assert.match(app,/columns\.forEach\(\(value,index\)=>classicPdfText/,'PDF must render each calculated pitching statistic');
assert.match(app,/responsiblePitcherKey:play\.pitcherKey/,'base runners must retain pitcher responsibility for later run attribution');
assert.match(app,/earnedRun:pitcherEarnedRunEligibility\(play\)/,'runner earned-run eligibility must be retained');

const start=app.indexOf('function emptyPitcherStats(');
const end=app.indexOf('function pitcherStatsTable(',start);
assert(start>=0&&end>start,'pitcher-stat helper block missing');

const pitchers=[
  {num:'35',name:'Sean Starter',throws:'RHP',record:'7-3',era:'3.02',k:'91'},
  {num:'47',name:'Robert Reliever',throws:'LHP',record:'3-1',era:'1.88',k:'52'}
];
const scoring={
  pitchLog:[],
  plays:[
    {
      team:'home',pitchingTeam:'away',pitcherKey:'away:0:Sean Starter',pitcherRow:0,pitcher:'Sean Starter',pitcherNumber:'35',
      outcome:'1B',outsOnPlay:0,runs:0,countsAsPlateAppearance:true,afterGameEnd:false,
      beforeState:{bases:{1:null,2:null,3:null}},destinations:{batter:'1',r1:'empty',r2:'empty',r3:'empty'}
    },
    {
      team:'home',pitchingTeam:'away',pitcherKey:'away:1:Robert Reliever',pitcherRow:1,pitcher:'Robert Reliever',pitcherNumber:'47',
      outcome:'2B',outsOnPlay:0,runs:1,countsAsPlateAppearance:true,afterGameEnd:false,
      beforeState:{bases:{1:{name:'Runner',responsiblePitcherKey:'away:0:Sean Starter',responsiblePitcherRow:0,responsiblePitcherName:'Sean Starter',responsiblePitcherNumber:'35',earnedRun:true},2:null,3:null}},
      destinations:{batter:'2',r1:'home',r2:'empty',r3:'empty'}
    },
    {
      team:'home',pitchingTeam:'away',pitcherKey:'away:1:Robert Reliever',pitcherRow:1,pitcher:'Robert Reliever',pitcherNumber:'47',
      outcome:'K',outsOnPlay:1,runs:0,countsAsPlateAppearance:true,afterGameEnd:false,
      beforeState:{bases:{1:null,2:null,3:null}},destinations:{batter:'out',r1:'empty',r2:'empty',r3:'empty'}
    }
  ]
};
const ctx={
  scoring,
  ensureScoringState:()=>{},
  collectData:()=>({away:{pitchers},home:{pitchers:[]}}),
  num:v=>Number(v)||0,
  defensiveTeamForBattingTeam:team=>team==='away'?'home':'away',
  pitcherKey:(team,row,name='')=>`${team}:${row}:${name}`,
  pitcherInfoFromRow:(team,row)=>({team,row,key:`${team}:${row}:${pitchers[row].name}`,name:pitchers[row].name,number:pitchers[row].num,throws:pitchers[row].throws}),
  resolvePitcherInfo:(team,name)=>{const row=pitchers.findIndex(p=>p.name===name);return {team,row,key:`${team}:${row}:${name}`,name,number:row>=0?pitchers[row].num:'',throws:''};},
  PITCH_TYPE_INFO:{},
  OUTCOME_MAP:{'1B':{hit:1},'2B':{hit:1},K:{hit:0,k:1}},
  pitcherRosterKey:p=>[String(p?.num||'').replace(/^#/,''),String(p?.name||'').trim().toLowerCase()].join('|'),
  scorecardPitchersForTeam:()=>pitchers
};
vm.createContext(ctx);
vm.runInContext(`${app.slice(start,end)}this.computePitcherTracking=computePitcherTracking;this.scorecardPitchingLinesForTeam=scorecardPitchingLinesForTeam;this.formatInningsPitched=formatInningsPitched;this.stampAutomaticRunnerPitcher=stampAutomaticRunnerPitcher;`,ctx);

assert.equal(ctx.formatInningsPitched(0),'0.0');
assert.equal(ctx.formatInningsPitched(1),'0.1');
assert.equal(ctx.formatInningsPitched(2),'0.2');
assert.equal(ctx.formatInningsPitched(3),'1.0');
assert.equal(ctx.formatInningsPitched(8),'2.2');
const extraBases={1:null,2:{name:'Automatic Runner',automaticRunner:true,earnedRun:false},3:null};
ctx.stampAutomaticRunnerPitcher(extraBases,{key:'away:1:Robert Reliever',row:1,name:'Robert Reliever',number:'47'});
assert.equal(extraBases[2].responsiblePitcherKey,'away:1:Robert Reliever');
assert.equal(extraBases[2].earnedRun,false,'automatic runner remains unearned');

const tracking=ctx.computePitcherTracking();
assert.equal(tracking.away[0].hits,1,'starter should be charged with the first hit');
assert.equal(tracking.away[0].runs,1,'inherited runner must remain charged to the starter');
assert.equal(tracking.away[0].earnedRuns,1,'earned inherited runner must count as an earned run');
assert.equal(tracking.away[1].hits,1,'reliever should be charged with the second hit');
assert.equal(tracking.away[1].outsRecorded,1,'reliever should receive one out');
assert.equal(tracking.away[1].strikeouts,1,'reliever should receive the strikeout');
assert.equal(tracking.away[1].runs,0,'reliever must not be charged for the inherited runner');

const lines=ctx.scorecardPitchingLinesForTeam('away');
assert.deepEqual(Array.from(lines[0].columns),['0.0',1,1,1,0,0,0,0]);
assert.deepEqual(Array.from(lines[1].columns),['0.1',1,0,0,0,1,0,0]);

console.log('Version 32 PDF pitching-stat population tests passed.');
