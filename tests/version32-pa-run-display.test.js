const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('function playNotation(');
const end=app.indexOf('function playsByBatterInning(',start);
assert(start>=0&&end>start,'playNotation helper must exist');

const ctx={
  num:value=>Number(value)||0,
  interferenceCode:()=> 'INT',
  errorNotation:error=>error?.code||'',
};
vm.createContext(ctx);
vm.runInContext(`${app.slice(start,end)}this.playNotation=playNotation;`,ctx);

assert.equal(ctx.playNotation({outcome:'1B',outcomeCode:'1B',runs:2,rbi:2,fieldingErrors:[]}), '1B', 'ordinary PA boxes show only the outcome');
assert.equal(ctx.playNotation({outcome:'2B',outcomeCode:'2B',runs:1,rbi:1,fieldingErrors:[{code:'E8'}]}), '2B/E8', 'fielding detail remains part of what happened');
assert.equal(ctx.playNotation({outcome:'ROE',outcomeCode:'ROE',runs:1,rbi:0,fieldingErrors:[{code:'E6'}]}), 'E6', 'reach-on-error keeps the error notation without run totals');
assert.equal(ctx.playNotation({outcome:'D3K',outcomeCode:'K',runs:1,rbi:0,droppedThirdStrikeCause:'wild-pitch',fieldingErrors:[]}), 'K WP', 'uncaught-third-strike cause remains visible');
assert.equal(ctx.playNotation({outcome:'HR',outcomeCode:'HR',runs:4,rbi:4,fieldingErrors:[]}), 'HR', 'home run remains compact');
assert.equal(ctx.playNotation({eventType:'runner',outcome:'SB',outcomeCode:'SB',runs:1,runnerEvent:{primaryBase:1,toBase:'2'}}), 'SB2', 'runner event shows only the event and destination');
assert.equal(ctx.playNotation({eventType:'runner',outcome:'DI',outcomeCode:'DI',runs:1,runnerEvent:{primaryBase:3,toBase:'home'}}), 'DIH', 'defensive indifference to home omits run totals');
assert.equal(ctx.playNotation({eventType:'runner',outcome:'CS',outcomeCode:'CS',runs:0,runnerEvent:{primaryBase:2,toBase:'3'}}), 'CS3', 'caught stealing destination remains visible');

assert.match(app,/st=ensure\([\s\S]*?st\.r\+\+/,'player run totals remain calculated from scored destinations');
assert.match(app,/result\[team\]\.runs=sum\(valid\.filter\(p=>p\.team===team\)\.map\(p=>p\.runs\)\)/,'team run totals remain calculated from recorded plays');
assert.match(app,/<th class="stat-cell">R<\/th>/,'dedicated on-screen run column remains');
assert.match(app,/\[stats\[r\]\.ab,stats\[r\]\.r,stats\[r\]\.h,stats\[r\]\.rbi\]/,'PDF run column remains populated');
assert.match(app,/setXmlCell\(doc,`M\$\{row\}`,stats\[i\]\.r,"number"\)/,'Excel run column remains populated');

console.log('Version 32 plate-appearance run display checks passed.');
