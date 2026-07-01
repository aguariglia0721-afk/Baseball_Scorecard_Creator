const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const BaseballData=require('../baseball-data.js');

const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const server=fs.readFileSync('netlify/functions/mlb.mts','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');

assert.match(app,/const VERSION_NUMBER = 34;/);
assert.match(html,/Version 34/);
assert.match(manifest,/Version 34/);
assert.match(app,/function comparePitchersAlphabetically\(/);
assert.match(app,/\.sort\(comparePitchersAlphabetically\)/);
assert.match(server,/function comparePitchersAlphabetically\(/);
assert.match(html,/Add Pitcher dropdown/i);
assert.match(app,/"CURRENT"/);

const schedule={dates:[{date:'2026-06-23',games:[{
  gamePk:72,officialDate:'2026-06-23',gameDate:'2026-06-23T23:10:00Z',gameType:'R',venue:{name:'Test Park'},
  teams:{
    away:{team:{id:100,name:'Away'},probablePitcher:{id:201,fullName:'Zack Wheeler'}},
    home:{team:{id:200,name:'Home'},probablePitcher:{id:301,fullName:'Home Starter'}}
  }
}]}]};
const feed={gameData:{datetime:{officialDate:'2026-06-23'},teams:{away:{id:100,name:'Away'},home:{id:200,name:'Home'}}},liveData:{boxscore:{teams:{away:{battingOrder:[],pitchers:[201],players:{}},home:{battingOrder:[],pitchers:[301],players:{}}},officials:[]}}};
const pitcher=(id,fullName,num,hand='R')=>({id,fullName,primaryNumber:num,pitchHand:{code:hand},primaryPosition:{abbreviation:'P',type:'Pitcher'},stats:[]});
const people={
  201:pitcher(201,'Zack Wheeler','45'),
  202:pitcher(202,'Adam Ottavino','0'),
  203:pitcher(203,'Edwin Diaz','39'),
  204:pitcher(204,'Phil Maton','88'),
  205:pitcher(205,'Reed Garrett','75'),
  206:pitcher(206,'Luis De Los Santos','62'),
  301:pitcher(301,'Home Starter','35','L')
};
const rosterEntry=(id)=>({person:{id,fullName:people[id].fullName},jerseyNumber:people[id].primaryNumber,position:{abbreviation:'P',type:'Pitcher'}});
const rosters={away:{roster:[rosterEntry(201),rosterEntry(202),rosterEntry(204),rosterEntry(206),rosterEntry(203),rosterEntry(205)]},home:{roster:[rosterEntry(301)]}};
const built=BaseballData.buildGameData(feed,schedule,people,rosters);
assert.deepEqual(built.away.pitchers.map(p=>p.name),[
  'Zack Wheeler',
  'Edwin Diaz',
  'Reed Garrett',
  'Phil Maton',
  'Adam Ottavino',
  'Luis De Los Santos'
]);

function sourceBetween(start,end){
  const a=app.indexOf(start);assert(a>=0,`${start} missing`);
  const b=app.indexOf(end,a);assert(b>a,`${end} missing`);
  return app.slice(a,b);
}
const helpers=sourceBetween('function pitcherAlphabeticalParts','function pitcherRosterKey');
const availability=sourceBetween('function usedPitcherRows','function recordPitcherChange');
const ctx={
  scoring:{activePitchers:{away:0,home:0},pitcherChanges:[]},
  collectData:()=>({away:{pitchers:[
    {name:'Current Starter',num:'1'},
    {name:'Adam Ottavino',num:'0'},
    {name:'Phil Maton',num:'88'},
    {name:'Edwin Diaz',num:'39'},
    {name:'Reed Garrett',num:'75'}
  ]},home:{pitchers:[]}}),
  num:v=>Number(v)||0
};
vm.createContext(ctx);
vm.runInContext(`${helpers}${availability}this.availablePitcherRows=availablePitcherRows;`,ctx);
assert.deepEqual(Array.from(ctx.availablePitcherRows('away'),x=>x.pitcher.name),['Edwin Diaz','Reed Garrett','Phil Maton','Adam Ottavino']);
ctx.scoring.pitcherChanges.push({team:'away',incomingRow:3});
assert.deepEqual(Array.from(ctx.availablePitcherRows('away'),x=>x.pitcher.name),['Reed Garrett','Phil Maton','Adam Ottavino']);


const controls=sourceBetween('function renderPitchingChangeControls','function substitutionNoteLines');
const select={innerHTML:'',disabled:false},status={textContent:''};
const uiCtx={
  scoring:{activePitchers:{away:0,home:0},pitcherChanges:[]},
  collectData:()=>({away:{pitchers:[
    {name:'Current Starter',num:'1',throws:'RHP',record:'8-2',era:'2.10',k:'101'},
    {name:'Adam Ottavino',num:'0',throws:'RHP',record:'1-1',era:'3.50',k:'30'},
    {name:'Phil Maton',num:'88',throws:'RHP',record:'2-1',era:'2.90',k:'42'},
    {name:'Edwin Diaz',num:'39',throws:'RHP',record:'3-0',era:'1.75',k:'60'},
    {name:'Reed Garrett',num:'75',throws:'RHP',record:'4-2',era:'2.40',k:'55'}
  ]},home:{pitchers:[]}}),
  num:v=>Number(v)||0,
  ensureScoringState:()=>{},
  escapeHtml:value=>String(value),
  formatPitcher:p=>[p.num?`#${p.num}`:'',p.name,p.throws,p.record,p.era?`${p.era} ERA`:'',p.k?`${p.k} K`:''].filter(Boolean).join(' — '),
  $:id=>id==='awayPitchingChangeSelect'?select:id==='awayPitchingChangeStatus'?status:null
};
vm.createContext(uiCtx);
vm.runInContext(`${helpers}${availability}${controls}this.renderPitchingChangeControls=renderPitchingChangeControls;`,uiCtx);
uiCtx.renderPitchingChangeControls();
const dropdown=select.innerHTML;
const positions=['Edwin Diaz','Reed Garrett','Phil Maton','Adam Ottavino'].map(name=>dropdown.indexOf(name));
assert(positions.every(index=>index>=0),'every unused active pitcher must appear');
assert.deepEqual([...positions].sort((a,b)=>a-b),positions,'dropdown must be alphabetical by last name');
assert.match(dropdown,/#39 — Edwin Diaz — RHP — 3-0 — 1.75 ERA — 60 K/,'dropdown must retain full pitcher information');
assert.match(status.textContent,/Active: #1 — Current Starter/,'current pitcher must remain displayed separately');

console.log('Version 32 alphabetical active-roster pitcher dropdown tests passed.');
