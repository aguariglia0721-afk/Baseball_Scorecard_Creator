const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');

assert.match(app,/const VERSION_NUMBER = 34;/);
assert.match(html,/The starting pitcher appears first\. Use the Add Pitcher dropdown/);
assert.match(html,/id="awayBullpenInputs"[^>]*hidden/);
assert.match(html,/id="homeBullpenInputs"[^>]*hidden/);
assert.doesNotMatch(html,/Bullpen \/ Available Relievers/);
assert.match(html,/<label>Add Pitcher<select id="awayPitchingChangeSelect"/);
assert.match(html,/id="customPitcherDialog"/);
assert.match(app,/function pitcherDisplayRows\(/);
assert.match(app,/function renderPitcherEntryRows\(/);
assert.match(app,/function openCustomPitcherDialog\(/);
assert.match(app,/function saveCustomPitcher\(/);
assert.match(css,/\.pitcher-data-pool\{display:none!important\}/);
assert.match(sw,/v34-pa-sync-r6/);

function sourceBetween(start,end){
  const a=app.indexOf(start);assert(a>=0,`${start} missing`);
  const b=app.indexOf(end,a);assert(b>a,`${end} missing`);
  return app.slice(a,b);
}
const displaySource=sourceBetween('function pitcherDisplayRows','function availablePitcherRows');
const ctx={
  scoring:{activePitchers:{away:4,home:0},pitcherChanges:[
    {team:'away',seq:2,incomingRow:4},
    {team:'away',seq:1,incomingRow:2},
    {team:'home',seq:1,incomingRow:3}
  ]},
  PITCHER_ROWS:15,
  num:v=>Number(v)||0,
  $:()=>null
};
vm.createContext(ctx);
vm.runInContext(`${displaySource}this.pitcherDisplayRows=pitcherDisplayRows;`,ctx);
assert.deepEqual(Array.from(ctx.pitcherDisplayRows('away')),[0,2,4]);
assert.deepEqual(Array.from(ctx.pitcherDisplayRows('home')),[0,3]);

const renderSource=sourceBetween('function renderPitchingChangeControls','function substitutionNoteLines');
const helpers=sourceBetween('function pitcherAlphabeticalParts','function pitcherRosterKey');
const availability=sourceBetween('function usedPitcherRows','function recordPitcherChange');
const select={innerHTML:'',disabled:true},status={textContent:''};
const uiCtx={
  scoring:{activePitchers:{away:0,home:0},pitcherChanges:[]},
  collectData:()=>({away:{pitchers:[
    {name:'Starter',num:'1'},
    {name:'Adam Ottavino',num:'0'},
    {name:'Edwin Diaz',num:'39'}
  ]},home:{pitchers:[]}}),
  num:v=>Number(v)||0,
  ensureScoringState:()=>{},
  renderPitcherEntryRows:()=>{},
  escapeHtml:String,
  formatPitcher:p=>[p.num?`#${p.num}`:'',p.name].filter(Boolean).join(' — '),
  $:id=>id==='awayPitchingChangeSelect'?select:id==='awayPitchingChangeStatus'?status:null
};
vm.createContext(uiCtx);
vm.runInContext(`${helpers}${availability}${renderSource}this.renderPitchingChangeControls=renderPitchingChangeControls;`,uiCtx);
uiCtx.renderPitchingChangeControls();
assert.match(select.innerHTML,/Add pitcher…/);
assert.match(select.innerHTML,/Edwin Diaz/);
assert.match(select.innerHTML,/Adam Ottavino/);
assert(select.innerHTML.indexOf('Edwin Diaz')<select.innerHTML.indexOf('Adam Ottavino'));
assert.match(select.innerHTML,/Add custom pitcher…/);
assert.equal(select.disabled,false);
assert.match(status.textContent,/Active: #1 — Starter/);

console.log('Version 32 compact starter-first pitcher workflow tests passed.');
