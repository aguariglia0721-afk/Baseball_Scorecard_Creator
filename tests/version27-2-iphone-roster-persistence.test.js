const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const worker=fs.readFileSync(path.join(root,"service-worker.js"),"utf8");

assert.match(app,/const AUTOSAVE_ROSTER_KEY = "guariglia-scorecard-v34-roster-mirror"/);
assert.match(app,/const gameFieldCache = new Map\(\)/);
assert.match(app,/function rehydrateGameFieldsFromCache\(\)/);
assert.match(app,/function mergeMissingGameData\(current=\{\},fallback=\{\}\)/);
assert.match(app,/document\.addEventListener\("freeze",\(\)=>persistAutosaveNow\("Saved before mobile suspension"/);
assert.match(app,/window\.addEventListener\("pageshow",event=>\{stabilizeRestoredGameFields/);
assert.match(app,/window\.addEventListener\("focus",\(\)=>stabilizeRestoredGameFields/);
assert.match(app,/key===AUTOSAVE_ROSTER_KEY/);
assert.match(html,/app\.js\?v=34-pa-sync-r6/);
assert.match(worker,/guariglia-scorecard-v34-pa-sync-r6/);

const start=app.indexOf('const GAME_DATA_TOP_LEVEL_FIELDS');
const end=app.indexOf('function formatPlayer',start);
assert.ok(start>0&&end>start,"mobile roster protection block must be extractable");
const block=app.slice(start,end);
const elements={};
const storage=new Map();
const context={console,JSON,Date,Math};
vm.createContext(context);
vm.runInContext(`
const LINEUP_ROWS=9,PITCHER_ROWS=15,BENCH_ROWS=10;
const AUTOSAVE_ROSTER_KEY="guariglia-scorecard-v34-roster-mirror";
const gameFieldCache=new Map();
const deepClone=value=>JSON.parse(JSON.stringify(value));
const localStorage={getItem:key=>__storage.has(key)?__storage.get(key):null,setItem:(key,value)=>__storage.set(key,String(value)),removeItem:key=>__storage.delete(key)};
const $=id=>__elements[id]||null;
const refreshAll=()=>{};
`,context);
context.__elements=elements;
context.__storage=storage;
vm.runInContext(block,context,{filename:"iphone-roster-protection.js"});

for(const id of ["awayTeam","homeTeam","awayPlayer1","awayNum1","awayPos1","awayPitcher1","awayPitcherThrows1"]){elements[id]={id,value:""};}
vm.runInContext(`
setField("awayTeam","Mets");
setField("homeTeam","Phillies");
setField("awayPlayer1","Francisco Lindor");
setField("awayNum1","12");
setField("awayPos1","SS");
setField("awayPitcher1","Kodai Senga");
setField("awayPitcherThrows1","R");
`,context);

// Simulate iPhone/Safari clearing visible controls after JavaScript restored them.
for(const id of Object.keys(elements))elements[id].value="";
const protectedData=vm.runInContext('collectData()',context);
assert.equal(protectedData.awayTeam,"Mets","team name must survive an unannounced mobile form reset");
assert.equal(protectedData.homeTeam,"Phillies","home team must survive an unannounced mobile form reset");
assert.equal(protectedData.away.lineup[0].name,"Francisco Lindor","lineup player must survive an unannounced mobile form reset");
assert.equal(protectedData.away.lineup[0].num,"12");
assert.equal(protectedData.away.pitchers[0].name,"Kodai Senga","starting pitcher must survive an unannounced mobile form reset");
assert.equal(vm.runInContext('rehydrateGameFieldsFromCache()',context),7,"all blanked visible fields should be rehydrated");
assert.equal(elements.awayPlayer1.value,"Francisco Lindor");

// A deliberate user clear updates the canonical cache and is respected.
elements.awayPlayer1.value="";
vm.runInContext('rememberGameFieldValue(__elements.awayPlayer1)',context);
assert.equal(vm.runInContext('getField("awayPlayer1")',context),"","intentional user clearing must remain possible");

// The independent roster mirror must repair a damaged full autosave.
vm.runInContext('persistRosterMirror(collectData())',context);
const damaged={awayTeam:"",homeTeam:"",away:{lineup:[],bench:[],pitchers:[]},home:{lineup:[],bench:[],pitchers:[]}};
context.__damaged=damaged;
const recovered=vm.runInContext('mergeMissingGameData(__damaged,readRosterMirror().data)',context);
assert.equal(recovered.awayTeam,"Mets");
assert.equal(recovered.homeTeam,"Phillies");
assert.equal(recovered.away.pitchers[0].name,"Kodai Senga");

console.log("Version 32 iPhone team and roster persistence tests passed");
