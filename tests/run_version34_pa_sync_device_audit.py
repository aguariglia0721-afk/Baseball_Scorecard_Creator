#!/usr/bin/env python3
import json
import re
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PREVIEW = ROOT / "preview"
PREVIEW.mkdir(exist_ok=True)
REPORT = ROOT / "VERSION_34_PA_COMPLETION_DEVICE_REPORT.json"
DEVICES = [
    {"name": "iPhone 15 Pro", "width": 390, "height": 844, "mobile": True, "touch": True,
     "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"},
    {"name": "iPad Pro 11", "width": 834, "height": 1194, "mobile": True, "touch": True,
     "ua": "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"},
    {"name": "Android Pixel 7", "width": 412, "height": 915, "mobile": True, "touch": True,
     "ua": "Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/136.0 Mobile Safari/537.36"},
    {"name": "Desktop 1440", "width": 1440, "height": 1000, "mobile": False, "touch": False,
     "ua": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/136.0 Safari/537.36"},
]

def slug(value):
    return "-".join(re.sub(r"[^a-z0-9]+", " ", value.lower()).split())

def inline_html():
    html = (ROOT / "index.html").read_text()
    css = (ROOT / "styles.css").read_text()
    html = re.sub(r'<link rel="manifest"[^>]*>', '', html)
    html = re.sub(r'<link rel="stylesheet"[^>]*>', f'<style>{css}</style>', html)
    bootstrap = """<script>(()=>{const store={};window.__auditStorage=store;const storage={getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?String(store[k]):null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>Object.keys(store).forEach(k=>delete store[k]),key:i=>Object.keys(store)[i]??null,get length(){return Object.keys(store).length}};Object.defineProperty(window,'localStorage',{configurable:true,value:storage});window.alert=()=>{};window.confirm=()=>true;})();</script>"""
    html = html.replace('<head>', '<head>' + bootstrap, 1)
    replacements = {
        'vendor/jszip.min.js': (ROOT / 'vendor/jszip.min.js').read_text(),
        'template_data.js': (ROOT / 'template_data.js').read_text(),
        'pdf_background_data.js?v=34': 'const EMBEDDED_SCORECARD_BACKGROUND_JPEG_BASE64 = "";',
        'baseball-data.js?v=34': (ROOT / 'baseball-data.js').read_text(),
        'app.js?v=34-pa-sync-r6': (ROOT / 'app.js').read_text(),
    }
    for src, code in replacements.items():
        html = html.replace(f'<script src="{src}"></script>', f'<script>{code.replace("</script>", "<\\/script>")}</script>')
    return html

SETUP = r"""() => {
 const set=(id,v)=>{const e=document.getElementById(id);if(!e)throw new Error('Missing '+id);e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
 set('awayTeam','Audit Visitors'); set('homeTeam','Audit Home');
 for(let i=1;i<=9;i++){set(`awayPlayer${i}`,`Visitor ${i}`);set(`awayNum${i}`,i);set(`awayPos${i}`,'CF');set(`homePlayer${i}`,`Home ${i}`);set(`homeNum${i}`,i+10);set(`homePos${i}`,'CF');}
 set('awayPitcher1','Away Starter'); set('homePitcher1','Home Starter');
 document.querySelector('.step[data-panel="scoring"]').click();
}"""

SNAPSHOT = r"""() => {
 const gridRow=i=>{const r=document.querySelectorAll('#awayScoringGrid tbody tr')[i];return {pa:[...r.querySelectorAll('.pa-select')].map(x=>x.value),stats:[...r.querySelectorAll('.stat-cell')].map(x=>Number(x.textContent))};};
 const cardRow=i=>{const team=document.querySelectorAll('.current-scorecard-team')[0],r=team.querySelectorAll('tbody tr')[i],cells=[...r.children].map(x=>x.textContent.trim());return {inning1:cells[1],stats:cells.slice(-4).map(Number)};};
 const totals=computeGameTotals(),pitcher=computePitcherTracking().home.find(x=>x.name==='Home Starter');
 return {plays:scoring.plays.map(p=>p.outcome),inning:scoring.inning,half:scoring.half,outs:scoring.outs,batter:document.getElementById('currentBatterName').textContent,count:{balls:scoring.count.balls,strikes:scoring.count.strikes,pitches:scoring.count.pitches,inPlay:scoring.count.inPlay,history:[...scoring.count.history]},pitchDisabled:[...document.querySelectorAll('[data-pitch]')].every(x=>x.disabled),rows:[0,1,2,3,4].map(gridRow),card:[0,1,2,3,4].map(cardRow),totals,pitcher:pitcher?{pitches:pitcher.pitches,strikes:pitcher.strikes,balls:pitcher.balls,bf:pitcher.battersFaced,hits:pitcher.hits,walks:pitcher.walks,k:pitcher.strikeouts}:null,status:document.getElementById('pitchStatus').textContent,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)>window.innerWidth+1};
}"""

def click(page, selector):
    page.locator(selector).click(timeout=10000)
    page.wait_for_timeout(25)

def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)

