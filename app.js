const LINEUP_ROWS = 9;
const SCORECARD_PITCHER_ROWS = 6;
const PITCHER_ROWS = 15;
const BENCH_ROWS = 10;
const PA_SLOTS = 10;
const ERROR_TYPES = [
  ["fielding","Fielding error"],["throwing","Throwing error"],["catching","Catching error"],
  ["dropped-fly","Dropped fly ball"],["missed-catch","Missed catch"],["catcher-interference","Catcher interference"],["other","Other error"]
];
const INTERFERENCE_TYPES = [
  {id:"batter",label:"Batter interference",code:"BI",endsPa:true,atBat:true,hit:false,outs:1,ruling:"offensive-out"},
  {id:"runner",label:"Runner interference",code:"RI",endsPa:false,atBat:false,hit:false,outs:1,ruling:"runner-out"},
  {id:"offensive-team",label:"Offensive team member / coach interference",code:"OI",endsPa:false,atBat:false,hit:false,outs:1,ruling:"umpire-placement"},
  {id:"catcher",label:"Catcher interference",code:"CI",endsPa:true,atBat:false,hit:false,outs:0,ruling:"batter-first"},
  {id:"umpire-batted",label:"Umpire interference — fair batted ball",code:"UI",endsPa:true,atBat:true,hit:true,outs:0,ruling:"batter-first"},
  {id:"umpire-catcher",label:"Umpire interference — catcher throw",code:"UI",endsPa:false,atBat:false,hit:false,outs:0,ruling:"runners-return"},
  {id:"spectator",label:"Fan / spectator interference",code:"FI",endsPa:true,atBat:true,hit:false,outs:0,ruling:"umpire-placement"},
  {id:"authorized-person",label:"Other person on field interference",code:"INT",endsPa:false,atBat:false,hit:false,outs:0,ruling:"umpire-placement"},
  {id:"other",label:"Other interference",code:"INT",endsPa:true,atBat:false,hit:false,outs:0,ruling:"custom"}
];
const INTERFERENCE_RULINGS = [
  ["offensive-out","Offensive player out; ball dead"],
  ["runner-out","Runner out; other runners return"],
  ["batter-first","Batter awarded first base"],
  ["runners-return","Ball dead; runners return"],
  ["umpire-placement","Umpire placed runners / awarded bases"],
  ["play-stands","Play allowed to stand"],
  ["custom","Other / custom ruling"]
];
const POSITION_NUMBERS = {P:"1",C:"2","1B":"3","2B":"4","3B":"5",SS:"6",LF:"7",CF:"8",RF:"9"};
const LEGACY_STORAGE_PREFIXES = ["guariglia-scorecard", "scorecard20260615"];
const AUTOSAVE_STORAGE_KEY = "guariglia-scorecard-v34-autosave-current";
const AUTOSAVE_BACKUP_KEY = "guariglia-scorecard-v34-autosave-previous";
const AUTOSAVE_ROSTER_KEY = "guariglia-scorecard-v34-roster-mirror";
const LEGACY_AUTOSAVE_KEYS = [
  {label:"Version 33",current:"guariglia-scorecard-v33-autosave-current",backup:"guariglia-scorecard-v33-autosave-previous",roster:"guariglia-scorecard-v33-roster-mirror"},
  {label:"Version 32",current:"guariglia-scorecard-v32-autosave-current",backup:"guariglia-scorecard-v32-autosave-previous",roster:"guariglia-scorecard-v32-roster-mirror"},
  {label:"Version 31",current:"guariglia-scorecard-v31-autosave-current",backup:"guariglia-scorecard-v31-autosave-previous",roster:"guariglia-scorecard-v31-roster-mirror"},
  {label:"Version 30",current:"guariglia-scorecard-v30-autosave-current",backup:"guariglia-scorecard-v30-autosave-previous",roster:"guariglia-scorecard-v30-roster-mirror"},
  {label:"Version 29",current:"guariglia-scorecard-v29-autosave-current",backup:"guariglia-scorecard-v29-autosave-previous",roster:"guariglia-scorecard-v29-roster-mirror"},
  {label:"Version 28",current:"guariglia-scorecard-v28-autosave-current",backup:"guariglia-scorecard-v28-autosave-previous",roster:"guariglia-scorecard-v28-roster-mirror"},
  {label:"Version 27.2",current:"guariglia-scorecard-v27.2-autosave-current",backup:"guariglia-scorecard-v27.2-autosave-previous",roster:"guariglia-scorecard-v27.2-roster-mirror"}
];
const AUTOSAVE_SCHEMA_VERSION = 2;
const TEMPLATE_FILE_NAME = "Scorecard_20260615_blank_template.xlsx";
const VERSION_NUMBER = 34;
const DEFAULT_SCORECARD_COLORS = {primary:"#3D2519",secondary:"#9B4D1F",accent:"#D9A441"};
const MLB_TEAM_COLOR_RECORDS = [
  {aliases:["arizona diamondbacks","diamondbacks","ari"],primary:"#A71930",secondary:"#000000",accent:"#E3D4AD"},
  {aliases:["atlanta braves","braves","atl"],primary:"#13274F",secondary:"#CE1141",accent:"#EAAA00"},
  {aliases:["baltimore orioles","orioles","bal"],primary:"#000000",secondary:"#DF4601",accent:"#FFFFFF"},
  {aliases:["boston red sox","red sox","bos"],primary:"#0C2340",secondary:"#BD3039",accent:"#FFFFFF"},
  {aliases:["chicago cubs","cubs","chc"],primary:"#0E3386",secondary:"#CC3433",accent:"#FFFFFF"},
  {aliases:["chicago white sox","white sox","chw","cws"],primary:"#27251F",secondary:"#C4CED4",accent:"#FFFFFF"},
  {aliases:["cincinnati reds","reds","cin"],primary:"#C6011F",secondary:"#000000",accent:"#FFFFFF"},
  {aliases:["cleveland guardians","guardians","cle"],primary:"#00385D",secondary:"#E50022",accent:"#FFFFFF"},
  {aliases:["colorado rockies","rockies","col"],primary:"#33006F",secondary:"#C4CED4",accent:"#000000"},
  {aliases:["detroit tigers","tigers","det"],primary:"#0C2340",secondary:"#FA4616",accent:"#FFFFFF"},
  {aliases:["houston astros","astros","hou"],primary:"#002D62",secondary:"#EB6E1F",accent:"#F4911E"},
  {aliases:["kansas city royals","royals","kc","kcr"],primary:"#004687",secondary:"#BD9B60",accent:"#FFFFFF"},
  {aliases:["los angeles angels","la angels","angels","laa"],primary:"#BA0021",secondary:"#003263",accent:"#C4CED4"},
  {aliases:["los angeles dodgers","la dodgers","dodgers","lad"],primary:"#005A9C",secondary:"#EF3E42",accent:"#FFFFFF"},
  {aliases:["miami marlins","marlins","mia"],primary:"#00A3E0",secondary:"#EF3340",accent:"#000000"},
  {aliases:["milwaukee brewers","brewers","mil"],primary:"#12284B",secondary:"#FFC52F",accent:"#FFFFFF"},
  {aliases:["minnesota twins","twins","min"],primary:"#002B5C",secondary:"#D31145",accent:"#B9975B"},
  {aliases:["new york mets","ny mets","mets","nym"],primary:"#002D72",secondary:"#FF5910",accent:"#FFFFFF"},
  {aliases:["new york yankees","ny yankees","yankees","nyy"],primary:"#0C2340",secondary:"#C4CED4",accent:"#FFFFFF"},
  {aliases:["athletics","a's","as","oakland athletics","sacramento athletics","ath","oak"],primary:"#003831",secondary:"#EFB21E",accent:"#FFFFFF"},
  {aliases:["philadelphia phillies","phillies","phi"],primary:"#E81828",secondary:"#002D72",accent:"#FFFFFF"},
  {aliases:["pittsburgh pirates","pirates","pit"],primary:"#27251F",secondary:"#FDB827",accent:"#FFFFFF"},
  {aliases:["san diego padres","padres","sd","sdp"],primary:"#2F241D",secondary:"#FFC425",accent:"#FFFFFF"},
  {aliases:["san francisco giants","sf giants","giants","sf","sfg"],primary:"#27251F",secondary:"#FD5A1E",accent:"#EFD19F"},
  {aliases:["seattle mariners","mariners","sea"],primary:"#0C2C56",secondary:"#005C5C",accent:"#C4CED4"},
  {aliases:["st louis cardinals","st. louis cardinals","cardinals","stl"],primary:"#0C2340",secondary:"#C41E3A",accent:"#FEDB00"},
  {aliases:["tampa bay rays","rays","tb","tbr"],primary:"#092C5C",secondary:"#8FBCE6",accent:"#F5D130"},
  {aliases:["texas rangers","rangers","tex"],primary:"#003278",secondary:"#C0111F",accent:"#FFFFFF"},
  {aliases:["toronto blue jays","blue jays","tor"],primary:"#134A8E",secondary:"#E8291C",accent:"#FFFFFF"},
  {aliases:["washington nationals","nationals","wsh","was"],primary:"#14225A",secondary:"#AB0003",accent:"#FFFFFF"}
];

const OUTCOMES = [
  {id:"1B", label:"Single", code:"1B", hit:1, bases:1, ab:true},
  {id:"2B", label:"Double", code:"2B", hit:1, bases:2, ab:true},
  {id:"3B", label:"Triple", code:"3B", hit:1, bases:3, ab:true},
  {id:"HR", label:"Home Run", code:"HR", hit:1, bases:4, ab:true, hr:1},
  {id:"BB", label:"Walk", code:"BB", bb:1, ab:false},
  {id:"IBB", label:"Intentional Walk", code:"IBB", bb:1, ab:false},
  {id:"HBP", label:"Hit by Pitch", code:"HBP", ab:false},
  {id:"ROE", label:"Reached on Error", code:"E", ab:true},
  {id:"FC", label:"Fielder’s Choice", code:"FC", ab:true},
  {id:"CI", label:"Catcher Interference", code:"CI", ab:false},
  {id:"INT", label:"Interference", code:"INT", ab:false},
  {id:"D3K", label:"Third Strike Not Caught", code:"K+", k:1, ab:true},
  {id:"K", label:"Strikeout Swinging", code:"K", k:1, ab:true, out:true},
  {id:"KL", label:"Strikeout Looking", code:"K", looking:true, k:1, ab:true, out:true},
  {id:"GO", label:"Groundout", code:"GO", ab:true, out:true},
  {id:"FO", label:"Flyout", code:"FO", ab:true, out:true},
  {id:"LO", label:"Lineout", code:"LO", ab:true, out:true},
  {id:"PO", label:"Popout", code:"PO", ab:true, out:true},
  {id:"SF", label:"Sacrifice Fly", code:"SF", ab:false, out:true},
  {id:"SH", label:"Sacrifice Bunt", code:"SAC", ab:false, out:true},
  {id:"DP", label:"Double Play", code:"DP", ab:true, out:true},
  {id:"TP", label:"Triple Play", code:"TP", ab:true, out:true},
  {id:"OBS", label:"Reached on Obstruction", code:"OBS", ab:false},
  {id:"OTHER", label:"Other / Custom Play", code:"OTH", ab:false}
];
const OUTCOME_MAP = Object.fromEntries(OUTCOMES.map(o => [o.id, o]));
const FIELD_POSITIONS = [
  {number:"1",code:"P",label:"Pitcher"},
  {number:"2",code:"C",label:"Catcher"},
  {number:"3",code:"1B",label:"First Base"},
  {number:"4",code:"2B",label:"Second Base"},
  {number:"5",code:"3B",label:"Third Base"},
  {number:"6",code:"SS",label:"Shortstop"},
  {number:"7",code:"LF",label:"Left Field"},
  {number:"8",code:"CF",label:"Center Field"},
  {number:"9",code:"RF",label:"Right Field"}
];
const FIELD_POSITION_COORDS = {"1":[50,63],"2":[50,87],"3":[76,68],"4":[63,50],"5":[24,68],"6":[37,50],"7":[19,29],"8":[50,17],"9":[81,29]};
const BATTED_BALL_OUTCOMES = new Set(["1B","2B","3B","ROE","FC","GO","FO","LO","PO","SF","SH","DP","TP"]);
const MULTI_FIELDER_OUTCOMES = new Set(["ROE","FC","GO","SH","DP","TP"]);
let pendingFieldLocationAction = null;
let pendingFieldingSequence = [];
const QUICK_RESULTS = [
  ["1B","Single"],["2B","Double"],["3B","Triple"],["HR","Home Run"],
  ["BB","Walk"],["HBP","Hit by Pitch"],["K","Strikeout"],["KL","Looking K"],
  ["GO","Groundout"],["FO","Flyout"],["LO","Lineout"],["PO","Popout"],
  ["ROE","Error"],["FC","Fielder’s Choice"],["SF","Sac Fly"],["SH","Sac Bunt"],
  ["DP","Double Play"],["IBB","Intentional Walk"],["INT","Interference"],["OTHER","Other / Details"]
];
const DESTINATIONS = [
  ["empty","No runner"], ["hold","Stayed"], ["1","First base"], ["2","Second base"], ["3","Third base"], ["home","Scored"], ["out","Out"]
];
const BATTER_DESTINATIONS = [["out","Out"],["1","First base"],["2","Second base"],["3","Third base"],["home","Home / scored"]];
const RUNNER_EVENT_TYPES = [
  ["steal","Steal attempt"],
  ["pickoff","Pickoff attempt"],
  ["wild-pitch","Wild pitch"],
  ["passed-ball","Passed ball"],
  ["defensive-indifference","Defensive indifference"]
];
const RUNNER_EVENT_RESULTS = {
  steal:[["stolen-base","Stolen base — safe"],["caught-stealing","Caught stealing — out"]],
  pickoff:[["safe","Runner safe — no advance"],["picked-off","Runner picked off — out"],["advanced","Runner advanced"],["advanced-error","Runner advanced on error / overthrow"],["balk","Balk or disengagement violation — runner awarded next base"]],
  "wild-pitch":[["advance","Runner(s) advanced on wild pitch"]],
  "passed-ball":[["advance","Runner(s) advanced on passed ball"]],
  "defensive-indifference":[["advance","Runner advanced — defensive indifference"]]
};
const PITCH_TYPE_INFO = {
  ball:{code:"B",label:"Ball",ball:true},
  strike:{code:"S",label:"Strike",strike:true},
  swingingStrike:{code:"SW",label:"Swinging Strike",strike:true},
  calledStrike:{code:"C",label:"Called Strike",strike:true},
  foul:{code:"F",label:"Foul",strike:true},
  inplay:{code:"IP",label:"In Play",strike:true},
  hitByPitch:{code:"HBP",label:"Hit By Pitch",hbp:true}
};
const BALL_IN_PLAY_OUTCOMES = new Set(["1B","2B","3B","HR","ROE","FC","GO","FO","LO","PO","SF","SH","DP","TP"]);
const $ = id => document.getElementById(id);
const deepClone = obj => JSON.parse(JSON.stringify(obj));
const makeId = () => globalThis.crypto?.randomUUID?.() || `play-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const sum = values => values.reduce((a,b)=>a+num(b),0);
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
function normalizeTeamColorName(value){return String(value||"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim();}
function hexToRgb(hex){const clean=String(hex||"").replace("#","");return {r:parseInt(clean.slice(0,2),16)||0,g:parseInt(clean.slice(2,4),16)||0,b:parseInt(clean.slice(4,6),16)||0};}
function rgbToHex({r,g,b}){return `#${[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("")}`.toUpperCase();}
function mixHex(a,b,amount){const x=hexToRgb(a),y=hexToRgb(b),t=Math.max(0,Math.min(1,amount));return rgbToHex({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t});}
function colorLuminance(hex){const {r,g,b}=hexToRgb(hex),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);}
function contrastText(hex){return colorLuminance(hex)>.48?"#241B16":"#FFFFFF";}
function scorecardPaletteForHomeTeam(teamName){
  // Version 32 uses one consistent Guariglia palette in the app and every PDF, regardless of matchup.
  const {primary,secondary,accent}=DEFAULT_SCORECARD_COLORS;
  return {team:"Guariglia",primary,secondary,accent,onPrimary:contrastText(primary),onSecondary:contrastText(secondary),text:primary,cream:mixHex(accent,"#FFFFFF",.91),light:mixHex(secondary,"#FFFFFF",.89),alternate:mixHex(primary,"#FFFFFF",.93),yellow:mixHex(accent,"#FFFFFF",.78),grid:mixHex(primary,"#FFFFFF",.63),gridDark:mixHex(primary,"#FFFFFF",.38)};
}
function paletteStatusText(){return "Guariglia brown, burnt-orange, gold, and cream palette";}

let uploadedTemplateBuffer = null;
let uploadedTemplateName = "";
let scheduleGames = [];
let scheduleRequestToken = 0;
let autosaveTimer = null;
let lastAutosaveStateJson = "";
let autosaveRestoring = false;
const gameFieldCache = new Map();
let deferredInstallPrompt = null;
let dialogErrorRoster = [];
let pendingExportKind = "";

function emptyBases(){ return {1:null,2:null,3:null}; }
function initialCount(){ return {balls:0,strikes:0,pitches:0,history:[],pendingStrikeout:false,inPlay:false,sessionId:""}; }
function normalizeCount(value={}){
  const count=initialCount();
  count.balls=Math.max(0,Math.min(4,num(value.balls)));
  count.strikes=Math.max(0,Math.min(3,num(value.strikes)));
  count.pitches=Math.max(0,num(value.pitches));
  count.history=Array.isArray(value.history)?value.history.map(item=>String(item)):[];
  count.pendingStrikeout=Boolean(value.pendingStrikeout);
  count.inPlay=Boolean(value.inPlay);
  count.sessionId=String(value.sessionId||"");
  return count;
}
function initialChallengeState(){ return {events:[],nextSeq:1,version:1}; }
function initialManagerReplayState(){ return {events:[],nextSeq:1,version:1}; }
function initialGameStatus(){return {status:"active",winner:"",reason:"",inning:0,half:"",endedAtSeq:0};}
function initialScoring(){
  return {inning:1,half:"top",outs:0,bases:emptyBases(),battingIndexes:{away:0,home:0},plays:[],nextSeq:1,count:initialCount(),pitchLog:[],nextPitchSeq:1,pitchLogVersion:1,activePitchers:{away:0,home:0},lastAutoStrikeoutPlayId:"",managerReplayChallenges:initialManagerReplayState(),challenges:initialChallengeState(),substitutions:[],nextSubstitutionSeq:1,pitcherChanges:[],nextPitcherChangeSeq:1,gameStatus:initialGameStatus(),automaticRunnerPlacements:[]};
}
function ensureScoringState(){
  if(!scoring||typeof scoring!=="object")scoring=initialScoring();
  const needsLegacyPitchImport=!Array.isArray(scoring.pitchLog)&&!scoring.pitchLogVersion;
  scoring.count=normalizeCount(scoring.count||{});
  scoring.bases=scoring.bases||emptyBases();
  scoring.battingIndexes=scoring.battingIndexes||{away:0,home:0};
  scoring.plays=Array.isArray(scoring.plays)?scoring.plays:[];
  scoring.pitchLog=Array.isArray(scoring.pitchLog)?scoring.pitchLog:[];
  scoring.nextPitchSeq=Math.max(1,num(scoring.nextPitchSeq)||1,...scoring.pitchLog.map(event=>num(event.seq)+1));
  scoring.pitchLogVersion=1;
  scoring.activePitchers={away:Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.away))),home:Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.home)))};
  scoring.lastAutoStrikeoutPlayId=String(scoring.lastAutoStrikeoutPlayId||"");
  if(!scoring.managerReplayChallenges||typeof scoring.managerReplayChallenges!=="object")scoring.managerReplayChallenges=initialManagerReplayState();
  scoring.managerReplayChallenges.events=Array.isArray(scoring.managerReplayChallenges.events)?scoring.managerReplayChallenges.events:[];
  scoring.managerReplayChallenges.nextSeq=Math.max(1,num(scoring.managerReplayChallenges.nextSeq)||1,...scoring.managerReplayChallenges.events.map(event=>num(event.seq)+1));
  scoring.managerReplayChallenges.version=1;
  if(!scoring.challenges||typeof scoring.challenges!=="object")scoring.challenges=initialChallengeState();
  scoring.challenges.events=Array.isArray(scoring.challenges.events)?scoring.challenges.events:[];
  scoring.challenges.nextSeq=Math.max(1,num(scoring.challenges.nextSeq)||1,...scoring.challenges.events.map(event=>num(event.seq)+1));
  scoring.challenges.version=1;
  scoring.substitutions=Array.isArray(scoring.substitutions)?scoring.substitutions:[];
  scoring.nextSubstitutionSeq=Math.max(1,num(scoring.nextSubstitutionSeq)||1,...scoring.substitutions.map(event=>num(event.seq)+1));
  scoring.pitcherChanges=Array.isArray(scoring.pitcherChanges)?scoring.pitcherChanges:[];
  scoring.nextPitcherChangeSeq=Math.max(1,num(scoring.nextPitcherChangeSeq)||1,...scoring.pitcherChanges.map(event=>num(event.seq)+1));
  if(!scoring.gameStatus||typeof scoring.gameStatus!=="object")scoring.gameStatus=initialGameStatus();
  scoring.gameStatus={...initialGameStatus(),...scoring.gameStatus};
  scoring.automaticRunnerPlacements=Array.isArray(scoring.automaticRunnerPlacements)?scoring.automaticRunnerPlacements:[];
  scoring.plays.forEach(play=>{play.fieldingErrors=Array.isArray(play.fieldingErrors)?play.fieldingErrors:[];play.keyPlay=Boolean(play.keyPlay);});
  if(needsLegacyPitchImport)reconstructLegacyPitchLog();
}
let scoring = initialScoring();
let scoringViewMode = "plateAppearances";

