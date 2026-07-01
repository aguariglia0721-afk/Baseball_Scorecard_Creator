const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const BaseballData=require('../baseball-data.js');

const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const server=fs.readFileSync('netlify/functions/mlb.mts','utf8');

assert.match(app,/const SCORECARD_PITCHER_ROWS = 6;/);
assert.match(app,/const PITCHER_ROWS = 15;/);
assert.match(app,/function scorecardPitchersForTeam\(/);
assert.match(html,/id="awayBullpenInputs"[^>]*hidden/);
assert.match(html,/id="homeBullpenInputs"[^>]*hidden/);
assert.doesNotMatch(html,/Bullpen \/ Available Relievers/);
assert.match(server,/rosterType=active/);
assert.match(server,/MAX_PITCHERS = 15/);

const schedule={dates:[{date:'2026-06-23',games:[{
  gamePk:1,officialDate:'2026-06-23',gameDate:'2026-06-23T23:10:00Z',gameType:'R',venue:{name:'Test Park'},
  teams:{
    away:{team:{id:100,name:'Away'},probablePitcher:{id:201,fullName:'Away Starter'}},
    home:{team:{id:200,name:'Home'},probablePitcher:{id:301,fullName:'Home Starter'}}
  }
}]}]};
const feed={gameData:{datetime:{officialDate:'2026-06-23'},teams:{away:{id:100,name:'Away'},home:{id:200,name:'Home'}}},liveData:{boxscore:{teams:{away:{battingOrder:[],pitchers:[201],players:{}},home:{battingOrder:[],pitchers:[301],players:{}}},officials:[]}}};
const people={
  201:{id:201,fullName:'Away Starter',primaryNumber:'45',pitchHand:{code:'R'},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[{group:{displayName:'pitching'},splits:[{stat:{wins:5,losses:2,era:'3.10',strikeOuts:70}}]}]},
  202:{id:202,fullName:'Away Reliever One',primaryNumber:'50',pitchHand:{code:'L'},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[{group:{displayName:'pitching'},splits:[{stat:{wins:2,losses:1,era:'2.50',strikeOuts:31}}]}]},
  203:{id:203,fullName:'Away Reliever Two',primaryNumber:'51',pitchHand:{code:'R'},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[]},
  301:{id:301,fullName:'Home Starter',primaryNumber:'35',pitchHand:{code:'L'},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[]},
  302:{id:302,fullName:'Home Reliever',primaryNumber:'36',pitchHand:{code:'R'},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[]}
};
const rosters={
  away:{roster:[
    {person:{id:201,fullName:'Away Starter'},jerseyNumber:'45',position:{abbreviation:'P',type:'Pitcher'}},
    {person:{id:202,fullName:'Away Reliever One'},jerseyNumber:'50',position:{abbreviation:'P',type:'Pitcher'}},
    {person:{id:203,fullName:'Away Reliever Two'},jerseyNumber:'51',position:{abbreviation:'P',type:'Pitcher'}}
  ]},
  home:{roster:[
    {person:{id:301,fullName:'Home Starter'},jerseyNumber:'35',position:{abbreviation:'P',type:'Pitcher'}},
    {person:{id:302,fullName:'Home Reliever'},jerseyNumber:'36',position:{abbreviation:'P',type:'Pitcher'}}
  ]}
};
const built=BaseballData.buildGameData(feed,schedule,people,rosters);
assert.deepEqual(built.away.pitchers.map(p=>p.name),['Away Starter','Away Reliever One','Away Reliever Two']);
assert.equal(built.away.pitchers[1].throws,'LHP');
assert.equal(built.away.pitchers[1].era,'2.50');
assert.deepEqual(built.home.pitchers.map(p=>p.name),['Home Starter','Home Reliever']);

function source(name,next){
  const a=app.indexOf(`function ${name}(`);assert(a>=0,`${name} missing`);
  const b=app.indexOf(`function ${next}(`,a);assert(b>a,`${next} missing`);
  return app.slice(a,b);
}
const ctx={scoring:{activePitchers:{away:0,home:0},pitcherChanges:[]},collectData:()=>({away:{pitchers:[{name:'Starter'},{name:'Reliever A'},{name:'Reliever B'}]},home:{pitchers:[]}}),num:v=>Number(v)||0,comparePitchersAlphabetically:(a,b)=>String(a.pitcher?.name||a.name||'').localeCompare(String(b.pitcher?.name||b.name||''))};
vm.createContext(ctx);
vm.runInContext(`${source('usedPitcherRows','availablePitcherRows')}${source('availablePitcherRows','recordPitcherChange')}this.availablePitcherRows=availablePitcherRows;`,ctx);
assert.deepEqual(Array.from(ctx.availablePitcherRows('away'),x=>x.pitcher.name),['Reliever A','Reliever B']);
ctx.scoring.pitcherChanges.push({team:'away',incomingRow:1});
assert.deepEqual(Array.from(ctx.availablePitcherRows('away'),x=>x.pitcher.name),['Reliever B']);

const scCtx={
  scoring:{
    activePitchers:{away:9,home:0},
    pitchLog:[
      {pitchingTeam:'away',pitcherRow:0,pitcherName:'Starter',pitcherNumber:'40',inning:1,half:'bottom',seq:1,recordedAt:'2026-06-23T23:10:00.000Z'},
      {pitchingTeam:'away',pitcherRow:9,pitcherName:'Deep Reliever',pitcherNumber:'99',inning:7,half:'bottom',seq:2,recordedAt:'2026-06-24T01:20:00.000Z'}
    ],
    plays:[],
    pitcherChanges:[{team:'away',seq:1,incomingRow:9,incoming:{name:'Deep Reliever',num:'99'},inning:7,half:'bottom',recordedAt:'2026-06-24T01:19:59.000Z'}]
  },
  collectData:()=>({away:{pitchers:[
    {name:'Starter',num:'40',throws:'RHP',record:'6-2',era:'2.90',k:'88'},
    {name:'Unused 1'},{name:'Unused 2'},{name:'Unused 3'},{name:'Unused 4'},{name:'Unused 5'},{name:'Unused 6'},{name:'Unused 7'},{name:'Unused 8'},
    {name:'Deep Reliever',num:'99',throws:'LHP',record:'2-1',era:'1.75',k:'41'}
  ]}}),
  num:v=>Number(v)||0,
  defensiveTeamForBattingTeam:team=>team==='away'?'home':'away',
  pitcherKey:(team,row,name='')=>`${team}:${row}:${name}`
};
vm.createContext(scCtx);
const helperStart=app.indexOf('function pitcherRosterKey('),helperEnd=app.indexOf('function playerIdentity(',helperStart);
vm.runInContext(`const SCORECARD_PITCHER_ROWS=6;const PITCHER_ROWS=15;${app.slice(helperStart,helperEnd)}this.scorecardPitchersForTeam=scorecardPitchersForTeam;`,scCtx);
const printed=Array.from(scCtx.scorecardPitchersForTeam('away'));
assert.deepEqual(printed.map(p=>p.name),['Starter','Deep Reliever']);
assert.equal(printed[0].throws,'RHP');
assert.equal(printed[0].record,'6-2');
assert.equal(printed[1].era,'1.75');
assert(!printed.some(p=>/^Unused/.test(p.name)),'unused roster pitchers must not print');

function mockResponse(payload,status=200){return {ok:status>=200&&status<300,status,text:async()=>JSON.stringify(payload)};}
(async()=>{
  const requested=[];
  global.fetch=async url=>{
    const decoded=decodeURIComponent(String(url));requested.push(decoded);
    if(decoded.includes('/feed/live'))return mockResponse(feed);
    if(decoded.includes('/schedule?gamePk=1'))return mockResponse(schedule);
    if(decoded.includes('/teams/100/roster'))return mockResponse(rosters.away);
    if(decoded.includes('/teams/200/roster'))return mockResponse(rosters.home);
    if(decoded.includes('/people?personIds='))return mockResponse({people:Object.values(people)});
    return mockResponse({});
  };
  const loaded=await BaseballData.getGame(1);
  assert.deepEqual(loaded.data.away.pitchers.map(p=>p.name),['Away Starter','Away Reliever One','Away Reliever Two']);
  assert(requested.some(url=>url.includes('/teams/100/roster')),'away active roster must be requested');
  assert(requested.some(url=>url.includes('/teams/200/roster')),'home active roster must be requested');
  console.log('Version 32 active bullpen and reliever dropdown tests passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
