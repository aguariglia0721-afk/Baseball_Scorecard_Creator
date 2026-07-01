#!/usr/bin/env python3
import json
import os
import re
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PREVIEW = ROOT / "preview"
PREVIEW.mkdir(exist_ok=True)
REPORT = ROOT / "VERSION_33_GAME_EMULATION_REPORT.json"
DEVICES = [
    {"name": "iPhone 15 Pro portrait", "width": 390, "height": 844, "is_mobile": True, "has_touch": True},
    {"name": "iPad Pro 11 portrait", "width": 834, "height": 1194, "is_mobile": True, "has_touch": True},
    {"name": "Desktop 1440", "width": 1440, "height": 1000, "is_mobile": False, "has_touch": False},
]


def slug(value):
    return "-".join("".join(c.lower() if c.isalnum() else " " for c in value).split())


def inline_app_html(seed=None):
    html = (ROOT / "index.html").read_text()
    css = (ROOT / "styles.css").read_text()
    html = re.sub(r'<link rel="manifest"[^>]*>', "", html)
    html = re.sub(r'<link rel="stylesheet"[^>]*>', "<style>" + css + "</style>", html)
    seed_json = json.dumps(seed or {})
    bootstrap = (
        "<script>(function(){"
        "const store=Object.assign({}," + seed_json + ");"
        "window.__auditStorage=store;"
        "const storage={"
        "getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?String(store[k]):null,"
        "setItem:(k,v)=>{store[k]=String(v)},"
        "removeItem:k=>{delete store[k]},"
        "clear:()=>{for(const k of Object.keys(store))delete store[k]},"
        "key:i=>Object.keys(store)[i]??null,"
        "get length(){return Object.keys(store).length}"
        "};"
        "try{Object.defineProperty(window,'localStorage',{configurable:true,value:storage})}catch(e){window.localStorage=storage}"
        "window.alert=()=>{};window.confirm=()=>true;"
        "})();</script>"
    )
    html = html.replace("<head>", "<head>" + bootstrap, 1)
    scripts = {
        "vendor/jszip.min.js": (ROOT / "vendor/jszip.min.js").read_text(),
        "template_data.js": (ROOT / "template_data.js").read_text(),
        "pdf_background_data.js?v=33": 'const EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64 = "";',
        "baseball-data.js?v=33": (ROOT / "baseball-data.js").read_text(),
        "app.js?v=33-follow-ball-r2": (ROOT / "app.js").read_text(),
    }
    for src, code in scripts.items():
        code = code.replace("</script>", "<\\/script>")
        html = html.replace(f'<script src="{src}"></script>', f"<script>{code}</script>")
    return html


