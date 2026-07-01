const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const data = fs.readFileSync(path.join(root, 'baseball-data.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'netlify/functions/mlb.mts'), 'utf8');

for (const id of [
  'managerChallengeAllotment','managerReplayEventLog','awayReplayTokens','homeReplayTokens',
  'awayReplayAvailable','homeReplayAvailable','managerReplayDialog','managerReplayForm',
  'managerReplayCall','managerReplayResult'
]) assert(html.includes(`id="${id}"`), `missing manager replay control ${id}`);

assert.match(html, /Manager replay challenges[\s\S]*Regular season \/ most games — 1 per team[\s\S]*Postseason \/ All-Star — 2 per team/);
assert.match(html, /Manager replay challenges and ABS ball–strike challenges use separate challenge pools/);
assert.match(app, /managerReplayChallenges:initialManagerReplayState\(\)/);
assert.match(app, /function computeManagerReplayState/);
assert.match(app, /if\(event\.result!=="overturned"&&available>0\)available--/);
assert.match(app, /function managerReplayPdfTokens/);
assert.match(app, /Manager Replay: \$\{replays\}/);
assert.match(app, /Replay \/ ABS Challenges/);
assert.match(data, /managerChallengeAllotmentForGame/);
assert.match(server, /managerChallengeAllotment = \["A","F","D","L","W","C","P"\]/);

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert(start >= 0, `missing function ${name}`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`unterminated function ${name}`);
}

const sandbox = {
  fieldValue: '1',
  scoring: { managerReplayChallenges: { events: [], nextSeq: 1, version: 1 } },
  getField: null,
  ensureScoringState() {},
  num(value) { return Number(value) || 0; }
};
sandbox.getField = id => id === 'managerChallengeAllotment' ? sandbox.fieldValue : '';
vm.createContext(sandbox);
for (const name of ['managerReplayAllotment','managerReplayEvents','computeManagerReplayState']) {
  vm.runInContext(extractFunction(app, name), sandbox);
}

let state = sandbox.computeManagerReplayState('away');
assert.equal(state.allotment, 1);
assert.equal(state.available, 1);

sandbox.scoring.managerReplayChallenges.events.push({id:'a',team:'away',seq:1,inning:1,result:'overturned'});
state = sandbox.computeManagerReplayState('away');
assert.equal(state.available, 1, 'successful manager replay must be retained');
assert.equal(state.overturned, 1);

sandbox.scoring.managerReplayChallenges.events.push({id:'b',team:'away',seq:2,inning:3,result:'confirmed'});
state = sandbox.computeManagerReplayState('away');
assert.equal(state.available, 0, 'confirmed call must consume the regular-season challenge');
assert.equal(state.lost, 1);

sandbox.fieldValue = '2';
sandbox.scoring.managerReplayChallenges.events = [{id:'c',team:'home',seq:1,inning:2,result:'stands'}];
state = sandbox.computeManagerReplayState('home');
assert.equal(state.allotment, 2);
assert.equal(state.available, 1, 'postseason/All-Star games must begin with two challenges');
assert.equal(state.stands, 1);

console.log('Version 32 manager replay and ABS separation tests passed.');
