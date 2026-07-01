const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const app=fs.readFileSync('app.js','utf8');
assert.match(app,/function scorecardPitchersForTeam\(/);
assert.doesNotMatch(app,/all\.forEach\(add\)/,'PDF/Excel pitching export must not append unused roster pitchers');
assert.match(app,/scoring\.pitchLog/);
assert.match(app,/scoring\.plays/);
assert.match(app,/scoring\.pitcherChanges/);

const start=app.indexOf('function pitcherRosterKey(');
const end=app.indexOf('function playerIdentity(',start);
assert(start>=0&&end>start,'pitcher export helpers missing');

function buildContext(scoring,pitchers){
  const ctx={
    scoring,
    collectData:()=>({away:{pitchers},home:{pitchers:[]}}),
    num:v=>Number(v)||0,
    defensiveTeamForBattingTeam:team=>team==='away'?'home':'away',
    pitcherKey:(team,row,name='')=>`${team}:${row}:${name}`
  };
  vm.createContext(ctx);
  vm.runInContext(`const SCORECARD_PITCHER_ROWS=6;const PITCHER_ROWS=15;${app.slice(start,end)}this.scorecardPitchersForTeam=scorecardPitchersForTeam;`,ctx);
  return ctx;
}

const pitchers=[
  {num:'35',name:'Sean Starter',throws:'RHP',record:'7-3',era:'3.02',k:'91'},
  {num:'11',name:'Unused Alpha',throws:'LHP',record:'0-0',era:'0.00',k:'0'},
  {num:'22',name:'Unused Beta',throws:'RHP',record:'0-0',era:'0.00',k:'0'},
  {num:'47',name:'Robert Reliever',throws:'LHP',record:'3-1',era:'1.88',k:'52'},
  {num:'58',name:'Caleb Closer',throws:'RHP',record:'1-2',era:'2.14',k:'66'}
];
const scoring={
  activePitchers:{away:4,home:0},
  pitchLog:[
    {pitchingTeam:'away',pitcherRow:0,pitcherName:'Sean Starter',pitcherNumber:'35',inning:1,half:'bottom',seq:1,recordedAt:'2026-06-24T23:10:00.000Z'},
    {pitchingTeam:'away',pitcherRow:3,pitcherName:'Robert Reliever',pitcherNumber:'47',inning:6,half:'bottom',seq:2,recordedAt:'2026-06-25T01:02:00.000Z'},
    {pitchingTeam:'away',pitcherRow:4,pitcherName:'Caleb Closer',pitcherNumber:'58',inning:9,half:'bottom',seq:3,recordedAt:'2026-06-25T02:05:00.000Z'}
  ],
  plays:[
    {pitchingTeam:'away',pitcherRow:0,pitcher:'Sean Starter',inning:1,half:'bottom',seq:1,recordedAt:'2026-06-24T23:11:00.000Z'},
    {pitchingTeam:'away',pitcherRow:3,pitcher:'Robert Reliever',inning:6,half:'bottom',seq:20,recordedAt:'2026-06-25T01:03:00.000Z'}
  ],
  pitcherChanges:[
    {team:'away',incomingRow:3,incoming:pitchers[3],inning:6,half:'bottom',seq:1,recordedAt:'2026-06-25T01:01:59.000Z'},
    {team:'away',incomingRow:4,incoming:pitchers[4],inning:9,half:'bottom',seq:2,recordedAt:'2026-06-25T02:04:59.000Z'}
  ]
};
const ctx=buildContext(scoring,pitchers);
const output=Array.from(ctx.scorecardPitchersForTeam('away'));
assert.deepEqual(output.map(p=>p.name),['Sean Starter','Robert Reliever','Caleb Closer']);
assert.deepEqual(output.map(p=>p.num),['35','47','58']);
assert.equal(output[0].record,'7-3');
assert.equal(output[1].era,'1.88');
assert.equal(output[2].k,'66');
assert(!output.some(p=>p.name.startsWith('Unused')));

const pregame=buildContext({activePitchers:{away:0,home:0},pitchLog:[],plays:[],pitcherChanges:[]},pitchers);
assert.deepEqual(Array.from(pregame.scorecardPitchersForTeam('away'),p=>p.name),['Sean Starter']);

const prePitchChange=buildContext({
  activePitchers:{away:3,home:0},pitchLog:[],plays:[],
  pitcherChanges:[{team:'away',incomingRow:3,incoming:pitchers[3],inning:1,half:'top',seq:1,recordedAt:'2026-06-24T23:00:00.000Z'}]
},pitchers);
assert.deepEqual(Array.from(prePitchChange.scorecardPitchersForTeam('away'),p=>p.name),['Robert Reliever']);

const legacy=buildContext({
  activePitchers:{away:0,home:0},pitchLog:[],pitcherChanges:[],
  plays:[{pitchingTeam:'away',pitcher:'Legacy Pitcher',inning:4,half:'bottom',seq:10,recordedAt:'2026-06-25T00:30:00.000Z'}]
},[{num:'19',name:'Legacy Pitcher',throws:'RHP',record:'4-4',era:'3.50',k:'72'}]);
const legacyPrinted=Array.from(legacy.scorecardPitchersForTeam('away'));
assert.deepEqual(legacyPrinted.map(p=>p.name),['Legacy Pitcher']);
assert.equal(legacyPrinted[0].era,'3.50');

console.log('Version 32 PDF/Excel actual pitcher appearance-order tests passed.');