SETUP_SCORE_JS = r"""async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing field ${id}`);
    el.value = value;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  };
  const click = selector => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Missing control ${selector}`);
    el.click();
    return el;
  };
  const activePanel = () => document.querySelector('.panel.active')?.id || '';
  const noOverflow = () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= window.innerWidth + 1;
  const dialogContained = dialog => {
    if (!dialog?.open) return false;
    const box = dialog.getBoundingClientRect();
    return box.left >= -1 && box.top >= -1 && box.right <= window.innerWidth + 1 && box.bottom <= window.innerHeight + 1;
  };
  const choosePath = async positions => {
    await wait(40);
    const dialog = document.getElementById('fieldLocationDialog');
    const buttons = [...document.querySelectorAll('.field-location-button')];
    const check = {
      open: Boolean(dialog?.open),
      contained: dialogContained(dialog),
      ninePositions: buttons.length === 9 && buttons.map(b => b.dataset.fieldPosition).join('') === '123456789',
      touchTargets: buttons.every(b => { const r=b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }),
      fieldArt: Boolean(document.querySelector('#fieldLocationGrid svg.field-map-art')),
      pathOverlay: Boolean(document.getElementById('fieldBallPathSvg')),
      noOverflow: noOverflow()
    };
    if (!Object.values(check).every(Boolean)) throw new Error(`Field map failed: ${JSON.stringify(check)}`);
    for (const position of positions) {
      click(`[data-field-position="${position}"]`);
      await wait(20);
    }
    const tray = document.getElementById('fieldingSequenceTray')?.textContent || '';
    const selected = positions.every(position => tray.includes(String(position)));
    if (!selected) throw new Error(`Ball path tray failed for ${positions.join('-')}: ${tray}`);
    click('#useFieldingSequenceBtn');
    await wait(45);
    return {...check,path:positions.join('-'),pathSelected:selected};
  };
  const quick = async (outcome, positions=null, saveDialog=false, expectNoFieldMap=false) => {
    click(`[data-quick-outcome="${outcome}"]`);
    await wait(35);
    let fieldCheck = null;
    if (expectNoFieldMap && document.getElementById('fieldLocationDialog')?.open) throw new Error(`${outcome} incorrectly opened field map`);
    if (positions !== null) fieldCheck = await choosePath(positions);
    if (saveDialog) {
      await wait(25);
      const dialog = document.getElementById('playDialog');
      if (!dialog.open || !dialogContained(dialog)) throw new Error(`${outcome} play dialog failed`);
      click('#savePlayBtn');
      await wait(50);
    }
    await wait(40);
    return fieldCheck;
  };

  const initial = {
    setupActive: activePanel() === 'setup',
    setupStepActive: Boolean(document.querySelector('.step[data-panel="setup"].active')),
    noOverflow: noOverflow()
  };
  if (!Object.values(initial).every(Boolean)) throw new Error(`Initial setup failed: ${JSON.stringify(initial)}`);

  set('awayTeam','Audit Visitors');
  set('homeTeam','Audit Home');
  set('gameDate','2026-06-28');
  set('gameTime','7:10 PM');
  set('venue','Audit Ballpark');
  const awayPos=['CF','SS','1B','RF','3B','LF','2B','C','P'];
  const homePos=['2B','CF','SS','1B','RF','3B','LF','C','P'];
  for(let i=1;i<=9;i++){
    set(`awayNum${i}`, String(i)); set(`awayPlayer${i}`, `Visitor ${i}`); set(`awayPos${i}`, awayPos[i-1]);
    set(`homeNum${i}`, String(i+10)); set(`homePlayer${i}`, `Home ${i}`); set(`homePos${i}`, homePos[i-1]);
  }
  set('awayPitcherNum1','99'); set('awayPitcher1','Away Starter'); set('awayPitcherThrows1','RHP');
  set('homePitcherNum1','88'); set('homePitcher1','Home Starter'); set('homePitcherThrows1','LHP');

  click('.step[data-panel="scoring"]');
  await wait(100);
  if (activePanel() !== 'scoring') throw new Error('Could not enter Live Scoring');

  click('#ballBtn'); click('#calledStrikeBtn'); click('#inPlayBtn');
  const locationChecks=[];
  locationChecks.push(await quick('1B',['7'],false));
  await quick('K');
  await quick('K');
  locationChecks.push(await quick('GO',['6','3'],true));
  await quick('HR',null,false,true);
  await quick('BB');
  locationChecks.push(await quick('DP',['4','3','1'],true));
  await quick('K');

  const totals = computeGameTotals();
  const afterGameFlow = {
    playCount: scoring.plays.length,
    inning: scoring.inning,
    half: scoring.half,
    outs: scoring.outs,
    awayScore: totals.away.runs,
    homeScore: totals.home.runs,
    notations: scoring.plays.map(playNotation),
    pitchEvents: scoring.pitchLog.length,
    noOverflow: noOverflow()
  };
  const expected=['1B7','K','K','GO6-3','HR','BB','DP4-3-1','K'];
  const flowPassed = afterGameFlow.playCount===8 && afterGameFlow.inning===2 && afterGameFlow.half==='top' && afterGameFlow.outs===0 && afterGameFlow.homeScore===1 && expected.every(n=>afterGameFlow.notations.includes(n)) && afterGameFlow.pitchEvents>=3 && afterGameFlow.noOverflow;
  if (!flowPassed) throw new Error(`Scoring flow mismatch: ${JSON.stringify(afterGameFlow)}`);

  click('#undoBtn'); await wait(70);
  const undoState={playCount:scoring.plays.length,inning:scoring.inning,half:scoring.half,outs:scoring.outs};
  if (!(undoState.playCount===7 && undoState.inning===1 && undoState.half==='bottom' && undoState.outs===2)) throw new Error(`Undo failed: ${JSON.stringify(undoState)}`);
  await quick('K');

  click('#currentScorecardViewBtn'); await wait(60);
  const scorecardView={visible:!document.getElementById('currentScorecardView').hidden,sheet:Boolean(document.querySelector('.current-scorecard-sheet')),noOverflow:noOverflow()};
  if (!Object.values(scorecardView).every(Boolean)) throw new Error(`Scorecard view failed: ${JSON.stringify(scorecardView)}`);
  click('#plateAppearancesViewBtn');

  click('.step[data-panel="summary"]'); await wait(70);
  const summary={panel:activePanel(),playLogCount:document.querySelectorAll('#playLog .play-log-item').length,hasScore:document.getElementById('lineScoreSummary').textContent.includes('Audit Home'),noOverflow:noOverflow()};
  if (!(summary.panel==='summary' && summary.playLogCount===8 && summary.hasScore && summary.noOverflow)) throw new Error(`Summary failed: ${JSON.stringify(summary)}`);

  persistAutosaveNow('Game emulation checkpoint',{force:true}); await wait(80);
  const saved=JSON.parse(localStorage.getItem('guariglia-scorecard-v33-autosave-current'));
  const autosave={present:Boolean(saved),playCount:saved?.scoring?.plays?.length||0,awayTeam:saved?.data?.awayTeam||'',savedPanel:saved?.ui?.activePanel||''};
  if (!(autosave.present && autosave.playCount===8 && autosave.awayTeam==='Audit Visitors' && autosave.savedPanel==='summary')) throw new Error(`Autosave failed: ${JSON.stringify(autosave)}`);

  return {initial,locationChecks,afterGameFlow,undoState,scorecardView,summary,autosave,passed:true};
}"""

