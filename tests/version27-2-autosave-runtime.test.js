const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const start=app.indexOf("function collectUiState()");
const end=app.indexOf("function downloadBlob",start);
assert.ok(start>0&&end>start,"autosave implementation block must be extractable");
const block=app.slice(start,end);
const storage=new Map();
const elements={
  toggleQuickResultsBtn:{getAttribute:()=>"true"},
  restoreAutosaveBtn:{disabled:true},
  autosaveBar:{textContent:""},
  autosaveDetails:{textContent:""}
};
const context={console,JSON,Date,Math,globalThis:{},alert:msg=>{throw new Error(msg)},confirm:()=>true};
vm.createContext(context);
vm.runInContext(`
const VERSION_NUMBER=29;
const AUTOSAVE_SCHEMA_VERSION=2;
const AUTOSAVE_STORAGE_KEY="guariglia-scorecard-v34-autosave-current";
const AUTOSAVE_BACKUP_KEY="guariglia-scorecard-v34-autosave-previous";
const LEGACY_AUTOSAVE_KEYS=[{label:"Version 28",current:"guariglia-scorecard-v28-autosave-current",backup:"guariglia-scorecard-v28-autosave-previous",roster:"guariglia-scorecard-v28-roster-mirror"},{label:"Version 27.2",current:"guariglia-scorecard-v27.2-autosave-current",backup:"guariglia-scorecard-v27.2-autosave-previous",roster:"guariglia-scorecard-v27.2-roster-mirror"}];
let autosaveTimer=null,lastAutosaveStateJson="",autosaveRestoring=false;
let activePanel="setup";
let dataState={awayTeam:"Mets",homeTeam:"Phillies",away:{lineup:[],bench:[],pitchers:[]},home:{lineup:[],bench:[],pitchers:[]}};
let scoring={inning:1,half:"top",plays:[],pitchLog:[],substitutions:[],pitcherChanges:[]};
const deepClone=value=>JSON.parse(JSON.stringify(value));
const localStorage={getItem:key=>__storage.has(key)?__storage.get(key):null,setItem:(key,value)=>__storage.set(key,String(value)),removeItem:key=>__storage.delete(key),key:index=>[...__storage.keys()][index]||null,get length(){return __storage.size;}};
const document={querySelector:selector=>selector===".panel.active"?{id:activePanel}:null};
const $=id=>__elements[id]||null;
const getField=id=>({lookupDate:"2026-06-25",scheduleLevel:"mlb"}[id]||"");
const setField=()=>{};
const collectData=()=>deepClone(dataState);
const setFieldsFromData=data=>{dataState=deepClone(data);};
const persistRosterMirror=data=>{localStorage.setItem("guariglia-scorecard-v34-roster-mirror",JSON.stringify({data:deepClone(data)}));return true;};
const readRosterMirror=()=>{const raw=localStorage.getItem("guariglia-scorecard-v34-roster-mirror");return raw?JSON.parse(raw):null;};
const mergeMissingGameData=(current,fallback)=>{const merged=deepClone(current||{});for(const key of ["awayTeam","homeTeam"]){if(!merged[key]&&fallback?.[key])merged[key]=fallback[key];}for(const team of ["away","home"]){if(!merged[team]&&fallback?.[team])merged[team]=deepClone(fallback[team]);}return merged;};
const setQuickResultsVisible=()=>{};
const setChallengePanelVisible=()=>{};
const setPanel=id=>{activePanel=id;};
const ensureScoringState=()=>{};
const refreshAll=()=>{};
const initialScoring=()=>({inning:1,half:"top",plays:[],pitchLog:[],substitutions:[],pitcherChanges:[]});
const setTimeout=fn=>{fn();return 1;};
const clearTimeout=()=>{};
`,context,{filename:"autosave-prelude.js"});
context.__storage=storage;context.__elements=elements;
vm.runInContext(block,context,{filename:"autosave-implementation.js"});

vm.runInContext('persistAutosaveNow("first save",{force:true})',context);
const currentKey='guariglia-scorecard-v34-autosave-current';
const backupKey='guariglia-scorecard-v34-autosave-previous';
assert.ok(storage.get(currentKey),"first save must create a current snapshot");
assert.equal(JSON.parse(storage.get(currentKey)).data.awayTeam,"Mets");
vm.runInContext('dataState.awayTeam="Yankees";persistAutosaveNow("second save")',context);
assert.equal(JSON.parse(storage.get(currentKey)).data.awayTeam,"Yankees","current snapshot must contain the latest field value");
assert.equal(JSON.parse(storage.get(backupKey)).data.awayTeam,"Mets","previous snapshot must retain the prior state");
vm.runInContext('dataState.awayTeam="";scoring={};initializePersistentStartup()',context);
assert.equal(vm.runInContext('dataState.awayTeam',context),"Yankees","startup must restore the current snapshot");
vm.runInContext('restorePreviousAutosave()',context);
assert.equal(vm.runInContext('dataState.awayTeam',context),"Mets","Restore Previous Autosave must load the backup");
assert.equal(JSON.parse(storage.get(backupKey)).data.awayTeam,"Yankees","restoring must preserve the replaced current state as the new backup");
console.log("Version 32 autosave runtime rotation and recovery tests passed");
