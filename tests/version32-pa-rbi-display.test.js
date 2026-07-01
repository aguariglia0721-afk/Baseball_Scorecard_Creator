const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('function playNotation(');
const end=app.indexOf('function playsByBatterInning(',start);
assert(start>=0&&end>start,'playNotation helper must exist');

const ctx={
  interferenceCode:()=> 'INT',
  errorNotation:()=> '',
};
vm.createContext(ctx);
vm.runInContext(`${app.slice(start,end)}this.playNotation=playNotation;`,ctx);

const single=ctx.playNotation({outcome:'1B',outcomeCode:'1B',rbi:1,runs:0,fieldingErrors:[]});
assert.equal(single,'1B','RBI text must not appear in a plate-appearance box');

const scoringRun=ctx.playNotation({outcome:'2B',outcomeCode:'2B',rbi:2,runs:1,fieldingErrors:[]});
assert.equal(scoringRun,'2B','run totals must not appear in a plate-appearance box');
assert.doesNotMatch(scoringRun,/\b\d+\s*R\b|RBI/,'plate-appearance notation must not repeat run or RBI totals');

const homer=ctx.playNotation({outcome:'HR',outcomeCode:'HR',rbi:4,runs:4,fieldingErrors:[]});
assert.equal(homer,'HR','home-run notation remains compact');

assert.match(app,/st\.rbi\+=p\.rbi\|\|0/,'team RBI totals must still be calculated');
assert.match(app,/st\.rbi\+=play\.rbi\|\|0/,'player RBI totals must still be calculated');
assert.match(app,/<th class="stat-cell">RBI<\/th>/,'dedicated on-screen RBI column must remain');
assert.match(app,/setXmlCell\(doc,`O\$\{row\}`,stats\[i\]\.rbi,"number"\)/,'Excel RBI column must remain populated');
assert.match(app,/\[stats\[r\]\.ab,stats\[r\]\.r,stats\[r\]\.h,stats\[r\]\.rbi\]/,'PDF RBI column must remain populated');

console.log('Version 32 plate-appearance result-only display checks passed.');