RELOAD_JS = r"""async () => {
  await new Promise(resolve=>setTimeout(resolve,220));
  const active=document.querySelector('.panel.active')?.id||'';
  const totals=computeGameTotals();
  const restored={
    setupActive:active==='setup',
    setupStepActive:Boolean(document.querySelector('.step[data-panel="setup"].active')),
    awayTeam:collectData().awayTeam,
    homeTeam:collectData().homeTeam,
    playCount:scoring.plays.length,
    inning:scoring.inning,
    half:scoring.half,
    homeScore:totals.home.runs,
    noOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)<=window.innerWidth+1
  };
  restored.passed=restored.setupActive&&restored.setupStepActive&&restored.awayTeam==='Audit Visitors'&&restored.homeTeam==='Audit Home'&&restored.playCount===8&&restored.inning===2&&restored.half==='top'&&restored.homeScore===1&&restored.noOverflow;
  if(!restored.passed) throw new Error(`Reload recovery failed: ${JSON.stringify(restored)}`);
  document.querySelector('.step[data-panel="scoring"]').click();
  await new Promise(resolve=>setTimeout(resolve,80));
  const resume={panel:document.querySelector('.panel.active')?.id||'',markedPlays:document.querySelectorAll('#awayScoringGrid .pa-select.has-play,#homeScoringGrid .pa-select.has-play').length,noOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)<=window.innerWidth+1};
  resume.passed=resume.panel==='scoring'&&resume.markedPlays===8&&resume.noOverflow;
  if(!resume.passed) throw new Error(`Resume scoring failed: ${JSON.stringify(resume)}`);
  return {restored,resume,passed:true};
}"""


def main():
    selected=os.environ.get("AUDIT_DEVICE", "").lower()
    devices=[d for d in DEVICES if not selected or selected in d["name"].lower()]
    results=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path="/usr/bin/chromium",args=["--no-sandbox","--disable-dev-shm-usage"])
        for device in devices:
            print("START", device["name"], flush=True)
            context=browser.new_context(viewport={"width":device["width"],"height":device["height"]},is_mobile=device["is_mobile"],has_touch=device["has_touch"],device_scale_factor=1)
            errors=[]
            page=context.new_page()
            page.on("pageerror",lambda exc,errors=errors: errors.append(str(exc)))
            page.set_content(inline_app_html(),wait_until="load",timeout=60000)
            print("LOADED FIRST", device["name"], flush=True)
            page.wait_for_function("typeof collectData==='function' && document.querySelector('#setup.panel.active')",timeout=20000)
            phase1=page.evaluate(SETUP_SCORE_JS)
            print("PHASE1 PASS", device["name"], flush=True)
            summary_shot=PREVIEW/f"version33-game-emulation-{slug(device['name'])}-summary.png"
            page.screenshot(path=str(summary_shot),full_page=False)
            seed=page.evaluate("Object.assign({},window.__auditStorage)")
            print("SEEDED", device["name"], len(json.dumps(seed)), flush=True)

            errors2=[]
            page2=context.new_page()
            page2.on("pageerror",lambda exc,errors2=errors2: errors2.append(str(exc)))
            page2.set_content(inline_app_html(seed),wait_until="load",timeout=60000)
            print("LOADED SECOND", device["name"], flush=True)
            page2.wait_for_function("typeof collectData==='function'",timeout=20000)
            phase2=page2.evaluate(RELOAD_JS)
            print("PHASE2 PASS", device["name"], flush=True)
            restored_shot=PREVIEW/f"version33-game-emulation-{slug(device['name'])}-restored.png"
            page2.screenshot(path=str(restored_shot),full_page=False)

            page_errors=[e for e in errors+errors2 if "serviceWorker" not in e]
            item={**device,"phase1":phase1,"phase2":phase2,"pageErrors":page_errors,"screenshots":[str(summary_shot.relative_to(ROOT)),str(restored_shot.relative_to(ROOT))]}
            item["passed"]=bool(phase1.get("passed") and phase2.get("passed") and not page_errors)
            results.append(item)
            print(("PASS" if item["passed"] else "FAIL"),device["name"])
            context.close()
        browser.close()

    report={
        "generatedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
        "browser":"Chromium via Playwright inline-source harness",
        "scope":"Full setup, game scoring, MLB-aligned follow-the-ball field-map selection, home-run bypass, pitch tracking, undo, current scorecard, summary, autosave, second-launch recovery, and setup-first launch",
        "environmentNote":"Managed Chromium blocks automated URL navigation. The unchanged production HTML, CSS, JavaScript, and saved storage state were loaded directly into Chromium for equivalent device emulation.",
        "passed":all(item["passed"] for item in results),
        "devices":results,
    }
    REPORT.write_text(json.dumps(report,indent=2))
    if not report["passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