def main():
    selected=os.environ.get("AUDIT_DEVICE", "").lower()
    devices=[device for device in DEVICES if not selected or selected in device["name"].lower()]
    results=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
        for device in devices:
            print(f"START {device['name']}", flush=True)
            context=browser.new_context(viewport={"width":device["width"],"height":device["height"]},is_mobile=device["mobile"],has_touch=device["touch"],user_agent=device["ua"],device_scale_factor=1)
            page=context.new_page(); errors=[]; page.on('pageerror',lambda exc, errors=errors: errors.append(str(exc)))
            page.set_content(inline_html(), wait_until='load', timeout=60000)
            page.wait_for_function("typeof collectData==='function' && document.querySelector('#setup.panel.active')")
            page.evaluate(SETUP); page.wait_for_timeout(120)

            for _ in range(4): click(page,'#ballBtn')
            s1=page.evaluate(SNAPSHOT)
            assert_true(s1['plays']==['BB'],f"{device['name']} walk did not complete: {s1}")
            assert_true(s1['rows'][0]['pa'][0]=='BB' and s1['card'][0]['inning1']=='BB',f"{device['name']} walk not populated below")
            assert_true(s1['count']['pitches']==0 and s1['batter']=='Visitor 2',f"{device['name']} walk count/batter reset failed")

            for _ in range(3): click(page,'#swingStrikeBtn')
            s2=page.evaluate(SNAPSHOT)
            assert_true(s2['plays']==['BB','K'],f"{device['name']} strikeout did not complete")
            assert_true(s2['rows'][1]['pa'][0]=='K' and s2['rows'][1]['stats']==[1,0,0,0] and s2['card'][1]['inning1']=='K',f"{device['name']} strikeout fields wrong")

            click(page,'#inPlayBtn')
            pending=page.evaluate(SNAPSHOT)
            assert_true(pending['pitchDisabled'] and pending['count']['inPlay'] and pending['count']['pitches']==1,f"{device['name']} In Play did not lock pitches")
            page.evaluate("addPitch('ball')")
            guarded=page.evaluate(SNAPSHOT)
            assert_true(guarded['count']['history']==['inplay'] and guarded['count']['inPlay'],f"{device['name']} accepted a pitch after In Play")
            click(page,'[data-quick-outcome="HR"]')
            s3=page.evaluate(SNAPSHOT)
            assert_true(s3['plays']==['BB','K','HR'] and not page.locator('#playDialog').evaluate('el=>el.open'),f"{device['name']} HR with runner did not complete directly")
            assert_true(s3['totals']['away']['runs']==2 and s3['rows'][0]['stats'][1]==1 and s3['rows'][2]['stats']==[1,1,1,2],f"{device['name']} HR run/RBI fields wrong: {s3}")

            click(page,'#inPlayBtn'); click(page,'[data-quick-outcome="1B"]')
            page.wait_for_function("document.getElementById('fieldLocationDialog').open")
            click(page,'[data-field-position="7"]'); click(page,'#useFieldingSequenceBtn')
            page.wait_for_function("scoring.plays.length===4")
            s4=page.evaluate(SNAPSHOT)
            assert_true(s4['rows'][3]['pa'][0]=='1B' and s4['rows'][3]['stats']==[1,0,1,0],f"{device['name']} direct single fields wrong")

            click(page,'#inPlayBtn'); click(page,'[data-quick-outcome="1B"]')
            page.wait_for_function("document.getElementById('fieldLocationDialog').open")
            click(page,'[data-field-position="8"]'); click(page,'#useFieldingSequenceBtn')
            page.wait_for_function("document.getElementById('playDialog').open")
            pending_dialog=page.evaluate(SNAPSHOT)
            button_text=page.locator('#savePlayBtn').text_content().strip(); notice=page.locator('#playCompletionNotice').text_content().strip()
            assert_true(len(pending_dialog['plays'])==4 and pending_dialog['rows'][4]['pa'][0]=='' and pending_dialog['pitchDisabled'],f"{device['name']} pending detail incorrectly populated")
            assert_true(button_text=='Save & Complete Batter' and 'not complete until you save' in notice.lower(),f"{device['name']} completion instruction missing")
            click(page,'#savePlayBtn'); page.wait_for_function("scoring.plays.length===5 && !document.getElementById('playDialog').open")
            final=page.evaluate(SNAPSHOT)
            assert_true(final['rows'][4]['pa'][0]=='1B' and final['rows'][4]['stats']==[1,0,1,0] and final['card'][4]['inning1'].startswith('1B'),f"{device['name']} saved detail did not populate below")
            assert_true(final['count']['pitches']==0 and not final['pitchDisabled'] and final['batter']=='Visitor 6',f"{device['name']} final count/batter reset failed")
            assert_true(final['pitcher']=={'pitches':10,'strikes':6,'balls':4,'bf':5,'hits':3,'walks':1,'k':1},f"{device['name']} pitcher totals mismatch: {final['pitcher']}")
            assert_true(not final['overflow'],f"{device['name']} page-level horizontal overflow")

            click(page,'#currentScorecardViewBtn'); page.wait_for_timeout(60)
            screenshot=PREVIEW/f"version34-pa-sync-{slug(device['name'])}.png"
            page.screenshot(path=str(screenshot),full_page=False)
            persist=page.evaluate("persistAutosaveNow('device audit',{force:true}); JSON.parse(localStorage.getItem('guariglia-scorecard-v34-autosave-current')).scoring.plays.length")
            assert_true(persist==5,f"{device['name']} autosave missed completed plays")
            filtered=[e for e in errors if 'serviceWorker' not in e and 'Failed to fetch' not in e]
            assert_true(not filtered,f"{device['name']} page errors: {filtered}")
            results.append({"device":device['name'],"viewport":[device['width'],device['height']],"passed":True,"plays":final['plays'],"score":final['totals']['away']['runs'],"pitcher":final['pitcher'],"screenshot":str(screenshot.relative_to(ROOT))})
            context.close()
        browser.close()
    REPORT.write_text(json.dumps({"version":"34.0.1 Revision 6","devices":results,"allPassed":all(x['passed'] for x in results)},indent=2))
    print(json.dumps({"passed":True,"devices":[r['device'] for r in results]},indent=2))

if __name__=='__main__': main()
