const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

assert.match(html,/Who requested it\?<select id="challengeRole">[\s\S]*value="batter"[\s\S]*value="pitcher"[\s\S]*value="catcher"/,'ABS dialog must visibly offer batter, pitcher, and catcher');
assert.match(html,/The batter may challenge a called strike; the pitcher or catcher may challenge a called ball/,'ABS rule note must distinguish offensive and defensive initiators');
assert.match(html,/id="challengeRoleRule"/,'dialog must explain how the selected initiator maps to the team and call');
assert.match(app,/function allowedChallengeRoles\(\)\{return \["batter","pitcher","catcher"\];\}/,'all three authorized initiators must remain selectable');
assert.match(app,/incoming\.team=expectedTeam/,'saved ABS event must automatically use the team authorized for the selected initiator');
assert.match(app,/incoming\.originalCall=incoming\.challengerRole==="batter"\?"strike":"ball"/,'batter must map to called strike and pitcher/catcher to called ball');
assert.match(app,/const permittedType=role==="batter"\?"calledStrike"/,'batter challenge must link only to a called strike');
assert.match(app,/\["pitcher","catcher"\]\.includes\(role\)\?"ball"/,'pitcher and catcher challenges must link only to a called ball');
assert.match(app,/updateChallengePitchLink\(false\)/,'changing the initiator must refresh the linked challengeable pitch');

const start=app.indexOf('function fieldingTeamForHalf(');
const end=app.indexOf('function populateChallengeRoleOptions(',start);
assert(start>=0&&end>start,'pure ABS role/team helpers must exist');
const context={};vm.createContext(context);
vm.runInContext('function battingTeamForHalf(half){return half==="top"?"away":"home";}'+app.slice(start,end)+';this.challengeTeamForRole=challengeTeamForRole;this.defaultChallengeRoleForTeam=defaultChallengeRoleForTeam;this.allowedChallengeRoles=allowedChallengeRoles;',context);
assert.equal(context.challengeTeamForRole('batter','top'),'away');
assert.equal(context.challengeTeamForRole('batter','bottom'),'home');
assert.equal(context.challengeTeamForRole('pitcher','top'),'home');
assert.equal(context.challengeTeamForRole('catcher','bottom'),'away');
assert.equal(context.defaultChallengeRoleForTeam('away','top'),'batter');
assert.equal(context.defaultChallengeRoleForTeam('home','top'),'catcher');
assert.deepEqual(Array.from(context.allowedChallengeRoles()),['batter','pitcher','catcher']);
console.log('Version 32 ABS batter initiator tests passed.');