function createLineupInputs(team){
  const wrap = $(`${team}LineupInputs`); wrap.innerHTML="";
  const caption=document.createElement("div"); caption.className="input-caption"; caption.textContent="# / Name / Pos / Bats / AVG / OBP"; wrap.appendChild(caption);
  for(let i=1;i<=LINEUP_ROWS;i++){
    const row=document.createElement("div"); row.className="lineup-row responsive-entry-row";
    row.innerHTML=`
      <span class="row-number" aria-label="Batting order ${i}">${i}</span>
      <label class="mini-field number-field"><span>No.</span><input id="${team}Num${i}" placeholder="#" aria-label="${team} player ${i} number" autocomplete="off"></label>
      <label class="mini-field name-field"><span>Player name</span><input id="${team}Player${i}" placeholder="Player name" aria-label="${team} player ${i} name" autocomplete="off"></label>
      <label class="mini-field"><span>Position</span><input id="${team}Pos${i}" placeholder="Pos" aria-label="${team} player ${i} position" autocomplete="off"></label>
      <label class="mini-field"><span>Bats</span><input id="${team}Bats${i}" placeholder="Bats" aria-label="${team} player ${i} bats" autocomplete="off"></label>
      <label class="mini-field"><span>AVG</span><input id="${team}Avg${i}" placeholder="AVG" aria-label="${team} player ${i} average" autocomplete="off"></label>
      <label class="mini-field"><span>OBP</span><input id="${team}Obp${i}" placeholder="OBP" aria-label="${team} player ${i} on base percentage" autocomplete="off"></label>`;
    wrap.appendChild(row);
  }
}
function createBenchInputs(team){
  const wrap=$(`${team}BenchInputs`);if(!wrap)return;wrap.innerHTML="";
  const caption=document.createElement("div");caption.className="input-caption";caption.textContent="# / Name / Pos / Bats / AVG / OBP";wrap.appendChild(caption);
  for(let i=1;i<=BENCH_ROWS;i++){
    const row=document.createElement("div");row.className="bench-row responsive-entry-row";
    row.innerHTML=`
      <span class="row-number" aria-label="Bench player ${i}">B${i}</span>
      <label class="mini-field number-field"><span>No.</span><input id="${team}BenchNum${i}" placeholder="#" aria-label="${team} bench player ${i} number" autocomplete="off"></label>
      <label class="mini-field name-field"><span>Player name</span><input id="${team}BenchPlayer${i}" placeholder="Player name" aria-label="${team} bench player ${i} name" autocomplete="off"></label>
      <label class="mini-field"><span>Position</span><input id="${team}BenchPos${i}" placeholder="Pos" aria-label="${team} bench player ${i} position" autocomplete="off"></label>
      <label class="mini-field"><span>Bats</span><input id="${team}BenchBats${i}" placeholder="Bats" aria-label="${team} bench player ${i} bats" autocomplete="off"></label>
      <label class="mini-field"><span>AVG</span><input id="${team}BenchAvg${i}" placeholder="AVG" aria-label="${team} bench player ${i} average" autocomplete="off"></label>
      <label class="mini-field"><span>OBP</span><input id="${team}BenchObp${i}" placeholder="OBP" aria-label="${team} bench player ${i} on base percentage" autocomplete="off"></label>`;
    wrap.appendChild(row);
  }
}
function createPitcherInputs(team){
  const visibleWrap=$(`${team}PitcherInputs`),poolWrap=$(`${team}BullpenInputs`);visibleWrap.innerHTML="";if(poolWrap)poolWrap.innerHTML="";
  const caption=document.createElement("div");caption.className="input-caption";caption.textContent="Role / # / Name / Throws / Record / ERA / K";visibleWrap.appendChild(caption);
  for(let i=1;i<=PITCHER_ROWS;i++){
    const row=document.createElement("div");row.className=`pitcher-row responsive-entry-row ${i===1?"starter-pitcher-row":"added-pitcher-row"}`;row.id=`${team}PitcherRow${i}`;row.dataset.pitcherRow=String(i-1);
    row.innerHTML=`
      <span class="row-number" aria-label="Pitcher row ${i}">${i===1?"SP":"RP"}</span>
      <label class="mini-field number-field"><span>No.</span><input id="${team}PitcherNum${i}" placeholder="#" aria-label="${team} pitcher ${i} number" autocomplete="off"></label>
      <label class="mini-field name-field"><span>Pitcher name</span><input id="${team}Pitcher${i}" placeholder="Pitcher name" aria-label="${team} pitcher ${i} name" autocomplete="off"></label>
      <label class="mini-field"><span>Throws</span><input id="${team}PitcherThrows${i}" placeholder="Throws" aria-label="${team} pitcher ${i} throws" autocomplete="off"></label>
      <label class="mini-field"><span>Record</span><input id="${team}PitcherRecord${i}" placeholder="Record" aria-label="${team} pitcher ${i} record" autocomplete="off"></label>
      <label class="mini-field"><span>ERA</span><input id="${team}PitcherEra${i}" placeholder="ERA" aria-label="${team} pitcher ${i} ERA" autocomplete="off"></label>
      <label class="mini-field"><span>K</span><input id="${team}PitcherK${i}" placeholder="K" aria-label="${team} pitcher ${i} strikeouts" autocomplete="off"></label>`;
    (i===1||!poolWrap?visibleWrap:poolWrap).appendChild(row);
  }
}
const GAME_DATA_TOP_LEVEL_FIELDS = new Set(["awayTeam","homeTeam","awayRecord","homeRecord","gameDate","gameTime","venue","gameNumber","extraInningsRule","managerChallengeAllotment","weather","umpires","broadcast","radio","gameNotes"]);
function isGameDataFieldId(id=""){
  return GAME_DATA_TOP_LEVEL_FIELDS.has(id)||/^(away|home)(Num|Player|Pos|Bats|Avg|Obp|BenchNum|BenchPlayer|BenchPos|BenchBats|BenchAvg|BenchObp|PitcherNum|Pitcher|PitcherThrows|PitcherRecord|PitcherEra|PitcherK)\d+$/.test(id);
}
function normalizedFieldValue(value){return String(value??"").trim();}
function rememberGameFieldValue(fieldOrId,value){
  const id=typeof fieldOrId==="string"?fieldOrId:fieldOrId?.id;
  if(!id||!isGameDataFieldId(id))return;
  const resolved=value!==undefined?value:fieldOrId?.value;
  gameFieldCache.set(id,normalizedFieldValue(resolved));
}
function getField(id){
  const current=normalizedFieldValue($(id)?.value);
  if(current!==""||!isGameDataFieldId(id)||!gameFieldCache.has(id))return current;
  return gameFieldCache.get(id)||"";
}
function setField(id,value){
  const field=$(id),resolved=value??"";
  if(field)field.value=resolved;
  rememberGameFieldValue(id,resolved);
}
function clearGameFieldCache(){gameFieldCache.clear();}
function rehydrateGameFieldsFromCache(){
  let restored=0;
  for(const [id,value] of gameFieldCache.entries()){
    const field=$(id);
    if(field&&value&&normalizedFieldValue(field.value)===""){field.value=value;restored++;}
  }
  return restored;
}
function mergeMissingGameData(current={},fallback={}){
  const merged=deepClone(current||{}),source=fallback||{};
  for(const id of GAME_DATA_TOP_LEVEL_FIELDS)if(!normalizedFieldValue(merged[id])&&normalizedFieldValue(source[id]))merged[id]=source[id];
  for(const team of ["away","home"]){
    merged[team]=merged[team]||{};
    for(const group of ["lineup","bench","pitchers"]){
      const rows=Array.isArray(merged[team][group])?merged[team][group]:[],backup=Array.isArray(source?.[team]?.[group])?source[team][group]:[],length=Math.max(rows.length,backup.length);
      merged[team][group]=Array.from({length},(_,index)=>{
        const row={...(rows[index]||{})},prior=backup[index]||{};
        for(const [key,value] of Object.entries(prior))if(!normalizedFieldValue(row[key])&&normalizedFieldValue(value))row[key]=value;
        return row;
      });
    }
  }
  return merged;
}
function readRosterMirror(){
  try{
    let raw=localStorage.getItem(AUTOSAVE_ROSTER_KEY);
    if(!raw){
      for(const legacy of LEGACY_AUTOSAVE_KEYS){
        raw=localStorage.getItem(legacy.roster);
        if(raw){localStorage.setItem(AUTOSAVE_ROSTER_KEY,raw);break;}
      }
    }
    if(!raw)return null;const parsed=JSON.parse(raw);return parsed?.data?parsed:null;
  }catch(err){console.warn("Roster mirror could not be read",err);return null;}
}
function persistRosterMirror(data){
  try{localStorage.setItem(AUTOSAVE_ROSTER_KEY,JSON.stringify({savedAt:new Date().toISOString(),data:deepClone(data)}));return true;}catch(err){console.warn("Roster mirror could not be saved",err);return false;}
}
function collectTeam(team){
  const lineup=[]; const bench=[]; const pitchers=[];
  for(let i=1;i<=LINEUP_ROWS;i++) lineup.push({num:getField(`${team}Num${i}`),name:getField(`${team}Player${i}`),pos:getField(`${team}Pos${i}`),bats:getField(`${team}Bats${i}`),avg:getField(`${team}Avg${i}`),obp:getField(`${team}Obp${i}`)});
  for(let i=1;i<=BENCH_ROWS;i++) bench.push({num:getField(`${team}BenchNum${i}`),name:getField(`${team}BenchPlayer${i}`),pos:getField(`${team}BenchPos${i}`),bats:getField(`${team}BenchBats${i}`),avg:getField(`${team}BenchAvg${i}`),obp:getField(`${team}BenchObp${i}`)});
  for(let i=1;i<=PITCHER_ROWS;i++) pitchers.push({num:getField(`${team}PitcherNum${i}`),name:getField(`${team}Pitcher${i}`),throws:getField(`${team}PitcherThrows${i}`),record:getField(`${team}PitcherRecord${i}`),era:getField(`${team}PitcherEra${i}`),k:getField(`${team}PitcherK${i}`)});
  return {lineup,bench,pitchers};
}
function collectData(){
  return {awayTeam:getField("awayTeam"),homeTeam:getField("homeTeam"),awayRecord:getField("awayRecord"),homeRecord:getField("homeRecord"),gameDate:getField("gameDate"),gameTime:getField("gameTime"),venue:getField("venue"),gameNumber:getField("gameNumber"),extraInningsRule:getField("extraInningsRule")||"automatic-runner",managerChallengeAllotment:getField("managerChallengeAllotment")==="2"?"2":"1",weather:getField("weather"),umpires:getField("umpires"),broadcast:getField("broadcast"),radio:getField("radio"),gameNotes:getField("gameNotes"),away:collectTeam("away"),home:collectTeam("home")};
}
function setFieldsFromData(data={}){
  ["awayTeam","homeTeam","awayRecord","homeRecord","gameDate","gameTime","venue","gameNumber","weather","umpires","broadcast","radio","gameNotes"].forEach(id=>setField(id,data[id]||""));
  setField("extraInningsRule",data.extraInningsRule||"automatic-runner");
  setField("managerChallengeAllotment",String(data.managerChallengeAllotment||"1")==="2"?"2":"1");
  ["away","home"].forEach(team=>{
    const t=data[team]||{};
    for(let x=0;x<LINEUP_ROWS;x++){const p=(t.lineup||[])[x]||{},i=x+1;setField(`${team}Num${i}`,p.num);setField(`${team}Player${i}`,p.name);setField(`${team}Pos${i}`,p.pos);setField(`${team}Bats${i}`,p.bats);setField(`${team}Avg${i}`,p.avg);setField(`${team}Obp${i}`,p.obp);}
    for(let x=0;x<BENCH_ROWS;x++){const p=(t.bench||[])[x]||{},i=x+1;setField(`${team}BenchNum${i}`,p.num);setField(`${team}BenchPlayer${i}`,p.name);setField(`${team}BenchPos${i}`,p.pos);setField(`${team}BenchBats${i}`,p.bats);setField(`${team}BenchAvg${i}`,p.avg);setField(`${team}BenchObp${i}`,p.obp);}
    for(let x=0;x<PITCHER_ROWS;x++){const p=(t.pitchers||[])[x]||{},i=x+1;setField(`${team}PitcherNum${i}`,p.num);setField(`${team}Pitcher${i}`,p.name);setField(`${team}PitcherThrows${i}`,p.throws);setField(`${team}PitcherRecord${i}`,p.record);setField(`${team}PitcherEra${i}`,p.era);setField(`${team}PitcherK${i}`,p.k);}
  });
  refreshAll();
}
function formatPlayer(player,index){
  const name=player.name||`Batter ${index+1}`; const detail=[player.num?`#${String(player.num).replace(/^#/,"")}`:"",player.pos,player.bats].filter(Boolean).join(" • ");
  return {name,detail};
}
function formatLineupPlayer(p){
  const left=[p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name].filter(Boolean).join(" ");
  const details=[p.pos,p.bats,[p.avg,p.obp].filter(Boolean).join("/")].filter(Boolean);
  return [left,...details].filter(Boolean).join(" — ");
}
function formatPitcher(p){
  const left=[p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name].filter(Boolean).join(" ");
  const details=[p.throws,p.record,p.era?`${String(p.era).replace(/\s*ERA$/i,"")} ERA`:"",p.k?`${String(p.k).replace(/\s*K$/i,"")} K`:""].filter(Boolean);
  return [left,...details].filter(Boolean).join(" — ");
}
function pitcherAlphabeticalParts(pitcher={}){
  const raw=String(pitcher?.name||"").trim().replace(/\s+/g," ");
  if(!raw)return {last:"",first:"",number:String(pitcher?.num||"")};
  const comma=raw.match(/^([^,]+),\s*(.+)$/);
  if(comma)return {last:comma[1].trim(),first:comma[2].trim(),number:String(pitcher?.num||"")};
  const words=raw.split(" ");
  while(words.length>1&&/^(jr\.?|sr\.?|ii|iii|iv|v)$/i.test(words.at(-1)))words.pop();
  const last=words.pop()||"";
  return {last,first:words.join(" "),number:String(pitcher?.num||"")};
}
function comparePitchersAlphabetically(a,b){
  const left=pitcherAlphabeticalParts(a?.pitcher||a),right=pitcherAlphabeticalParts(b?.pitcher||b),compare=(x,y)=>String(x||"").localeCompare(String(y||""),"en",{sensitivity:"base",numeric:true});
  return compare(left.last,right.last)||compare(left.first,right.first)||compare(left.number,right.number);
}
function pitcherRosterKey(p){return [String(p?.num||"").replace(/^#/,""),String(p?.name||"").trim().toLowerCase()].join("|");}
function scorecardPitchersForTeam(team){
  const data=collectData(),all=data[team]?.pitchers||[],selected=[],seen=new Set(),timeline=[];
  const mergePitcher=(base={},overlay={})=>{
    const merged={...base};
    for(const [key,value] of Object.entries(overlay||{}))if(value!==undefined&&value!==null&&String(value)!=="")merged[key]=value;
    return merged;
  };
  const rosterPitcher=(candidate={})=>{
    const row=Number.isInteger(candidate.row)?candidate.row:Number.isInteger(candidate.pitcherRow)?candidate.pitcherRow:Number.isInteger(candidate.incomingRow)?candidate.incomingRow:-1;
    const embedded=typeof candidate.pitcher==="object"&&candidate.pitcher?candidate.pitcher:typeof candidate.incoming==="object"&&candidate.incoming?candidate.incoming:candidate;
    const snapshot=mergePitcher(embedded,{num:candidate.pitcherNumber||embedded?.num||"",name:candidate.pitcherName||(typeof candidate.pitcher==="string"?candidate.pitcher:embedded?.name)||"",throws:embedded?.throws||"",record:embedded?.record||"",era:embedded?.era||"",k:embedded?.k||""});
    let roster=row>=0&&row<all.length?all[row]:null;
    if(!roster){
      const key=String(candidate.key||candidate.pitcherKey||"");
      if(key)roster=all.find((pitcher,index)=>pitcherKey(team,index,pitcher.name)===key)||null;
    }
    if(!roster&&(snapshot?.name||snapshot?.num)){
      const target=pitcherRosterKey(snapshot),targetName=String(snapshot?.name||"").trim().toLowerCase();
      roster=all.find(pitcher=>pitcherRosterKey(pitcher)===target)||(targetName?all.find(pitcher=>String(pitcher?.name||"").trim().toLowerCase()===targetName):null)||null;
    }
    return mergePitcher(roster||{},snapshot||{});
  };
  const addTimeline=(candidate,kind,order=0)=>{
    const pitcher=rosterPitcher(candidate);if(!(pitcher.name||pitcher.num))return;
    const recordedAt=String(candidate?.recordedAt||"");
    const timestamp=Date.parse(recordedAt);
    timeline.push({pitcher,inning:Math.max(0,num(candidate?.inning)),half:candidate?.half==="bottom"?1:0,timestamp:Number.isFinite(timestamp)?timestamp:0,kind,order:num(order)});
  };
  for(const event of scoring.pitchLog||[])if((event.pitchingTeam||defensiveTeamForBattingTeam(event.battingTeam))===team)addTimeline(event,"pitch",event.seq);
  for(const play of scoring.plays||[])if((play.pitchingTeam||defensiveTeamForBattingTeam(play.team))===team)addTimeline(play,"play",play.seq);
  for(const event of scoring.pitcherChanges||[])if(event.team===team)addTimeline({...event,...(event.incoming||{}),pitcher:event.incoming,row:event.incomingRow},"change",event.seq);
  const kindOrder={change:0,pitch:1,play:2};
  timeline.sort((a,b)=>a.inning-b.inning||a.half-b.half||((a.timestamp&&b.timestamp)?a.timestamp-b.timestamp:0)||(kindOrder[a.kind]-kindOrder[b.kind])||a.order-b.order);
  const add=p=>{const key=pitcherRosterKey(p);if(!(p?.name||p?.num)||seen.has(key))return;seen.add(key);selected.push({...p});};
  timeline.forEach(item=>add(item.pitcher));
  if(!selected.length){
    const current=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));
    add(all[current]||all[0]);
  }
  return selected.slice(0,SCORECARD_PITCHER_ROWS);
}
function playerIdentity(player,team="",prefix="player"){
  const explicit=String(player?.id||"").trim();if(explicit)return `${team}:${prefix}:id:${explicit}`;
  const name=String(player?.name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const number=String(player?.num||"").replace(/^#/,"").trim();
  return `${team}:${prefix}:${number}:${name||"unknown"}`;
}
function playerSnapshot(player={}){return {id:player.id||"",num:player.num||"",name:player.name||"",pos:player.pos||"",bats:player.bats||"",avg:player.avg||"",obp:player.obp||""};}
function substitutionEvents(team="",lineupIndex=null){ensureScoringState();return [...scoring.substitutions].filter(event=>(!team||event.team===team)&&(lineupIndex===null||num(event.lineupIndex)===num(lineupIndex))).sort((a,b)=>num(a.seq)-num(b.seq));}
function activeBatter(team,lineupIndex){
  const events=substitutionEvents(team,lineupIndex),latest=events.at(-1);if(latest?.incoming)return playerSnapshot(latest.incoming);
  return playerSnapshot(collectData()[team]?.lineup?.[lineupIndex]||{});
}
function lineupOccupants(team,lineupIndex){return [playerSnapshot(collectData()[team]?.lineup?.[lineupIndex]||{}),...substitutionEvents(team,lineupIndex).map(event=>playerSnapshot(event.incoming))].filter(player=>player.name||player.num);}
function usedBenchKeys(team){return new Set(substitutionEvents(team).map(event=>event.incomingKey||playerIdentity(event.incoming,team,"bench")));}
function availableBenchPlayers(team){
  const data=collectData(),used=usedBenchKeys(team),active=new Set(Array.from({length:LINEUP_ROWS},(_,index)=>playerIdentity(activeBatter(team,index),team,"bench")));
  return (data[team]?.bench||[]).map((player,index)=>({...player,benchIndex:index,key:playerIdentity(player,team,"bench")})).filter(player=>(player.name||player.num)&&!used.has(player.key)&&!active.has(player.key));
}
function currentDefensivePlayers(team){return Array.from({length:LINEUP_ROWS},(_,lineupIndex)=>{const player=activeBatter(team,lineupIndex);return {...player,lineupIndex,key:playerIdentity(player,team,"fielder")};}).filter(player=>player.name||player.num);}
function rosterPlayersForError(team,existingErrors=[]){
  const players=[...currentDefensivePlayers(team)];
  for(const error of existingErrors||[]){if(error?.fielderKey&&!players.some(player=>player.key===error.fielderKey))players.push({...playerSnapshot(error.fielder),key:error.fielderKey,lineupIndex:error.lineupIndex});}
  return players;
}
function positionNumber(position){const tokens=String(position||"").toUpperCase().split(/[\s,/.-]+/).filter(Boolean);return tokens.map(token=>POSITION_NUMBERS[token]).find(Boolean)||"";}
function errorNotation(error){const number=error.positionNumber||positionNumber(error.fielder?.pos);return `E${number}`;}
function fieldingErrorCount(play){return Array.isArray(play?.fieldingErrors)&&play.fieldingErrors.length?play.fieldingErrors.length:Math.max(0,num(play?.errors));}
function lineupDisplayText(team,lineupIndex){return lineupOccupants(team,lineupIndex).map((player,index)=>`${index?"↳ ":""}${formatLineupPlayer(player)}`).join("\n");}
function pitcherDisplayText(team,row){return formatPitcher(collectData()[team]?.pitchers?.[row]||{});}

function setPanel(id){
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".step").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));
  if(id==="summary")renderSummary();
  if(id==="pitchTracking")renderPitchTracking();
  if(id==="scoring")renderScoring();
  window.scrollTo({top:0,behavior:"smooth"});
  if(!autosaveRestoring)scheduleAutosave("Section position updated");
}
function teamName(team){ const d=collectData(); return d[`${team}Team`] || (team==="away"?"Away":"Home"); }
function teamScoreboxAbbreviation(team){
  const name=teamName(team),key=normalizeTeamColorName(name),matched=MLB_TEAM_COLOR_RECORDS.find(item=>item.aliases.some(alias=>normalizeTeamColorName(alias)===key));
  if(matched){const code=matched.aliases.find(alias=>/^[a-z]{3}$/i.test(alias))||matched.aliases.find(alias=>/^[a-z]{2}$/i.test(alias));if(code)return code.toUpperCase();}
  const words=String(name||"").replace(/[^A-Za-z0-9 ]+/g," ").trim().split(/\s+/).filter(Boolean);
  if(!words.length)return team==="away"?"AWY":"HME";
  if(words.length===1)return words[0].slice(0,3).toUpperCase();
  return words.map(word=>word[0]).join("").slice(0,3).toUpperCase();
}
function compactInningLabel(){if(gameIsFinal())return "FINAL";return `${scoring.half==="top"?"▲":"▼"} ${scoring.inning}`;}
function battingTeamForHalf(half){ return half==="top"?"away":"home"; }
function currentBattingTeam(){ return battingTeamForHalf(scoring.half); }
function automaticRunnerEnabled(){return (getField("extraInningsRule")||"automatic-runner")==="automatic-runner";}
function gameIsFinal(){return scoring.gameStatus?.status==="final";}
function gameScoreThroughSeq(maxSeq=Infinity){const totals={away:0,home:0};for(const play of scoring.plays||[]){if(num(play.seq)>maxSeq)continue;totals[play.team]=(totals[play.team]||0)+num(play.runs);}return totals;}
function automaticRunnerForState(state){
  const team=battingTeamForHalf(state.half),dueIndex=Math.max(0,Math.min(LINEUP_ROWS-1,num(state.battingIndexes?.[team]))),runnerIndex=(dueIndex+LINEUP_ROWS-1)%LINEUP_ROWS,player=activeBatter(team,runnerIndex),playerKey=playerIdentity(player,team,"batter");
  return {id:playerKey,playerKey,team,playerIndex:runnerIndex,name:player.name||`Batter ${runnerIndex+1}`,player:playerSnapshot(player),automaticRunner:true,earnedRun:false,placedInning:state.inning,placedHalf:state.half};
}
function prepareHalfInningState(state,placements=null){
  const next={...state,bases:deepClone(state.bases||emptyBases())};
  if(next.inning>=10&&automaticRunnerEnabled()&&!next.bases[2]){const runner=automaticRunnerForState(next);next.bases[2]=runner;if(placements&&!placements.some(item=>item.inning===next.inning&&item.half===next.half))placements.push({inning:next.inning,half:next.half,team:runner.team,runner:deepClone(runner)});}
  return next;
}
function decideGameStatus(play,afterState,score){
  const inning=num(play.inning),half=play.half,halfEnded=num(play.beforeState?.outs)+num(play.outsOnPlay)>=3;
  if(inning<9)return null;
  if(half==="bottom"&&score.home>score.away)return {status:"final",winner:"home",reason:`Walk-off in the bottom of inning ${inning}`,inning,half,endedAtSeq:num(play.seq)};
  if(half==="top"&&halfEnded&&score.home>score.away)return {status:"final",winner:"home",reason:`Home team ahead after the top of the ${inning}`,inning,half,endedAtSeq:num(play.seq)};
  if(half==="bottom"&&halfEnded&&score.away>score.home)return {status:"final",winner:"away",reason:`Visiting team ahead after the bottom of the ${inning}`,inning,half,endedAtSeq:num(play.seq)};
  return null;
}
function gameStatusText(){
  if(gameIsFinal()){const score=gameScoreThroughSeq(scoring.gameStatus.endedAtSeq||Infinity),winner=teamName(scoring.gameStatus.winner);return `FINAL — ${winner} wins ${score[scoring.gameStatus.winner]}-${score[scoring.gameStatus.winner==="away"?"home":"away"]}`;}
  if(scoring.inning>=10)return `${automaticRunnerEnabled()?"MLB automatic runner on second":"Traditional extra innings"} — ${scoring.half==="top"?"Top":"Bottom"} ${scoring.inning}`;
  return "Game in progress";
}
function runnerFor(team,index){const p=activeBatter(team,index),playerKey=playerIdentity(p,team,"batter");return {id:playerKey,playerKey,team,playerIndex:index,name:p.name||`Batter ${index+1}`,player:playerSnapshot(p)};}
function playsForSlot(team,playerIndex,paIndex){ return scoring.plays.find(p=>p.team===team&&p.playerIndex===playerIndex&&p.paIndex===paIndex); }
function outcomeOptions(selected="",compact=false,displayText=""){
  return `<option value=""></option>`+OUTCOMES.map(o=>{const text=o.id===selected&&displayText?displayText:(compact?o.code:`${o.code} - ${o.label}`);return `<option value="${o.id}" ${o.id===selected?"selected":""}>${escapeHtml(text)}</option>`;}).join("");
}
function defensiveTeamForBattingTeam(battingTeam){ return battingTeam==="away"?"home":"away"; }
function pitcherKey(team,row,name=""){
  const clean=String(name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return Number.isInteger(row)&&row>=0?`${team}:row:${row}`:`${team}:name:${clean||"unknown"}`;
}
function pitcherInfoFromRow(team,row){
  const data=collectData(),pitcher=data[team]?.pitchers?.[row]||{};
  return {team,row,key:pitcherKey(team,row,pitcher.name),name:pitcher.name||`${teamName(team)} Pitcher ${row+1}`,number:pitcher.num||"",throws:pitcher.throws||""};
}
function resolvePitcherInfo(team,name=""){
  const target=String(name||"").trim().toLowerCase(),data=collectData();
  const row=(data[team]?.pitchers||[]).findIndex(p=>String(p.name||"").trim().toLowerCase()===target&&target);
  if(row>=0)return pitcherInfoFromRow(team,row);
  const fallbackRow=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));
  if(!target)return pitcherInfoFromRow(team,fallbackRow);
  return {team,row:-1,key:pitcherKey(team,-1,name),name:String(name).trim(),number:"",throws:""};
}
function activePitcherInfo(battingTeam=currentBattingTeam()){
  ensureScoringState();
  const team=defensiveTeamForBattingTeam(battingTeam),row=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers[team])));
  return pitcherInfoFromRow(team,row);
}
function pitchCountAfter(history=[]){
  const out={balls:0,strikes:0,pitches:0,inPlay:false,pendingStrikeout:false};
  history.forEach(type=>{
    out.pitches++;
    if(type==="ball")out.balls=Math.min(4,out.balls+1);
    else if(["strike","swingingStrike","calledStrike"].includes(type))out.strikes=Math.min(3,out.strikes+1);
    else if(type==="foul"&&out.strikes<2)out.strikes++;
    else if(type==="inplay")out.inPlay=true;
  });
  out.pendingStrikeout=out.strikes>=3;
  return out;
}
function pitchEventFrom(type,before,after,overrides={}){
  const battingTeam=overrides.battingTeam||currentBattingTeam();
  const pitching=overrides.pitcherInfo||activePitcherInfo(battingTeam);
  const batterIndex=Number.isInteger(overrides.batterIndex)?overrides.batterIndex:(scoring.battingIndexes[battingTeam]||0);
  const batter=activeBatter(battingTeam,batterIndex);
  return {id:makeId(),seq:scoring.nextPitchSeq++,sessionId:overrides.sessionId||scoring.count.sessionId||"",type,code:PITCH_TYPE_INFO[type]?.code||String(type).toUpperCase(),label:PITCH_TYPE_INFO[type]?.label||String(type),inning:overrides.inning||scoring.inning,half:overrides.half||scoring.half,battingTeam,pitchingTeam:pitching.team,pitcherKey:pitching.key,pitcherRow:pitching.row,pitcherName:pitching.name,pitcherNumber:pitching.number||"",batterTeam:battingTeam,batterIndex,batterName:overrides.batterName||batter.name||`Batter ${batterIndex+1}`,countBefore:{balls:num(before?.balls),strikes:num(before?.strikes)},countAfter:{balls:num(after?.balls),strikes:num(after?.strikes)},recordedAt:overrides.recordedAt||new Date().toISOString()};
}
function appendPitchLogEvent(type,before,after,overrides={}){
  ensureScoringState();
  const event=pitchEventFrom(type,before,after,overrides);
  scoring.pitchLog.push(event);
  return event;
}
function removeCurrentPitchSessionEvents(){
  ensureScoringState();
  const sessionId=scoring.count.sessionId;
  if(sessionId)scoring.pitchLog=scoring.pitchLog.filter(event=>event.sessionId!==sessionId);
}
function reconstructLegacyPitchLog(){
  if(!Array.isArray(scoring.pitchLog))scoring.pitchLog=[];
  let seq=1;
  const data=collectData();
  const addHistory=(history,meta)=>{
    let before={balls:0,strikes:0};
    for(const type of history||[]){
      const after=pitchCountAfter([...(meta.processed||[]),type]);
      const pitcherTeam=defensiveTeamForBattingTeam(meta.battingTeam),pitcher=resolvePitcherInfo(pitcherTeam,meta.pitcherName||"");
      scoring.nextPitchSeq=seq;
      const event=pitchEventFrom(type,before,after,{sessionId:meta.sessionId,battingTeam:meta.battingTeam,batterIndex:meta.batterIndex,batterName:meta.batterName,pitcherInfo:pitcher,inning:meta.inning,half:meta.half,recordedAt:meta.recordedAt});
      scoring.pitchLog.push(event);seq=event.seq+1;before={balls:after.balls,strikes:after.strikes};meta.processed=(meta.processed||[]).concat(type);
    }
  };
  [...scoring.plays].sort((a,b)=>a.seq-b.seq).filter(play=>play.countsAsPlateAppearance!==false).forEach(play=>{const sessionId=play.pitchCount?.sessionId||`legacy-play-${play.id}`;play.pitchSessionId=sessionId;play.pitchCount={...(play.pitchCount||{}),sessionId};const pitchingTeam=defensiveTeamForBattingTeam(play.team),resolved=resolvePitcherInfo(pitchingTeam,play.pitcher||"");play.pitchingTeam=pitchingTeam;play.pitcherKey=resolved.key;play.pitcherRow=resolved.row;addHistory(play.pitchCount?.history||[],{sessionId,battingTeam:play.team,batterIndex:play.playerIndex,batterName:play.playerName,pitcherName:play.pitcher,inning:play.inning,half:play.half,recordedAt:play.recordedAt||new Date(0).toISOString()});});
  if(scoring.count.history.length){const sessionId=scoring.count.sessionId||`legacy-current-${Date.now()}`;scoring.count.sessionId=sessionId;addHistory(scoring.count.history,{sessionId,battingTeam:currentBattingTeam(),batterIndex:scoring.battingIndexes[currentBattingTeam()]||0,batterName:activeBatter(currentBattingTeam(),scoring.battingIndexes[currentBattingTeam()]||0).name||"",pitcherName:activePitcherInfo().name,inning:scoring.inning,half:scoring.half,recordedAt:new Date().toISOString()});}
  scoring.nextPitchSeq=Math.max(seq,1);
}
function currentPaIndex(team,playerIndex){
  for(let i=0;i<PA_SLOTS;i++)if(!playsForSlot(team,playerIndex,i))return i;
  return PA_SLOTS-1;
}
function countSnapshot(){
  ensureScoringState();
  return {balls:scoring.count.balls,strikes:scoring.count.strikes,pitches:scoring.count.pitches,history:[...scoring.count.history],sessionId:scoring.count.sessionId||""};
}
function countLabel(count=scoring.count){ return `${num(count?.balls)}-${num(count?.strikes)}`; }
function pitchSequenceLabel(history=[]){
  const labels={ball:"B",strike:"S",swingingStrike:"SW",calledStrike:"C",foul:"F",inplay:"IP",hitByPitch:"HBP"};
  return history.map(item=>labels[item]||String(item).toUpperCase()).join(" ");
}
function outcomeCodeHtml(outcomeId,code=""){
  const text=code||OUTCOME_MAP[outcomeId]?.code||outcomeId;
  const mirrored=outcomeId==="KL";
  return `<strong class="quick-code-symbol${mirrored?" is-mirrored-k":""}"${mirrored?' aria-label="Strikeout looking"':''}>${escapeHtml(mirrored?"K":text)}</strong>`;
}
function liveBatterPlateAppearances(team,index){
  return scoring.plays.filter(play=>play.team===team&&play.playerIndex===index).sort((a,b)=>a.seq-b.seq);
}
function renderLiveMatchup(){
  if(!$("currentBatterName")||!$("currentPitcherName"))return;
  ensureScoringState();
  const data=collectData(),team=currentBattingTeam(),index=Math.max(0,Math.min(LINEUP_ROWS-1,num(scoring.battingIndexes[team]))),batter=activeBatter(team,index);
  $("currentBatterName").textContent=batter.name||`${teamName(team)} batter ${index+1}`;
  const batterDetails=[batter.num?`#${String(batter.num).replace(/^#/,"")}`:"",batter.pos||"",batter.bats?`Bats ${String(batter.bats).toUpperCase()}`:"",batter.avg?`AVG ${batter.avg}`:"",batter.obp?`OBP ${batter.obp}`:"",`Lineup ${index+1}`].filter(Boolean);
  $("currentBatterDetails").textContent=batterDetails.join(" • ")||"Batter details not yet available.";
  const prior=liveBatterPlateAppearances(team,index);
  $("currentBatterHistory").textContent=prior.length?prior.map(play=>play.outcome==="KL"?"K looking":playNotation(play)).join(" • "):`First plate appearance • ${scoring.half==="top"?"Top":"Bottom"} ${scoring.inning}`;
  const onDeckIndex=(index+1)%LINEUP_ROWS,inHoleIndex=(index+2)%LINEUP_ROWS,onDeck=activeBatter(team,onDeckIndex),inHole=activeBatter(team,inHoleIndex);
  if($("onDeckName"))$("onDeckName").textContent=onDeck.name||`Batter ${onDeckIndex+1}`;
  if($("onDeckDetails"))$("onDeckDetails").textContent=[onDeck.num?`#${String(onDeck.num).replace(/^#/,"")}`:"",onDeck.pos||"",`Lineup ${onDeckIndex+1}`].filter(Boolean).join(" • ");
  if($("inHoleName"))$("inHoleName").textContent=inHole.name||`Batter ${inHoleIndex+1}`;
  if($("inHoleDetails"))$("inHoleDetails").textContent=[inHole.num?`#${String(inHole.num).replace(/^#/,"")}`:"",inHole.pos||"",`Lineup ${inHoleIndex+1}`].filter(Boolean).join(" • ");

  const info=activePitcherInfo(team),season=info.row>=0?(data[info.team]?.pitchers?.[info.row]||{}):{},tracking=computePitcherTracking()[info.team]?.find(row=>row.key===info.key||row.row===info.row);
  $("currentPitcherName").textContent=info.name||`${teamName(info.team)} pitcher`;
  const pitcherDetails=[season.num?`#${String(season.num).replace(/^#/,"")}`:"",season.throws?`Throws ${String(season.throws).replace(/HP$/i,"")}`:"",season.record?`Record ${season.record}`:"",season.era?`${season.era} ERA`:"",season.k?`${season.k} K`:""].filter(Boolean);
  $("currentPitcherDetails").textContent=pitcherDetails.join(" • ")||"Pitcher details not yet available.";
  $("currentPitcherGameStats").textContent=tracking?`${tracking.pitches} P • ${tracking.strikes} Str • ${tracking.balls} B • ${tracking.battersFaced} BF • ${tracking.strikeouts} K • ${tracking.walks+tracking.intentionalWalks} BB • ${tracking.hits} H`:`0 pitches • 0 BF`;
}
function renderQuickResults(){
  const wrap=$("quickResultGrid");
  if(!wrap)return;
  wrap.innerHTML=QUICK_RESULTS.map(([id,label])=>`<button type="button" class="quick-result-button" data-quick-outcome="${id}">${outcomeCodeHtml(id)}<span>${escapeHtml(label)}</span></button>`).join("");
}
function renderPitchConsole(message=""){
  ensureScoringState();
  const count=scoring.count;
  const correctionPlay=scoring.lastAutoStrikeoutPlayId?scoring.plays.find(play=>play.id===scoring.lastAutoStrikeoutPlayId):null;
  if(scoring.lastAutoStrikeoutPlayId&&!correctionPlay)scoring.lastAutoStrikeoutPlayId="";
  renderActivePitcherSelect();
  renderLiveMatchup();
  if($("ballCount"))$("ballCount").textContent=count.balls;
  if($("strikeCount"))$("strikeCount").textContent=count.strikes;
  if($("pitchTotalLabel"))$("pitchTotalLabel").textContent=`${count.pitches} pitch${count.pitches===1?"":"es"} this plate appearance`;
  const status=$("pitchStatus");
  if(status){
    const sequence=pitchSequenceLabel(count.history);
    const correctionMessage=correctionPlay?`${correctionPlay.outcome==="KL"?"Looking":"Swinging"} strikeout recorded. Use “Third strike not caught” only if the catcher did not legally catch strike three.`:"";
    status.textContent=message || correctionMessage || (count.inPlay?"Ball is in play. Choose the result code below.":sequence?`Pitch sequence: ${sequence}`:"Ready for the first pitch.");
  }
  if($("strikeoutChooser"))$("strikeoutChooser").hidden=!correctionPlay;
  if($("undoPitchBtn"))$("undoPitchBtn").disabled=!count.history.length;
  if($("resetCountBtn"))$("resetCountBtn").disabled=!(count.history.length||count.balls||count.strikes||count.inPlay);
  document.querySelectorAll("[data-pitch]").forEach(button=>button.disabled=false);
}
function resetCurrentCount(message="Count reset to 0-0."){
  removeCurrentPitchSessionEvents();
  scoring.lastAutoStrikeoutPlayId="";
  scoring.count=initialCount();
  renderScoreboard();
  renderPitchConsole(message);
  renderPitchTracking();
  scheduleAutosave("Pitch count reset");
}
function undoPitch(){
  ensureScoringState();
  if(!scoring.count.history.length)return;
  const sessionId=scoring.count.sessionId;
  scoring.count.history.pop();
  for(let i=scoring.pitchLog.length-1;i>=0;i--){if(scoring.pitchLog[i].sessionId===sessionId){scoring.pitchLog.splice(i,1);break;}}
  const recalculated=pitchCountAfter(scoring.count.history);
  scoring.count.balls=recalculated.balls;scoring.count.strikes=recalculated.strikes;scoring.count.pitches=recalculated.pitches;scoring.count.pendingStrikeout=recalculated.pendingStrikeout;scoring.count.inPlay=recalculated.inPlay;
  if(!scoring.count.history.length)scoring.count.sessionId="";
  renderScoreboard();
  renderPitchConsole("Last pitch removed.");
  renderPitchTracking();
  scheduleAutosave("Pitch removed");
}
function appendPitch(type,{allowAutomaticOutcome=true}={}){
  ensureScoringState();
  const count=scoring.count;
  if(!count.history.length&&scoring.lastAutoStrikeoutPlayId)scoring.lastAutoStrikeoutPlayId="";
  if(count.pendingStrikeout&&allowAutomaticOutcome)return false;
  if(!count.sessionId)count.sessionId=makeId();
  const before={balls:count.balls,strikes:count.strikes};
  count.history.push(type);count.pitches++;count.inPlay=false;
  if(type==="ball")count.balls=Math.min(4,count.balls+1);
  else if(["strike","swingingStrike","calledStrike"].includes(type))count.strikes=Math.min(3,count.strikes+1);
  else if(type==="foul"&&count.strikes<2)count.strikes++;
  else if(type==="inplay")count.inPlay=true;
  const after={balls:count.balls,strikes:count.strikes};
  appendPitchLogEvent(type,before,after,{sessionId:count.sessionId});
  if(count.strikes>=3)count.pendingStrikeout=true;
  renderPitchTracking();
  return true;
}
function addPitch(type){
  if(gameIsFinal()){alert("This game is final. Use Undo Last Play if the ending needs correction.");return;}
  if(!appendPitch(type))return;
  const count=scoring.count;
  if(type==="ball"&&count.balls>=4){recordQuickOutcome("BB",true,true);return;}
  if(["strike","swingingStrike","calledStrike"].includes(type)&&count.strikes>=3){
    const outcomeId=type==="calledStrike"?"KL":"K";
    const play=recordQuickOutcome(outcomeId,true,true);
    if(play){scoring.lastAutoStrikeoutPlayId=play.id;renderPitchConsole(`${outcomeId==="KL"?"Looking":"Swinging"} strikeout recorded automatically.`);scheduleAutosave("Automatic strikeout recorded");}
    return;
  }
  if(type==="inplay")setQuickResultsVisible(true);
  renderScoreboard();
  renderPitchConsole();
  scheduleAutosave("Pitch recorded");
}
function fieldPositionRecord(value){return FIELD_POSITIONS.find(position=>position.number===String(value||""))||null;}
function fieldPositionLabel(value){const position=fieldPositionRecord(value);return position?`${position.number} — ${position.label} (${position.code})`:"";}
function normalizeFieldingSequence(value,fallback=""){
  const raw=Array.isArray(value)?value:String(value||fallback||"").match(/[1-9]/g)||[];
  return raw.map(String).filter(number=>Boolean(fieldPositionRecord(number)));
}
function fieldingSequenceString(value,fallback=""){return normalizeFieldingSequence(value,fallback).join("-");}
function fieldingSequenceLabel(value,fallback=""){
  const sequence=normalizeFieldingSequence(value,fallback);
  return sequence.map(number=>fieldPositionLabel(number)).filter(Boolean).join(" → ");
}
function outcomeRequiresFieldLocation(outcomeId){return BATTED_BALL_OUTCOMES.has(outcomeId);}
function outcomeSupportsBallPath(outcomeId){return outcomeRequiresFieldLocation(outcomeId);}
function selectedBallPathFromForm(){return fieldingSequenceString($("playFieldingSequence")?.value,$("playFieldLocation")?.value);}
function renderPendingFieldingSequence(){
  const tray=$("fieldingSequenceTray"),done=$("useFieldingSequenceBtn"),undo=$("undoFieldingSequenceBtn"),clear=$("clearFieldingSequenceBtn");
  if(tray){
    tray.innerHTML=pendingFieldingSequence.length?pendingFieldingSequence.map((number,index)=>{const position=fieldPositionRecord(number);return `<span class="fielding-sequence-step"><b>${index+1}</b><strong>${number}</strong><small>${escapeHtml(position?.code||"")}</small></span>`;}).join('<span class="fielding-sequence-arrow" aria-hidden="true">→</span>'):'<span class="fielding-sequence-empty">Tap the first fielder who handled the ball.</span>';
    tray.setAttribute("aria-label",pendingFieldingSequence.length?`Ball path ${pendingFieldingSequence.join(" to ")}`:"No fielders selected");
  }
  const pathSvg=$("fieldBallPathSvg"),points=pendingFieldingSequence.map(number=>FIELD_POSITION_COORDS[number]).filter(Boolean);
  if(pathSvg){
    const pointText=points.map(point=>point.join(",")).join(" "),last=points.at(-1);
    pathSvg.innerHTML=points.length?`${points.length>1?`<polyline points="${pointText}"/>`:""}${points.map((point,index)=>`<circle class="field-ball-path-stop" cx="${point[0]}" cy="${point[1]}" r="${index===points.length-1?2.5:1.7}"/>`).join("")}${last?`<circle class="field-ball-current" cx="${last[0]}" cy="${last[1]}" r="3.2"/>`:""}`:"";
  }
  if(done){done.disabled=!pendingFieldingSequence.length;done.textContent=pendingFieldingSequence.length===1?"Use This Fielder":"Use Ball Path";}
  if(undo)undo.disabled=!pendingFieldingSequence.length;
  if(clear)clear.disabled=!pendingFieldingSequence.length;
  document.querySelectorAll("#fieldLocationGrid [data-field-position]").forEach(button=>{
    const count=pendingFieldingSequence.filter(number=>number===button.dataset.fieldPosition).length;
    button.classList.toggle("is-in-path",count>0);
    button.dataset.pathCount=count?String(count):"";
  });
}
function populateFieldLocationControls(selected="",selectedSequence=""){
  const sequence=normalizeFieldingSequence(selectedSequence,selected),first=sequence[0]||"",select=$("playFieldLocation");
  if(select)select.innerHTML=`<option value="">Choose position 1–9</option>`+FIELD_POSITIONS.map(position=>`<option value="${position.number}" ${position.number===first?"selected":""}>${position.number} — ${escapeHtml(position.label)} (${position.code})</option>`).join("");
  const grid=$("fieldLocationGrid");
  if(grid)grid.innerHTML=`<svg class="field-map-art" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><linearGradient id="fieldGrassV33" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76b85b"/><stop offset="1" stop-color="#3f7f35"/></linearGradient><linearGradient id="fieldDirtV33" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ad72"/><stop offset="1" stop-color="#b87942"/></linearGradient><pattern id="fieldStripeV33" width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="26" height="52" fill="rgba(255,255,255,.055)"/><rect x="26" width="26" height="52" fill="rgba(0,0,0,.035)"/></pattern></defs><rect x="3" y="3" width="594" height="494" rx="34" fill="#315f2c" stroke="#704321" stroke-width="6"/><path d="M300 486 L35 226 Q300 -12 565 226 Z" fill="url(#fieldGrassV33)"/><path d="M300 486 L35 226 Q300 -12 565 226 Z" fill="url(#fieldStripeV33)"/><path d="M300 472 L154 340 L300 208 L446 340 Z" fill="url(#fieldDirtV33)" stroke="#a46735" stroke-width="4"/><path d="M300 424 L210 340 L300 257 L390 340 Z" fill="#5a963f" stroke="rgba(255,255,255,.25)" stroke-width="2"/><path d="M300 472 L35 226 M300 472 L565 226" fill="none" stroke="#f9efd8" stroke-width="5" stroke-linecap="round" opacity=".95"/><path d="M300 472 L154 340 L300 208 L446 340 Z" fill="none" stroke="#f4e0bd" stroke-width="4" opacity=".92"/><circle cx="300" cy="340" r="25" fill="#c99159" stroke="#9b6538" stroke-width="3"/><rect x="291" y="335" width="18" height="6" rx="3" fill="#f8eedb"/><g fill="#fff9e9" stroke="#8e603c" stroke-width="3"><rect x="435" y="329" width="22" height="22" transform="rotate(45 446 340)"/><rect x="289" y="197" width="22" height="22" transform="rotate(45 300 208)"/><rect x="143" y="329" width="22" height="22" transform="rotate(45 154 340)"/><path d="M286 462 L314 462 L320 475 L300 489 L280 475 Z"/></g><path d="M77 228 Q300 37 523 228" fill="none" stroke="rgba(255,255,255,.20)" stroke-width="3"/><path d="M116 264 Q300 109 484 264" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3"/></svg><svg id="fieldBallPathSvg" class="field-ball-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>`+FIELD_POSITIONS.map(position=>`<button type="button" class="field-location-button field-pos-${position.number}" data-field-position="${position.number}" data-field-code="${position.code}" aria-label="Add ${position.number}, ${escapeHtml(position.label)}, to ball path"><strong>${position.number}</strong><span>${position.code}</span><small>${escapeHtml(position.label)}</small></button>`).join("");
  pendingFieldingSequence=[...sequence];renderPendingFieldingSequence();
}
function updatePlayFieldLocationVisibility(outcomeId,selected="",selectedSequence=""){
  const required=outcomeRequiresFieldLocation(outcomeId),section=$("playFieldLocationSection"),select=$("playFieldLocation"),sequenceInput=$("playFieldingSequence"),display=$("playFieldingSequenceDisplay"),sequence=required?normalizeFieldingSequence(selectedSequence,selected):[];
  if(section)section.hidden=!required;
  if(select){select.required=false;select.value=sequence[0]||"";}
  if(sequenceInput)sequenceInput.value=sequence.join("-");
  if(display)display.value=sequence.length?sequence.join("-"):"No ball path selected";
}
function closeFieldLocationDialog(){pendingFieldLocationAction=null;pendingFieldingSequence=[];$("fieldLocationDialog").close();}
function openFieldLocationDialog(outcomeId,action={}){
  if(outcomeId==="HR"){
    if(action.mode==="play-form")updatePlayFieldLocationVisibility("HR");
    else recordQuickOutcome("HR",Boolean(action.forceDirect),Boolean(action.skipPitchPreparation),"","");
    return;
  }
  const outcome=OUTCOME_MAP[outcomeId],sequence=normalizeFieldingSequence(action.sequence,action.selected||action.fieldLocation||"");
  pendingFieldLocationAction={outcomeId,...action};
  populateFieldLocationControls(sequence[0]||"",sequence);
  $("fieldLocationTitle").textContent=`${outcome?.label||"Batted ball"} — Follow the ball`;
  $("fieldLocationPrompt").textContent=MULTI_FIELDER_OUTCOMES.has(outcomeId)?"Tap each fielder in the order the ball traveled. Example: shortstop to first base is 6–3.":"Tap the primary fielder. Add another fielder only when you want to record a relay or continuing play.";
  $("fieldLocationDialog").showModal();
}
function applyFieldLocationSelection(position){
  if(!pendingFieldLocationAction)return;
  const selected=String(position||"");if(!fieldPositionRecord(selected))return;
  pendingFieldingSequence.push(selected);renderPendingFieldingSequence();
}
function undoFieldingSequence(){pendingFieldingSequence.pop();renderPendingFieldingSequence();}
function clearFieldingSequence(){pendingFieldingSequence=[];renderPendingFieldingSequence();}
function completeFieldingSequence(){
  const action=pendingFieldLocationAction,sequence=normalizeFieldingSequence(pendingFieldingSequence);if(!action||!sequence.length)return;
  const fieldLocation=sequence[0],fieldingSequence=sequence.join("-");
  pendingFieldLocationAction=null;pendingFieldingSequence=[];$("fieldLocationDialog").close();
  if(action.mode==="play-form"){
    updatePlayFieldLocationVisibility($("playOutcome").value,fieldLocation,fieldingSequence);return;
  }
  if(action.mode==="dialog"){
    openPlayDialog(action.team,action.playerIndex,action.paIndex,action.outcomeId,action.existing||null,{fieldLocation,fieldingSequence});
    if(action.showError)showErrorAssignmentPanel(action.existing?.fieldingErrors||[],action.existing?.errorDetails||"");
    return;
  }
  recordQuickOutcome(action.outcomeId,Boolean(action.forceDirect),Boolean(action.skipPitchPreparation),fieldLocation,fieldingSequence);
}
function requestQuickOutcome(outcomeId,forceDirect=false,skipPitchPreparation=false){
  if(outcomeId==="HR")return recordQuickOutcome(outcomeId,forceDirect,skipPitchPreparation,"","");
  if(outcomeRequiresFieldLocation(outcomeId)){openFieldLocationDialog(outcomeId,{mode:"quick",forceDirect,skipPitchPreparation});return null;}
  return recordQuickOutcome(outcomeId,forceDirect,skipPitchPreparation,"","");
}

