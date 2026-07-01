const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
function extract(name,next){
  const start=app.indexOf(`function ${name}(`);assert(start>=0,`missing ${name}`);
  const end=next?app.indexOf(`function ${next}(`,start):app.length;assert(end>start,`missing end for ${name}`);
  return app.slice(start,end);
}
const code=[extract('halfInningOrdinal','completedHalfInningEndingPlays'),extract('completedHalfInningEndingPlays','setScoringView')].join('\n');
const context={num:v=>Number.isFinite(Number(v))?Number(v):0,gameIsFinal:()=>context.final,final:false,scoring:{inning:1,half:'top',plays:[]},Map,Math};
vm.createContext(context);vm.runInContext(code,context);
context.scoring={inning:1,half:'bottom',plays:[
  {id:'a',seq:1,inning:1,half:'top',countsAsPlateAppearance:true},
  {id:'b',seq:2,inning:1,half:'top',countsAsPlateAppearance:false},
  {id:'c',seq:3,inning:1,half:'top',countsAsPlateAppearance:true}
]};
let ending=context.completedHalfInningEndingPlays();
assert.deepEqual([...ending.keys()],['c'],'only the final completed plate appearance ends the top half');
assert.equal(ending.get('c'),'End top 1');
context.scoring={inning:9,half:'bottom',plays:[{id:'walkoff',seq:10,inning:9,half:'bottom',countsAsPlateAppearance:true}]};context.final=true;
ending=context.completedHalfInningEndingPlays();assert.equal(ending.get('walkoff'),'End bottom 9','walk-off must receive a half-inning ending divider');

context.final=false;context.scoring={inning:2,half:'top',plays:[{id:'prior',seq:1,inning:1,half:'bottom',countsAsPlateAppearance:true},{id:'runner-int',seq:2,inning:1,half:'bottom',countsAsPlateAppearance:false}]};
ending=context.completedHalfInningEndingPlays();assert.equal(ending.get('runner-int'),'End bottom 1','a non-PA ruling that ends the half must receive the divider');
context.final=false;context.scoring={inning:1,half:'top',plays:[{id:'live',seq:1,inning:1,half:'top',countsAsPlateAppearance:true}]};
assert.equal(context.completedHalfInningEndingPlays().size,0,'an active half-inning must not receive a premature divider');
assert.match(app,/classicPdfHorizontalRule/,'PDF overlay must support the same dark half-inning rule');
console.log('Version 32 half-inning ending behavior checks passed.');
