const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');

function functionSource(name,nextName){
  const start=app.indexOf(`function ${name}(`);
  assert(start>=0,`${name} missing`);
  const end=nextName?app.indexOf(`function ${nextName}(`,start):app.indexOf('\nfunction ',start+10);
  assert(end>start,`could not isolate ${name}`);
  return app.slice(start,end);
}

const ruleContext={};
vm.createContext(ruleContext);
vm.runInContext(`const num=value=>Number.isFinite(Number(value))?Number(value):0;\n${functionSource('decideGameStatus','gameStatusText')}\nthis.decideGameStatus=decideGameStatus;`,ruleContext);
const decide=ruleContext.decideGameStatus;
const play=(inning,half,outsBefore,outsOnPlay,seq=1)=>({inning,half,outsOnPlay,seq,beforeState:{outs:outsBefore}});
assert.equal(decide(play(9,'top',2,1),{}, {away:2,home:3}).winner,'home','home lead after top 9 must end game');
assert.equal(decide(play(9,'top',2,1),{}, {away:3,home:2}),null,'away lead after top 9 must still allow bottom 9');
assert.equal(decide(play(9,'bottom',0,0),{}, {away:2,home:3}).winner,'home','home lead in bottom 9 must walk off immediately');
assert.equal(decide(play(9,'bottom',2,1),{}, {away:4,home:3}).winner,'away','away lead after bottom 9 must end game');
assert.equal(decide(play(9,'bottom',2,1),{}, {away:3,home:3}),null,'tie after 9 must continue');
assert.equal(decide(play(12,'bottom',1,0),{}, {away:5,home:6}).winner,'home','extra-inning walk-off must end immediately');

const runnerContext={};
vm.createContext(runnerContext);
vm.runInContext(`
const LINEUP_ROWS=9;
const num=value=>Number.isFinite(Number(value))?Number(value):0;
const battingTeamForHalf=half=>half==='top'?'away':'home';
const activeBatter=(team,index)=>({name:team+'-'+index,num:String(index),pos:'X'});
const playerIdentity=(player,team,prefix)=>team+':'+prefix+':'+player.name;
const playerSnapshot=player=>({...player});
${functionSource('automaticRunnerForState','prepareHalfInningState')}
this.automaticRunnerForState=automaticRunnerForState;`,runnerContext);
let runner=runnerContext.automaticRunnerForState({inning:10,half:'top',battingIndexes:{away:0,home:0}});
assert.equal(runner.playerIndex,8,'when leadoff slot is due, ninth batting-order slot must be automatic runner');
runner=runnerContext.automaticRunnerForState({inning:10,half:'bottom',battingIndexes:{away:0,home:5}});
assert.equal(runner.playerIndex,4,'automatic runner must be batting-order slot immediately preceding due hitter');
assert.equal(runner.earnedRun,false,'automatic runner must be marked unearned to the pitcher');

const pdfContext={TextEncoder,Uint8Array};
vm.createContext(pdfContext);
const pdfStart=app.indexOf('function buildClassicPdfBytes('),pdfEnd=app.indexOf('async function exportClassicPdf',pdfStart);
vm.runInContext(`${app.slice(pdfStart,pdfEnd)}\nthis.buildClassicPdfBytes=buildClassicPdfBytes;`,pdfContext);
const pdf=pdfContext.buildClassicPdfBytes({bytes:new Uint8Array([1,2,3]),width:1,height:1},['page-one','page-two']);
const pdfText=Buffer.from(pdf).toString('latin1');
assert(pdfText.includes('/Count 2'),'continuation PDF must contain two pages');
assert(pdfText.includes('page-one')&&pdfText.includes('page-two'),'both page content streams must be retained');

console.log('Version 27 behavioral baseball rules and two-page PDF tests passed.');