function prepareTerminalPitch(outcomeId){
  ensureScoringState();
  const last=scoring.count.history.at(-1);
  if(outcomeId==="HBP"&&last!=="hitByPitch")appendPitch("hitByPitch",{allowAutomaticOutcome:false});
  else if(BALL_IN_PLAY_OUTCOMES.has(outcomeId)&&last!=="inplay")appendPitch("inplay",{allowAutomaticOutcome:false});
  else if(outcomeId==="K"&&scoring.count.strikes===2&&!scoring.count.pendingStrikeout)appendPitch("swingingStrike",{allowAutomaticOutcome:false});
  else if(outcomeId==="KL"&&scoring.count.strikes===2&&!scoring.count.pendingStrikeout)appendPitch("calledStrike",{allowAutomaticOutcome:false});
  else if(outcomeId==="BB"&&scoring.count.balls===3)appendPitch("ball",{allowAutomaticOutcome:false});
}
function outcomeCanQuickSave(outcomeId){
  const basesOccupied=Boolean(scoring.bases[1]||scoring.bases[2]||scoring.bases[3]);
  if(["BB","IBB","HBP","K","KL"].includes(outcomeId))return true;
  return !basesOccupied&&["1B","2B","3B","HR","GO","FO","LO","PO"].includes(outcomeId);
}
function recordQuickOutcome(outcomeId,forceDirect=false,skipPitchPreparation=false,fieldLocation="",fieldingSequence=""){
  if(gameIsFinal()){alert("This game is final. Use Undo Last Play if the ending needs correction.");return null;}
  ensureScoringState();
  if(outcomeId!=="D3K")scoring.lastAutoStrikeoutPlayId="";
  if(!skipPitchPreparation)prepareTerminalPitch(outcomeId);
  const team=currentBattingTeam(),playerIndex=scoring.battingIndexes[team]||0,paIndex=currentPaIndex(team,playerIndex);
  const normalizedPath=fieldingSequenceString(fieldingSequence,fieldLocation);
  if(outcomeRequiresFieldLocation(outcomeId)&&!normalizedPath){openFieldLocationDialog(outcomeId,{mode:"quick",forceDirect,skipPitchPreparation:true});return null;}
  fieldLocation=normalizeFieldingSequence(normalizedPath)[0]||"";fieldingSequence=normalizedPath;
  if(outcomeId==="D3K"||outcomeId==="OTHER"||(!forceDirect&&!outcomeCanQuickSave(outcomeId))){
    openPlayDialog(team,playerIndex,paIndex,outcomeId,null,{fieldLocation,fieldingSequence});
    return null;
  }
  const defaults=defaultDetails(outcomeId,team,playerIndex).d;
  const incoming={team,playerIndex,paIndex,outcome:outcomeId,fieldLocation,fieldingSequence,pitcher:currentPitcherName(team),inning:scoring.inning,half:scoring.half,runs:defaults.runs,rbi:defaults.rbi,outsOnPlay:defaults.outs,errors:defaults.errors,destinations:{batter:defaults.batter,r1:defaults.r1,r2:defaults.r2,r3:defaults.r3},notes:""};
  return commitPlay(incoming,"");
}
function handleQuickOutcome(outcomeId){
  requestQuickOutcome(outcomeId,false);
}
function openDroppedThirdStrikeCorrection(play){
  const defaults=defaultDetails("D3K",play.team,play.playerIndex,play.beforeState?.bases||emptyBases(),play.beforeState?.outs??0).d;
  const replacement={...play,outcome:"D3K",outcomeCode:OUTCOME_MAP.D3K.code,runs:defaults.runs,rbi:defaults.rbi,outsOnPlay:defaults.outs,errors:defaults.errors,destinations:{batter:defaults.batter,r1:defaults.r1,r2:defaults.r2,r3:defaults.r3},notes:[play.notes,"Third strike not caught"].filter(Boolean).join("; ")};
  openPlayDialog(play.team,play.playerIndex,play.paIndex,"D3K",replacement);
}
function handleTerminalStrikeout(outcomeId){
  if(outcomeId==="dismiss"){scoring.lastAutoStrikeoutPlayId="";renderPitchConsole("Strikeout confirmed.");scheduleAutosave("Strikeout confirmed");return;}
  if(outcomeId==="D3K"){
    const play=scoring.plays.find(item=>item.id===scoring.lastAutoStrikeoutPlayId);
    if(play)openDroppedThirdStrikeCorrection(play);
    return;
  }
  requestQuickOutcome(outcomeId,true);
}
function setQuickResultsVisible(visible){
  const grid=$("quickResultGrid"),button=$("toggleQuickResultsBtn");
  if(!grid||!button)return;
  const show=Boolean(visible);
  grid.hidden=!show;
  grid.classList.toggle("is-collapsed",!show);
  grid.setAttribute("aria-hidden",String(!show));
  if("inert" in grid)grid.inert=!show;
  button.setAttribute("aria-expanded",String(show));
  button.textContent=show?"Hide Codes":"Show Codes";
}
function toggleQuickResults(){
  const grid=$("quickResultGrid");
  if(!grid)return;
  const isVisible=!grid.hidden&&!grid.classList.contains("is-collapsed");
  setQuickResultsVisible(!isVisible);scheduleAutosave("Quick Codes display updated");
}
function setChallengePanelVisible(visible){
  const panel=$("absChallengePanel"),button=$("challengeQuickBtn");
  if(!panel||!button)return;
  const show=Boolean(visible);
  panel.hidden=!show;
  panel.setAttribute("aria-hidden",String(!show));
  button.setAttribute("aria-expanded",String(show));
  button.textContent=show?"Close Challenges":"Challenges";
}
function toggleChallengePanel(){
  const panel=$("absChallengePanel");
  if(!panel)return;
  setChallengePanelVisible(panel.hidden);
  scheduleAutosave("Challenge controls updated");
}
function scoringPanelActive(){ return $("scoring")?.classList.contains("active"); }
function handleScoringKeyboard(event){
  if(!scoringPanelActive()||$("playDialog")?.open)return;
  const target=event.target;if(target&&target.closest&&target.closest("input,textarea,select,[contenteditable=true]"))return;
  const key=event.key.toLowerCase();
  if(scoring.lastAutoStrikeoutPlayId&&key==="d"){event.preventDefault();handleTerminalStrikeout("D3K");return;}
  const pitchKeys={b:"ball",s:"swingingStrike",c:"calledStrike",f:"foul",i:"inplay"};
  const resultKeys={"1":"1B","2":"2B","3":"3B","4":"HR",w:"BB",h:"HBP",k:"K",g:"GO",o:"FO",l:"LO",p:"PO",e:"ROE",x:"FC"};
  if(key==="backspace"){event.preventDefault();undoPitch();return;}
  if(pitchKeys[key]){event.preventDefault();addPitch(pitchKeys[key]);return;}
  if(resultKeys[key]){event.preventDefault();handleQuickOutcome(resultKeys[key]);}
}

function managerReplayAllotment(){return getField("managerChallengeAllotment")==="2"?2:1;}
function managerReplayEvents(team=""){
  ensureScoringState();
  return [...scoring.managerReplayChallenges.events].filter(event=>!team||event.team===team).sort((a,b)=>num(a.inning)-num(b.inning)||num(a.seq)-num(b.seq));
}
function computeManagerReplayState(team,excludeId="",beforeSeq=Infinity){
  ensureScoringState();
  const allotment=managerReplayAllotment(),events=managerReplayEvents(team).filter(event=>event.id!==excludeId&&num(event.seq)<beforeSeq);
  let available=allotment;
  const processed=[];
  for(const event of events){
    const before=available;
    if(event.result!=="overturned"&&available>0)available--;
    processed.push({...event,availableBefore:before,availableAfter:available});
  }
  const overturned=events.filter(event=>event.result==="overturned").length;
  const confirmed=events.filter(event=>event.result==="confirmed").length;
  const stands=events.filter(event=>event.result==="stands").length;
  return {team,allotment,available,attempts:events.length,overturned,confirmed,stands,lost:confirmed+stands,processed};
}
function managerReplayResultLabel(result){return result==="overturned"?"Overturned — retained":result==="confirmed"?"Confirmed — lost":"Call stands — lost";}
function managerReplayTokenMarkup(team,state){
  const consumed=state.allotment-state.available;
  return Array.from({length:state.allotment},(_,index)=>{const lost=index<consumed;return `<button type="button" class="challenge-token ${lost?"is-lost":"is-available"}" data-record-replay="${team}" aria-label="${lost?`Manager challenge ${index+1} lost`:`Manager challenge ${index+1} available`}" title="${lost?"Unsuccessful manager challenge used":"Manager challenge available"}" ${lost?"disabled":""}>${lost?"✓":index+1}</button>`;}).join("");
}
function renderManagerReplayTracker(){
  if(!$("managerReplayEventLog"))return;
  ensureScoringState();
  const data=collectData();
  for(const team of ["away","home"]){
    const state=computeManagerReplayState(team),name=data[`${team}Team`]||(team==="away"?"Away":"Home");
    $(`${team}ReplayHeading`).textContent=`${name} Replay`;
    $(`${team}ReplayAvailable`).textContent=`${state.available} available`;
    $(`${team}ReplayTokens`).innerHTML=managerReplayTokenMarkup(team,state);
    $(`${team}ReplayStatus`).textContent=`${state.attempts} attempt${state.attempts===1?"":"s"} • ${state.overturned} overturned • ${state.lost} lost`;
    const record=document.querySelector(`.replay-record-button[data-record-replay="${team}"]`);if(record)record.disabled=state.available<=0;
  }
  const events=[...scoring.managerReplayChallenges.events].sort((a,b)=>num(b.seq)-num(a.seq));
  $("managerReplayLogCount").textContent=`${events.length} attempt${events.length===1?"":"s"}`;
  $("managerReplayEventLog").innerHTML=events.length?events.map(event=>`<div class="challenge-log-item"><div><strong>${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${escapeHtml(teamName(event.team))}</strong><p>${escapeHtml(`${event.callDescription} • ${managerReplayResultLabel(event.result)}${event.notes?` • ${event.notes}`:""}`)}</p></div><button class="secondary compact" type="button" data-edit-replay="${event.id}">Edit</button></div>`).join(""):`<p class="empty-tracking-note">No manager replay challenges recorded.</p>`;
}
function openManagerReplayDialog(team,eventId=""){
  ensureScoringState();
  const existing=scoring.managerReplayChallenges.events.find(event=>event.id===eventId),inning=existing?.inning||scoring.inning,half=existing?.half||scoring.half;
  $("managerReplayId").value=existing?.id||"";$("managerReplayTeam").value=existing?.team||team;$("managerReplayInning").value=inning;$("managerReplayHalf").value=half;
  setField("managerReplayCall",existing?.callDescription||"");$("managerReplayResult").value=existing?.result||"";setField("managerReplayNotes",existing?.notes||"");
  $("managerReplayTeamSummary").textContent=`${teamName(existing?.team||team)} • ${half==="top"?"Top":"Bottom"} ${inning} • ${managerReplayAllotment()} starting challenge${managerReplayAllotment()===1?"":"s"}`;
  $("managerReplayDialogTitle").textContent=existing?"Edit Manager Replay":"Record Manager Replay";$("deleteManagerReplayBtn").hidden=!existing;
  $("managerReplayDialog").showModal();
}
function getManagerReplayFromDialog(){return {id:$("managerReplayId").value||makeId(),team:$("managerReplayTeam").value,inning:Math.max(1,num($("managerReplayInning").value)),half:$("managerReplayHalf").value==="bottom"?"bottom":"top",callDescription:getField("managerReplayCall"),result:$("managerReplayResult").value,notes:getField("managerReplayNotes")};}
function saveManagerReplay(event){
  event.preventDefault();ensureScoringState();const incoming=getManagerReplayFromDialog(),existing=scoring.managerReplayChallenges.events.find(item=>item.id===incoming.id);
  if(!incoming.callDescription){alert("Enter the call or play being challenged.");return;}
  if(!["overturned","confirmed","stands"].includes(incoming.result)){alert("Choose the replay result.");return;}
  const state=computeManagerReplayState(incoming.team,existing?.id||"",existing?num(existing.seq):Infinity);
  if(state.available<=0){alert("That team has no manager replay challenge available.");return;}
  const saved={...incoming,seq:existing?.seq||scoring.managerReplayChallenges.nextSeq++,recordedAt:existing?.recordedAt||new Date().toISOString()};
  if(existing){const index=scoring.managerReplayChallenges.events.findIndex(item=>item.id===existing.id);scoring.managerReplayChallenges.events[index]=saved;}else scoring.managerReplayChallenges.events.push(saved);
  $("managerReplayDialog").close();renderManagerReplayTracker();renderSummary();scheduleAutosave(existing?"Manager replay updated":"Manager replay recorded");
}
function deleteManagerReplay(id){const index=scoring.managerReplayChallenges.events.findIndex(event=>event.id===id);if(index<0)return;scoring.managerReplayChallenges.events.splice(index,1);renderManagerReplayTracker();renderSummary();scheduleAutosave("Manager replay deleted");}
function managerReplaySummaryLine(team){const state=computeManagerReplayState(team);return `${teamName(team)}: ${state.available} available, ${state.attempts} attempts, ${state.overturned} overturned, ${state.lost} lost`;}
function managerReplayPdfTokens(team){const state=computeManagerReplayState(team),consumed=state.allotment-state.available;return Array.from({length:state.allotment},(_,index)=>index<consumed?"[X]":"[ ]").join(" ");}
function managerReplayLogText(limit=8){return managerReplayEvents().slice(-limit).map(event=>`${event.half==="top"?"T":"B"}${event.inning} ${teamName(event.team)}: ${event.callDescription} — ${managerReplayResultLabel(event.result)}`).join("; ");}

function challengeEvents(team=""){
  ensureScoringState();
  return [...scoring.challenges.events].filter(event=>!team||event.team===team).sort((a,b)=>num(a.inning)-num(b.inning)||num(a.seq)-num(b.seq));
}
function computeChallengeState(team,throughInning=scoring.inning,excludeId=""){
  ensureScoringState();
  const maxInning=Math.max(9,num(throughInning)||9),events=challengeEvents(team).filter(event=>event.id!==excludeId&&num(event.inning)<=maxInning);
  let available=2,initialLost=0,extraGrants=0,extraLost=0;
  const processed=[];
  for(let inning=1;inning<=maxInning;inning++){
    let granted=false;
    if(inning>=10&&available===0){available=1;extraGrants++;granted=true;}
    for(const event of events.filter(item=>num(item.inning)===inning)){
      const before=available;
      if(event.result==="upheld"&&available>0){available--;if(initialLost<2)initialLost++;else extraLost++;}
      processed.push({...event,availableBefore:before,availableAfter:available,extraGrantAtStart:granted});
    }
  }
  const attempts=events.length,overturned=events.filter(event=>event.result==="overturned").length,upheld=events.filter(event=>event.result==="upheld").length;
  return {team,available,initialLost,extraGrants,extraLost,attempts,overturned,upheld,processed,throughInning:maxInning};
}
function challengeRoleLabel(role){return ({batter:"Batter",pitcher:"Pitcher",catcher:"Catcher"})[role]||role;}
function challengeResultLabel(result){return result==="overturned"?"Overturned — retained":"Call upheld — lost";}
function challengeCallLabel(call){return call==="strike"?"called strike":"called ball";}
function catcherForTeam(team){const lineup=collectData()[team]?.lineup||[];return lineup.find(player=>String(player.pos||"").split(/[\s,/.-]+/).some(pos=>pos.toUpperCase()==="C"))||{};}
function pitcherForTeam(team){const row=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));return pitcherInfoFromRow(team,row);}
function suggestedChallengeName(team,role,half=scoring.half){
  const data=collectData();
  if(role==="batter"){
    const index=team===currentBattingTeam()?num(scoring.battingIndexes[team]):0;
    return activeBatter(team,index).name||"";
  }
  if(role==="pitcher")return pitcherForTeam(team).name||"";
  if(role==="catcher")return catcherForTeam(team).name||"";
  return "";
}
function challengePitchOriginalType(event){return event?.absOriginalType||event?.type||"";}
function latestChallengeablePitch(inning=scoring.inning,half=scoring.half,role="",excludeChallengeId=""){
  const permittedType=role==="batter"?"calledStrike":["pitcher","catcher"].includes(role)?"ball":"";
  return [...scoring.pitchLog].sort((a,b)=>num(b.seq)-num(a.seq)).find(event=>{
    const originalType=challengePitchOriginalType(event),available=!event.absChallengeId||event.absChallengeId===excludeChallengeId;
    return available&&num(event.inning)===num(inning)&&event.half===half&&["ball","calledStrike"].includes(originalType)&&(!permittedType||originalType===permittedType);
  })||null;
}
function latestChallengeablePitchForTeam(team,excludeChallengeId=""){
  return [...scoring.pitchLog].sort((a,b)=>num(b.seq)-num(a.seq)).find(event=>{
    const originalType=challengePitchOriginalType(event),available=!event.absChallengeId||event.absChallengeId===excludeChallengeId;
    if(!available)return false;
    if(originalType==="calledStrike")return event.battingTeam===team;
    if(originalType==="ball")return event.pitchingTeam===team;
    return false;
  })||null;
}
function updateChallengePitchLink(preserveExisting=true){
  const role=$("challengeRole").value||"batter",inning=Math.max(1,num($("challengeInning").value)),half=$("challengeHalf").value||"top",existingId=$("challengeLinkedPitchId").value||"",challengeId=$("challengeId").value||"";
  let pitch=preserveExisting&&existingId?scoring.pitchLog.find(item=>item.id===existingId):null;
  const expectedType=role==="batter"?"calledStrike":"ball",originalType=challengePitchOriginalType(pitch);
  if(!pitch||originalType!==expectedType||num(pitch.inning)!==inning||pitch.half!==half||(pitch.absChallengeId&&pitch.absChallengeId!==challengeId))pitch=latestChallengeablePitch(inning,half,role,challengeId);
  $("challengeLinkedPitchId").value=pitch?.id||"";
  const pitchType=challengePitchOriginalType(pitch),originalLabel=PITCH_TYPE_INFO[pitchType]?.label||pitch?.label||"Pitch";
  $("challengePitchSummary").textContent=pitch?`Linked pitch #${pitch.seq}: ${originalLabel} to ${pitch.batterName} by ${pitch.pitcherName}, count ${pitch.countBefore.balls}-${pitch.countBefore.strikes} to ${pitch.countAfter.balls}-${pitch.countAfter.strikes}.`:`No ${role==="batter"?"called strike":"called ball"} is currently available to link for this challenge. The challenge can still be logged manually.`;
}
function fieldingTeamForHalf(half){return battingTeamForHalf(half)==="away"?"home":"away";}
function challengeTeamForRole(role,half){return role==="batter"?battingTeamForHalf(half):fieldingTeamForHalf(half);}
function defaultChallengeRoleForTeam(team,half){return team===battingTeamForHalf(half)?"batter":"catcher";}
function allowedChallengeRoles(){return ["batter","pitcher","catcher"];}
function populateChallengeRoleOptions(preserve=true){
  const team=$("challengeTeam").value||"away",half=$("challengeHalf").value||"top",select=$("challengeRole"),prior=select.value,roles=allowedChallengeRoles();
  select.innerHTML=roles.map(role=>`<option value="${role}">${challengeRoleLabel(role)}</option>`).join("");
  select.value=preserve&&roles.includes(prior)?prior:defaultChallengeRoleForTeam(team,half);
  updateChallengeNameAndCall(false);
}
function challengePlayerSuggestions(team){
  const data=collectData(),names=[];
  (data[team]?.lineup||[]).forEach(player=>{if(player.name)names.push(player.name);});
  (data[team]?.pitchers||[]).forEach(player=>{if(player.name)names.push(player.name);});
  return [...new Set(names)];
}
function updateChallengeNameAndCall(overwriteName=true){
  const role=$("challengeRole").value||"batter",half=$("challengeHalf").value||"top",team=challengeTeamForRole(role,half),inning=Math.max(1,num($("challengeInning").value));
  $("challengeTeam").value=team;
  $("challengeOriginalCall").value=role==="batter"?"strike":"ball";
  if(overwriteName||!getField("challengeName"))setField("challengeName",suggestedChallengeName(team,role,half));
  $("challengePlayerSuggestions").innerHTML=challengePlayerSuggestions(team).map(name=>`<option value="${escapeHtml(name)}"></option>`).join("");
  $("challengeTeamSummary").textContent=`${teamName(team)} • ${half==="top"?"Top":"Bottom"} ${inning}`;
  const action=role==="batter"?"Batter challenges a called strike for the batting team.":`${challengeRoleLabel(role)} challenges a called ball for the fielding team.`;
  if($("challengeRoleRule"))$("challengeRoleRule").textContent=`${action} The request must be made immediately after the pitch without help from the dugout.`;
}
function challengeTokenMarkup(team,state){
  const regulation=[0,1].map(index=>{const lost=index<state.initialLost;return `<button type="button" class="challenge-token ${lost?"is-lost":"is-available"}" data-record-challenge="${team}" aria-label="${lost?`Challenge ${index+1} lost`:`Challenge ${index+1} available`}" title="${lost?"Unsuccessful challenge used":"Challenge available"}" ${lost?"disabled":""}>${lost?"✓":index+1}</button>`;}).join("");
  let extraClass="is-locked",extraText="EI",extraTitle="Extra-inning challenge is not active.";
  if(state.throughInning>=10){
    if(state.extraGrants>0){extraClass=state.available>0&&state.initialLost>=2?"is-available":"is-lost";extraText=state.extraGrants>1?`EI×${state.extraGrants}`:"EI";extraTitle=state.available>0&&state.initialLost>=2?"Extra-inning challenge available":"Extra-inning challenge used unsuccessfully";}
    else extraTitle="No extra challenge was added because the team still had a challenge at the start of the extra inning.";
  }
  return regulation+`<button type="button" class="challenge-token ${extraClass}" data-record-challenge="${team}" aria-label="Extra inning challenge" title="${escapeHtml(extraTitle)}" ${extraClass==="is-available"?"":"disabled"}>${extraText}</button>`;
}
function renderChallengeTracker(){
  if(!$("challengeEventLog"))return;
  ensureScoringState();
  const data=collectData();
  for(const team of ["away","home"]){
    const state=computeChallengeState(team),name=data[`${team}Team`]||(team==="away"?"Away":"Home");
    $(`${team}ChallengeHeading`).textContent=`${name} Challenges`;
    $(`${team}ChallengesAvailable`).textContent=`${state.available} available`;
    $(`${team}ChallengeTokens`).innerHTML=challengeTokenMarkup(team,state);
    $(`${team}ChallengeStatus`).textContent=`${state.attempts} attempt${state.attempts===1?"":"s"} • ${state.overturned} retained • ${state.upheld} lost${state.extraGrants?` • ${state.extraGrants} extra-inning grant${state.extraGrants===1?"":"s"}`:""}`;
    const record=document.querySelector(`.challenge-record-button[data-record-challenge="${team}"]`);if(record)record.disabled=state.available<=0;
  }
  const events=[...scoring.challenges.events].sort((a,b)=>num(b.seq)-num(a.seq));
  $("challengeLogCount").textContent=`${events.length} attempt${events.length===1?"":"s"}`;
  $("challengeEventLog").innerHTML=events.length?events.map(event=>`<div class="challenge-log-item"><div><strong>${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${escapeHtml(teamName(event.team))}: ${escapeHtml(event.challengerName||challengeRoleLabel(event.challengerRole))}</strong><p>${escapeHtml(`${challengeRoleLabel(event.challengerRole)} challenged a ${challengeCallLabel(event.originalCall)} • ${challengeResultLabel(event.result)}${event.notes?` • ${event.notes}`:""}`)}</p></div><button class="secondary compact" type="button" data-edit-challenge="${event.id}">Edit</button></div>`).join(""):`<p class="empty-tracking-note">No ABS challenges recorded.</p>`;
}
function openChallengeDialog(team,eventId=""){
  ensureScoringState();
  const existing=scoring.challenges.events.find(event=>event.id===eventId),candidate=existing?null:latestChallengeablePitchForTeam(team),inning=existing?.inning||candidate?.inning||scoring.inning,half=existing?.half||candidate?.half||scoring.half;
  const candidateType=challengePitchOriginalType(candidate),candidateRole=candidateType==="calledStrike"?"batter":candidateType==="ball"?"catcher":"";
  $("challengeId").value=existing?.id||"";$("challengeTeam").value=existing?.team||team;$("challengeInning").value=inning;$("challengeHalf").value=half;
  populateChallengeRoleOptions(false);
  $("challengeRole").value=existing?.challengerRole||candidateRole||defaultChallengeRoleForTeam(existing?.team||team,half);
  updateChallengeNameAndCall(false);
  setField("challengeName",existing?.challengerName||suggestedChallengeName($("challengeTeam").value,$("challengeRole").value,half));
  $("challengeOriginalCall").value=existing?.originalCall||($("challengeRole").value==="batter"?"strike":"ball");
  $("challengeResult").value=existing?.result||"";setField("challengeNotes",existing?.notes||"");
  $("challengeLinkedPitchId").value=existing?.linkedPitchId||candidate?.id||"";
  updateChallengeNameAndCall(false);
  updateChallengePitchLink(Boolean(existing||candidate));
  $("challengeDialogTitle").textContent=existing?"Edit ABS Challenge":"Record ABS Challenge";$("deleteChallengeBtn").hidden=!existing;
  $("challengeDialog").showModal();
}
function getChallengeFromDialog(){return {id:$("challengeId").value||makeId(),team:$("challengeTeam").value,inning:Math.max(1,num($("challengeInning").value)),half:$("challengeHalf").value==="bottom"?"bottom":"top",challengerRole:$("challengeRole").value,challengerName:getField("challengeName"),originalCall:$("challengeOriginalCall").value,result:$("challengeResult").value,linkedPitchId:$("challengeLinkedPitchId").value||"",notes:getField("challengeNotes")};}
function pitchSessionEvents(sessionId){return scoring.pitchLog.filter(event=>event.sessionId===sessionId).sort((a,b)=>num(a.seq)-num(b.seq));}
function recalculatePitchSession(sessionId){
  const events=pitchSessionEvents(sessionId),history=[];let before={balls:0,strikes:0};
  for(const pitch of events){
    const type=pitch.type;history.push(type);const after=pitchCountAfter(history);
    pitch.code=PITCH_TYPE_INFO[type]?.code||String(type).toUpperCase();pitch.label=PITCH_TYPE_INFO[type]?.label||String(type);
    pitch.countBefore={balls:before.balls,strikes:before.strikes};pitch.countAfter={balls:after.balls,strikes:after.strikes};before={balls:after.balls,strikes:after.strikes};
  }
  const calculated=pitchCountAfter(history),snapshot={balls:calculated.balls,strikes:calculated.strikes,pitches:calculated.pitches,history:[...history],pendingStrikeout:calculated.pendingStrikeout,inPlay:calculated.inPlay,sessionId};
  scoring.plays.filter(play=>play.pitchSessionId===sessionId).forEach(play=>{play.pitchCount=deepClone(snapshot);play.pitchSequence=pitchSequenceLabel(history);});
  return snapshot;
}
function removePlayPreservingPitchSession(id){
  const index=scoring.plays.findIndex(play=>play.id===id);if(index<0)return null;
  const removed=deepClone(scoring.plays[index]);scoring.plays.splice(index,1);if(scoring.lastAutoStrikeoutPlayId===id)scoring.lastAutoStrikeoutPlayId="";rebuildDerivedGameState();return removed;
}
function restorePlaySnapshot(play){
  if(!play||scoring.plays.some(item=>item.id===play.id))return;
  scoring.plays.push(deepClone(play));scoring.plays.sort((a,b)=>num(a.seq)-num(b.seq));rebuildDerivedGameState();
  if(["K","KL"].includes(play.outcome))scoring.lastAutoStrikeoutPlayId=play.id;
}
function setCurrentCountFromPitchSession(sessionId){
  const snapshot=recalculatePitchSession(sessionId);scoring.count=normalizeCount(snapshot);scoring.count.sessionId=sessionId;synchronizeCurrentPitchSession();return snapshot;
}
function linkedTerminalPlay(sessionId){
  const play=scoring.plays.find(item=>item.pitchSessionId===sessionId);if(!play)return null;
  const last=[...scoring.plays].sort((a,b)=>num(b.seq)-num(a.seq))[0];return last?.id===play.id?play:null;
}
function rollbackAbsChallengeCorrection(challenge){
  const correction=challenge?.correction;if(!correction)return;
  if(correction.createdPlayId)removePlayPreservingPitchSession(correction.createdPlayId);
  const pitch=scoring.pitchLog.find(item=>item.id===correction.linkedPitchId);
  if(pitch&&correction.originalPitch)Object.assign(pitch,deepClone(correction.originalPitch));
  if(correction.removedPlay){restorePlaySnapshot(correction.removedPlay);scoring.count=initialCount();}
  else if(correction.sessionId&&pitch){
    const completed=scoring.plays.some(play=>play.pitchSessionId===correction.sessionId);
    if(!completed&&(scoring.count.sessionId===correction.sessionId||!scoring.count.sessionId))setCurrentCountFromPitchSession(correction.sessionId);
  }
  if(pitch){delete pitch.absChallengeId;delete pitch.absOriginalType;}
  rebuildDerivedGameState();
}
function applyAbsChallengeCorrection(challenge){
  const pitch=scoring.pitchLog.find(item=>item.id===challenge.linkedPitchId);if(!pitch)return challenge;
  const originalType=challengePitchOriginalType(pitch),expectedType=challenge.challengerRole==="batter"?"calledStrike":"ball";
  if(originalType!==expectedType)return challenge;
  const correction={linkedPitchId:pitch.id,sessionId:pitch.sessionId,originalPitch:deepClone(pitch),removedPlay:null,createdPlayId:"",applied:challenge.result==="overturned"};
  pitch.absChallengeId=challenge.id;pitch.absOriginalType=originalType;
  if(challenge.result!=="overturned")return {...challenge,correction};
  const completed=linkedTerminalPlay(pitch.sessionId);
  if(completed&&((originalType==="calledStrike"&&completed.outcome==="KL")||(originalType==="ball"&&completed.outcome==="BB")))correction.removedPlay=removePlayPreservingPitchSession(completed.id);
  pitch.type=originalType==="calledStrike"?"ball":"calledStrike";
  const count=setCurrentCountFromPitchSession(pitch.sessionId);
  let replacement=null;
  if(count.balls>=4)replacement=recordQuickOutcome("BB",true,true);
  else if(count.strikes>=3){replacement=recordQuickOutcome("KL",true,true);if(replacement)scoring.lastAutoStrikeoutPlayId=replacement.id;}
  if(replacement)correction.createdPlayId=replacement.id;
  return {...challenge,correction};
}
function saveChallenge(event){
  event.preventDefault();ensureScoringState();const incoming=getChallengeFromDialog(),existing=scoring.challenges.events.find(item=>item.id===incoming.id),expectedTeam=challengeTeamForRole(incoming.challengerRole,incoming.half);
  incoming.team=expectedTeam;
  if(!allowedChallengeRoles().includes(incoming.challengerRole)){alert("Under MLB ABS rules, only the batter, pitcher, or catcher may initiate a challenge.");return;}
  if(!incoming.challengerName){alert("Enter the name of the batter, pitcher, or catcher who requested the challenge.");return;}
  if(!incoming.result){alert("Choose whether the call was overturned or upheld.");return;}
  const state=computeChallengeState(incoming.team,incoming.inning,existing?.id||"");
  if(state.available<=0){alert("That team has no ABS challenge available for the selected inning.");return;}
  incoming.originalCall=incoming.challengerRole==="batter"?"strike":"ball";
  if(existing)rollbackAbsChallengeCorrection(existing);
  let saved={...incoming,seq:existing?.seq||scoring.challenges.nextSeq++,recordedAt:existing?.recordedAt||new Date().toISOString()};
  saved=applyAbsChallengeCorrection(saved);
  if(existing){const index=scoring.challenges.events.findIndex(item=>item.id===existing.id);scoring.challenges.events[index]=saved;}else scoring.challenges.events.push(saved);
  $("challengeDialog").close();refreshAll();scheduleAutosave(existing?"ABS challenge updated and pitch result recalculated":"ABS challenge recorded and pitch result recalculated");
}
function deleteChallenge(id){const index=scoring.challenges.events.findIndex(event=>event.id===id);if(index<0)return;rollbackAbsChallengeCorrection(scoring.challenges.events[index]);scoring.challenges.events.splice(index,1);refreshAll();scheduleAutosave("ABS challenge deleted and linked pitch restored");}
function challengeSummaryLine(team){const state=computeChallengeState(team);return `${teamName(team)}: ${state.available} available, ${state.attempts} attempts, ${state.overturned} retained, ${state.upheld} lost${state.extraGrants?`, ${state.extraGrants} extra-inning grant${state.extraGrants===1?"":"s"}`:""}`;}
function challengePdfTokens(team){const state=computeChallengeState(team),box=index=>index<state.initialLost?"[X]":"[ ]";let extra="EI[-]";if(state.extraGrants>0)extra=state.available>0&&state.initialLost>=2?"EI[ ]":"EI[X]";return `${box(0)} ${box(1)} ${extra}`;}
function challengeLogText(limit=8){return challengeEvents().slice(-limit).map(event=>`${event.half==="top"?"T":"B"}${event.inning} ${teamName(event.team)} ${event.challengerName} (${challengeRoleLabel(event.challengerRole)}): ${challengeResultLabel(event.result)}`).join("; ");}

