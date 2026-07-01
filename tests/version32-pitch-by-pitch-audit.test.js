const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

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

for (const fn of [
  'challengePitchOriginalType','latestChallengeablePitch','latestChallengeablePitchForTeam',
  'recalculatePitchSession','linkedTerminalPlay','rollbackAbsChallengeCorrection',
  'applyAbsChallengeCorrection','playNotation'
]) assert(app.includes(`function ${fn}`), `missing audited helper ${fn}`);

assert.match(app, /pitch\.absChallengeId=challenge\.id;pitch\.absOriginalType=originalType/,
  'linked pitches must retain challenge ownership and original call type');
assert.match(app, /pitch\.type=originalType==="calledStrike"\?"ball":"calledStrike"/,
  'an overturned ABS call must reverse the linked pitch');
assert.match(app, /if\(count\.balls>=4\)replacement=recordQuickOutcome\("BB",true,true\)/,
  'a corrected ball four must rebuild the walk');
assert.match(app, /else if\(count\.strikes>=3\)\{replacement=recordQuickOutcome\("KL",true,true\)/,
  'a corrected called strike three must rebuild the strikeout');
assert.match(app, /const completed=scoring\.plays\.some\(play=>play\.pitchSessionId===correction\.sessionId\)/,
  'rollback must recognize a completed plate appearance');
assert.match(app, /if\(!completed&&\(scoring\.count\.sessionId===correction\.sessionId\|\|!scoring\.count\.sessionId\)\)/,
  'deleting an upheld terminal challenge must not resurrect a completed 4-0 or 0-3 count');
assert.match(app, /if\(play\.outcome==="D3K"&&play\.droppedThirdStrikeCause==="wild-pitch"\)text=`\$\{base\} WP`/,
  'uncaught third strike on a wild pitch must display K WP');
assert.match(app, /if\(play\.outcome==="D3K"&&play\.droppedThirdStrikeCause==="passed-ball"\)text=`\$\{base\} PB`/,
  'uncaught third strike on a passed ball must display K PB');

const pitchContext = {
  scoring: {
    inning: 2,
    half: 'bottom',
    pitchLog: [
      {id:'p1',seq:1,inning:1,half:'top',type:'calledStrike',battingTeam:'away',pitchingTeam:'home'},
      {id:'p2',seq:2,inning:1,half:'top',type:'ball',battingTeam:'away',pitchingTeam:'home'},
      {id:'p3',seq:3,inning:1,half:'bottom',type:'calledStrike',battingTeam:'home',pitchingTeam:'away'},
      {id:'p4',seq:4,inning:1,half:'bottom',type:'ball',battingTeam:'home',pitchingTeam:'away',absChallengeId:'used'},
      {id:'p5',seq:5,inning:2,half:'top',type:'ball',absOriginalType:'calledStrike',battingTeam:'away',pitchingTeam:'home',absChallengeId:'edit-me'}
    ]
  },
  num(value) { return Number(value) || 0; }
};
vm.createContext(pitchContext);
for (const name of ['challengePitchOriginalType','latestChallengeablePitch','latestChallengeablePitchForTeam']) {
  vm.runInContext(extractFunction(app, name), pitchContext);
}
assert.equal(pitchContext.latestChallengeablePitchForTeam('away').id, 'p1',
  'team lookup must find an eligible prior-half batting challenge even after the game has advanced');
assert.equal(pitchContext.latestChallengeablePitchForTeam('home').id, 'p3',
  'team lookup must choose the latest eligible batting or fielding challenge and skip already challenged pitches');
assert.equal(pitchContext.latestChallengeablePitchForTeam('away','edit-me').id, 'p5',
  'editing a challenge must keep its corrected pitch eligible by original type');
assert.equal(pitchContext.latestChallengeablePitch(2,'top','batter','edit-me').id, 'p5',
  'editing a challenge must continue to link its corrected pitch by original type');
assert.equal(pitchContext.latestChallengeablePitch(1,'top','catcher').id, 'p2');

const notationContext = {
  num(value) { return Number(value) || 0; },
  errorNotation() { return ''; },
  interferenceCode() { return 'INT'; }
};
vm.createContext(notationContext);
vm.runInContext(extractFunction(app, 'playNotation'), notationContext);
assert.equal(notationContext.playNotation({outcome:'D3K',droppedThirdStrikeCause:'wild-pitch',fieldingErrors:[]}), 'K WP');
assert.equal(notationContext.playNotation({outcome:'D3K',droppedThirdStrikeCause:'passed-ball',fieldingErrors:[]}), 'K PB');
assert.equal(notationContext.playNotation({outcome:'HR',runs:1,rbi:1}), 'HR',
  'plate-appearance notation must remain result-only');
assert.equal(notationContext.playNotation({eventType:'runner',outcomeCode:'SB',runnerEvent:{primaryBase:1,toBase:'2'}}), 'SB2');

console.log('Version 32 pitch-by-pitch audit regression tests passed.');