function benchPlayerByKey(team,key){return availableBenchPlayers(team).find(player=>player.key===key)||null;}
function openSubstitutionDialog(team,lineupIndex,incomingKey){
  const incoming=benchPlayerByKey(team,incomingKey);if(!incoming)return;const outgoing=activeBatter(team,lineupIndex);
  $("substitutionTeam").value=team;$("substitutionLineupIndex").value=lineupIndex;$("substitutionIncomingKey").value=incomingKey;
  $("substitutionDialogTitle").textContent=`${teamName(team)} — Batting Order ${lineupIndex+1}`;
  $("substitutionOutgoing").textContent=formatLineupPlayer(outgoing)||`Batter ${lineupIndex+1}`;$("substitutionIncoming").textContent=formatLineupPlayer(incoming);
  $("substitutionReason").value="Pinch Hitter";$("substitutionPosition").value=incoming.pos||"";$("substitutionInning").value=scoring.inning;$("substitutionHalf").value=scoring.half;$("substitutionNote").value="";
  $("substitutionDialog").showModal();
}
function saveSubstitution(event){
  event.preventDefault();ensureScoringState();const team=$("substitutionTeam").value,lineupIndex=num($("substitutionLineupIndex").value),incomingKey=$("substitutionIncomingKey").value,incomingSource=benchPlayerByKey(team,incomingKey);if(!incomingSource){alert("That bench player is no longer available.");$("substitutionDialog").close();refreshAll();return;}
  const outgoing=activeBatter(team,lineupIndex),incoming={...playerSnapshot(incomingSource),pos:getField("substitutionPosition")||incomingSource.pos||""};
  const outgoingKey=playerIdentity(outgoing,team,"batter");
  scoring.substitutions.push({id:makeId(),seq:scoring.nextSubstitutionSeq++,team,lineupIndex,outgoing:playerSnapshot(outgoing),outgoingKey,incoming,incomingKey,reason:$("substitutionReason").value||"Substitution",inning:Math.max(1,num($("substitutionInning").value)),half:$("substitutionHalf").value||scoring.half,note:getField("substitutionNote"),recordedAt:new Date().toISOString()});
  for(const base of [1,2,3])if(scoring.bases?.[base]?.playerKey===outgoingKey){const newKey=playerIdentity(incoming,team,"batter");scoring.bases[base]={...scoring.bases[base],id:newKey,playerKey:newKey,name:incoming.name||scoring.bases[base].name,player:playerSnapshot(incoming),playerIndex:lineupIndex};}
  $("substitutionDialog").close();synchronizeCurrentPitchSession();refreshAll();scheduleAutosave(`${incoming.name||"Player"} entered the game`);
}
function substitutionHistoryMarkup(team,lineupIndex){
  const events=substitutionEvents(team,lineupIndex);if(!events.length)return "";
  return `<div class="substitution-history">${events.map(event=>`<small>${escapeHtml(`${event.half==="top"?"T":"B"}${event.inning} ${event.reason}: ${event.incoming?.name||"Substitute"} for ${event.outgoing?.name||"player"}`)}</small>`).join("")}</div>`;
}
function substitutionOptionsMarkup(team){
  const available=availableBenchPlayers(team);if(!available.length)return '<option value="">No bench players available</option>';
  return '<option value="">Replace player…</option>'+available.map(player=>`<option value="${escapeHtml(player.key)}">${escapeHtml([player.num?`#${String(player.num).replace(/^#/,"")}`:"",player.name,player.pos,player.bats?`Bats ${player.bats}`:"",[player.avg,player.obp].filter(Boolean).join("/")].filter(Boolean).join(" — "))}</option>`).join("");
}
function usedPitcherRows(team){const rows=new Set([0]);for(const event of scoring.pitcherChanges||[])if(event.team===team)rows.add(num(event.incomingRow));return rows;}
function pitcherDisplayRows(team){
  const rows=[0],seen=new Set(rows);
  [...(scoring.pitcherChanges||[])].filter(event=>event.team===team).sort((a,b)=>num(a.seq)-num(b.seq)).forEach(event=>{const row=num(event.incomingRow);if(!seen.has(row)){seen.add(row);rows.push(row);}});
  const current=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));if(!seen.has(current))rows.push(current);
  return rows;
}
function renderPitcherEntryRows(team){
  const visibleWrap=$(`${team}PitcherInputs`),poolWrap=$(`${team}BullpenInputs`);if(!visibleWrap||!poolWrap)return;
  const displayed=pitcherDisplayRows(team),active=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers?.[team])));
  for(let row=0;row<PITCHER_ROWS;row++){const node=$(`${team}PitcherRow${row+1}`);if(node)poolWrap.appendChild(node);}
  displayed.forEach((row,index)=>{const node=$(`${team}PitcherRow${row+1}`);if(!node)return;const badge=node.querySelector(".row-number");if(badge){badge.textContent=index===0?"SP":`RP${index}`;badge.setAttribute("aria-label",index===0?"Starting pitcher":`Added pitcher ${index}`);}node.classList.toggle("is-active-pitcher",row===active);visibleWrap.appendChild(node);});
}
function availablePitcherRows(team){const data=collectData(),current=num(scoring.activePitchers?.[team]),used=usedPitcherRows(team);return (data[team]?.pitchers||[]).map((pitcher,row)=>({pitcher,row})).filter(({pitcher,row})=>(pitcher.name||pitcher.num)&&row!==current&&!used.has(row)).sort(comparePitchersAlphabetically);}
function openCustomPitcherDialog(team){
  setField("customPitcherTeam",team);["customPitcherNum","customPitcherName","customPitcherThrows","customPitcherRecord","customPitcherEra","customPitcherK"].forEach(id=>setField(id,""));
  $("customPitcherDialogTitle").textContent=`Add ${teamName(team)} Pitcher`;$("customPitcherDialog").showModal();
}
function saveCustomPitcher(event){
  event.preventDefault();const team=getField("customPitcherTeam"),used=usedPitcherRows(team),current=num(scoring.activePitchers?.[team]);let row=-1;
  for(let index=1;index<PITCHER_ROWS;index++){const pitcher=collectData()[team]?.pitchers?.[index]||{};if(!(pitcher.name||pitcher.num)&&!used.has(index)&&index!==current){row=index;break;}}
  if(row<0){alert("There is no open pitcher slot available.");return;}
  const i=row+1;setField(`${team}PitcherNum${i}`,getField("customPitcherNum"));setField(`${team}Pitcher${i}`,getField("customPitcherName"));setField(`${team}PitcherThrows${i}`,getField("customPitcherThrows"));setField(`${team}PitcherRecord${i}`,getField("customPitcherRecord"));setField(`${team}PitcherEra${i}`,getField("customPitcherEra"));setField(`${team}PitcherK${i}`,getField("customPitcherK"));
  if(!getField(`${team}Pitcher${i}`)&&!getField(`${team}PitcherNum${i}`)){alert("Enter the pitcher’s name or uniform number.");return;}
  $("customPitcherDialog").close();recordPitcherChange(team,row,"Custom pitcher");
}
function recordPitcherChange(team,row,source="Pitching section"){
  ensureScoringState();row=Math.max(0,Math.min(PITCHER_ROWS-1,num(row)));const outgoingRow=num(scoring.activePitchers?.[team]);if(row===outgoingRow)return;const data=collectData(),incoming=data[team]?.pitchers?.[row]||{};if(!(incoming.name||incoming.num))return;
  const outgoing=data[team]?.pitchers?.[outgoingRow]||{};scoring.pitcherChanges.push({id:makeId(),seq:scoring.nextPitcherChangeSeq++,team,outgoingRow,incomingRow:row,outgoing:{...outgoing},incoming:{...incoming},reason:"Pitching Change",source,inning:scoring.inning,half:scoring.half,recordedAt:new Date().toISOString()});scoring.activePitchers[team]=row;
  renderPitchConsole(`${incoming.name||"New pitcher"} is now pitching.`);renderPitchTracking();renderPitchingChangeControls();renderSummary();scheduleAutosave("Pitching change recorded");
}
function renderPitchingChangeControls(){
  ensureScoringState();for(const team of ["away","home"]){renderPitcherEntryRows(team);const select=$(`${team}PitchingChangeSelect`),status=$(`${team}PitchingChangeStatus`);if(!select)continue;const current=num(scoring.activePitchers[team]),currentPitcher=collectData()[team]?.pitchers?.[current]||{},available=availablePitcherRows(team);select.innerHTML='<option value="">Add pitcher…</option>'+available.map(({pitcher,row})=>`<option value="${row}">${escapeHtml([pitcher.num?`#${String(pitcher.num).replace(/^#/,"")}`:"",pitcher.name||`Pitcher ${row+1}`,pitcher.throws,pitcher.record,pitcher.era?`${pitcher.era} ERA`:"",pitcher.k?`${pitcher.k} K`:""].filter(Boolean).join(" — "))}</option>`).join("")+`<option value="custom">Add custom pitcher…</option>`;select.disabled=false;if(status)status.textContent=`Active: ${formatPitcher(currentPitcher)||`Pitcher ${current+1}`}${available.length?` • ${available.length} available`:" • No unused roster pitchers listed"}`;}
}
function substitutionNoteLines(){return substitutionEvents().map(event=>`${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${teamName(event.team)} substitution: ${event.incoming?.name||"Substitute"} entered for ${event.outgoing?.name||"player"} (${event.reason})${event.note?` — ${event.note}`:""}`);}
function pitcherChangeNoteLines(){return [...(scoring.pitcherChanges||[])].sort((a,b)=>num(a.inning)-num(b.inning)||(a.half==="top"?-1:1)-(b.half==="top"?-1:1)||num(a.seq)-num(b.seq)).map(event=>`${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${teamName(event.team)} pitching change: ${event.incoming?.name||"Pitcher"} replaced ${event.outgoing?.name||"pitcher"}`);}

function halfInningOrdinal(inning,half){return (Math.max(1,num(inning))-1)*2+(half==="bottom"?1:0);}
function completedHalfInningEndingPlays(){
  const completedPlays=[...(scoring.plays||[])].sort((a,b)=>num(a.seq)-num(b.seq));
  const groups=new Map();
  for(const play of completedPlays){const key=`${play.inning}:${play.half}`,group=groups.get(key)||[];group.push(play);groups.set(key,group);}
  const currentOrdinal=halfInningOrdinal(scoring.inning,scoring.half),maxRecordedOrdinal=completedPlays.reduce((max,play)=>Math.max(max,halfInningOrdinal(play.inning,play.half)),-1),ending=new Map();
  for(const group of groups.values()){
    const last=group.at(-1),ordinal=halfInningOrdinal(last.inning,last.half),isComplete=ordinal<currentOrdinal||(gameIsFinal()&&ordinal===maxRecordedOrdinal);
    if(isComplete)ending.set(last.id,`${last.half==="top"?"End top":"End bottom"} ${last.inning}`);
  }
  return ending;
}
function setScoringView(mode,{persist=true}={}){
  scoringViewMode=mode==="scorecard"?"scorecard":"plateAppearances";
  const showScorecard=scoringViewMode==="scorecard",plate=$("plateAppearancesView"),card=$("currentScorecardView"),plateButton=$("plateAppearancesViewBtn"),cardButton=$("currentScorecardViewBtn");
  if(plate)plate.hidden=showScorecard;if(card)card.hidden=!showScorecard;
  if(plateButton){plateButton.classList.toggle("is-active",!showScorecard);plateButton.setAttribute("aria-selected",String(!showScorecard));plateButton.setAttribute("aria-pressed",String(!showScorecard));}
  if(cardButton){cardButton.classList.toggle("is-active",showScorecard);cardButton.setAttribute("aria-selected",String(showScorecard));cardButton.setAttribute("aria-pressed",String(showScorecard));}
  if(showScorecard)renderCurrentScorecardPreview();
  if(persist)scheduleAutosave(showScorecard?"Current Scorecard view selected":"Plate Appearances view selected");
}
function currentScorecardLineScore(startInning=1){
  const totals=computeGameTotals(),end=startInning+9;let html='<table class="current-line-score"><thead><tr><th>Team</th>';
  for(let inning=startInning;inning<=end;inning++)html+=`<th>${inning}</th>`;
  html+='<th>R</th><th>H</th><th>E</th></tr></thead><tbody>';
  for(const team of ["away","home"]){html+=`<tr><th>${escapeHtml(teamName(team))}</th>`;for(let inning=startInning;inning<=end;inning++)html+=`<td>${totals[team].innings[inning-1]||0}</td>`;html+=`<td><strong>${totals[team].runs}</strong></td><td>${totals[team].hits}</td><td>${totals[team].errors}</td></tr>`;}
  return '<div class="current-scorecard-table-wrap current-line-score-wrap">'+html+'</tbody></table></div>';
}
function buildCurrentScorecardTeam(team,label,startInning,endingPlays){
  const stats=computeTeamStats(team),end=startInning+9;let html=`<section class="current-scorecard-team"><h3>${escapeHtml(label)}: ${escapeHtml(teamName(team))}</h3><div class="current-scorecard-table-wrap"><table><thead><tr><th class="current-player-column">Player / No.</th>`;
  for(let inning=startInning;inning<=end;inning++)html+=`<th>${inning}</th>`;
  html+='<th>AB</th><th>R</th><th>H</th><th>RBI</th></tr></thead><tbody>';
  for(let index=0;index<LINEUP_ROWS;index++){
    html+=`<tr><td class="current-player-column">${lineupOccupants(team,index).map(player=>escapeHtml(formatLineupPlayer(player))).join("<br>")}</td>`;
    for(let inning=startInning;inning<=end;inning++){
      const plays=playsByBatterInning(team,index,inning),endingPlay=plays.find(play=>endingPlays.has(play.id)),notations=plays.map(play=>play.outcome==="KL"?'<span class="mirrored-k-inline">K</span>':escapeHtml(playNotation(play))).join(" / "),endClass=endingPlay?" half-inning-ending-cell":"",labelText=endingPlay?endingPlays.get(endingPlay.id):"";
      html+=`<td class="current-score-cell${endClass}"${labelText?` title="${escapeHtml(labelText)}" aria-label="${escapeHtml(labelText)}"`:""}>${notations}</td>`;
    }
    const stat=stats[index];html+=`<td>${stat.ab}</td><td>${stat.r}</td><td>${stat.h}</td><td>${stat.rbi}</td></tr>`;
  }
  return html+'</tbody></table></div></section>';
}
function currentScorecardPitchingSummary(){
  const section=team=>scorecardPitchingLinesForTeam(team).map(({pitcher,stats},index)=>`<p><strong>${index===0?"SP":`RP${index}`}</strong> ${escapeHtml(formatPitcher(pitcher))}<br><small>${escapeHtml(`${formatInningsPitched(stats.outsRecorded)} IP • ${stats.hits} H • ${stats.runs} R • ${stats.earnedRuns} ER • ${stats.walks+stats.intentionalWalks} BB • ${stats.strikeouts} K • ${stats.hitBatters} HP • ${stats.wildPitches} WP`)}</small></p>`).join("")||"<p>No pitcher listed.</p>";
  return `<div class="current-scorecard-pitching"><div><h4>${escapeHtml(teamName("away"))} Pitching</h4>${section("away")}</div><div><h4>${escapeHtml(teamName("home"))} Pitching</h4>${section("home")}</div></div>`;
}
function buildCurrentScorecardPage(startInning,endingPlays){
  const data=collectData(),totals=computeGameTotals(),end=startInning+9,continuation=startInning>1,notes=exportNotes(data,totals).replace(/^Game Notes\n?/,"").split("\n").slice(0,8).map(line=>escapeHtml(line)).join("<br>");
  return `<article class="current-scorecard-sheet"><header><div><p>${continuation?`Continuation • Innings ${startInning}–${end}`:"Live scorecard • Innings 1–10"}</p><h2>${escapeHtml(data.awayTeam||"Away")} at ${escapeHtml(data.homeTeam||"Home")}</h2></div><strong>${escapeHtml(gameStatusText())}</strong></header>${currentScorecardLineScore(startInning)}${buildCurrentScorecardTeam("away","Away",startInning,endingPlays)}${buildCurrentScorecardTeam("home","Home",startInning,endingPlays)}${currentScorecardPitchingSummary()}<div class="current-scorecard-notes"><h4>Game Notes</h4><p>${notes||"No game notes recorded."}</p></div></article>`;
}
function renderCurrentScorecardPreview(){
  const wrap=$("currentScorecardPreview");if(!wrap)return;const endingPlays=completedHalfInningEndingPlays(),maxInning=Math.max(num(scoring.inning),...(scoring.plays||[]).map(play=>num(play.inning)),1),pages=[buildCurrentScorecardPage(1,endingPlays)];if(maxInning>=11)pages.push(buildCurrentScorecardPage(11,endingPlays));wrap.innerHTML=pages.join("");
}

function renderScoringGrid(team){
  const stats=computeTeamStats(team),endingPlays=completedHalfInningEndingPlays();let html=`<table class="scoring-table"><thead><tr><th>Batter</th>`;
  for(let p=0;p<PA_SLOTS;p++)html+=`<th>PA ${p+1}</th>`;html+=`<th class="stat-cell">AB</th><th class="stat-cell">R</th><th class="stat-cell">H</th><th class="stat-cell">RBI</th></tr></thead><tbody>`;
  for(let i=0;i<LINEUP_ROWS;i++){
    const player=activeBatter(team,i),f=formatPlayer(player,i),history=substitutionHistoryMarkup(team,i),options=substitutionOptionsMarkup(team);html+=`<tr><td class="player-cell"><div class="player-cell-content"><div class="player-current"><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.detail)}</span></div>${history}<select class="substitution-select" data-sub-team="${team}" data-sub-lineup="${i}" aria-label="Replace ${escapeHtml(f.name)}">${options}</select></div></td>`;
    for(let p=0;p<PA_SLOTS;p++){const play=playsForSlot(team,i,p),notation=play?playNotation(play):"",isLooking=play?.outcome==="KL",displayNotation=isLooking?"K":notation,sizeClass=notation.length>7?"long-code":"",endLabel=play?endingPlays.get(play.id):"",endClass=endLabel?" half-inning-ending-cell":"";html+=`<td class="${endClass.trim()}"${endLabel?` title="${escapeHtml(endLabel)}"`:""}><span class="pa-control ${isLooking?"is-looking-k":""}"><select class="pa-select ${play?"has-play":""} ${sizeClass}" data-team="${team}" data-player="${i}" data-pa="${p}" aria-label="${escapeHtml(f.name)} plate appearance ${p+1}${isLooking?", strikeout looking":""}${endLabel?`, ${endLabel}`:""}" title="${escapeHtml((isLooking?"Strikeout looking":notation)||`Record plate appearance ${p+1}`)}">${outcomeOptions(play?.outcome||"",true,displayNotation)}</select>${isLooking?'<span class="mirrored-k-mark" aria-hidden="true">K</span>':""}${play?.keyPlay?'<span class="key-play-mark" aria-label="Key play" title="Key play">★</span>':""}</span></td>`;}
    const st=stats[i];html+=`<td class="stat-cell">${st.ab}</td><td class="stat-cell">${st.r}</td><td class="stat-cell">${st.h}</td><td class="stat-cell">${st.rbi}</td></tr>`;
  }
  html+=`</tbody></table>`;$(`${team}ScoringGrid`).innerHTML=html;
}
function renderScoring(){
  renderScoringGrid("away"); renderScoringGrid("home");
  document.querySelectorAll(".pa-select").forEach(select=>{
    select.addEventListener("change",e=>{ if(e.target.value) openPlayDialog(e.target.dataset.team,num(e.target.dataset.player),num(e.target.dataset.pa),e.target.value); else {const play=playsForSlot(e.target.dataset.team,num(e.target.dataset.player),num(e.target.dataset.pa));if(play&&confirm("Delete this recorded play?")) deletePlay(play.id);else renderScoring();} });
    select.addEventListener("pointerdown",e=>{const play=playsForSlot(e.currentTarget.dataset.team,num(e.currentTarget.dataset.player),num(e.currentTarget.dataset.pa));if(play){e.preventDefault();openPlayDialog(play.team,play.playerIndex,play.paIndex,play.outcome,play);}});
  });
  document.querySelectorAll(".substitution-select").forEach(select=>select.addEventListener("change",event=>{const key=event.target.value;if(key)openSubstitutionDialog(event.target.dataset.subTeam,num(event.target.dataset.subLineup),key);else renderScoring();event.target.value="";}));
  renderScoreboard();
  renderPitchConsole();
  renderCurrentScorecardPreview();
  setScoringView(scoringViewMode,{persist:false});
}
function renderScoreboard(){
  const totals=computeGameTotals();
  $("scoreAwayName").textContent=teamName("away"); $("scoreHomeName").textContent=teamName("home");
  if($("scoreAwayAbbr"))$("scoreAwayAbbr").textContent=teamScoreboxAbbreviation("away");if($("scoreHomeAbbr"))$("scoreHomeAbbr").textContent=teamScoreboxAbbreviation("home");
  $("scoreAwayRuns").textContent=totals.away.runs; $("scoreHomeRuns").textContent=totals.home.runs;
  $("inningLabel").textContent=compactInningLabel(); $("outsLabel").textContent=gameIsFinal()?scoring.gameStatus.reason:`${scoring.outs} ${scoring.outs===1?"out":"outs"}`;
  const statusLabel=$("gameStatusLabel");if(statusLabel){statusLabel.textContent=gameStatusText();statusLabel.classList.toggle("is-final",gameIsFinal());statusLabel.classList.toggle("is-extra",!gameIsFinal()&&scoring.inning>=10);}
  document.body.classList.toggle("game-final",gameIsFinal());
  [1,2,3].forEach(base=>$(base===1?"base1":base===2?"base2":"base3").classList.toggle("occupied",Boolean(scoring.bases[base])));
  renderLiveMatchup();
}
function fillDestinationSelect(id,options){ $(id).innerHTML=options.map(([v,l])=>`<option value="${v}">${l}</option>`).join(""); }
function defaultDetails(outcomeId,team,playerIndex,beforeBasesOverride=null,beforeOutsOverride=null){
  const o=OUTCOME_MAP[outcomeId]||OUTCOME_MAP.OTHER; const currentTeam=currentBattingTeam();
  const before=beforeBasesOverride?deepClone(beforeBasesOverride):(team===currentTeam?deepClone(scoring.bases):emptyBases());
  const outsBefore=beforeOutsOverride===null?num(scoring.outs):Math.max(0,num(beforeOutsOverride));
  const d={batter:"out",r1:before[1]?"hold":"empty",r2:before[2]?"hold":"empty",r3:before[3]?"hold":"empty",outs:o.out?1:0,runs:0,rbi:0,errors:0};
  if(o.bases===1){d.batter="1";if(before[1])d.r1="2";if(before[2])d.r2="3";if(before[3]){d.r3="home";d.runs++;d.rbi++;}}
  else if(o.bases===2){d.batter="2";if(before[1])d.r1="3";if(before[2]){d.r2="home";d.runs++;d.rbi++;}if(before[3]){d.r3="home";d.runs++;d.rbi++;}}
  else if(o.bases===3){d.batter="3";[1,2,3].forEach(b=>{if(before[b]){d[`r${b}`]="home";d.runs++;d.rbi++;}});}
  else if(o.bases===4){d.batter="home";d.runs=1;d.rbi=1;[1,2,3].forEach(b=>{if(before[b]){d[`r${b}`]="home";d.runs++;d.rbi++;}});}
  else if(["BB","IBB","HBP","CI","OBS"].includes(outcomeId)){
    d.batter="1";
    if(before[1]){d.r1="2";if(before[2]){d.r2="3";if(before[3]){d.r3="home";d.runs++;d.rbi++;}}}
  } else if(outcomeId==="D3K"){
    const batterMayRun=!before[1]||outsBefore>=2;
    if(!batterMayRun){d.batter="out";d.outs=1;}
    else{
      d.batter="1";d.outs=0;
      if(before[1]){d.r1="2";if(before[2]){d.r2="3";if(before[3]){d.r3="home";d.runs++;}}}
    }
  } else if(outcomeId==="ROE"){d.batter="1";d.errors=1;if(before[1])d.r1="2";if(before[2])d.r2="3";if(before[3])d.r3="home",d.runs++;}
  else if(outcomeId==="FC"){d.batter="1";if(before[1])d.r1="out";else if(before[2])d.r2="out";else if(before[3])d.r3="out";d.outs=1;}
  else if(outcomeId==="SF"){d.batter="out";d.outs=1;if(before[3]){d.r3="home";d.runs=1;d.rbi=1;}}
  else if(outcomeId==="SH"){d.batter="out";d.outs=1;if(before[3])d.r3="home",d.runs++;if(before[2])d.r2="3";if(before[1])d.r1="2";}
  else if(outcomeId==="DP"){d.batter="out";d.outs=2;if(before[1])d.r1="out";else if(before[2])d.r2="out";else if(before[3])d.r3="out";}
  else if(outcomeId==="TP"){d.batter="out";d.outs=3;[1,2,3].forEach(b=>{if(before[b])d[`r${b}`]="out";});}
  else if(outcomeId==="INT"){d.batter="out";d.outs=0;}
  return {before,d};
}
function errorTypeLabel(type){return ERROR_TYPES.find(([value])=>value===type)?.[1]||"Error";}
function setKeyPlayState(active,{syncNote=false}={}){
  const button=$("keyPlayBtn");if(!button)return;button.classList.toggle("is-active",Boolean(active));button.setAttribute("aria-pressed",String(Boolean(active)));
  if(syncNote){let note=getField("playNotes");if(active&&!/^KEY PLAY(?:\s*[—-]|$)/i.test(note))setField("playNotes",note?`KEY PLAY — ${note}`:"KEY PLAY");if(!active)setField("playNotes",note.replace(/^KEY PLAY\s*(?:[—-]\s*)?/i,"").trim());}
}
function toggleKeyPlay(){setKeyPlayState($("keyPlayBtn").getAttribute("aria-pressed")!=="true",{syncNote:true});}
function errorFielderOptions(selectedKey=""){
  return '<option value="">Choose defensive player</option>'+dialogErrorRoster.map(player=>`<option value="${escapeHtml(player.key)}" ${player.key===selectedKey?"selected":""}>${escapeHtml([player.num?`#${String(player.num).replace(/^#/,"")}`:"",player.name||"Unknown",player.pos?`(${player.pos})`:""].filter(Boolean).join(" "))}</option>`).join("");
}
function renderErrorAssignmentRows(errors=[]){
  const wrap=$("errorAssignmentRows");if(!wrap)return;const rows=errors.length?errors:[{}];
  wrap.innerHTML=rows.slice(0,2).map((error,index)=>`<div class="error-assignment-row" data-error-index="${index}"><label>Defensive player<select class="error-fielder-select">${errorFielderOptions(error.fielderKey||"")}</select></label><label>Error type<select class="error-type-select">${ERROR_TYPES.map(([value,label])=>`<option value="${value}" ${value===(error.type||"fielding")?"selected":""}>${label}</option>`).join("")}</select></label><button class="danger compact remove-error-button" type="button" data-remove-error="${index}" ${rows.length===1?"hidden":""}>Remove</button></div>`).join("");
  $("playErrors").value=rows.filter(row=>row.fielderKey).length||0;$("addSecondErrorBtn").disabled=rows.length>=2;
}
function showErrorAssignmentPanel(errors=[],details=""){
  const team=$("dialogTeam").value||currentBattingTeam(),defensiveTeam=defensiveTeamForBattingTeam(team);dialogErrorRoster=rosterPlayersForError(defensiveTeam,errors);$("errorAssignmentPanel").hidden=false;setField("errorDetails",details);renderErrorAssignmentRows(errors.length?errors:[{}]);
}
function closeErrorAssignmentPanel(){if(getFieldingErrorsFromDialog().length&& !confirm("Remove the assigned error information from this play?"))return;$("errorAssignmentPanel").hidden=true;$("errorAssignmentRows").innerHTML="";setField("errorDetails","");$("playErrors").value=0;}
function getFieldingErrorsFromDialog(){
  if($("errorAssignmentPanel")?.hidden)return [];
  return [...document.querySelectorAll(".error-assignment-row")].map(row=>{const fielderKey=row.querySelector(".error-fielder-select")?.value||"",type=row.querySelector(".error-type-select")?.value||"fielding",fielder=dialogErrorRoster.find(player=>player.key===fielderKey);if(!fielderKey||!fielder)return null;return {fielderKey,lineupIndex:fielder.lineupIndex,fielder:playerSnapshot(fielder),type,typeLabel:errorTypeLabel(type),positionNumber:positionNumber(fielder.pos)};}).filter(Boolean);
}
function addErrorAssignmentRow(){const errors=getFieldingErrorsFromDialog();if(document.querySelectorAll(".error-assignment-row").length===1&&!errors.length)errors.push({});if(errors.length<2)errors.push({});renderErrorAssignmentRows(errors);}
function removeErrorAssignmentRow(index){const errors=getFieldingErrorsFromDialog();errors.splice(index,1);renderErrorAssignmentRows(errors.length?errors:[{}]);}
function errorDetailsText(play){
  const errors=Array.isArray(play?.fieldingErrors)?play.fieldingErrors:[];const assignments=errors.map(error=>`${errorNotation(error)} ${error.fielder?.name||"Unknown fielder"} — ${error.typeLabel||errorTypeLabel(error.type)}`).join("; ");return [assignments,play?.errorDetails].filter(Boolean).join("; ");
}
function interferenceTypeRecord(id){return INTERFERENCE_TYPES.find(item=>item.id===id)||INTERFERENCE_TYPES.at(-1);}
function interferenceTypeLabel(id){return interferenceTypeRecord(id).label;}
function interferenceCode(play){
  const type=play?.interferenceType||(play?.outcome==="CI"?"catcher":"");
  return type?interferenceTypeRecord(type).code:(play?.outcome==="CI"?"CI":"INT");
}
function interferenceRulingLabel(value){return INTERFERENCE_RULINGS.find(([id])=>id===value)?.[1]||"Custom ruling";}
function interferenceDetailsText(play){
  if(!play||(!play.interferenceType&&play.outcome!=="INT"&&play.outcome!=="CI"))return "";
  const type=play.interferenceType||(play.outcome==="CI"?"catcher":"other"),parts=[interferenceTypeLabel(type)];
  if(play.interferencePerson)parts.push(play.interferencePerson);
  if(play.interferenceRuling)parts.push(interferenceRulingLabel(play.interferenceRuling));
  if(play.interferenceDetails)parts.push(play.interferenceDetails);
  if(play.countsAsPlateAppearance===false)parts.push("plate appearance continued");
  return parts.filter(Boolean).join(" — ");
}
function interferenceTypeOptions(selected=""){
  return INTERFERENCE_TYPES.map(item=>`<option value="${item.id}" ${item.id===selected?"selected":""}>${escapeHtml(`${item.code} — ${item.label}`)}</option>`).join("");
}
function interferenceRulingOptions(selected=""){
  return INTERFERENCE_RULINGS.map(([id,label])=>`<option value="${id}" ${id===selected?"selected":""}>${escapeHtml(label)}</option>`).join("");
}
function setInterferencePanelValues(play={},fallbackType=""){
  const type=play.interferenceType||fallbackType||(play.outcome==="CI"?"catcher":"batter"),record=interferenceTypeRecord(type);
  $("interferenceType").innerHTML=interferenceTypeOptions(type);
  $("interferenceRuling").innerHTML=interferenceRulingOptions(play.interferenceRuling||record.ruling);
  setField("interferencePerson",play.interferencePerson||"");
  setField("interferenceDetails",play.interferenceDetails||"");
  $("interferenceEndsPa").checked=play.countsAsPlateAppearance!==undefined?Boolean(play.countsAsPlateAppearance):Boolean(record.endsPa);
  $("interferenceAtBat").checked=play.abOverride!==undefined?Boolean(play.abOverride):Boolean(record.atBat);
  $("interferenceHit").checked=play.hitOverride!==undefined?Boolean(play.hitOverride):Boolean(record.hit);
}
function applyInterferenceDefaults(typeId,{preservePlacements=false}={}){
  const record=interferenceTypeRecord(typeId);
  $("interferenceRuling").innerHTML=interferenceRulingOptions(record.ruling);
  $("interferenceEndsPa").checked=Boolean(record.endsPa);
  $("interferenceAtBat").checked=Boolean(record.atBat);
  $("interferenceHit").checked=Boolean(record.hit);
  if(!preservePlacements){
    $("playOuts").value=record.outs;
    const team=$("dialogTeam").value||currentBattingTeam(),idx=num($("dialogPlayerIndex").value),existing=scoring.plays.find(play=>play.id===$("dialogPlayId").value),def=defaultDetails(record.id==="catcher"?"CI":"INT",team,idx,existing?.beforeState?.bases||null,existing?.beforeState?.outs??null).d;
    $("playRuns").value=def.runs;$("playRbi").value=def.rbi;$("batterDestination").value=def.batter;$("runner1Destination").value=def.r1;$("runner2Destination").value=def.r2;$("runner3Destination").value=def.r3;
    if(["batter","runner","offensive-team","umpire-catcher","authorized-person"].includes(record.id)){$("batterDestination").value="out";["runner1Destination","runner2Destination","runner3Destination"].forEach(id=>{if($(id).value!=="empty")$(id).value="hold";});}
    if(record.id==="umpire-batted"||record.id==="catcher")$("batterDestination").value="1";
  }
}
function showInterferencePanel(play={},fallbackType=""){
  $("interferencePanel").hidden=false;
  setInterferencePanelValues(play,fallbackType);
}
function closeInterferencePanel(){
  $("interferencePanel").hidden=true;
  setField("interferencePerson","");setField("interferenceDetails","");
}
function toggleInterferencePanel(){
  if($("interferencePanel").hidden){if(!["INT","CI"].includes($("playOutcome").value))$("playOutcome").value="INT";showInterferencePanel({},$("playOutcome").value==="CI"?"catcher":"batter");applyInterferenceDefaults($("interferenceType").value);}
  else closeInterferencePanel();
}

function openPlayDialog(team,playerIndex,paIndex,outcomeId,existing=null,prefill={}){
  const data=collectData(),player=existing?.playerSnapshot||activeBatter(team,playerIndex);
  $("dialogTeam").value=team;$("dialogPlayerIndex").value=playerIndex;$("dialogPaIndex").value=paIndex;$("dialogPlayId").value=existing?.id||"";
  ensureScoringState();
  $("dialogTitle").textContent=`${player.name||`Batter ${playerIndex+1}`} — PA ${paIndex+1} — ${existing?.pitchCount?countLabel(existing.pitchCount):countLabel()}`;
  $("playOutcome").innerHTML=OUTCOMES.map(o=>`<option value="${o.id}">${escapeHtml(o.code)} — ${escapeHtml(o.label)}</option>`).join("");
  populateFieldLocationControls(existing?.fieldLocation||prefill.fieldLocation||"",existing?.fieldingSequence||prefill.fieldingSequence||"");
  fillDestinationSelect("batterDestination",BATTER_DESTINATIONS); ["runner1Destination","runner2Destination","runner3Destination"].forEach(id=>fillDestinationSelect(id,DESTINATIONS));
  const defaults=defaultDetails(outcomeId,team,playerIndex,existing?.beforeState?.bases||null,existing?.beforeState?.outs??null); const v=existing||{};
  $("playOutcome").value=v.outcome||outcomeId; $("playPitcher").value=v.pitcher||currentPitcherName(team); $("playInning").value=v.inning||scoring.inning; $("playHalf").value=v.half||(team==="away"?"top":"bottom");
  $("playRuns").value=v.runs??defaults.d.runs; $("playRbi").value=v.rbi??defaults.d.rbi; $("playOuts").value=v.outsOnPlay??defaults.d.outs; $("playErrors").value=fieldingErrorCount(v)||defaults.d.errors;
  $("batterDestination").value=v.destinations?.batter||defaults.d.batter; $("runner1Destination").value=v.destinations?.r1||defaults.d.r1; $("runner2Destination").value=v.destinations?.r2||defaults.d.r2; $("runner3Destination").value=v.destinations?.r3||defaults.d.r3; $("playNotes").value=v.notes||"";
  setKeyPlayState(Boolean(v.keyPlay));$("errorAssignmentPanel").hidden=true;$("errorAssignmentRows").innerHTML="";setField("errorDetails",v.errorDetails||"");
  $("interferencePanel").hidden=true;setField("interferencePerson","");setField("interferenceDetails","");
  const selectedOutcome=v.outcome||outcomeId;updatePlayFieldLocationVisibility(selectedOutcome,v.fieldLocation||prefill.fieldLocation||"",v.fieldingSequence||prefill.fieldingSequence||"");$("droppedThirdStrikePanel").hidden=selectedOutcome!=="D3K";$("droppedThirdStrikeCause").value=v.droppedThirdStrikeCause||"unclassified";
  if((v.fieldingErrors||[]).length||selectedOutcome==="ROE")showErrorAssignmentPanel(v.fieldingErrors||[],v.errorDetails||"");
  if(v.interferenceType||["INT","CI"].includes(selectedOutcome))showInterferencePanel(v,selectedOutcome==="CI"?"catcher":"batter");
  $("deletePlayBtn").hidden=!existing; $("playDialog").showModal();
}
function handlePlayOutcomeChange(){
  const team=$("dialogTeam").value,idx=num($("dialogPlayerIndex").value),existing=scoring.plays.find(play=>play.id===$("dialogPlayId").value),outcome=$("playOutcome").value,def=defaultDetails($("playOutcome").value,team,idx,existing?.beforeState?.bases||null,existing?.beforeState?.outs??null).d;
  $("playRuns").value=def.runs;$("playRbi").value=def.rbi;$("playOuts").value=def.outs;$("batterDestination").value=def.batter;$("runner1Destination").value=def.r1;$("runner2Destination").value=def.r2;$("runner3Destination").value=def.r3;
  updatePlayFieldLocationVisibility(outcome,existing?.fieldLocation||"",existing?.fieldingSequence||"");
  if(outcome==="ROE"&&$("errorAssignmentPanel").hidden)showErrorAssignmentPanel(existing?.fieldingErrors||[],existing?.errorDetails||"");
  if(["INT","CI"].includes(outcome)){
    showInterferencePanel(existing||{},outcome==="CI"?"catcher":"batter");
    if(!existing?.interferenceType)applyInterferenceDefaults(outcome==="CI"?"catcher":"batter");
  }else if(!$("interferencePanel").hidden)closeInterferencePanel();
  $("droppedThirdStrikePanel").hidden=outcome!=="D3K";if(outcome==="D3K"&&!existing?.droppedThirdStrikeCause)$("droppedThirdStrikeCause").value="unclassified";
  $("playErrors").value=getFieldingErrorsFromDialog().length;
}
function recordCurrentError(){const team=currentBattingTeam(),playerIndex=num(scoring.battingIndexes[team]),paIndex=currentPaIndex(team,playerIndex);openFieldLocationDialog("ROE",{mode:"dialog",team,playerIndex,paIndex,showError:true});}

let runnerEventDialogBases=emptyBases();
function runnerBaseLabel(base){return base===1?"1st":base===2?"2nd":"3rd";}
function runnerEventTypeLabel(type){return RUNNER_EVENT_TYPES.find(([id])=>id===type)?.[1]||"Runner event";}
function runnerEventResultLabel(type,result){return (RUNNER_EVENT_RESULTS[type]||[]).find(([id])=>id===result)?.[1]||result||"";}
function runnerEventCode(type,result){
  if(type==="steal")return result==="caught-stealing"?"CS":"SB";
  if(type==="pickoff")return result==="picked-off"?"PO":result==="advanced-error"?"PK-E":result==="balk"?"BK":"PK";
  if(type==="wild-pitch")return "WP";
  if(type==="passed-ball")return "PB";
  if(type==="defensive-indifference")return "DI";
  return "RUN";
}
function runnerEventNextDestination(base){return base===1?"2":base===2?"3":"home";}
function runnerEventOccupiedBases(bases=runnerEventDialogBases){return [1,2,3].filter(base=>Boolean(bases?.[base]));}
function runnerEventPrimaryRunner(base=Number($("runnerEventPrimaryBase")?.value||0)){return runnerEventDialogBases?.[base]||null;}
function populateRunnerEventPrimaryOptions(selectedBase=0){
  const select=$("runnerEventPrimaryBase"),occupied=runnerEventOccupiedBases();
  select.innerHTML=occupied.map(base=>{const runner=runnerEventDialogBases[base];return `<option value="${base}" ${base===Number(selectedBase)?"selected":""}>Runner on ${runnerBaseLabel(base)} — ${escapeHtml(runner?.name||"Runner")}</option>`;}).join("");
  if(!occupied.includes(Number(select.value)))select.value=String(occupied[0]||"");
}
function populateRunnerEventResults(type,selected=""){
  const rows=RUNNER_EVENT_RESULTS[type]||[];$("runnerEventResult").innerHTML=rows.map(([id,label])=>`<option value="${id}" ${id===selected?"selected":""}>${escapeHtml(label)}</option>`).join("");
  if(!rows.some(([id])=>id===$("runnerEventResult").value))$("runnerEventResult").value=rows[0]?.[0]||"";
}
function setRunnerEventDestinationOptions(){
  for(let base=1;base<=3;base++){
    const id=`runnerEventRunner${base}Destination`,runner=runnerEventDialogBases?.[base];fillDestinationSelect(id,DESTINATIONS);
    $(id).disabled=!runner;$(id).closest("label").hidden=!runner;
    $(id).value=runner?"hold":"empty";
    const name=$(id).closest("label").querySelector("span");if(name)name.textContent=runner?`${runner.name||"Runner"} from ${runnerBaseLabel(base)}`:`Runner from ${runnerBaseLabel(base)}`;
  }
}
function applyRunnerEventDefaults({preserveDestinations=false}={}){
  const type=$("runnerEventType").value,result=$("runnerEventResult").value,primary=Number($("runnerEventPrimaryBase").value||0);
  if(!preserveDestinations){
    for(let base=1;base<=3;base++){const field=$(`runnerEventRunner${base}Destination`);if(field&&!field.disabled)field.value="hold";}
    const field=$(`runnerEventRunner${primary}Destination`);
    if(field){
      if(type==="steal"&&result==="caught-stealing")field.value="out";
      else if(type==="pickoff"&&result==="picked-off")field.value="out";
      else if(type==="pickoff"&&result==="safe")field.value="hold";
      else field.value=runnerEventNextDestination(primary);
    }
  }
  syncRunnerEventCounts();
}
function syncRunnerEventCounts(){
  let runs=0,outs=0;
  for(let base=1;base<=3;base++){const field=$(`runnerEventRunner${base}Destination`);if(!field||field.disabled)continue;if(field.value==="home")runs++;if(field.value==="out")outs++;}
  $("runnerEventRuns").value=runs;$("runnerEventOuts").value=outs;
}
function openRunnerEventDialog(existingId=""){
  ensureScoringState();
  if(gameIsFinal()&&!existingId){alert("This game is already final. Use Undo Last Play to reopen it before recording another event.");return;}
  const existing=scoring.plays.find(play=>play.id===existingId&&play.eventType==="runner")||null,team=existing?.team||currentBattingTeam();
  runnerEventDialogBases=deepClone(existing?.beforeState?.bases||scoring.bases||emptyBases());
  const occupied=runnerEventOccupiedBases();
  if(!occupied.length){alert("There is no runner on base to record. For an uncaught third strike, use K+ in the plate-appearance result.");return;}
  $("runnerEventPlayId").value=existing?.id||"";$("runnerEventTeam").value=team;
  $("runnerEventType").innerHTML=RUNNER_EVENT_TYPES.map(([id,label])=>`<option value="${id}">${escapeHtml(label)}</option>`).join("");
  const type=existing?.runnerEvent?.type||"steal";$("runnerEventType").value=type;populateRunnerEventResults(type,existing?.runnerEvent?.result||"");
  const selectedBase=existing?.runnerEvent?.primaryBase||occupied.find(base=>runnerEventDialogBases[base]?.playerKey===existing?.playerKey)||occupied[0];populateRunnerEventPrimaryOptions(selectedBase);setRunnerEventDestinationOptions();
  $("runnerEventPitcher").value=existing?.pitcher||currentPitcherName(team);$("runnerEventInning").value=existing?.inning||scoring.inning;$("runnerEventHalf").value=existing?.half||scoring.half;$("runnerEventNotes").value=existing?.notes||"";
  if(existing?.destinations){for(let base=1;base<=3;base++){const field=$(`runnerEventRunner${base}Destination`);if(field&&!field.disabled)field.value=existing.destinations[`r${base}`]||"hold";}$("runnerEventRuns").value=Math.max(0,num(existing.runs));$("runnerEventOuts").value=Math.max(0,num(existing.outsOnPlay));}
  else applyRunnerEventDefaults();
  $("runnerEventDialogTitle").textContent=existing?`Edit ${runnerEventTypeLabel(type)}`:`Record Runner Event — ${teamName(team)}`;$("deleteRunnerEventBtn").hidden=!existing;$("runnerEventDialog").showModal();
}
function getRunnerEventFromDialog(){
  const team=$("runnerEventTeam").value,type=$("runnerEventType").value,result=$("runnerEventResult").value,primaryBase=Number($("runnerEventPrimaryBase").value),runner=runnerEventDialogBases?.[primaryBase];
  const destinations={batter:"out",r1:runnerEventDialogBases[1]?$("runnerEventRunner1Destination").value:"empty",r2:runnerEventDialogBases[2]?$("runnerEventRunner2Destination").value:"empty",r3:runnerEventDialogBases[3]?$("runnerEventRunner3Destination").value:"empty"};
  const code=runnerEventCode(type,result),target=destinations[`r${primaryBase}`];
  return {eventType:"runner",team,playerIndex:Math.max(0,num(runner?.playerIndex)),playerName:runner?.name||"Runner",playerKey:runner?.playerKey||runner?.id||"",playerSnapshot:runner?.player||{name:runner?.name||"Runner"},paIndex:-1,outcome:code,outcomeCode:code,pitcher:getField("runnerEventPitcher"),inning:Math.max(1,num($("runnerEventInning").value)),half:$("runnerEventHalf").value,runs:Math.max(0,num($("runnerEventRuns").value)),rbi:0,outsOnPlay:Math.max(0,num($("runnerEventOuts").value)),errors:0,fieldingErrors:[],destinations,countsAsPlateAppearance:false,abOverride:false,hitOverride:0,notes:getField("runnerEventNotes"),runnerEvent:{type,result,primaryBase,fromBase:primaryBase,toBase:target,description:`${runnerEventTypeLabel(type)} — ${runnerEventResultLabel(type,result)}`}};
}
function saveRunnerEvent(event){
  event.preventDefault();syncRunnerEventCounts();
  const existingId=$("runnerEventPlayId").value,incoming=getRunnerEventFromDialog(),primary=incoming.runnerEvent.primaryBase,destination=incoming.destinations[`r${primary}`],type=incoming.runnerEvent.type,result=incoming.runnerEvent.result;
  if(!runnerEventPrimaryRunner(primary)){alert("Choose a runner who is currently on base.");return;}
  if(type==="steal"&&result==="stolen-base"&&!["2","3","home"].includes(destination)){alert("A stolen base must move the selected runner to the next base or home.");return;}
  if(type==="steal"&&result==="caught-stealing"&&destination!=="out"){alert("Caught stealing must record the selected runner as out.");return;}
  if(type==="pickoff"&&result==="picked-off"&&destination!=="out"){alert("A successful pickoff must record the selected runner as out.");return;}
  if(["wild-pitch","passed-ball","defensive-indifference"].includes(type)){
    const advanced=[1,2,3].some(base=>{const value=incoming.destinations[`r${base}`],rank={1:1,2:2,3:3,home:4}[value]||0;return runnerEventDialogBases[base]&&rank>base;});
    if(!advanced){alert(`${runnerEventTypeLabel(type)} requires at least one runner to advance.`);return;}
  }
  if(type==="pickoff"&&result==="advanced-error")incoming.errors=1;
  const saved=commitPlay(incoming,existingId);if(!saved)return;$("runnerEventDialog").close();
}
function runnerEventDetail(play){
  const type=play?.runnerEvent?.type||"",result=play?.runnerEvent?.result||"",from=Number(play?.runnerEvent?.primaryBase||0),to=play?.runnerEvent?.toBase||"";
  const movement=from?`${runnerBaseLabel(from)} → ${to==="home"?"home":to==="out"?"out":to==="hold"?"held":to?runnerBaseLabel(Number(to)):""}`:"";
  return [runnerEventTypeLabel(type),runnerEventResultLabel(type,result),movement].filter(Boolean).join(" • ");
}
function runnerEventTeamTotals(team){
  const totals={sb:0,cs:0,pickoffAttempts:0,pickoffs:0,wp:0,pb:0,di:0};
  scoring.plays.filter(play=>!play.afterGameEnd).forEach(play=>{
    const battingTeam=play.team,fieldingTeam=defensiveTeamForBattingTeam(battingTeam),type=play.runnerEvent?.type,result=play.runnerEvent?.result;
    if(play.eventType==="runner"&&battingTeam===team){if(type==="steal"){if(result==="stolen-base")totals.sb++;if(result==="caught-stealing")totals.cs++;}if(type==="defensive-indifference")totals.di++;}
    if(play.eventType==="runner"&&fieldingTeam===team){if(type==="pickoff"){totals.pickoffAttempts++;if(result==="picked-off")totals.pickoffs++;}if(type==="wild-pitch")totals.wp++;if(type==="passed-ball")totals.pb++;}
    if(play.outcome==="D3K"&&fieldingTeam===team){if(play.droppedThirdStrikeCause==="wild-pitch")totals.wp++;if(play.droppedThirdStrikeCause==="passed-ball")totals.pb++;}
  });
  return totals;
}
function renderRunnerEventTracker(){
  const wrap=$("runnerEventLog"),count=$("runnerEventLogCount"),summary=$("runnerEventSummary");if(!wrap||!count)return;
  const events=scoring.plays.filter(play=>play.eventType==="runner"&&!play.afterGameEnd).sort((a,b)=>b.seq-a.seq);count.textContent=`${events.length} event${events.length===1?"":"s"}`;
  if(summary)summary.innerHTML=["away","home"].map(team=>{const t=runnerEventTeamTotals(team);return `<span><strong>${escapeHtml(teamName(team))}</strong> SB ${t.sb} • CS ${t.cs} • PK Att ${t.pickoffAttempts} • PO ${t.pickoffs} • WP ${t.wp} • PB ${t.pb} • DI ${t.di}</span>`;}).join("");
  wrap.innerHTML=events.length?events.map(play=>`<div class="runner-event-log-item"><div><strong>${escapeHtml(`${play.half==="top"?"Top":"Bottom"} ${play.inning} — ${play.playerName}: ${playNotation(play)}`)}</strong><p>${escapeHtml([runnerEventDetail(play),play.notes].filter(Boolean).join(" • "))}</p></div><button class="secondary compact" type="button" data-edit-runner-event="${play.id}">Edit</button></div>`).join(""):`<p class="empty-tracking-note">No steals, pickoff attempts, wild pitches, passed balls, or defensive-indifference events recorded.</p>`;
}
function runnerEventLogText(){return scoring.plays.filter(play=>play.eventType==="runner"&&!play.afterGameEnd).sort((a,b)=>a.seq-b.seq).map(play=>`${play.half==="top"?"T":"B"}${play.inning} ${play.playerName} ${playNotation(play)}`).join("; ");}

function currentPitcherName(battingTeam){ return activePitcherInfo(battingTeam).name; }
function renderActivePitcherSelect(){
  const select=$("activePitcherSelect");if(!select)return;ensureScoringState();
  const pitchingTeam=defensiveTeamForBattingTeam(currentBattingTeam()),data=collectData(),selected=Math.max(0,Math.min(PITCHER_ROWS-1,num(scoring.activePitchers[pitchingTeam]))),used=usedPitcherRows(pitchingTeam),pitchers=data[pitchingTeam]?.pitchers||[];
  const roster=pitchers.map((p,index)=>({p,index})).filter(({p,index})=>index===selected||p.name||p.num),current=roster.find(({index})=>index===selected),unused=roster.filter(({index})=>index!==selected&&!used.has(index)).sort((a,b)=>comparePitchersAlphabetically({pitcher:a.p},{pitcher:b.p})),previous=roster.filter(({index})=>index!==selected&&used.has(index)).sort((a,b)=>comparePitchersAlphabetically({pitcher:a.p},{pitcher:b.p})),options=[...(current?[current]:[]),...unused,...previous];
  select.innerHTML=options.map(({p,index})=>`<option value="${index}" ${index!==selected&&used.has(index)?"disabled":""}>${escapeHtml([index===selected?"CURRENT":"",p.num?`#${String(p.num).replace(/^#/,"")}`:"",p.name||`Pitcher ${index+1}`,index!==selected&&used.has(index)?"(used)":""].filter(Boolean).join(" — "))}</option>`).join("");
  if(!options.some(({index})=>index===selected))select.insertAdjacentHTML("afterbegin",`<option value="${selected}">Pitcher ${selected+1}</option>`);select.value=String(selected);
  if($("activePitcherTeamLabel"))$("activePitcherTeamLabel").textContent=`${teamName(pitchingTeam)} pitcher`;
}
function changeActivePitcher(){const pitchingTeam=defensiveTeamForBattingTeam(currentBattingTeam());recordPitcherChange(pitchingTeam,$("activePitcherSelect").value,"Live scoring");}

function getPlayFromDialog(){
  const fieldingErrors=getFieldingErrorsFromDialog(),outcome=$("playOutcome").value,interferenceActive=!$("interferencePanel").hidden&&["INT","CI"].includes(outcome),droppedThirdStrikeCause=outcome==="D3K"?$("droppedThirdStrikeCause").value:"";
  const fieldingSequence=outcomeRequiresFieldLocation(outcome)?selectedBallPathFromForm():"",fieldLocation=normalizeFieldingSequence(fieldingSequence)[0]||"";
  return {team:$("dialogTeam").value,playerIndex:num($("dialogPlayerIndex").value),paIndex:num($("dialogPaIndex").value),outcome,fieldLocation,fieldingSequence,pitcher:getField("playPitcher"),inning:Math.max(1,num($("playInning").value)),half:$("playHalf").value,runs:Math.max(0,num($("playRuns").value)),rbi:Math.max(0,num($("playRbi").value)),outsOnPlay:Math.max(0,num($("playOuts").value)),errors:fieldingErrors.length,fieldingErrors,errorDetails:getField("errorDetails"),keyPlay:$("keyPlayBtn").getAttribute("aria-pressed")==="true",destinations:{batter:$("batterDestination").value,r1:$("runner1Destination").value,r2:$("runner2Destination").value,r3:$("runner3Destination").value},notes:getField("playNotes"),droppedThirdStrikeCause,interferenceType:interferenceActive?$("interferenceType").value:"",interferencePerson:interferenceActive?getField("interferencePerson"):"",interferenceRuling:interferenceActive?$("interferenceRuling").value:"",interferenceDetails:interferenceActive?getField("interferenceDetails"):"",countsAsPlateAppearance:interferenceActive?$("interferenceEndsPa").checked:true,abOverride:interferenceActive?$("interferenceAtBat").checked:undefined,hitOverride:interferenceActive?($("interferenceHit").checked?1:0):undefined};
}
function applyDestinations(beforeBases,team,playerIndex,destinations,batterOverride=null){
  const post=emptyBases(); const batter=batterOverride||runnerFor(team,playerIndex); const runners={r1:beforeBases[1],r2:beforeBases[2],r3:beforeBases[3],batter};
  const originalBase={r1:"1",r2:"2",r3:"3"};
  for(const [key,runner] of Object.entries(runners)){
    if(!runner) continue;
    const dest=destinations[key];
    if(dest==="hold"&&originalBase[key])post[originalBase[key]]=runner;
    else if(["1","2","3"].includes(dest))post[dest]=runner;
  }
  return post;
}
function nextHalfState(inning,half){ return half==="top"?{inning,half:"bottom"}:{inning:inning+1,half:"top"}; }
function buildAfterState(play,beforeState,{placements=null,score=null}={}){
  const outs=beforeState.outs+play.outsOnPlay; let after={inning:play.inning,half:play.half,outs,bases:applyDestinations(beforeState.bases,play.team,play.playerIndex,play.destinations,{id:play.playerKey||`${play.team}-${play.playerIndex}`,playerKey:play.playerKey||"",team:play.team,playerIndex:play.playerIndex,name:play.playerName||`Batter ${play.playerIndex+1}`,player:play.playerSnapshot||{name:play.playerName},responsiblePitcherKey:play.pitcherKey||"",responsiblePitcherRow:Number.isInteger(play.pitcherRow)?play.pitcherRow:-1,responsiblePitcherName:play.pitcher||"",responsiblePitcherNumber:play.pitcherNumber||"",earnedRun:pitcherEarnedRunEligibility(play)}),battingIndexes:deepClone(beforeState.battingIndexes)};
  if(play.countsAsPlateAppearance!==false)after.battingIndexes[play.team]=(play.playerIndex+1)%LINEUP_ROWS;
  const finalStatus=score?decideGameStatus(play,after,score):null;
  if(finalStatus){after.gameStatus=finalStatus;after.outs=Math.min(3,outs);return after;}
  if(outs>=3){const n=nextHalfState(play.inning,play.half);after=prepareHalfInningState({...after,...n,outs:0,bases:emptyBases()},placements);}
  return after;
}
function commitPlay(incoming,existingId=""){
  ensureScoringState();
  if(gameIsFinal()&&!existingId){alert("This game is already final. Use Undo Last Play to reopen it before recording another play.");return null;}
  const existing=scoring.plays.find(p=>p.id===existingId);
  let beforeState;
  if(existing) beforeState=deepClone(existing.beforeState);
  else {
    const chosenTeam=battingTeamForHalf(incoming.half);
    beforeState={inning:incoming.inning,half:incoming.half,outs:(incoming.inning===scoring.inning&&incoming.half===scoring.half)?scoring.outs:0,bases:(incoming.inning===scoring.inning&&incoming.half===scoring.half&&incoming.team===chosenTeam)?deepClone(scoring.bases):emptyBases(),battingIndexes:deepClone(scoring.battingIndexes)};
    beforeState=prepareHalfInningState(beforeState);
  }
  const pitchCount=existing?.pitchCount||countSnapshot();
  const pitchingTeam=defensiveTeamForBattingTeam(incoming.team),resolvedPitcher=resolvePitcherInfo(pitchingTeam,incoming.pitcher);
  stampAutomaticRunnerPitcher(beforeState.bases,resolvedPitcher);
  const pitchSessionId=incoming.countsAsPlateAppearance===false?"":(existing?.pitchSessionId||pitchCount.sessionId||"");
  const currentPlayer=existing?.playerSnapshot||incoming.playerSnapshot||activeBatter(incoming.team,incoming.playerIndex),currentPlayerKey=existing?.playerKey||incoming.playerKey||playerIdentity(currentPlayer,incoming.team,"batter");
  const fieldingErrors=Array.isArray(incoming.fieldingErrors)?incoming.fieldingErrors:[];
  if(incoming.countsAsPlateAppearance===false&&!existing)incoming.paIndex=-1;
  const play={...incoming,errors:fieldingErrors.length||Math.max(0,num(incoming.errors)),fieldingErrors,keyPlay:Boolean(incoming.keyPlay),id:existing?.id||makeId(),seq:existing?.seq||scoring.nextSeq++,beforeState,pitchCount,pitchSessionId,pitchingTeam,pitcherKey:resolvedPitcher.key,pitcherRow:resolvedPitcher.row,pitcherNumber:resolvedPitcher.number||"",pitchSequence:existing?.pitchSequence||pitchSequenceLabel(pitchCount.history),playerName:incoming.playerName||currentPlayer.name||`Batter ${incoming.playerIndex+1}`,playerKey:currentPlayerKey,playerSnapshot:playerSnapshot(currentPlayer),recordedAt:existing?.recordedAt||new Date().toISOString()};
  play.outcomeCode=incoming.outcomeCode||(["INT","CI"].includes(incoming.outcome)?interferenceCode(play):(OUTCOME_MAP[incoming.outcome]?.code||incoming.outcome));
  if(pitchSessionId)scoring.pitchLog.filter(event=>event.sessionId===pitchSessionId).forEach(event=>{event.pitchingTeam=pitchingTeam;event.pitcherKey=resolvedPitcher.key;event.pitcherRow=resolvedPitcher.row;event.pitcherName=resolvedPitcher.name;event.pitcherNumber=resolvedPitcher.number||"";});
  if(existing){const idx=scoring.plays.findIndex(p=>p.id===existing.id);scoring.plays[idx]=play;} else scoring.plays.push(play);
  scoring.plays.sort((a,b)=>a.seq-b.seq);
  if(!existing&&incoming.countsAsPlateAppearance!==false)scoring.count=initialCount();
  rebuildDerivedGameState();refreshAll();scheduleAutosave(existing?"Play updated and all game counters rebuilt":gameIsFinal()?"Final play saved — game complete":incoming.eventType==="runner"?"Runner event saved; plate appearance continues":incoming.countsAsPlateAppearance===false?"Interference event saved; plate appearance continues":"Play saved");
  return play;
}
function recordPlay(event){
  event.preventDefault();
  const existingId=$("dialogPlayId").value,incoming=getPlayFromDialog();
  if(outcomeRequiresFieldLocation(incoming.outcome)&&!normalizeFieldingSequence(incoming.fieldingSequence,incoming.fieldLocation).length){openFieldLocationDialog(incoming.outcome,{mode:"play-form"});return;}
  if(incoming.outcome==="ROE"&&!incoming.fieldingErrors.length){showErrorAssignmentPanel([],incoming.errorDetails);alert("Choose the defensive player who committed the error before saving this reached-on-error play.");return;}
  if(["INT","CI"].includes(incoming.outcome)&&!incoming.interferenceType){showInterferencePanel({},incoming.outcome==="CI"?"catcher":"batter");alert("Choose the interference type and record the umpire’s ruling before saving.");return;}
  const saved=commitPlay(incoming,existingId);if(!saved)return;
  if(existingId&&scoring.lastAutoStrikeoutPlayId===existingId)scoring.lastAutoStrikeoutPlayId="";
  $("playDialog").close();
  renderPitchConsole();
}
function synchronizeCurrentPitchSession(){
  ensureScoringState();
  const sessionId=scoring.count.sessionId;
  if(!sessionId)return;
  const battingTeam=currentBattingTeam();
  const batterIndex=Math.max(0,Math.min(LINEUP_ROWS-1,num(scoring.battingIndexes[battingTeam])));
  const batter=activeBatter(battingTeam,batterIndex);
  const pitcher=activePitcherInfo(battingTeam);
  scoring.pitchLog.filter(event=>event.sessionId===sessionId).forEach(event=>{
    event.inning=scoring.inning;event.half=scoring.half;event.battingTeam=battingTeam;event.batterTeam=battingTeam;event.batterIndex=batterIndex;event.batterName=batter.name||`Batter ${batterIndex+1}`;event.pitchingTeam=pitcher.team;event.pitcherKey=pitcher.key;event.pitcherRow=pitcher.row;event.pitcherName=pitcher.name;event.pitcherNumber=pitcher.number||"";
  });
}
function rebuildDerivedGameState(){
  ensureScoringState();
  const ordered=[...scoring.plays].sort((a,b)=>a.seq-b.seq);
  const placements=[];let state={inning:1,half:"top",outs:0,bases:emptyBases(),battingIndexes:{away:0,home:0}},score={away:0,home:0},finalStatus=initialGameStatus();
  for(const play of ordered){
    if(finalStatus.status==="final"&&num(play.seq)>num(finalStatus.endedAtSeq)){play.afterGameEnd=true;continue;}
    delete play.afterGameEnd;
    const inning=Math.max(1,num(play.inning)||state.inning),half=play.half==="bottom"?"bottom":"top",team=play.team==="home"?"home":"away";
    if(state.inning!==inning||state.half!==half)state=prepareHalfInningState({...state,inning,half,outs:0,bases:emptyBases()},placements);
    else state=prepareHalfInningState(state,placements);
    const pitchingTeam=play.pitchingTeam||defensiveTeamForBattingTeam(team),resolvedPitcher=play.pitcherKey?{team:pitchingTeam,row:Number.isInteger(play.pitcherRow)?play.pitcherRow:-1,key:play.pitcherKey,name:play.pitcher||"Unknown Pitcher",number:play.pitcherNumber||"",throws:""}:resolvePitcherInfo(pitchingTeam,play.pitcher);
    stampAutomaticRunnerPitcher(state.bases,resolvedPitcher);
    if(play.countsAsPlateAppearance!==false)state.battingIndexes[team]=Math.max(0,Math.min(LINEUP_ROWS-1,num(play.playerIndex)));
    play.inning=inning;play.half=half;play.team=team;
    play.beforeState={inning:state.inning,half:state.half,outs:state.outs,bases:deepClone(state.bases),battingIndexes:deepClone(state.battingIndexes)};
    score[team]+=num(play.runs);
    play.afterState=buildAfterState(play,play.beforeState,{placements,score});
    if(play.afterState.gameStatus){finalStatus=play.afterState.gameStatus;state={...state,outs:play.afterState.outs,bases:deepClone(play.afterState.bases),battingIndexes:deepClone(play.afterState.battingIndexes)};}
    else state={inning:play.afterState.inning,half:play.afterState.half,outs:play.afterState.outs,bases:deepClone(play.afterState.bases),battingIndexes:deepClone(play.afterState.battingIndexes)};
  }
  scoring.plays=ordered;scoring.gameStatus=finalStatus;scoring.automaticRunnerPlacements=placements;
  scoring.inning=finalStatus.status==="final"?finalStatus.inning:state.inning;scoring.half=finalStatus.status==="final"?finalStatus.half:state.half;scoring.outs=state.outs;scoring.bases=deepClone(state.bases);scoring.battingIndexes=deepClone(state.battingIndexes);
  scoring.nextSeq=Math.max(1,...ordered.map(play=>num(play.seq)+1));
  if(scoring.lastAutoStrikeoutPlayId&&!ordered.some(play=>play.id===scoring.lastAutoStrikeoutPlayId))scoring.lastAutoStrikeoutPlayId="";
  synchronizeCurrentPitchSession();ensureScoringState();
}
function syncCurrentToLastPlay(){ rebuildDerivedGameState(); }
function deletePlay(id){
  const idx=scoring.plays.findIndex(p=>p.id===id);
  if(idx<0)return;
  const removed=scoring.plays[idx];
  scoring.plays.splice(idx,1);
  if(scoring.lastAutoStrikeoutPlayId===removed.id)scoring.lastAutoStrikeoutPlayId="";
  if(removed.pitchSessionId)scoring.pitchLog=scoring.pitchLog.filter(event=>event.sessionId!==removed.pitchSessionId);
  rebuildDerivedGameState();
  refreshAll();
  scheduleAutosave("Play deleted and all game counters rebuilt");
}
function undoLastPlay(){ const last=[...scoring.plays].sort((a,b)=>a.seq-b.seq).at(-1); if(!last)return; deletePlay(last.id); }
function manualChangeHalf(){
  if(gameIsFinal()&&!confirm("This game is final. Reopen it and manually change the half-inning?"))return;if(gameIsFinal())scoring.gameStatus=initialGameStatus();
  if(scoring.outs<3&&!confirm("Under MLB rules, a half-inning normally ends after three outs. Use this override only to correct the recorded game state. Change half-inning now?"))return;
  const n=nextHalfState(scoring.inning,scoring.half),prepared=prepareHalfInningState({...n,outs:0,bases:emptyBases(),battingIndexes:deepClone(scoring.battingIndexes)},scoring.automaticRunnerPlacements);scoring.inning=prepared.inning;scoring.half=prepared.half;scoring.outs=0;scoring.bases=prepared.bases;scoring.count=initialCount();scoring.lastAutoStrikeoutPlayId="";refreshAll();scheduleAutosave("Half-inning changed by manual correction");
}
function clearPersistentGameData(){
  clearTimeout(autosaveTimer);lastAutosaveStateJson="";clearGameFieldCache();
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i)||"";
      if(key===AUTOSAVE_STORAGE_KEY||key===AUTOSAVE_BACKUP_KEY||key===AUTOSAVE_ROSTER_KEY||LEGACY_STORAGE_PREFIXES.some(prefix=>key.startsWith(prefix)))localStorage.removeItem(key);
    }
  }catch(err){console.warn("Stored game data could not be cleared.",err);}
  updateAutosaveControls();
}
function blankEntireGame(message="Blank game ready. Choose a scheduled game or enter one manually.",returnToSetup=true){
  clearPersistentGameData();
  scoring=initialScoring();
  setFieldsFromData({});
  refreshAll();
  if(returnToSetup) setPanel("setup");
  if($("autosaveBar")) $("autosaveBar").textContent=message;
}
function resetScoring(){
  if(!confirm("Reset the entire game? This clears every team, lineup, pitcher, note, and recorded play."))return;
  blankEntireGame("Game reset. All scorecard fields and scoring totals are blank.");
}

function computeTeamStats(team){
  const rows=Array.from({length:LINEUP_ROWS},()=>({pa:0,ab:0,r:0,h:0,rbi:0,bb:0,k:0,hr:0,sb:0,cs:0}));
  scoring.plays.filter(p=>!p.afterGameEnd&&p.team===team).forEach(p=>{const st=rows[p.playerIndex]||rows[0],o=OUTCOME_MAP[p.outcome]||{},countsPa=p.countsAsPlateAppearance!==false,countsAb=p.abOverride!==undefined?Boolean(p.abOverride):Boolean(o.ab),hitValue=p.hitOverride!==undefined?num(p.hitOverride):num(o.hit);if(countsPa)st.pa++;if(countsPa&&countsAb)st.ab++;st.h+=hitValue;st.rbi+=p.rbi||0;st.bb+=o.bb||0;st.k+=o.k||0;st.hr+=o.hr||0;if(p.eventType==="runner"&&p.runnerEvent?.type==="steal"){if(p.runnerEvent.result==="stolen-base")st.sb++;if(p.runnerEvent.result==="caught-stealing")st.cs++;}});
  scoring.plays.filter(p=>!p.afterGameEnd).forEach(p=>{const before=p.beforeState?.bases||{},sources={batter:{team:p.team,playerIndex:p.playerIndex},r1:before[1],r2:before[2],r3:before[3]};Object.entries(p.destinations||{}).forEach(([key,destination])=>{const runner=sources[key];if(destination==="home"&&runner?.team===team&&rows[runner.playerIndex])rows[runner.playerIndex].r++;});});
  return rows;
}
function computePlayerStats(team){
  const map=new Map(),ensure=(key,player,lineupIndex)=>{if(!map.has(key))map.set(key,{key,team,lineupIndex,player:playerSnapshot(player),pa:0,ab:0,r:0,h:0,rbi:0,bb:0,k:0,hr:0,sb:0,cs:0});return map.get(key);};
  for(let index=0;index<LINEUP_ROWS;index++)for(const player of lineupOccupants(team,index))ensure(playerIdentity(player,team,"batter"),player,index);
  for(const play of scoring.plays.filter(play=>!play.afterGameEnd&&play.team===team)){const key=play.playerKey||playerIdentity(play.playerSnapshot||{name:play.playerName},team,"batter"),st=ensure(key,play.playerSnapshot||{name:play.playerName},play.playerIndex),o=OUTCOME_MAP[play.outcome]||{},countsPa=play.countsAsPlateAppearance!==false,countsAb=play.abOverride!==undefined?Boolean(play.abOverride):Boolean(o.ab),hitValue=play.hitOverride!==undefined?num(play.hitOverride):num(o.hit);if(countsPa)st.pa++;if(countsPa&&countsAb)st.ab++;st.h+=hitValue;st.rbi+=play.rbi||0;st.bb+=o.bb||0;st.k+=o.k||0;st.hr+=o.hr||0;if(play.eventType==="runner"&&play.runnerEvent?.type==="steal"){if(play.runnerEvent.result==="stolen-base")st.sb++;if(play.runnerEvent.result==="caught-stealing")st.cs++;}}
  for(const play of scoring.plays.filter(play=>!play.afterGameEnd)){const before=play.beforeState?.bases||{},sources={batter:{team:play.team,playerKey:play.playerKey,playerIndex:play.playerIndex,player:play.playerSnapshot},r1:before[1],r2:before[2],r3:before[3]};for(const [source,destination] of Object.entries(play.destinations||{})){const runner=sources[source];if(destination!=="home"||runner?.team!==team)continue;const fallback=activeBatter(team,runner.playerIndex||0),key=runner.playerKey||runner.id||playerIdentity(runner.player||fallback,team,"batter"),st=ensure(key,runner.player||fallback,runner.playerIndex||0);st.r++;}}
  return [...map.values()].filter(st=>st.player.name||st.pa).sort((a,b)=>a.lineupIndex-b.lineupIndex||a.player.name.localeCompare(b.player.name));
}
function computeFielderErrors(){const map=new Map();for(const play of scoring.plays.filter(play=>!play.afterGameEnd))for(const error of play.fieldingErrors||[]){const team=defensiveTeamForBattingTeam(play.team),key=error.fielderKey||playerIdentity(error.fielder,team,"fielder");if(!map.has(key))map.set(key,{key,team,player:playerSnapshot(error.fielder),errors:0});map.get(key).errors++;}return [...map.values()].sort((a,b)=>a.team.localeCompare(b.team)||a.player.name.localeCompare(b.player.name));}
function emptyPitcherStats(info){return {...info,pitches:0,strikes:0,balls:0,swingingStrikes:0,calledStrikes:0,fouls:0,inPlay:0,hbpPitches:0,battersFaced:0,outsRecorded:0,hits:0,runs:0,earnedRuns:0,walks:0,intentionalWalks:0,hitBatters:0,strikeouts:0,wildPitches:0,pickoffAttempts:0,pickoffs:0};}
function pitcherEarnedRunEligibility(play){return !["ROE","CI"].includes(String(play?.outcome||"").toUpperCase());}
function pitcherInfoForRunner(runner,play,fallback){
  const team=fallback.team,key=runner?.responsiblePitcherKey||fallback.key,row=Number.isInteger(runner?.responsiblePitcherRow)?runner.responsiblePitcherRow:fallback.row,name=runner?.responsiblePitcherName||fallback.name,number=runner?.responsiblePitcherNumber||fallback.number||"";
  return {team,row,key:key||pitcherKey(team,row,name),name:name||"Unknown Pitcher",number,throws:""};
}
function stampAutomaticRunnerPitcher(bases,pitcherInfo){
  if(!bases||!pitcherInfo)return bases;
  for(const base of [1,2,3]){const runner=bases[base];if(!runner?.automaticRunner||runner.responsiblePitcherKey)continue;bases[base]={...runner,responsiblePitcherKey:pitcherInfo.key||"",responsiblePitcherRow:Number.isInteger(pitcherInfo.row)?pitcherInfo.row:-1,responsiblePitcherName:pitcherInfo.name||"",responsiblePitcherNumber:pitcherInfo.number||"",earnedRun:false};}
  return bases;
}
function formatInningsPitched(outs){const total=Math.max(0,num(outs)),whole=Math.floor(total/3),remainder=total%3;return `${whole}.${remainder}`;}
function computePitcherTracking(){
  ensureScoringState();
  const data=collectData(),map=new Map();
  const ensure=(info)=>{if(!map.has(info.key))map.set(info.key,emptyPitcherStats(info));return map.get(info.key);};
  for(const team of ["away","home"])(data[team]?.pitchers||[]).forEach((p,row)=>{if(p.name||p.num)ensure(pitcherInfoFromRow(team,row));});
  scoring.pitchLog.forEach(event=>{
    const info={team:event.pitchingTeam||defensiveTeamForBattingTeam(event.battingTeam),row:Number.isInteger(event.pitcherRow)?event.pitcherRow:-1,key:event.pitcherKey||pitcherKey(event.pitchingTeam||"away",event.pitcherRow,event.pitcherName),name:event.pitcherName||"Unknown Pitcher",number:event.pitcherNumber||"",throws:""},s=ensure(info),type=event.type;
    s.pitches++;
    if(type==="ball")s.balls++;
    if(PITCH_TYPE_INFO[type]?.strike)s.strikes++;
    if(type==="swingingStrike"||type==="strike")s.swingingStrikes++;
    if(type==="calledStrike")s.calledStrikes++;
    if(type==="foul")s.fouls++;
    if(type==="inplay")s.inPlay++;
    if(type==="hitByPitch")s.hbpPitches++;
  });
  scoring.plays.filter(play=>!play.afterGameEnd).forEach(play=>{
    const team=play.pitchingTeam||defensiveTeamForBattingTeam(play.team),resolved=play.pitcherKey?{team,row:Number.isInteger(play.pitcherRow)?play.pitcherRow:-1,key:play.pitcherKey,name:play.pitcher||"Unknown Pitcher",number:play.pitcherNumber||"",throws:""}:resolvePitcherInfo(team,play.pitcher),s=ensure(resolved),o=OUTCOME_MAP[play.outcome]||{},hitValue=play.hitOverride!==undefined?num(play.hitOverride):num(o.hit);
    if(play.countsAsPlateAppearance!==false)s.battersFaced++;
    s.outsRecorded+=Math.max(0,num(play.outsOnPlay));
    s.hits+=hitValue;s.strikeouts+=o.k||0;
    if(play.outcome==="BB")s.walks++;
    if(play.outcome==="IBB")s.intentionalWalks++;
    if(play.outcome==="HBP")s.hitBatters++;
    if((play.eventType==="runner"&&play.runnerEvent?.type==="wild-pitch")||(play.outcome==="D3K"&&play.droppedThirdStrikeCause==="wild-pitch"))s.wildPitches++;
    if(play.eventType==="runner"&&play.runnerEvent?.type==="pickoff"){s.pickoffAttempts++;if(play.runnerEvent?.result==="picked-off")s.pickoffs++;}
    const batterRunner={responsiblePitcherKey:resolved.key,responsiblePitcherRow:resolved.row,responsiblePitcherName:resolved.name,responsiblePitcherNumber:resolved.number,earnedRun:pitcherEarnedRunEligibility(play)};
    const sources={batter:batterRunner,r1:play.beforeState?.bases?.[1],r2:play.beforeState?.bases?.[2],r3:play.beforeState?.bases?.[3]};
    let attributedRuns=0;
    for(const [source,destination] of Object.entries(play.destinations||{})){
      if(destination!=="home")continue;
      attributedRuns++;
      const runner=sources[source]||batterRunner,charged=ensure(pitcherInfoForRunner(runner,play,resolved));
      charged.runs++;
      if(runner?.earnedRun!==false&&!runner?.automaticRunner&&play.runnerEvent?.type!=="passed-ball"&&play.droppedThirdStrikeCause!=="passed-ball")charged.earnedRuns++;
    }
    const unassignedRuns=Math.max(0,num(play.runs)-attributedRuns);
    if(unassignedRuns){s.runs+=unassignedRuns;if(pitcherEarnedRunEligibility(play))s.earnedRuns+=unassignedRuns;}
  });
  return {away:[...map.values()].filter(s=>s.team==="away").sort((a,b)=>(a.row<0?99:a.row)-(b.row<0?99:b.row)||a.name.localeCompare(b.name)),home:[...map.values()].filter(s=>s.team==="home").sort((a,b)=>(a.row<0?99:a.row)-(b.row<0?99:b.row)||a.name.localeCompare(b.name))};
}
function scorecardPitchingLinesForTeam(team){
  const tracked=computePitcherTracking()[team]||[],pitchers=scorecardPitchersForTeam(team);
  return pitchers.map(pitcher=>{
    const key=pitcherRosterKey(pitcher),name=String(pitcher?.name||"").trim().toLowerCase();
    const stats=tracked.find(item=>pitcherRosterKey({num:item.number,name:item.name})===key)||(name?tracked.find(item=>String(item.name||"").trim().toLowerCase()===name):null)||emptyPitcherStats({team,row:-1,key:`${team}:pdf:${key}`,name:pitcher.name||"",number:pitcher.num||"",throws:pitcher.throws||""});
    return {pitcher,stats,columns:[formatInningsPitched(stats.outsRecorded),stats.hits,stats.runs,stats.earnedRuns,stats.walks+stats.intentionalWalks,stats.strikeouts,stats.hitBatters,stats.wildPitches]};
  });
}
function pitcherStatsTable(team,rows){
  const title=teamName(team),body=rows.length?rows.map(s=>`<tr><td><strong>${escapeHtml([s.number?`#${String(s.number).replace(/^#/,"")}`:"",s.name].filter(Boolean).join(" "))}</strong></td><td>${s.pitches}</td><td>${s.strikes}</td><td>${s.balls}</td><td>${s.pitches?Math.round(s.strikes/s.pitches*100):0}%</td><td>${s.swingingStrikes}</td><td>${s.calledStrikes}</td><td>${s.fouls}</td><td>${s.inPlay}</td><td>${s.battersFaced}</td><td>${s.hits}</td><td>${s.walks}</td><td>${s.intentionalWalks}</td><td>${s.hitBatters}</td><td>${s.strikeouts}</td><td>${s.wildPitches}</td><td>${s.pickoffAttempts}</td><td>${s.pickoffs}</td></tr>`).join(""):`<tr><td colspan="18">No pitcher or pitch data recorded yet.</td></tr>`;
  return `<article class="pitcher-tracking-card"><h3>${escapeHtml(title)} Pitchers</h3><div class="pitcher-table-wrap"><table class="pitcher-tracking-table"><thead><tr><th>Pitcher</th><th>P</th><th>Str</th><th>Ball</th><th>Str%</th><th>SW</th><th>C</th><th>F</th><th>IP</th><th>BF</th><th>H</th><th>BB</th><th>IBB</th><th>HBP</th><th>K</th><th>WP</th><th>PK Att</th><th>PK</th></tr></thead><tbody>${body}</tbody></table></div></article>`;
}
function renderPitchTracking(){
  const summary=$("pitcherTrackingSummary"),log=$("pitchEventLog");if(!summary||!log)return;
  const stats=computePitcherTracking();summary.innerHTML=pitcherStatsTable("away",stats.away)+pitcherStatsTable("home",stats.home);
  const events=[...scoring.pitchLog].sort((a,b)=>b.seq-a.seq);
  if($("pitchLogCount"))$("pitchLogCount").textContent=`${events.length} recorded pitch${events.length===1?"":"es"}`;
  log.innerHTML=events.length?`<div class="pitcher-table-wrap"><table class="pitch-log-table"><thead><tr><th>#</th><th>Inning</th><th>Pitcher</th><th>Batter</th><th>Pitch</th><th>Count</th></tr></thead><tbody>${events.map(event=>`<tr><td>${event.seq}</td><td>${event.half==="top"?"Top":"Bottom"} ${event.inning}</td><td>${escapeHtml(event.pitcherName||"Unknown")}</td><td>${escapeHtml(event.batterName||"Unknown")}</td><td><strong>${escapeHtml(event.code||PITCH_TYPE_INFO[event.type]?.code||event.type)}</strong> ${escapeHtml(event.label||PITCH_TYPE_INFO[event.type]?.label||"")}</td><td>${num(event.countBefore?.balls)}-${num(event.countBefore?.strikes)} → ${num(event.countAfter?.balls)}-${num(event.countAfter?.strikes)}</td></tr>`).join("")}</tbody></table></div>`:`<p class="empty-tracking-note">No pitches recorded yet. Every Ball, Swinging Strike, Called Strike, Foul, In Play, and Hit By Pitch will appear here.</p>`;
}
function csvCell(value){const text=String(value??"");return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;}
function excelCountCsvValue(count){return `="${num(count?.balls)}-${num(count?.strikes)}"`;}
function downloadPitchLogCsv(){
  persistAutosaveNow("Pitch log export checkpoint",{force:true});
  ensureScoringState();
  const headers=["Pitch #","Inning","Half","Pitching Team","Pitcher #","Pitcher","Batting Team","Batter","Pitch Code","Pitch Type","Count Before","Count After","Recorded At"];
  const rows=[headers,...[...scoring.pitchLog].sort((a,b)=>a.seq-b.seq).map(e=>[e.seq,e.inning,e.half,e.pitchingTeam,e.pitcherNumber,e.pitcherName,e.battingTeam,e.batterName,e.code,e.label,excelCountCsvValue(e.countBefore),excelCountCsvValue(e.countAfter),e.recordedAt])];
  const data=collectData(),name=safeFileName(`${data.awayTeam||"Away"}_at_${data.homeTeam||"Home"}_${data.gameDate||"pitch-log"}`);
  downloadBlob(new Blob(["\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\n")],{type:"text/csv;charset=utf-8"}),`${name}_pitch_log.csv`);
}
function computeGameTotals(){
  const result={away:{runs:0,hits:0,errors:0,innings:Array(30).fill(0)},home:{runs:0,hits:0,errors:0,innings:Array(30).fill(0)}};
  for(const team of ["away","home"]){const valid=scoring.plays.filter(p=>!p.afterGameEnd),stats=computeTeamStats(team);result[team].runs=sum(valid.filter(p=>p.team===team).map(p=>p.runs));result[team].hits=sum(stats.map(st=>st.h));result[team].errors=sum(valid.filter(p=>p.team!==team).map(fieldingErrorCount));valid.filter(p=>p.team===team).forEach(p=>{result[team].innings[p.inning-1]+=p.runs||0;});}
  return result;
}
function playFieldLocationSuffix(play){return outcomeRequiresFieldLocation(play?.outcome)?fieldingSequenceString(play?.fieldingSequence,play?.fieldLocation):"";}
function playNotation(play){
  if(play.eventType==="runner"){
    const code=play.outcomeCode||play.outcome||"RUN",to=play.runnerEvent?.toBase,from=Math.max(1,num(play.runnerEvent?.primaryBase)||1);
    let suffix="";
    if(["SB","DI"].includes(code))suffix=to==="home"?"H":(["1","2","3"].includes(String(to))?String(to):"");
    if(code==="CS")suffix=from===3?"H":String(from+1);
    if(["PK","PO"].includes(code))suffix=String(from);
    return `${code}${suffix}`;
  }
  const errors=(play.fieldingErrors||[]).map(errorNotation).filter(Boolean),rawBase=["INT","CI"].includes(play.outcome)?interferenceCode(play):(["KL","D3K"].includes(play.outcome)?"K":(play.outcomeCode||play.outcome||"")),path=Array.isArray(play.fieldingSequence)?play.fieldingSequence:(String(play.fieldingSequence||play.fieldLocation||"").match(/[1-9]/g)||[]),locationSuffix=play.outcome==="HR"?"":path.join("-"),base=locationSuffix?`${rawBase}${locationSuffix}`:rawBase;let text=base;
  if(play.outcome==="D3K"&&play.droppedThirdStrikeCause==="wild-pitch")text=`${base} WP`;
  if(play.outcome==="D3K"&&play.droppedThirdStrikeCause==="passed-ball")text=`${base} PB`;
  if(errors.length)text=play.outcome==="ROE"?errors.join("/"):[text,...errors].filter(Boolean).join("/");
  return text;
}
function playsByBatterInning(team,playerIndex,inning){ return scoring.plays.filter(p=>p.team===team&&p.playerIndex===playerIndex&&p.inning===inning).sort((a,b)=>a.seq-b.seq); }
function renderLineScoreTable(){
  const d=collectData(),t=computeGameTotals(),maxInning=Math.max(9,Math.min(20,Math.max(scoring.inning,...scoring.plays.map(play=>num(play.inning))))); let h=`<table class="line-score-table"><thead><tr><th>Team</th>`;for(let i=1;i<=maxInning;i++)h+=`<th>${i}</th>`;h+=`<th>R</th><th>H</th><th>E</th></tr></thead><tbody>`;
  for(const team of ["away","home"]){h+=`<tr><th>${escapeHtml(d[`${team}Team`]||team)}</th>`;for(let i=0;i<maxInning;i++)h+=`<td>${t[team].innings[i]||0}</td>`;h+=`<td><strong>${t[team].runs}</strong></td><td>${t[team].hits}</td><td>${t[team].errors}</td></tr>`;}return h+`</tbody></table>`;
}
function renderBattingTable(team){
  const stats=computePlayerStats(team);let h=`<h4>${escapeHtml(teamName(team))}</h4><table class="batting-table"><thead><tr><th>Player</th><th>PA</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>BB</th><th>K</th><th>HR</th><th>SB</th><th>CS</th></tr></thead><tbody>`;
  for(const st of stats)h+=`<tr><td>${escapeHtml(formatLineupPlayer(st.player)||st.player.name||`Batter ${st.lineupIndex+1}`)}</td><td>${st.pa}</td><td>${st.ab}</td><td>${st.r}</td><td>${st.h}</td><td>${st.rbi}</td><td>${st.bb}</td><td>${st.k}</td><td>${st.hr}</td><td>${st.sb}</td><td>${st.cs}</td></tr>`;return h+`</tbody></table>`;
}
function renderFielderErrorSummary(){const rows=computeFielderErrors();if(!rows.length)return '<div class="fielding-error-summary"><strong>Individual Errors</strong><p>No individual errors recorded.</p></div>';return `<div class="fielding-error-summary"><strong>Individual Errors</strong><table><thead><tr><th>Team</th><th>Fielder</th><th>E</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escapeHtml(teamName(row.team))}</td><td>${escapeHtml(formatLineupPlayer(row.player)||row.player.name)}</td><td>${row.errors}</td></tr>`).join("")}</tbody></table></div>`;}
function renderSummary(){
  $("lineScoreSummary").innerHTML=renderLineScoreTable()+`<div class="summary-challenge-lines"><strong>Manager Replay</strong><span>${escapeHtml(managerReplaySummaryLine("away"))}</span><span>${escapeHtml(managerReplaySummaryLine("home"))}</span><strong>ABS Challenges</strong><span>${escapeHtml(challengeSummaryLine("away"))}</span><span>${escapeHtml(challengeSummaryLine("home"))}</span></div>`+renderFielderErrorSummary();$("battingSummary").innerHTML=renderBattingTable("away")+renderBattingTable("home");
  const log=[...scoring.plays].sort((a,b)=>b.seq-a.seq);$("playLog").innerHTML=log.length?log.map(p=>{const count=p.pitchCount?`Count ${countLabel(p.pitchCount)}`:"Count not recorded",sequence=p.pitchSequence?` • Pitches: ${p.pitchSequence}`:"",details=[p.keyPlay?"KEY PLAY":"",fieldingSequenceLabel(p.fieldingSequence,p.fieldLocation)?`Ball path: ${fieldingSequenceLabel(p.fieldingSequence,p.fieldLocation)}`:"",p.notes,errorDetailsText(p),interferenceDetailsText(p)].filter(Boolean).join(" • ")||`${p.outsOnPlay} out(s), ${p.runs} run(s)`;return `<div class="play-log-item"><strong>${p.keyPlay?"★ ":""}${p.half==="top"?"Top":"Bottom"} ${p.inning} — ${escapeHtml(p.playerName)}: ${escapeHtml(playNotation(p))}</strong><p>${escapeHtml(`${count}${sequence} • ${details}`)}</p></div>`;}).join(""):`<p>No plays recorded yet.</p>`;
}
function refreshHeadings(){ const a=teamName("away"),h=teamName("home");$("awayLineupHeading").textContent=`${a} Lineup`;$("homeLineupHeading").textContent=`${h} Lineup`;$("awayPitcherHeading").textContent=`${a} Pitchers`;$("homePitcherHeading").textContent=`${h} Pitchers`;$("awayScoringHeading").textContent=`${a} Batters`;$("homeScoringHeading").textContent=`${h} Batters`; }
function refreshAll(){ refreshHeadings();renderScoring();renderSummary();renderPitchTracking();renderRunnerEventTracker();renderManagerReplayTracker();renderChallengeTracker();renderPitchingChangeControls(); }

function collectUiState(){
  return {
    activePanel:document.querySelector(".panel.active")?.id||"setup",
    lookupDate:getField("lookupDate"),
    scheduleLevel:getField("scheduleLevel")||"mlb",
    quickResultsVisible:$("toggleQuickResultsBtn")?.getAttribute("aria-expanded")!=="false",
    challengePanelVisible:$("challengeQuickBtn")?.getAttribute("aria-expanded")==="true",
    scoringView:typeof scoringViewMode!=="undefined"?scoringViewMode:"plateAppearances"
  };
}
function applyUiState(ui={},options={}){
  if(ui.lookupDate)setField("lookupDate",ui.lookupDate);
  if(ui.scheduleLevel)setField("scheduleLevel",ui.scheduleLevel);
  if(typeof ui.quickResultsVisible==="boolean")setQuickResultsVisible(ui.quickResultsVisible);
  setChallengePanelVisible(Boolean(ui.challengePanelVisible));
  if(typeof setScoringView==="function")setScoringView(ui.scoringView||"plateAppearances",{persist:false});
  if(options.restorePanel!==false&&ui.activePanel&&$(ui.activePanel))setPanel(ui.activePanel);
}
function serializeApp(){ return {app:"Guariglia Baseball Scorecard Builder",version:VERSION_NUMBER,autosaveSchema:AUTOSAVE_SCHEMA_VERSION,savedAt:new Date().toISOString(),data:collectData(),scoring:deepClone(scoring),ui:collectUiState()}; }
function autosaveStateJson(snapshot){return JSON.stringify({data:snapshot.data,scoring:snapshot.scoring,ui:snapshot.ui||{}});}
function parseSavedSnapshot(raw){
  if(!raw)return null;
  const saved=JSON.parse(raw);
  if(!saved?.data||!saved?.scoring)throw new Error("Saved game data is incomplete.");
  return saved;
}
function updateAutosaveControls(){
  const restore=$("restoreAutosaveBtn");
  if(restore){
    try{restore.disabled=!localStorage.getItem(AUTOSAVE_BACKUP_KEY);}catch{restore.disabled=true;}
  }
}
function updateAutosaveStatus(message,savedAt=""){
  if($("autosaveBar"))$("autosaveBar").textContent=message;
  if($("autosaveDetails"))$("autosaveDetails").textContent=savedAt?`${message} Recovery time: ${new Date(savedAt).toLocaleString()}.`:message;
  updateAutosaveControls();
}
function persistAutosaveNow(message="Autosaved",options={}){
  clearTimeout(autosaveTimer);
  if(autosaveRestoring)return false;
  try{
    const snapshot=serializeApp(),stateJson=autosaveStateJson(snapshot),savedAt=new Date().toISOString();
    snapshot.savedAt=savedAt;snapshot.autosaveReason=message;persistRosterMirror(snapshot.data);
    const raw=JSON.stringify(snapshot);
    const currentRaw=localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    const changed=stateJson!==lastAutosaveStateJson;
    if(changed&&currentRaw&&options.rotate!==false)localStorage.setItem(AUTOSAVE_BACKUP_KEY,currentRaw);
    if(changed||options.force||!currentRaw)localStorage.setItem(AUTOSAVE_STORAGE_KEY,raw);
    lastAutosaveStateJson=stateJson;
    updateAutosaveStatus(`Autosave active • Saved ${new Date(savedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit",second:"2-digit"})}`,savedAt);
    return true;
  }catch(err){
    console.error("Autosave failed",err);
    updateAutosaveStatus("Autosave could not write to this browser. Download a Game File now.");
    return false;
  }
}
function scheduleAutosave(message="Current session updated"){
  clearTimeout(autosaveTimer);
  if(autosaveRestoring)return;
  updateAutosaveStatus(`${message} • Saving…`);
  autosaveTimer=setTimeout(()=>persistAutosaveNow(message),250);
}
function applySavedSnapshot(saved,sourceLabel="Autosave restored",options={}){
  autosaveRestoring=true;
  try{
    const mirror=readRosterMirror(),recoveredData=mergeMissingGameData(saved.data,mirror?.data||{});
    scoring=deepClone(saved.scoring);ensureScoringState();setFieldsFromData(recoveredData);applyUiState(saved.ui||{},{restorePanel:options.startOnSetup!==true});
    if(options.startOnSetup===true)setPanel("setup");
    refreshAll();
    lastAutosaveStateJson=autosaveStateJson({data:recoveredData,scoring:saved.scoring,ui:saved.ui||{}});
    updateAutosaveStatus(`${sourceLabel} • Continuous autosave active`,saved.savedAt||"");
  }finally{autosaveRestoring=false;}
}
function initializePersistentStartup(){
  const candidates=[
    [AUTOSAVE_STORAGE_KEY,"Recovered current game",false],
    [AUTOSAVE_BACKUP_KEY,"Recovered previous backup",false],
    ...LEGACY_AUTOSAVE_KEYS.flatMap(legacy=>[
      [legacy.current,`Recovered ${legacy.label} game`,true],
      [legacy.backup,`Recovered ${legacy.label} backup`,true]
    ])
  ];
  for(const [key,label,isLegacy] of candidates){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const saved=parseSavedSnapshot(raw);
      if(key===AUTOSAVE_BACKUP_KEY||isLegacy)localStorage.setItem(AUTOSAVE_STORAGE_KEY,raw);
      applySavedSnapshot(saved,label,{startOnSetup:true});if(isLegacy)persistAutosaveNow("Migrated game to Version 34",{force:true,rotate:false});return true;
    }catch(err){console.warn(`${label} failed`,err);try{if(!isLegacy)localStorage.removeItem(key);}catch{}}
  }
  const mirror=readRosterMirror();
  scoring=initialScoring();setFieldsFromData(mirror?.data||{});
  const today=globalThis.BaseballData?.localDateISO?.("America/New_York")||new Date().toISOString().slice(0,10);
  setField("lookupDate",today);setField("scheduleLevel","mlb");refreshAll();setPanel("setup");
  updateAutosaveStatus("Autosave active • Blank game ready");
  return false;
}
function stabilizeRestoredGameFields(sourceLabel="Mobile fields restored"){
  const restore=()=>{const count=rehydrateGameFieldsFromCache();if(count){refreshAll();updateAutosaveStatus(`${sourceLabel} • ${count} field${count===1?"":"s"} protected`);}};
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(restore);else restore();
  setTimeout(restore,120);setTimeout(restore,700);
}
function saveNow(){persistAutosaveNow("Saved manually",{force:true});}
function restorePreviousAutosave(){
  let previousRaw,currentRaw,saved;
  try{previousRaw=localStorage.getItem(AUTOSAVE_BACKUP_KEY);currentRaw=localStorage.getItem(AUTOSAVE_STORAGE_KEY);saved=parseSavedSnapshot(previousRaw);}catch(err){alert(`Previous autosave is unavailable: ${err.message}`);return;}
  if(!previousRaw||!saved){alert("No previous autosave is available yet.");return;}
  if(!confirm("Restore the previous autosave? The current version will be kept as the new recovery backup."))return;
  try{localStorage.setItem(AUTOSAVE_STORAGE_KEY,previousRaw);if(currentRaw)localStorage.setItem(AUTOSAVE_BACKUP_KEY,currentRaw);applySavedSnapshot(saved,"Previous autosave restored");}catch(err){alert(`Could not restore the previous autosave: ${err.message}`);}
}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
function safeFileName(value){return String(value||"baseball-game").replace(/[^a-z0-9._-]+/gi,"_").replace(/^_+|_+$/g,"");}
function hasCurrentGameData(){const d=collectData();return Boolean(scoring.plays.length||scoring.pitchLog.length||scoring.substitutions.length||scoring.pitcherChanges.length||scoring.challenges.events.length||scoring.managerReplayChallenges.events.length||d.awayTeam||d.homeTeam||d.gameNotes||d.away.lineup.some(player=>player.name||player.num)||d.home.lineup.some(player=>player.name||player.num));}
function showPostExportDialog(kind){pendingExportKind=kind;const dialog=$("postExportDialog");if(!dialog)return;$("postExportTitle").textContent=`${kind} saved — keep this game open?`;$("postExportMessage").textContent=`The ${kind.toLowerCase()} was downloaded successfully. Nothing has been deleted. Choose Clear Card only when you are completely finished with this game.`;dialog.showModal();}
function clearAfterExport(){if(!confirm("Permanently clear this live game from the screen? Your downloaded file will remain, but all current on-screen scoring data will be erased."))return;$("postExportDialog").close();blankEntireGame(`${pendingExportKind||"File"} saved. Live card cleared by request.`);pendingExportKind="";}
function saveGameFile(){persistAutosaveNow("Game file checkpoint",{force:true});const d=collectData(),name=safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"game"}`);downloadBlob(new Blob([JSON.stringify(serializeApp(),null,2)],{type:"application/json"}),`${name}.scoregame.json`);$("autosaveBar").textContent="Game file downloaded. All live data remains on screen.";setTimeout(()=>showPostExportDialog("Game File"),120);}
async function openGameFile(file){
  persistAutosaveNow("Checkpoint before opening a game file",{force:true});
  try{const saved=JSON.parse(await file.text());if(!saved.data||!saved.scoring)throw new Error("This is not a compatible Version 11 through Version 34 game file.");scoring=deepClone(saved.scoring);ensureScoringState();setFieldsFromData(saved.data);applyUiState(saved.ui||{});refreshAll();persistAutosaveNow("Game file opened",{force:true});setPanel("scoring");}catch(err){alert(`Could not open the game file: ${err.message}`);}
}
function clearForManual(){
  if(!confirm("Start a blank game? This clears every current scorecard field and recorded play."))return;
  blankEntireGame("Blank manual game ready. All scorecard fields and scoring totals are empty.");
}

function dateDisplay(value){if(!value)return"";const d=new Date(`${value}T12:00:00`);return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function setConnectionState(state,message){
  const badge=$("connectionBadge");
  if(!badge)return;
  badge.className=`connection-badge ${state}`;
  badge.textContent=message;
}
function restoreRefreshPosition(anchor, previousScrollX, previousScrollY){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const root=document.documentElement;
    const priorInlineBehavior=root.style.scrollBehavior;
    root.style.scrollBehavior="auto";
    window.scrollTo(previousScrollX,previousScrollY);
    anchor?.focus({preventScroll:true});
    root.style.scrollBehavior=priorInlineBehavior;
  }));
}
async function refreshScheduleAndClear(){
  if(hasCurrentGameData()&&!confirm("Reset the current card and refresh the schedule list? This will erase the live game from the screen. Save or export first if you may need it."))return;
  const refreshButton=$("refreshGamesBtn");
  const previousScrollX=window.scrollX;
  const previousScrollY=window.scrollY;
  const selectedDate=getField("lookupDate");
  const selectedLevel=getField("scheduleLevel")||"mlb";
  blankEntireGame("Schedule refreshed. All previously populated game data and scoring were cleared.",false);
  setField("lookupDate",selectedDate);
  setField("scheduleLevel",selectedLevel);
  scheduleGames=[];
  $("dailyGameSelect").innerHTML='<option value="">Loading scheduled games…</option>';
  $("lookupGameBtn").disabled=true;
  try{
    await loadSchedule();
  }finally{
    restoreRefreshPosition(refreshButton,previousScrollX,previousScrollY);
  }
}

async function loadSchedule(){
  const date=getField("lookupDate"),level=getField("scheduleLevel");
  if(!date)return;
  const requestToken=++scheduleRequestToken;
  scheduleGames=[];
  $("dailyGameSelect").innerHTML='<option value="">Loading scheduled games…</option>';
  $("lookupStatus").textContent="Connecting to official baseball schedule data…";
  setConnectionState("checking","Checking connection…");
  $("refreshGamesBtn").disabled=true;
  $("lookupGameBtn").disabled=true;
  try{
    if(!globalThis.BaseballData)throw new Error("The baseball-data connection module is missing.");
    const payload=await BaseballData.getSchedule(date,level);
    if(requestToken!==scheduleRequestToken)return;
    scheduleGames=payload.games||[];
    $("dailyGameSelect").innerHTML=scheduleGames.length
      ?'<option value="">Choose a matchup</option>'+scheduleGames.map((game,index)=>`<option value="${index}">${escapeHtml(game.label)}</option>`).join("")
      :'<option value="">No games found</option>';
    setConnectionState("connected","Online schedule connected");
    const source=payload.source?` Connection: ${payload.source}.`:"";
    $("lookupStatus").textContent=scheduleGames.length
      ?`${scheduleGames.length} game${scheduleGames.length===1?"":"s"} available for ${dateDisplay(date)}.${source}`
      :`The connection is working, but no scheduled games were returned for ${dateDisplay(date)} and that level.${source}`;
  }catch(err){
    if(requestToken!==scheduleRequestToken)return;
    console.error(err);
    $("dailyGameSelect").innerHTML='<option value="">Schedule unavailable — use Refresh Schedule</option>';
    setConnectionState("disconnected","Schedule connection unavailable");
    $("lookupStatus").textContent=`The online schedule could not be loaded: ${err.message || "unknown connection error"}. Select Refresh Schedule to try again, or use manual entry.`;
  }finally{
    if(requestToken===scheduleRequestToken)$("refreshGamesBtn").disabled=false;
  }
}
async function loadSelectedGame(){
  const rawIndex=$("dailyGameSelect").value;
  if(rawIndex==="")return;
  const game=scheduleGames[num(rawIndex)];
  if(!game)return;
  if(hasCurrentGameData()&&!confirm("Replace the current on-screen game with this scheduled game? Save or export the current game first if you may need it."))return;
  $("lookupStatus").textContent="Loading teams, venue, lineups, pitchers, broadcasts, and available game details…";
  setConnectionState("checking","Loading selected game…");
  $("lookupGameBtn").disabled=true;
  try{
    if(!globalThis.BaseballData)throw new Error("The baseball-data connection module is missing.");
    const payload=await BaseballData.getGame(game.gamePk);
    setFieldsFromData(payload.data||{});
    scoring=initialScoring();
    refreshAll();
    persistAutosaveNow("Official game information loaded",{force:true});
    setConnectionState("connected","Selected game connected");
    const source=payload.source?` Connection: ${payload.source}.`:"";
    $("lookupStatus").textContent=`Game information loaded. Review the populated game information below before moving to the next section.${source}`;
    setPanel("setup");
  }catch(err){
    console.error(err);
    setConnectionState("disconnected","Game details unavailable");
    $("lookupStatus").textContent=`The selected game could not be loaded: ${err.message || "unknown connection error"}. Refresh the schedule or enter the game manually.`;
  }finally{
    $("lookupGameBtn").disabled=!$("dailyGameSelect").value;
  }
}

function base64ToArrayBuffer(base64){const binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes.buffer;}
function getTemplateArrayBuffer(){if(uploadedTemplateBuffer)return uploadedTemplateBuffer.slice(0);return base64ToArrayBuffer(EMBEDDED_SCORECARD_TEMPLATE_BASE64);}
function colNumber(ref){let n=0;for(const c of ref.match(/[A-Z]+/)[0])n=n*26+c.charCodeAt(0)-64;return n;}
function ensureCell(doc,ref){
  const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main",rowNum=num(ref.match(/\d+/)[0]),sheetData=doc.getElementsByTagNameNS(ns,"sheetData")[0];let row=[...doc.getElementsByTagNameNS(ns,"row")].find(r=>num(r.getAttribute("r"))===rowNum);
  if(!row){row=doc.createElementNS(ns,"row");row.setAttribute("r",rowNum);const rows=[...sheetData.children];const before=rows.find(r=>num(r.getAttribute("r"))>rowNum);before?sheetData.insertBefore(row,before):sheetData.appendChild(row);}
  let cell=[...row.getElementsByTagNameNS(ns,"c")].find(c=>c.getAttribute("r")===ref);if(!cell){cell=doc.createElementNS(ns,"c");cell.setAttribute("r",ref);const before=[...row.children].find(c=>colNumber(c.getAttribute("r"))>colNumber(ref));before?row.insertBefore(cell,before):row.appendChild(cell);}return cell;
}
function clearCellChildren(cell){while(cell.firstChild)cell.removeChild(cell.firstChild);}
function setXmlCell(doc,ref,value,type="string"){
  const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main",cell=ensureCell(doc,ref);clearCellChildren(cell);
  if(type==="number"){cell.setAttribute("t","n");const v=doc.createElementNS(ns,"v");v.textContent=String(num(value));cell.appendChild(v);} else {cell.setAttribute("t","inlineStr");const is=doc.createElementNS(ns,"is"),t=doc.createElementNS(ns,"t");t.setAttribute("xml:space","preserve");t.textContent=String(value??"");is.appendChild(t);cell.appendChild(is);}
}
function columnLetter(n){let s="";while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
function topLine(d){return [[d.awayTeam,d.homeTeam].some(Boolean)?`${d.awayTeam||"Away"} at ${d.homeTeam||"Home"}`:"",dateDisplay(d.gameDate),d.gameTime,d.venue,[d.awayRecord,d.homeRecord].filter(Boolean).join(" / "),d.gameNumber].filter(Boolean).join(" • ");}
function cleanKeyPlayNote(note){return String(note||"").replace(/^KEY PLAY\s*(?:[—-]\s*)?/i,"").trim();}
function appearanceNoteLine(play){
  const note=cleanKeyPlayNote(play.notes),errorText=errorDetailsText(play),interferenceText=interferenceDetailsText(play);if(!note&&!errorText&&!interferenceText&&!play.keyPlay)return "";
  const lead=play.keyPlay?"* KEY PLAY - ":"",details=[note,errorText,interferenceText].filter(Boolean).join("; ");return `${lead}${play.half==="top"?"Top":"Bottom"} ${play.inning} — ${play.playerName}: ${playNotation(play)}${details?` — ${details}`:""}`;
}
function gameManagementTimeline(){
  const items=[];for(const play of scoring.plays){const text=appearanceNoteLine(play);if(text)items.push({recordedAt:play.recordedAt||"",inning:play.inning,half:play.half,order:num(play.seq),text});}
  for(const event of scoring.substitutions||[])items.push({recordedAt:event.recordedAt||"",inning:event.inning,half:event.half,order:num(event.seq),text:`${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${teamName(event.team)} substitution: ${event.incoming?.name||"Substitute"} for ${event.outgoing?.name||"player"} (${event.reason})${event.note?` — ${event.note}`:""}`});
  for(const event of scoring.pitcherChanges||[])items.push({recordedAt:event.recordedAt||"",inning:event.inning,half:event.half,order:num(event.seq),text:`${event.half==="top"?"Top":"Bottom"} ${event.inning} — ${teamName(event.team)} pitching change: ${event.incoming?.name||"Pitcher"} replaced ${event.outgoing?.name||"pitcher"}`});
  return items.sort((a,b)=>{const at=Date.parse(a.recordedAt)||0,bt=Date.parse(b.recordedAt)||0;if(at&&bt&&at!==bt)return at-bt;return num(a.inning)-num(b.inning)||(a.half==="top"?-1:1)-(b.half==="top"?-1:1)||a.order-b.order;}).map(item=>item.text);
}
function automaticRunnerNoteLines(){return (scoring.automaticRunnerPlacements||[]).map(item=>`${item.half==="top"?"Top":"Bottom"} ${item.inning} — Automatic runner: ${item.runner?.name||"preceding batter"} placed on second for ${teamName(item.team)}`);}
function exportNotes(d,t){const score=`${gameIsFinal()?"Final Score":"Current Score"}: ${d.awayTeam||"Away"} ${t.away.runs}, ${d.homeTeam||"Home"} ${t.home.runs}`,status=gameIsFinal()?gameStatusText():"",timeline=gameManagementTimeline(),automaticRunners=automaticRunnerNoteLines(),runnerEvents=runnerEventLogText(),replays=managerReplayLogText(),challenges=challengeLogText();return ["Game Notes",score,status,d.gameNotes,...automaticRunners,...timeline,runnerEvents?`Runner Events: ${runnerEvents}`:"",replays?`Manager Replay: ${replays}`:"",challenges?`ABS Challenges: ${challenges}`:""].filter(Boolean).join("\n");}
async function exportExcel(){
  persistAutosaveNow("Excel export checkpoint",{force:true});
  try{
    const d=collectData(),t=computeGameTotals(),zip=await JSZip.loadAsync(getTemplateArrayBuffer()),path="xl/worksheets/sheet1.xml",xml=await zip.file(path).async("text"),doc=new DOMParser().parseFromString(xml,"application/xml");
    setXmlCell(doc,"A1","");setXmlCell(doc,"A2",topLine(d));setXmlCell(doc,"A3",[[d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" • "),[d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" • ")].filter(Boolean).join("\n"));
    setXmlCell(doc,"J3","Replay / ABS Challenges");setXmlCell(doc,"J4",`Replay ${managerReplayPdfTokens("away")}\nABS ${challengePdfTokens("away")}`);setXmlCell(doc,"M4",`Replay ${managerReplayPdfTokens("home")}\nABS ${challengePdfTokens("home")}`);setXmlCell(doc,"A6",`Away: ${d.awayTeam||"Away"}`);setXmlCell(doc,"A7",`Home: ${d.homeTeam||"Home"}`);
    setXmlCell(doc,"A9",`Away: ${d.awayTeam||"Away"}${d.awayRecord?` (${d.awayRecord})`:""}`);setXmlCell(doc,"A21",`Home: ${d.homeTeam||"Home"}${d.homeRecord?` (${d.homeRecord})`:""}`);setXmlCell(doc,"A33",`Away: ${d.awayTeam||"Away"} Pitching`);setXmlCell(doc,"A41",`Home: ${d.homeTeam||"Home"} Pitching`);setXmlCell(doc,"J33",exportNotes(d,t));
    for(const [team,rowStart] of [["away",11],["home",23]]){
      const stats=computeTeamStats(team);for(let i=0;i<LINEUP_ROWS;i++){const row=rowStart+i;setXmlCell(doc,`A${row}`,lineupDisplayText(team,i));for(let inning=1;inning<=10;inning++){const plays=playsByBatterInning(team,i,inning);setXmlCell(doc,`${columnLetter(inning+1)}${row}`,plays.length?plays.map(playNotation).join(" / "):"");}setXmlCell(doc,`L${row}`,stats[i].ab,"number");setXmlCell(doc,`M${row}`,stats[i].r,"number");setXmlCell(doc,`N${row}`,stats[i].h,"number");setXmlCell(doc,`O${row}`,stats[i].rbi,"number");}
    }
    setXmlCell(doc,"I34","WP");setXmlCell(doc,"I42","WP");
    for(const [team,rowStart] of [["away",35],["home",43]])scorecardPitchingLinesForTeam(team).forEach(({pitcher,columns},i)=>{const row=rowStart+i;setXmlCell(doc,`A${row}`,formatPitcher(pitcher));columns.forEach((value,index)=>setXmlCell(doc,`${columnLetter(index+2)}${row}`,value,index===0?"":"number"));});
    for(let inning=1;inning<=10;inning++){setXmlCell(doc,`${columnLetter(inning+1)}6`,t.away.innings[inning-1]||0,"number");setXmlCell(doc,`${columnLetter(inning+1)}7`,t.home.innings[inning-1]||0,"number");}
    [["M6",t.away.runs],["N6",t.away.hits],["O6",t.away.errors],["M7",t.home.runs],["N7",t.home.hits],["O7",t.home.errors]].forEach(([r,v])=>setXmlCell(doc,r,v,"number"));
    for(let row=1;row<=48;row++)setXmlCell(doc,`AA${row}`,"");
    zip.file(path,new XMLSerializer().serializeToString(doc));const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6},mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});downloadBlob(blob,`${safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"scorecard"}`)}.xlsx`);$("autosaveBar").textContent="Excel scorecard downloaded. All live data remains on screen.";setTimeout(()=>showPostExportDialog("Excel Scorecard"),120);
  }catch(err){console.error(err);alert(`Excel export failed: ${err.message}`);}
}
function buildPrintTeam(team,rowLabel){
  const d=collectData(),stats=computeTeamStats(team),endingPlays=completedHalfInningEndingPlays();let h=`<div class="print-section"><div class="team-title">${escapeHtml(rowLabel)}: ${escapeHtml(d[`${team}Team`]||team)}</div><table><thead><tr><th class="player-col">Player / No.</th>`;for(let i=1;i<=10;i++)h+=`<th>${i}</th>`;h+=`<th class="tot">AB</th><th class="tot">R</th><th class="tot">H</th><th class="tot">RBI</th></tr></thead><tbody>`;
  for(let idx=0;idx<LINEUP_ROWS;idx++){h+=`<tr><td class="player-col">${lineupOccupants(team,idx).map(player=>escapeHtml(formatLineupPlayer(player))).join("<br>")}</td>`;for(let inn=1;inn<=10;inn++){const plays=playsByBatterInning(team,idx,inn),isEnding=plays.some(play=>endingPlays.has(play.id));h+=`<td class="score-box${isEnding?" half-inning-ending-cell":""}">${escapeHtml(plays.length?plays.map(playNotation).join(" / "):"")}</td>`;}const st=stats[idx];h+=`<td>${st.ab}</td><td>${st.r}</td><td>${st.h}</td><td>${st.rbi}</td></tr>`;}return h+`</tbody></table></div>`;
}
function renderPrintScorecard(){
  const d=collectData(),t=computeGameTotals(),log=[...scoring.plays].sort((a,b)=>a.seq-b.seq).slice(-18).map(p=>`${p.half==="top"?"T":"B"}${p.inning} ${p.playerName}: ${playNotation(p)}`).join(" • "),notes=exportNotes(d,t).replace(/^Game Notes\n?/,"");
  $("printScorecard").innerHTML=`<div class="print-header"><h1>${escapeHtml(d.awayTeam||"Away")} at ${escapeHtml(d.homeTeam||"Home")}</h1><p>${escapeHtml(topLine(d))}</p></div><div class="print-info"><div>${escapeHtml([d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" • "))}</div><div>${escapeHtml([d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" • "))}</div></div>${renderLineScoreTable()}${buildPrintTeam("away","Away")}${buildPrintTeam("home","Home")}<div class="print-bottom"><div class="print-notes"><h3>Game Notes</h3>${escapeHtml(notes).replace(/\n/g,"<br>")}</div><div class="print-log"><h3>Play Log</h3>${escapeHtml(log)}</div></div>`;
}
function printPdf(){renderPrintScorecard();setTimeout(()=>window.print(),60);}
async function downloadBlank(){
  try{
    const zip=await JSZip.loadAsync(getTemplateArrayBuffer()),path="xl/worksheets/sheet1.xml",xml=await zip.file(path).async("text"),doc=new DOMParser().parseFromString(xml,"application/xml");
    ["A1","A2","A3","J4","M4","A6","A7","A9","A21","A33","A41"].forEach(ref=>setXmlCell(doc,ref,""));
    setXmlCell(doc,"J3","□ Replay Challenge □");setXmlCell(doc,"J33","Game Notes");
    for(let col=2;col<=15;col++){setXmlCell(doc,`${columnLetter(col)}6`,"");setXmlCell(doc,`${columnLetter(col)}7`,"");}
    for(const rowStart of [11,23])for(let i=0;i<LINEUP_ROWS;i++){const row=rowStart+i;setXmlCell(doc,`A${row}`,"");for(let inning=1;inning<=10;inning++)setXmlCell(doc,`${columnLetter(inning+1)}${row}`,"+");for(const col of ["L","M","N","O"])setXmlCell(doc,`${col}${row}`,"");}
    for(const rowStart of [35,43])for(let i=0;i<SCORECARD_PITCHER_ROWS;i++)for(let col=1;col<=8;col++)setXmlCell(doc,`${columnLetter(col)}${rowStart+i}`,"");
    for(let row=1;row<=48;row++)setXmlCell(doc,`AA${row}`,"");
    zip.file(path,new XMLSerializer().serializeToString(doc));
    const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6},mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    downloadBlob(blob,uploadedTemplateName||TEMPLATE_FILE_NAME);
  }catch(err){console.error(err);alert(`Blank scorecard download failed: ${err.message}`);}
}
async function uploadTemplate(file){try{uploadedTemplateBuffer=await file.arrayBuffer();uploadedTemplateName=file.name;$("templateStatus").textContent=`Using uploaded template: ${file.name}`;}catch(err){uploadedTemplateBuffer=null;uploadedTemplateName="";$("templateStatus").textContent="The uploaded template could not be read.";}}



// Version 32 retains the classic scorecard geometry and automatic continuation pages for innings 11–20 while redesigning the live game center.
// Clean computer-scored PDFs rebuild each scoring grid so no plus-sign or 2x3 counter fragments remain.
const CLASSIC_PDF_WIDTH=612, CLASSIC_PDF_HEIGHT=792;
const SCORECARD_SOURCE_SWATCHES=[
  {source:[60,36,24],role:"primary"},{source:[75,49,36],role:"primary"},{source:[47,67,76],role:"primary"},{source:[89,70,54],role:"gridDark"},
  {source:[154,76,30],role:"secondary"},{source:[136,59,17],role:"secondary"},{source:[155,118,95],role:"secondary"},{source:[199,150,112],role:"light"},
  {source:[175,135,58],role:"accent"},{source:[247,240,224],role:"cream"},{source:[210,202,183],role:"alternate"},{source:[202,180,163],role:"yellow"},
  {source:[164,159,153],role:"grid"},{source:[150,135,117],role:"grid"},{source:[109,103,97],role:"gridDark"},{source:[188,198,203],role:"grid"},{source:[120,129,133],role:"gridDark"}
];
let classicPdfMeasureContext=null,classicPdfPalette=scorecardPaletteForHomeTeam("");
function classicPdfSanitize(value){return String(value??"").replace(/\u00a0/g," ").replace(/[\u2605\u2606\u2B50]/g,"*").replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g," - ").replace(/\u2022/g," - ").replace(/\u2026/g,"...").replace(/[\u25a1\u2610]/g,"").replace(/[^\x09\x0A\x0D\x20-\xFF]/g,"?");}
function classicPdfCtx(){if(!classicPdfMeasureContext){const c=document.createElement("canvas");classicPdfMeasureContext=c.getContext("2d");}return classicPdfMeasureContext;}
function classicPdfMeasure(text,size,bold=false){const c=classicPdfCtx();c.font=`${bold?700:400} ${size}px Arial`;return c.measureText(classicPdfSanitize(text)).width;}
function classicPdfFit(text,width,size,min,bold=false){while(size>min&&classicPdfMeasure(text,size,bold)>width)size-=.25;return Math.max(min,size);}
function classicPdfHex(value){let h="";for(const ch of classicPdfSanitize(value)){const n=ch.charCodeAt(0);h+=(n<=255?n:63).toString(16).padStart(2,"0").toUpperCase();}return `<${h}>`;}
function classicPdfRgb(hex){const {r,g,b}=hexToRgb(hex);return `${(r/255).toFixed(4)} ${(g/255).toFixed(4)} ${(b/255).toFixed(4)}`;}
function classicPdfColor(role){const color=role==="white"?classicPdfPalette.onSecondary:role==="brown"?classicPdfPalette.text:role==="cream"?classicPdfPalette.cream:classicPdfPalette[role]||classicPdfPalette.text;return classicPdfRgb(color);}
function classicPdfHorizontalRule(cmd,x,top,width,thickness=2.2){const y=CLASSIC_PDF_HEIGHT-top;cmd.push(`${classicPdfColor("brown")} RG ${thickness.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} m ${(x+width).toFixed(2)} ${y.toFixed(2)} l S`);}
function classicPdfVerticalRule(cmd,x,top,height,thickness=2.2){const y1=CLASSIC_PDF_HEIGHT-top,y2=CLASSIC_PDF_HEIGHT-top-height;cmd.push(`${classicPdfColor("brown")} RG ${thickness.toFixed(2)} w ${x.toFixed(2)} ${y1.toFixed(2)} m ${x.toFixed(2)} ${y2.toFixed(2)} l S`);}
function classicPdfPlayMatchesPlayer(play,player,team){
  if(!(player?.name||player?.num||player?.id))return false;
  const target=playerIdentity(player,team,"batter");
  if(String(play?.playerKey||"")===target)return true;
  const snapshot=play?.playerSnapshot||{name:play?.playerName||"",num:""};
  return playerIdentity(snapshot,team,"batter")===target;
}
function classicPdfSubstitutionBoundaries(team,lineupIndex,startInning,inningX){
  const endInning=startInning+9,boundaries=[];
  for(const event of substitutionEvents(team,lineupIndex)){
    const incomingPlays=scoring.plays.filter(play=>play.team===team&&num(play.playerIndex)===num(lineupIndex)&&classicPdfPlayMatchesPlayer(play,event.incoming,team)).sort((a,b)=>num(a.seq)-num(b.seq));
    const firstIncoming=incomingPlays[0]||null;
    let targetInning=Math.max(1,num(firstIncoming?.inning||event.inning));
    if(!firstIncoming&&team==="away"&&event.half==="bottom")targetInning+=1;
    if(targetInning<startInning||targetInning>endInning)continue;
    const slot=targetInning-startInning+1;
    const x=inningX(slot);
    if(!boundaries.some(existing=>Math.abs(existing-x)<.35))boundaries.push(x);
  }
  return boundaries.sort((a,b)=>a-b);
}
function classicPdfDrawSubstitutionBoundaries(cmd,team,lineupIndex,startInning,inningX,cellTop){
  classicPdfSubstitutionBoundaries(team,lineupIndex,startInning,inningX).forEach(x=>classicPdfVerticalRule(cmd,x,cellTop,22,2.15));
}
function classicPdfText(cmd,value,x,top,width,size,opt={}){let text=classicPdfSanitize(value).trim();if(!text)return;const bold=opt.bold!==false;size=classicPdfFit(text,width,size,opt.minSize||4.2,bold);if(classicPdfMeasure(text,size,bold)>width)text=classicPdfEllipsize(text,width,size,bold);const w=classicPdfMeasure(text,size,bold);let dx=x;if(opt.align==="center")dx=x+Math.max(0,(width-w)/2);if(opt.align==="right")dx=x+Math.max(0,width-w);const y=CLASSIC_PDF_HEIGHT-top-size*.95;const matrix=opt.mirror?`-1 0 0 1 ${(dx+w).toFixed(2)} ${y.toFixed(2)}`:`1 0 0 1 ${dx.toFixed(2)} ${y.toFixed(2)}`;cmd.push(`BT /${bold?"F2":"F1"} ${size.toFixed(2)} Tf ${classicPdfColor(opt.color)} rg ${matrix} Tm ${classicPdfHex(text)} Tj ET`);}
function classicPdfCompactLineupPlayer(player,opt={}){
  const number=String(player?.num||"").replace(/^#/,"").trim(),name=String(player?.name||"").trim(),identity=[number?`#${number}`:"",name].filter(Boolean).join(" ");
  const rates=opt.includeRates===false?"":[player?.avg,player?.obp].filter(Boolean).join("/");
  const details=[player?.pos,opt.includeBats===false?"":player?.bats,rates].filter(Boolean).join(" ");
  return [identity,details].filter(Boolean).join(" - ");
}
function classicPdfLineupCell(cmd,team,lineupIndex,cellTop){
  const x=21.4,width=174,height=22,occupants=lineupOccupants(team,lineupIndex);if(!occupants.length)return;
  const clipY=CLASSIC_PDF_HEIGHT-cellTop-height;cmd.push(`q ${x.toFixed(2)} ${clipY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re W n`);
  if(occupants.length===1){
    classicPdfText(cmd,classicPdfCompactLineupPlayer(occupants[0]),x,cellTop+4.0,width,8.0,{minSize:6.4,color:"brown"});
  }else if(occupants.length===2){
    classicPdfText(cmd,classicPdfCompactLineupPlayer(occupants[0]),x,cellTop+1.0,width,7.2,{minSize:6.5,color:"brown"});
    classicPdfText(cmd,`* ${classicPdfCompactLineupPlayer(occupants[1],{includeRates:false})}`,x,cellTop+11.0,width,6.9,{minSize:6.3,color:"brown"});
  }else{
    const displayed=occupants.length<=3?occupants:[occupants[0],occupants.at(-2),occupants.at(-1)];
    const omitted=Math.max(0,occupants.length-displayed.length);
    classicPdfText(cmd,classicPdfCompactLineupPlayer(displayed[0],{includeRates:false}),x,cellTop+.1,width,6.5,{minSize:6.1,color:"brown"});
    classicPdfText(cmd,`* ${omitted?`(+${omitted}) `:""}${classicPdfCompactLineupPlayer(displayed[1],{includeRates:false})}`,x,cellTop+7.3,width,6.4,{minSize:6.0,color:"brown"});
    classicPdfText(cmd,`* ${classicPdfCompactLineupPlayer(displayed[2],{includeRates:false})}`,x,cellTop+14.5,width,6.4,{minSize:6.0,color:"brown"});
  }
  cmd.push("Q");
}
function classicPdfSplitWord(word,width,size,bold=false){const parts=[];let part="";for(const char of String(word||"")){const test=part+char;if(part&&classicPdfMeasure(test,size,bold)>width){parts.push(part);part=char;}else part=test;}if(part)parts.push(part);return parts;}
function classicPdfWrap(text,width,size,bold=false){const out=[];for(const para of classicPdfSanitize(text).split(/\r?\n/)){const words=para.trim().split(/\s+/).filter(Boolean);if(!words.length){out.push("");continue;}let line="";for(const word of words){const pieces=classicPdfMeasure(word,size,bold)<=width?[word]:classicPdfSplitWord(word,width,size,bold);for(const piece of pieces){const test=line?`${line} ${piece}`:piece;if(!line||classicPdfMeasure(test,size,bold)<=width)line=test;else{out.push(line);line=piece;}}}if(line)out.push(line);}return out;}
function classicPdfEllipsize(text,width,size,bold=false){const suffix="...";let value=String(text||"");while(value&&classicPdfMeasure(value+suffix,size,bold)>width)value=value.slice(0,-1);return `${value.trimEnd()}${suffix}`;}
function classicPdfNotes(cmd,text){const clean=classicPdfSanitize(text).replace(/^Game Notes\s*/i,"").trim();if(!clean)return;const box={x:432,top:611,width:174,height:176};let size=7.2,lineHeight=8.4,lines=classicPdfWrap(clean,box.width,size,false);while(lines.length*lineHeight>box.height&&size>5.2){size-=.25;lineHeight=size*1.18;lines=classicPdfWrap(clean,box.width,size,false);}const maxLines=Math.max(1,Math.floor((box.height-size*.25)/lineHeight)),visible=lines.slice(0,maxLines);if(lines.length>maxLines)visible[maxLines-1]=classicPdfEllipsize(visible[maxLines-1],box.width,size,false);const clipY=CLASSIC_PDF_HEIGHT-box.top-box.height;cmd.push(`q ${box.x.toFixed(2)} ${clipY.toFixed(2)} ${box.width.toFixed(2)} ${box.height.toFixed(2)} re W n`);visible.forEach((line,i)=>classicPdfText(cmd,line,box.x,box.top+i*lineHeight,box.width,size,{bold:false,minSize:size,color:"brown"}));cmd.push("Q");}
function classicPdfStrokeRect(cmd,x,top,width,height,role="gridDark",thickness=.8){const y=CLASSIC_PDF_HEIGHT-top-height;cmd.push(`${classicPdfColor(role)} RG ${thickness.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);}
function classicPdfTextBox(cmd,text,box,opt={}){
  const fallback=opt.fallback||"",clean=classicPdfSanitize(text||fallback).trim();if(!clean)return;
  let size=opt.size||8,lineHeight=opt.lineHeight||size*1.25,lines=classicPdfWrap(clean,box.width,size,Boolean(opt.bold));
  while(lines.length*lineHeight>box.height&&size>(opt.minSize||5.4)){size-=.25;lineHeight=size*(opt.lineHeightRatio||1.25);lines=classicPdfWrap(clean,box.width,size,Boolean(opt.bold));}
  const maxLines=Math.max(1,Math.floor((box.height-size*.2)/lineHeight)),visible=lines.slice(0,maxLines);
  if(lines.length>maxLines)visible[maxLines-1]=classicPdfEllipsize(visible[maxLines-1],box.width,size,Boolean(opt.bold));
  const clipY=CLASSIC_PDF_HEIGHT-box.top-box.height;cmd.push(`q ${box.x.toFixed(2)} ${clipY.toFixed(2)} ${box.width.toFixed(2)} ${box.height.toFixed(2)} re W n`);
  visible.forEach((line,i)=>classicPdfText(cmd,line,box.x,box.top+i*lineHeight,box.width,size,{bold:opt.bold===true,minSize:size,color:opt.color||"brown",align:opt.align||"left"}));cmd.push("Q");
}
function classicPdfSectionBox(cmd,title,box){classicPdfFillRect(cmd,box.x,box.top,box.width,box.height,"cream");classicPdfFillRect(cmd,box.x,box.top,box.width,18,"secondary");classicPdfStrokeRect(cmd,box.x,box.top,box.width,box.height,"gridDark",.9);classicPdfText(cmd,title,box.x+8,box.top+4,box.width-16,9,{minSize:6,color:"white"});}
function classicPdfReviewStatus(cmd){
  for(const [team,x] of [["away",424],["home",515]]){const replay=computeManagerReplayState(team),abs=computeChallengeState(team);classicPdfText(cmd,team.toUpperCase(),x,40,88,5.8,{minSize:4.8,color:"white",align:"center"});classicPdfText(cmd,`Replay ${replay.available}/${replay.allotment} | ABS ${abs.available} left`,x+2,51,84,5.2,{minSize:3.8,color:"white",align:"center"});}
}
function classicPdfReviewCard(cmd,team,box){
  const replay=computeManagerReplayState(team),abs=computeChallengeState(team),label=`${teamName(team)} (${team})`;
  classicPdfFillRect(cmd,box.x,box.top,box.width,box.height,"alternate");classicPdfStrokeRect(cmd,box.x,box.top,box.width,box.height,"grid",.7);
  classicPdfText(cmd,label,box.x+8,box.top+7,box.width-16,8.4,{minSize:5.5,color:"brown"});
  classicPdfText(cmd,`Manager Replay: ${replay.available} available of ${replay.allotment}; ${replay.attempts} attempts; ${replay.overturned} overturned; ${replay.lost} lost`,box.x+8,box.top+24,box.width-16,6.7,{minSize:4.5,bold:false,color:"brown"});
  classicPdfText(cmd,`ABS: ${abs.available} available; ${abs.attempts} attempts; ${abs.overturned} overturned; ${abs.upheld} upheld${abs.extraGrants?`; ${abs.extraGrants} extra-inning grant${abs.extraGrants===1?"":"s"}`:""}`,box.x+8,box.top+39,box.width-16,6.7,{minSize:4.5,bold:false,color:"brown"});
}
function classicPdfNotesPage(startInning=1,blank=false){
  const d=collectData(),totals=computeGameTotals(),continuation=startInning>1,cmd=[];classicPdfFillRect(cmd,0,0,612,792,"cream");classicPdfStrokeRect(cmd,10,10,592,772,"gridDark",1.2);
  classicPdfFillRect(cmd,10,10,592,58,"primary");classicPdfText(cmd,continuation?"EXTRA-INNING NOTES & REVIEWS":"GAME NOTES & REVIEWS",28,23,556,17,{minSize:11,color:"white",align:"center"});
  classicPdfText(cmd,blank?"Duplex reverse side - write game notes and review details here.":`${d.awayTeam||"Away"} at ${d.homeTeam||"Home"} - ${gameIsFinal()?"Final":"Current"}: ${totals.away.runs}-${totals.home.runs}${continuation?` - Continuation innings ${startInning}-${startInning+9}`:""}`,28,48,556,8.2,{minSize:5.2,bold:false,color:"white",align:"center"});
  const summary={x:24,top:82,width:564,height:90};classicPdfSectionBox(cmd,"Replay and ABS Review Summary",summary);classicPdfReviewCard(cmd,"away",{x:34,top:108,width:264,height:52});classicPdfReviewCard(cmd,"home",{x:314,top:108,width:264,height:52});
  const notesBox={x:24,top:186,width:564,height:398};classicPdfSectionBox(cmd,continuation?"Continuation Notes & Game Events":"Game Notes & Events",notesBox);
  const runnerEvents=runnerEventLogText(),events=blank?"": [...automaticRunnerNoteLines(),...gameManagementTimeline(),runnerEvents?`Runner Events: ${runnerEvents}`:""].filter(Boolean).join("\n");
  if(blank){for(let i=0;i<22;i++)classicPdfHorizontalRule(cmd,38,210+i*16,536,.45);}else{const combinedNotes=[d.gameNotes?`Game Notes: ${d.gameNotes}`:"",events?`Recorded Game Events: ${events}`:""].filter(Boolean).join("\n\n");classicPdfTextBox(cmd,combinedNotes,{x:38,top:219,width:536,height:349},{size:9,minSize:5.8,lineHeightRatio:1.27,bold:false,fallback:"No game notes or additional game events were recorded."});}
  const reviewBox={x:24,top:598,width:564,height:166};classicPdfSectionBox(cmd,"Review Decision Log",reviewBox);const reviews=blank?"": [managerReplayLogText(99)?`Manager Replay: ${managerReplayLogText(99)}`:"",challengeLogText(99)?`ABS: ${challengeLogText(99)}`:""].filter(Boolean).join("\n");if(blank){for(let i=0;i<7;i++)classicPdfHorizontalRule(cmd,38,631+i*16,536,.45);}else classicPdfTextBox(cmd,reviews,{x:38,top:631,width:536,height:112},{size:7.6,minSize:5.4,lineHeightRatio:1.25,bold:false,fallback:"No replay or ABS review decisions were recorded."});classicPdfText(cmd,"Duplex printing: print double-sided and flip on the long edge.",28,771,556,6.4,{minSize:5,bold:false,color:"brown",align:"center"});return `${cmd.join("\n")}\n`;
}
function classicPdfBlankOverlay(){const cmd=["q 612 0 0 792 0 0 cm /Im0 Do Q"];classicPdfText(cmd,"Away Pitching",12,598,586,9.5,{minSize:6,color:"white"});classicPdfText(cmd,"Home Pitching",12,696.5,586,9.5,{minSize:6,color:"white"});classicPdfText(cmd,"AWAY",424,40,88,5.8,{minSize:4.8,color:"white",align:"center"});classicPdfText(cmd,"Replay / ABS",426,51,84,5.2,{minSize:3.8,color:"white",align:"center"});classicPdfText(cmd,"HOME",515,40,88,5.8,{minSize:4.8,color:"white",align:"center"});classicPdfText(cmd,"Replay / ABS",517,51,84,5.2,{minSize:3.8,color:"white",align:"center"});return `${cmd.join("\n")}\n`;}

function colorDistance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);}
function scorecardImageElement(){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Classic scorecard background could not be loaded."));image.src=`data:image/jpeg;base64,${EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64}`;});}
function recolorScorecardCanvas(ctx,width,height,palette){const image=ctx.getImageData(0,0,width,height),pixels=image.data,targets=Object.fromEntries(Object.entries(palette).map(([key,value])=>[key,Object.values(hexToRgb(value))]));for(let i=0;i<pixels.length;i+=4){const rgb=[pixels[i],pixels[i+1],pixels[i+2]];let best=null,bestDistance=Infinity;for(const swatch of SCORECARD_SOURCE_SWATCHES){const distance=colorDistance(rgb,swatch.source);if(distance<bestDistance){bestDistance=distance;best=swatch;}}if(best&&bestDistance<62){const target=targets[best.role]||targets.text,shade=.38;pixels[i]=Math.max(0,Math.min(255,target[0]+(rgb[0]-best.source[0])*shade));pixels[i+1]=Math.max(0,Math.min(255,target[1]+(rgb[1]-best.source[1])*shade));pixels[i+2]=Math.max(0,Math.min(255,target[2]+(rgb[2]-best.source[2])*shade));}}ctx.putImageData(image,0,0);}
function medianChannel(values){const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)]||0;}
function sampleScoringCellFill(ctx,sx,sy,left,top,cellWidth){const samples=[];for(const dx of [cellWidth-4.5,cellWidth-3.5,cellWidth-2.5])for(const dy of [2.5,3.5,4.5]){const pixel=ctx.getImageData(Math.round((left+dx)*sx),Math.round((top+dy)*sy),1,1).data;samples.push([pixel[0],pixel[1],pixel[2]]);}return [0,1,2].map(channel=>medianChannel(samples.map(sample=>sample[channel])));}
function removeTraditionalScoringGuides(ctx,width,height){
  const sx=width/CLASSIC_PDF_WIDTH,sy=height/CLASSIC_PDF_HEIGHT,xStart=196.8,cellWidth=28.55,rowHeight=22,xEnd=xStart+cellWidth*10;
  const groups=[{top:158,rows:9},{top:394,rows:9}],fills=[];
  for(const group of groups)for(let row=0;row<group.rows;row++){const top=group.top+row*rowHeight;fills.push({top,color:sampleScoringCellFill(ctx,sx,sy,xStart,top,cellWidth)});}
  ctx.save();
  for(const item of fills){ctx.fillStyle=`rgb(${item.color[0]},${item.color[1]},${item.color[2]})`;ctx.fillRect(Math.round(xStart*sx),Math.round(item.top*sy),Math.round((xEnd-xStart)*sx),Math.round(rowHeight*sy)+1);}
  ctx.strokeStyle=classicPdfPalette.grid;ctx.lineWidth=Math.max(1,Math.min(sx,sy)*.58);ctx.lineCap="butt";ctx.lineJoin="miter";
  for(const group of groups){const groupBottom=group.top+group.rows*rowHeight;ctx.beginPath();for(let col=0;col<=10;col++){const x=(xStart+col*cellWidth)*sx;ctx.moveTo(x,group.top*sy);ctx.lineTo(x,groupBottom*sy);}for(let row=0;row<=group.rows;row++){const y=(group.top+row*rowHeight)*sy;ctx.moveTo(xStart*sx,y);ctx.lineTo(xEnd*sx,y);}ctx.stroke();}
  ctx.restore();
}
function drawWildPitchPdfHeaders(ctx,width,height,palette){
  const sx=width/CLASSIC_PDF_WIDTH,sy=height/CLASSIC_PDF_HEIGHT;
  ctx.save();ctx.scale(sx,sy);ctx.fillStyle=palette.primary;ctx.fillRect(396.65,611.0,28.55,13.7);ctx.fillRect(396.65,708.7,28.55,13.7);ctx.fillStyle=palette.onSecondary||"#FFFFFF";ctx.font="700 7.2px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("WP",410.925,617.85);ctx.fillText("WP",410.925,715.55);ctx.restore();
}
function redrawPdfReviewArea(ctx,width,height,palette){
  const sx=width/CLASSIC_PDF_WIDTH,sy=height/CLASSIC_PDF_HEIGHT;ctx.save();ctx.scale(sx,sy);const x=423,top=14,widthPt=188,heightPt=54,headerHeight=22;
  ctx.fillStyle=palette.secondary;ctx.fillRect(x,top,widthPt,headerHeight);ctx.fillStyle=palette.primary;ctx.fillRect(x,top+headerHeight,widthPt,heightPt-headerHeight);ctx.strokeStyle=palette.gridDark;ctx.lineWidth=.75;ctx.strokeRect(x,top,widthPt,heightPt);ctx.beginPath();ctx.moveTo(x+94,top+headerHeight);ctx.lineTo(x+94,top+heightPt);ctx.stroke();ctx.fillStyle=palette.onSecondary||"#FFFFFF";ctx.font="700 7.4px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("REPLAY / ABS STATUS",x+widthPt/2,top+headerHeight/2);ctx.restore();
}
function redrawExpandedPitchingArea(ctx,width,height,palette){
  const sx=width/CLASSIC_PDF_WIDTH,sy=height/CLASSIC_PDF_HEIGHT;ctx.save();ctx.scale(sx,sy);const x=.8,fullWidth=610.4,top=594,tableHeight=98.5,titleHeight=17,headerHeight=16,pitcherWidth=240,statWidth=(fullWidth-pitcherWidth)/8,headers=["Pitcher / No.","IP","H","R","ER","BB","K","HBP","WP"];
  ctx.fillStyle=palette.cream;ctx.fillRect(x,top,fullWidth,197);ctx.strokeStyle=palette.gridDark;ctx.lineWidth=.7;ctx.textBaseline="middle";
  for(let table=0;table<2;table++){
    const y=top+table*tableHeight;ctx.fillStyle=palette.secondary;ctx.fillRect(x,y,fullWidth,titleHeight);ctx.fillStyle=palette.primary;ctx.fillRect(x,y+titleHeight,fullWidth,headerHeight);
    const dataTop=y+titleHeight+headerHeight,rowHeight=(tableHeight-titleHeight-headerHeight)/6;for(let row=0;row<6;row++){ctx.fillStyle=row%2?palette.alternate:palette.cream;ctx.fillRect(x,dataTop+row*rowHeight,fullWidth,rowHeight);}
    ctx.strokeStyle=palette.gridDark;ctx.strokeRect(x,y,fullWidth,tableHeight);ctx.beginPath();ctx.moveTo(x,y+titleHeight);ctx.lineTo(x+fullWidth,y+titleHeight);ctx.moveTo(x,y+titleHeight+headerHeight);ctx.lineTo(x+fullWidth,y+titleHeight+headerHeight);
    for(let row=1;row<6;row++){const ry=dataTop+row*rowHeight;ctx.moveTo(x,ry);ctx.lineTo(x+fullWidth,ry);}ctx.moveTo(x+pitcherWidth,y+titleHeight);ctx.lineTo(x+pitcherWidth,y+tableHeight);for(let col=1;col<8;col++){const cx=x+pitcherWidth+col*statWidth;ctx.moveTo(cx,y+titleHeight);ctx.lineTo(cx,y+tableHeight);}ctx.stroke();
    ctx.fillStyle=palette.onSecondary||"#FFFFFF";ctx.font="700 7.1px Arial";ctx.textAlign="center";headers.forEach((label,index)=>{const left=index===0?x:x+pitcherWidth+(index-1)*statWidth,w=index===0?pitcherWidth:statWidth;ctx.fillText(label,left+w/2,y+titleHeight+headerHeight/2+.3);});
  }
  ctx.restore();
}
async function themedScorecardBackground(includeTraditionalGuides=false,palette=classicPdfPalette){const source=await scorecardImageElement(),canvas=document.createElement("canvas");canvas.width=source.naturalWidth||EMBEDDED_SCORECARD_BACKGROUND_WIDTH;canvas.height=source.naturalHeight||EMBEDDED_SCORECARD_BACKGROUND_HEIGHT;const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(source,0,0,canvas.width,canvas.height);recolorScorecardCanvas(ctx,canvas.width,canvas.height,palette);if(!includeTraditionalGuides)removeTraditionalScoringGuides(ctx,canvas.width,canvas.height);redrawPdfReviewArea(ctx,canvas.width,canvas.height,palette);redrawExpandedPitchingArea(ctx,canvas.width,canvas.height,palette);const dataUrl=canvas.toDataURL("image/jpeg",.985);return {bytes:new Uint8Array(base64ToArrayBuffer(dataUrl.split(",")[1])),width:canvas.width,height:canvas.height};}
function classicPdfFillRect(cmd,x,top,width,height,role="cream"){const y=CLASSIC_PDF_HEIGHT-top-height;cmd.push(`${classicPdfColor(role)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);}
function classicPdfOverlay(startInning=1){
  const d=collectData(),totals=computeGameTotals(),endingPlays=completedHalfInningEndingPlays(),endInning=startInning+9,continuation=startInning>1,cmd=["q 612 0 0 792 0 0 cm /Im0 Do Q"];
  classicPdfText(cmd,`${topLine(d)}${continuation?` - CONTINUATION INNINGS ${startInning}-${endInning}`:""}`,21.4,5.0,395,9.4,{minSize:5.3,color:"brown"});
  const info=[[d.weather?`Weather: ${d.weather}`:"",d.umpires?`Umpires: ${d.umpires}`:""].filter(Boolean).join(" - "),[d.broadcast?`TV: ${d.broadcast}`:"",d.radio?`Radio: ${d.radio}`:""].filter(Boolean).join(" - ")].filter(Boolean);info.slice(0,2).forEach((line,i)=>classicPdfText(cmd,line,21.4,22+i*12,395,8.8,{minSize:5,color:"brown"}));
  classicPdfReviewStatus(cmd);
  const scoreTops={away:88.3,home:105.6},inningX=slot=>196.8+(slot-1)*28.55;classicPdfText(cmd,`Away: ${d.awayTeam||"Away"}`,21.4,scoreTops.away,178,10.2,{minSize:6.2,color:"white"});classicPdfText(cmd,`Home: ${d.homeTeam||"Home"}`,21.4,scoreTops.home,178,10.2,{minSize:6.2,color:"white"});
  if(continuation){for(let slot=1;slot<=10;slot++){classicPdfFillRect(cmd,inningX(slot),66,28.4,17,"cream");classicPdfText(cmd,startInning+slot-1,inningX(slot),69,28.4,6.4,{align:"center",color:"brown"});}}
  for(let slot=1;slot<=10;slot++){const inning=startInning+slot-1;classicPdfText(cmd,totals.away.innings[inning-1]||0,inningX(slot),scoreTops.away,28.5,8,{align:"center",color:"brown"});classicPdfText(cmd,totals.home.innings[inning-1]||0,inningX(slot),scoreTops.home,28.5,8,{align:"center",color:"brown"});}
  [["away",scoreTops.away],["home",scoreTops.home]].forEach(([team,top])=>{classicPdfText(cmd,totals[team].runs,520,top,27,8,{align:"center",color:"brown"});classicPdfText(cmd,totals[team].hits,548.5,top,27,8,{align:"center",color:"brown"});classicPdfText(cmd,totals[team].errors,577,top,27,8,{align:"center",color:"brown"});});
  const awayTitle=`Away: ${d.awayTeam||"Away"}${d.awayRecord?` (${d.awayRecord})`:""}`,homeTitle=`Home: ${d.homeTeam||"Home"}${d.homeRecord?` (${d.homeRecord})`:""}`;classicPdfText(cmd,awayTitle,21.4,128.0,395,10.3,{minSize:5.5,color:"white"});classicPdfText(cmd,homeTitle,21.4,364.6,395,10.3,{minSize:5.5,color:"white"});
  if(continuation){for(const top of [140,376])for(let slot=1;slot<=10;slot++){classicPdfFillRect(cmd,inningX(slot),top,28.4,17,"cream");classicPdfText(cmd,startInning+slot-1,inningX(slot),top+3,28.4,6.1,{align:"center",color:"brown"});}}
  const rowTops={away:[161.7,184.1,205.8,227.6,249.3,271.7,293.5,315.2,336.9],home:[398.2,420.0,441.7,463.4,485.1,507.6,529.3,551.0,572.7]};
  for(const team of ["away","home"]){const stats=computeTeamStats(team);d[team].lineup.forEach((p,r)=>{const top=rowTops[team][r],cellTop=(team==="away"?158:394)+r*22;classicPdfLineupCell(cmd,team,r,cellTop);for(let slot=1;slot<=10;slot++){const inning=startInning+slot-1,plays=playsByBatterInning(team,r,inning),notation=plays.length?plays.map(playNotation).join("/"):"";if(notation){const lookingOnly=plays.length===1&&plays[0].outcome==="KL";classicPdfText(cmd,lookingOnly?"K":notation,inningX(slot)+1,top-2.6,26.5,8.8,{minSize:4.4,align:"center",color:"brown",mirror:lookingOnly});}if(plays.some(play=>endingPlays.has(play.id)))classicPdfHorizontalRule(cmd,inningX(slot),top+14.8,28.4,2.4);}classicPdfDrawSubstitutionBoundaries(cmd,team,r,startInning,inningX,cellTop);const xs=[482,511,540,569];[stats[r].ab,stats[r].r,stats[r].h,stats[r].rbi].forEach((v,j)=>classicPdfText(cmd,v,xs[j],top,27,7.5,{align:"center",color:"brown"}));});}
  classicPdfText(cmd,`Away: ${d.awayTeam||"Away"} Pitching`,12,598,586,9.5,{minSize:6,color:"white"});classicPdfText(cmd,`Home: ${d.homeTeam||"Home"} Pitching`,12,696.5,586,9.5,{minSize:6,color:"white"});
  const pitcherX=10,pitcherWidth=230,statStart=240.8,statWidth=46.3,pTops={away:[630.0,640.9,651.8,662.7,673.6,684.5],home:[728.5,739.4,750.3,761.2,772.1,783.0]};for(const team of ["away","home"])scorecardPitchingLinesForTeam(team).forEach(({pitcher,columns},i)=>{const top=pTops[team][i];classicPdfText(cmd,formatPitcher(pitcher),pitcherX,top,pitcherWidth,8.1,{minSize:4.2,color:"brown"});columns.forEach((value,index)=>classicPdfText(cmd,value,statStart+index*statWidth,top,statWidth,8,{minSize:4.8,align:"center",color:"brown"}));});return `${cmd.join("\n")}\n`;
}
function buildClassicPdfBytes(imageInfo,contentInput=""){
  const contentTexts=Array.isArray(contentInput)?contentInput:[contentInput||"q 612 0 0 792 0 0 cm /Im0 Do Q\n"],pageCount=contentTexts.length,image=imageInfo.bytes,parts=[],objectCount=5+pageCount*2,offsets=Array(objectCount+1).fill(0);let length=0;
  const push=b=>{parts.push(b);length+=b.length;},txt=t=>push(new TextEncoder().encode(t)),obj=(n,b)=>{offsets[n]=length;txt(`${n} 0 obj\n`);b.forEach(push);txt("\nendobj\n");};
  const pageStart=3,fontRegular=pageStart+pageCount,fontBold=fontRegular+1,imageObject=fontBold+1,contentStart=imageObject+1;txt("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");obj(1,[new TextEncoder().encode("<< /Type /Catalog /Pages 2 0 R >>")]);obj(2,[new TextEncoder().encode(`<< /Type /Pages /Kids [${Array.from({length:pageCount},(_,i)=>`${pageStart+i} 0 R`).join(" ")}] /Count ${pageCount} >>`)]);
  for(let i=0;i<pageCount;i++)obj(pageStart+i,[new TextEncoder().encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentStart+i} 0 R >>`)]);
  obj(fontRegular,[new TextEncoder().encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")]);obj(fontBold,[new TextEncoder().encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")]);
  offsets[imageObject]=length;txt(`${imageObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageInfo.width} /Height ${imageInfo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);push(image);txt("\nendstream\nendobj\n");
  contentTexts.forEach((text,index)=>{const content=new TextEncoder().encode(text);offsets[contentStart+index]=length;txt(`${contentStart+index} 0 obj\n<< /Length ${content.length} >>\nstream\n`);push(content);txt("endstream\nendobj\n");});
  const xref=length;txt(`xref\n0 ${objectCount+1}\n0000000000 65535 f \n`);for(let i=1;i<=objectCount;i++)txt(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`);txt(`trailer\n<< /Size ${objectCount+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);const out=new Uint8Array(length);let pos=0;for(const part of parts){out.set(part,pos);pos+=part.length;}return out;
}
async function exportClassicPdf(){persistAutosaveNow("PDF export checkpoint",{force:true});try{const d=collectData();classicPdfPalette=scorecardPaletteForHomeTeam();const image=await themedScorecardBackground(false,classicPdfPalette),maxInning=Math.max(scoring.inning,...scoring.plays.map(play=>num(play.inning))),pages=[classicPdfOverlay(1),classicPdfNotesPage(1,false)];if(maxInning>=11)pages.push(classicPdfOverlay(11),classicPdfNotesPage(11,false));const bytes=buildClassicPdfBytes(image,pages);downloadBlob(new Blob([bytes],{type:"application/pdf"}),`${safeFileName(`${d.awayTeam||"Away"}_at_${d.homeTeam||"Home"}_${d.gameDate||"scorecard"}`)}.pdf`);$("autosaveBar").textContent=`Duplex PDF downloaded with ${pages.length} pages: each scorecard is followed by its notes and review page. All live data remains on screen.`;setTimeout(()=>showPostExportDialog("PDF Scorecard"),120);}catch(err){console.error(err);alert(`PDF export failed: ${err.message}`);}}
async function exportBlankClassicPdf(includeTraditionalGuides){try{const d=collectData();classicPdfPalette=scorecardPaletteForHomeTeam();const image=await themedScorecardBackground(includeTraditionalGuides,classicPdfPalette),bytes=buildClassicPdfBytes(image,[classicPdfBlankOverlay(),classicPdfNotesPage(1,true)]);downloadBlob(new Blob([bytes],{type:"application/pdf"}),`${safeFileName(`${d.homeTeam||"Baseball"}_blank_scorecard${includeTraditionalGuides?"_with_guides":"_clean"}`)}.pdf`);$("blankPdfDialog").close();$("autosaveBar").textContent=`Blank two-page duplex PDF downloaded using ${paletteStatusText(d.homeTeam)}${includeTraditionalGuides?" with traditional guides":" with clean scoring boxes"}.`;}catch(err){console.error(err);alert(`Blank PDF export failed: ${err.message}`);}}

function initEvents(){
  document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>setPanel(b.dataset.panel)));document.querySelectorAll(".next-panel").forEach(b=>b.addEventListener("click",()=>setPanel(b.dataset.next)));
  $("plateAppearancesViewBtn").addEventListener("click",()=>setScoringView("plateAppearances"));$("currentScorecardViewBtn").addEventListener("click",()=>setScoringView("scorecard"));
  const autosaveFieldChange=e=>{if(e.target.matches("input,textarea,select")&&!e.target.closest("#playDialog")){rememberGameFieldValue(e.target);refreshHeadings();if(scoringViewMode==="scorecard")renderCurrentScorecardPreview();if(e.type==="change")persistAutosaveNow("Field selection saved",{force:true,rotate:false});else scheduleAutosave();}};document.addEventListener("input",autosaveFieldChange);document.addEventListener("change",autosaveFieldChange);
  document.addEventListener("blur",e=>{if(e.target?.matches?.("input,textarea,select")&&!e.target.closest("#playDialog")){rememberGameFieldValue(e.target);persistAutosaveNow("Field edit committed",{force:true,rotate:false});}},true);
  $("playForm").addEventListener("submit",recordPlay);$("closePlayDialogBtn").addEventListener("click",()=>$("playDialog").close());$("cancelPlayBtn").addEventListener("click",()=>$("playDialog").close());$("playOutcome").addEventListener("change",handlePlayOutcomeChange);
  $("fieldLocationGrid").addEventListener("click",event=>{const button=event.target.closest("[data-field-position]");if(button)applyFieldLocationSelection(button.dataset.fieldPosition);});$("closeFieldLocationDialogBtn").addEventListener("click",closeFieldLocationDialog);$("cancelFieldLocationBtn").addEventListener("click",closeFieldLocationDialog);$("undoFieldingSequenceBtn").addEventListener("click",undoFieldingSequence);$("clearFieldingSequenceBtn").addEventListener("click",clearFieldingSequence);$("useFieldingSequenceBtn").addEventListener("click",completeFieldingSequence);$("chooseFieldLocationBtn").addEventListener("click",()=>openFieldLocationDialog($("playOutcome").value,{mode:"play-form",selected:$("playFieldLocation").value,sequence:$("playFieldingSequence").value}));
  $("runnerEventBtn").addEventListener("click",()=>openRunnerEventDialog());$("runnerEventForm").addEventListener("submit",saveRunnerEvent);$("closeRunnerEventDialogBtn").addEventListener("click",()=>$("runnerEventDialog").close());$("cancelRunnerEventBtn").addEventListener("click",()=>$("runnerEventDialog").close());
  $("runnerEventType").addEventListener("change",()=>{populateRunnerEventResults($("runnerEventType").value);applyRunnerEventDefaults();});$("runnerEventResult").addEventListener("change",()=>applyRunnerEventDefaults());$("runnerEventPrimaryBase").addEventListener("change",()=>applyRunnerEventDefaults());
  [1,2,3].forEach(base=>$(`runnerEventRunner${base}Destination`).addEventListener("change",syncRunnerEventCounts));
  $("deleteRunnerEventBtn").addEventListener("click",()=>{const id=$("runnerEventPlayId").value;if(id&&confirm("Delete this runner event?")){deletePlay(id);$("runnerEventDialog").close();}});
  $("runnerEventLog").addEventListener("click",event=>{const button=event.target.closest("[data-edit-runner-event]");if(button)openRunnerEventDialog(button.dataset.editRunnerEvent);});
  $("keyPlayBtn").addEventListener("click",toggleKeyPlay);$("recordErrorBtn").addEventListener("click",()=>showErrorAssignmentPanel(getFieldingErrorsFromDialog(),getField("errorDetails")));$("recordInterferenceBtn").addEventListener("click",toggleInterferencePanel);$("recordErrorQuickBtn").addEventListener("click",recordCurrentError);$("closeErrorPanelBtn").addEventListener("click",closeErrorAssignmentPanel);$("closeInterferencePanelBtn").addEventListener("click",closeInterferencePanel);$("interferenceType").addEventListener("change",event=>applyInterferenceDefaults(event.target.value));$("addSecondErrorBtn").addEventListener("click",addErrorAssignmentRow);
  $("errorAssignmentRows").addEventListener("click",event=>{const button=event.target.closest("[data-remove-error]");if(button)removeErrorAssignmentRow(num(button.dataset.removeError));});$("errorAssignmentRows").addEventListener("change",()=>{$("playErrors").value=getFieldingErrorsFromDialog().length;});
  $("substitutionForm").addEventListener("submit",saveSubstitution);$("closeSubstitutionDialogBtn").addEventListener("click",()=>$("substitutionDialog").close());$("cancelSubstitutionBtn").addEventListener("click",()=>$("substitutionDialog").close());
  ["away","home"].forEach(team=>$(`${team}PitchingChangeSelect`).addEventListener("change",event=>{const value=event.target.value;if(value==="custom")openCustomPitcherDialog(team);else if(value!=="")recordPitcherChange(team,value,"Pitching section");event.target.value="";}));
  $("customPitcherForm").addEventListener("submit",saveCustomPitcher);$("cancelCustomPitcherBtn").addEventListener("click",()=>$("customPitcherDialog").close());$("closeCustomPitcherDialogBtn").addEventListener("click",()=>$("customPitcherDialog").close());
  $("deletePlayBtn").addEventListener("click",()=>{const id=$("dialogPlayId").value;if(id&&confirm("Delete this play?")){deletePlay(id);$("playDialog").close();}});
  $("undoBtn").addEventListener("click",undoLastPlay);$("manualHalfBtn").addEventListener("click",manualChangeHalf);$("resetScoringBtn").addEventListener("click",resetScoring);
  $("ballBtn").addEventListener("click",()=>addPitch("ball"));$("swingStrikeBtn").addEventListener("click",()=>addPitch("swingingStrike"));$("calledStrikeBtn").addEventListener("click",()=>addPitch("calledStrike"));$("foulBtn").addEventListener("click",()=>addPitch("foul"));$("inPlayBtn").addEventListener("click",()=>addPitch("inplay"));
  $("undoPitchBtn").addEventListener("click",undoPitch);$("resetCountBtn").addEventListener("click",()=>resetCurrentCount());$("challengeQuickBtn").addEventListener("click",toggleChallengePanel);$("toggleQuickResultsBtn").addEventListener("click",toggleQuickResults);$("activePitcherSelect").addEventListener("change",changeActivePitcher);
  $("quickResultGrid").addEventListener("click",event=>{const button=event.target.closest("[data-quick-outcome]");if(button)handleQuickOutcome(button.dataset.quickOutcome);});
  $("strikeoutChooser").addEventListener("click",event=>{const button=event.target.closest("[data-terminal-outcome]");if(button)handleTerminalStrikeout(button.dataset.terminalOutcome);});
  document.querySelector(".abs-challenge-card").addEventListener("click",event=>{const replayRecord=event.target.closest("[data-record-replay]");if(replayRecord&&!replayRecord.disabled)openManagerReplayDialog(replayRecord.dataset.recordReplay);const replayEdit=event.target.closest("[data-edit-replay]");if(replayEdit)openManagerReplayDialog(scoring.managerReplayChallenges.events.find(item=>item.id===replayEdit.dataset.editReplay)?.team||"away",replayEdit.dataset.editReplay);const record=event.target.closest("[data-record-challenge]");if(record&&!record.disabled)openChallengeDialog(record.dataset.recordChallenge);const edit=event.target.closest("[data-edit-challenge]");if(edit)openChallengeDialog(scoring.challenges.events.find(item=>item.id===edit.dataset.editChallenge)?.team||"away",edit.dataset.editChallenge);});
  $("managerReplayForm").addEventListener("submit",saveManagerReplay);$("closeManagerReplayDialogBtn").addEventListener("click",()=>$("managerReplayDialog").close());$("cancelManagerReplayBtn").addEventListener("click",()=>$("managerReplayDialog").close());
  $("managerReplayHalf").addEventListener("change",()=>{$("managerReplayTeamSummary").textContent=`${teamName($("managerReplayTeam").value)} • ${$("managerReplayHalf").value==="top"?"Top":"Bottom"} ${Math.max(1,num($("managerReplayInning").value))} • ${managerReplayAllotment()} starting challenge${managerReplayAllotment()===1?"":"s"}`;});
  $("managerReplayInning").addEventListener("input",()=>{$("managerReplayTeamSummary").textContent=`${teamName($("managerReplayTeam").value)} • ${$("managerReplayHalf").value==="top"?"Top":"Bottom"} ${Math.max(1,num($("managerReplayInning").value))} • ${managerReplayAllotment()} starting challenge${managerReplayAllotment()===1?"":"s"}`;});
  $("deleteManagerReplayBtn").addEventListener("click",()=>{const id=$("managerReplayId").value;if(id&&confirm("Delete this manager replay record?")){deleteManagerReplay(id);$("managerReplayDialog").close();}});
  $("challengeForm").addEventListener("submit",saveChallenge);$("closeChallengeDialogBtn").addEventListener("click",()=>$("challengeDialog").close());$("cancelChallengeBtn").addEventListener("click",()=>$("challengeDialog").close());
  $("challengeHalf").addEventListener("change",()=>{updateChallengeNameAndCall(true);updateChallengePitchLink(false);});
  $("challengeInning").addEventListener("input",()=>{updateChallengeNameAndCall(false);updateChallengePitchLink(false);});
  $("challengeRole").addEventListener("change",()=>{updateChallengeNameAndCall(true);updateChallengePitchLink(false);});
  $("deleteChallengeBtn").addEventListener("click",()=>{const id=$("challengeId").value;if(id&&confirm("Delete this ABS challenge record?")){deleteChallenge(id);$("challengeDialog").close();}});
  document.addEventListener("keydown",handleScoringKeyboard);
  $("refreshGamesBtn").addEventListener("click",refreshScheduleAndClear);$("dailyGameSelect").addEventListener("change",()=>$("lookupGameBtn").disabled=!$("dailyGameSelect").value);$("lookupGameBtn").addEventListener("click",loadSelectedGame);$("clearForManualBtn").addEventListener("click",clearForManual);
  $("downloadPitchLogBtn").addEventListener("click",downloadPitchLogCsv);
  ["exportExcelBtn","exportExcelBtn2"].forEach(id=>$(id).addEventListener("click",exportExcel));["printPdfBtn","printPdfBtn2"].forEach(id=>$(id).addEventListener("click",exportClassicPdf));["saveGameFileBtn","saveGameFileBtn2"].forEach(id=>$(id).addEventListener("click",saveGameFile));
  $("clearAfterExportBtn").addEventListener("click",clearAfterExport);$("saveNowBtn").addEventListener("click",saveNow);$("restoreAutosaveBtn").addEventListener("click",restorePreviousAutosave);$("keepGameOpenBtn").addEventListener("click",()=>{pendingExportKind="";});$("closePostExportDialogBtn").addEventListener("click",()=>{pendingExportKind="";});$("postExportDialog").addEventListener("close",()=>{pendingExportKind="";});
  ["openGameFile","openGameFile2"].forEach(id=>$(id).addEventListener("change",e=>{if(e.target.files[0])openGameFile(e.target.files[0]);e.target.value="";}));$("templateFile").addEventListener("change",e=>{if(e.target.files[0])uploadTemplate(e.target.files[0]);});$("downloadBlankBtn").addEventListener("click",downloadBlank);$("downloadBlankPdfBtn").addEventListener("click",()=>$("blankPdfDialog").showModal());$("blankPdfWithGuidesBtn").addEventListener("click",()=>exportBlankClassicPdf(true));$("blankPdfCleanBtn").addEventListener("click",()=>exportBlankClassicPdf(false));
  $("lookupDate").addEventListener("change",loadSchedule);$("scheduleLevel").addEventListener("change",loadSchedule);$("extraInningsRule").addEventListener("change",()=>{rebuildDerivedGameState();refreshAll();scheduleAutosave("Extra-inning rule updated");});$("managerChallengeAllotment").addEventListener("change",()=>{renderManagerReplayTracker();renderSummary();scheduleAutosave("Manager replay allotment updated");});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false;});$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true;});
}
function disableBrowserFormRestore(){
  document.querySelectorAll("input:not([type=file]):not([type=hidden]), textarea").forEach(field=>{
    field.setAttribute("autocomplete","off");
    field.setAttribute("autocapitalize",field.type==="text"?"words":"off");
  });
  document.querySelectorAll("form").forEach(form=>form.setAttribute("autocomplete","off"));
}
function init(){
  createLineupInputs("away");createLineupInputs("home");createBenchInputs("away");createBenchInputs("home");createPitcherInputs("away");createPitcherInputs("home");
  disableBrowserFormRestore();renderQuickResults();setQuickResultsVisible(true);setChallengePanelVisible(false);initEvents();
  initializePersistentStartup();stabilizeRestoredGameFields("Startup roster recovery");loadSchedule();
  window.addEventListener("pageshow",event=>{stabilizeRestoredGameFields(event.persisted?"Game retained from iPhone memory":"Game fields verified");});
  window.addEventListener("focus",()=>stabilizeRestoredGameFields("Game fields restored after returning"));
  window.addEventListener("pagehide",()=>persistAutosaveNow("Saved before leaving",{force:true}));
  window.addEventListener("beforeunload",()=>persistAutosaveNow("Saved before closing",{force:true}));
  document.addEventListener("freeze",()=>persistAutosaveNow("Saved before mobile suspension",{force:true}));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")persistAutosaveNow("Saved while app moved to background",{force:true});else stabilizeRestoredGameFields("Game fields restored from background");});
  if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js?v=34-pdf-duplex-r5",{updateViaCache:"none"}).catch(console.warn);
}
init();
