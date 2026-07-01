#!/usr/bin/env python3
import base64
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time
from urllib.request import urlopen
from websocket import create_connection

ROOT = Path(__file__).resolve().parent.parent
PREVIEW = ROOT / "preview"
REPORT = ROOT / "VERSION_33_FIELD_MAP_MOBILE_REPORT.json"
PREVIEW.mkdir(exist_ok=True)

VIEWPORTS = [
    {"name": "iPhone SE portrait", "width": 320, "height": 568, "mobile": True},
    {"name": "iPhone compact portrait", "width": 360, "height": 800, "mobile": True},
    {"name": "iPhone standard portrait", "width": 390, "height": 844, "mobile": True},
    {"name": "iPhone Pro Max portrait", "width": 430, "height": 932, "mobile": True},
    {"name": "iPhone landscape", "width": 844, "height": 390, "mobile": True},
    {"name": "iPad mini portrait", "width": 768, "height": 1024, "mobile": True},
    {"name": "iPad 10th gen portrait", "width": 820, "height": 1180, "mobile": True},
    {"name": "iPad Pro 11 portrait", "width": 834, "height": 1194, "mobile": True},
    {"name": "iPad landscape", "width": 1180, "height": 820, "mobile": True},
    {"name": "iPad Pro 12.9 portrait", "width": 1024, "height": 1366, "mobile": True},
    {"name": "iPad Pro 12.9 landscape", "width": 1366, "height": 1024, "mobile": True},
]

AUDIT_JS = r'''
(() => {
  const finalize = result => {
    result.userAgent = navigator.userAgent;
    document.title = 'FIELD_AUDIT_' + btoa(unescape(encodeURIComponent(JSON.stringify(result))));
  };
  try {
    const mode = '__AUDIT_MODE__';
    document.querySelector('.step[data-panel="scoring"]')?.click();
    document.querySelector('[data-quick-outcome="1B"]')?.click();
    const dialog = document.getElementById('fieldLocationDialog');
    const form = document.getElementById('fieldLocationForm');
    const grid = document.getElementById('fieldLocationGrid');
    const buttons = [...document.querySelectorAll('.field-location-button')];
    const rect = dialog.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const buttonRects = buttons.map(button => button.getBoundingClientRect());
    const rectByPosition = Object.fromEntries(buttons.map(button => {
      const box = button.getBoundingClientRect();
      return [button.dataset.fieldPosition,{left:box.left,right:box.right,top:box.top,bottom:box.bottom,x:box.left+box.width/2,y:box.top+box.height/2,width:box.width,height:box.height}];
    }));
    const overlaps = (a,b) => Math.hypot(a.x-b.x,a.y-b.y) < ((Math.min(a.width,a.height)+Math.min(b.width,b.height))/2)-2;
    const pairs = [];
    for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++)pairs.push([rectByPosition[buttons[i].dataset.fieldPosition],rectByPosition[buttons[j].dataset.fieldPosition]]);
    const p=rectByPosition;
    const standardAlignment = Boolean(p['1']&&p['2']&&p['3']&&p['4']&&p['5']&&p['6']&&p['7']&&p['8']&&p['9']) &&
      p['8'].y < p['7'].y && p['8'].y < p['9'].y && p['7'].x < p['8'].x && p['8'].x < p['9'].x &&
      p['6'].x < p['1'].x && p['1'].x < p['4'].x && p['6'].y < p['1'].y && p['4'].y < p['1'].y &&
      p['5'].x < p['1'].x && p['1'].x < p['3'].x && p['2'].y > p['1'].y;
    const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const checks = {
      dialogOpen: Boolean(dialog.open),
      fieldSvgPresent: Boolean(grid.querySelector('svg.field-map-art')),
      buttonCount: buttons.length,
      positionsComplete: buttons.map(button => button.dataset.fieldPosition).join('') === '123456789',
      touchTargets: buttonRects.every(box => box.width >= 44 && box.height >= 44),
      noHorizontalOverflow: docWidth <= window.innerWidth + 1,
      dialogInsideViewport: rect.left >= -1 && rect.right <= window.innerWidth + 1 && rect.top >= -1 && rect.bottom <= window.innerHeight + 1,
      fieldVisible: gridRect.width >= 180 && gridRect.height >= 180,
      fieldContainsButtons: buttonRects.every(box => box.left >= gridRect.left - 1 && box.right <= gridRect.right + 1 && box.top >= gridRect.top - 1 && box.bottom <= gridRect.bottom + 1),
      standardAlignment,
      noButtonOverlap: pairs.every(([a,b]) => !overlaps(a,b)),
      formScrollableWhenNeeded: form.scrollHeight <= form.clientHeight + 1 || ['auto','scroll'].includes(getComputedStyle(form).overflowY),
      titleVisible: document.getElementById('fieldLocationTitle').textContent.includes('Where was the ball hit?')
    };
    const openPassed = checks.dialogOpen && checks.fieldSvgPresent && checks.buttonCount === 9 && checks.positionsComplete && checks.touchTargets && checks.noHorizontalOverflow && checks.dialogInsideViewport && checks.fieldVisible && checks.fieldContainsButtons && checks.standardAlignment && checks.noButtonOverlap && checks.formScrollableWhenNeeded && checks.titleVisible;
    if (mode === 'flow') {
      document.querySelector('[data-field-position="7"]')?.click();
      document.getElementById('saveNowBtn')?.click();
      const playLogText = document.getElementById('playLog')?.textContent || '';
      const stored = Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).some(key => (localStorage.getItem(key) || '').includes('"fieldLocation":"7"'));
      const flow = {
        dialogClosed: !dialog.open,
        notationSaved: playLogText.includes('1B7'),
        fullLocationSaved: playLogText.includes('Field location: 7 — Left Field (LF)'),
        autosaveContainsLocation: stored,
        pageStillContained: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= window.innerWidth + 1
      };
      flow.passed = Object.values(flow).every(Boolean);
      finalize({mode, viewport:{width:window.innerWidth,height:window.innerHeight}, checks, openPassed, flow, passed:openPassed && flow.passed});
    } else {
      finalize({mode, viewport:{width:window.innerWidth,height:window.innerHeight}, checks, passed:openPassed});
    }
  } catch (error) {
    finalize({passed:false,error:String(error && error.stack || error)});
  }
})();
'''

STORAGE_PRELUDE = r'''
(() => {
  const data = new Map();
  const storage = {
    get length(){ return data.size; },
    key(i){ return Array.from(data.keys())[i] ?? null; },
    getItem(k){ k=String(k); return data.has(k) ? data.get(k) : null; },
    setItem(k,v){ data.set(String(k),String(v)); },
    removeItem(k){ data.delete(String(k)); },
    clear(){ data.clear(); }
  };
  Object.defineProperty(window,'localStorage',{value:storage});
  window.alert=()=>{};
  window.confirm=()=>true;
})();
'''


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def slug(text):
    return "-".join("".join(c.lower() if c.isalnum() else " " for c in text).split())


class CDP:
    def __init__(self, url):
        self.ws = create_connection(url, timeout=15)
        self.next_id = 1

    def call(self, method, params=None):
        request_id = self.next_id
        self.next_id += 1
        self.ws.send(json.dumps({"id": request_id, "method": method, "params": params or {}}))
        while True:
            response = json.loads(self.ws.recv())
            if response.get("id") == request_id:
                if "error" in response:
                    raise RuntimeError(f"{method}: {response['error']}")
                return response.get("result", {})

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass


def wait_json(url, timeout=20):
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            with urlopen(url, timeout=1) as response:
                return json.load(response)
        except Exception as exc:
            last_error = exc
            time.sleep(0.1)
    raise RuntimeError(f"Timed out waiting for Chromium: {last_error}")


def wait_for_audit(cdp, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        result = cdp.call("Runtime.evaluate", {"expression": "document.title", "returnByValue": True})
        title = result.get("result", {}).get("value", "")
        if title.startswith("FIELD_AUDIT_"):
            return json.loads(base64.b64decode(title[len("FIELD_AUDIT_"):]).decode("utf-8"))
        time.sleep(0.05)
    debug = cdp.call("Runtime.evaluate", {"expression": "JSON.stringify({title:document.title,ready:document.readyState,body:document.body&&document.body.innerText.slice(0,500)})", "returnByValue": True})
    raise RuntimeError(f"Audit did not complete: {debug}")


def build_inline_html(mode):
    html = (ROOT / "index.html").read_text()
    css = (ROOT / "styles.css").read_text()
    app = (ROOT / "app.js").read_text()
    html = re.sub(r'<link rel="stylesheet"[^>]*>', '', html)
    html = re.sub(r'<script src="[^"]+"></script>', '', html)
    html = html.replace('src="assets/guariglia-crest.gif"', 'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="')
    html = html.replace('</head>', f'<style>{css}</style><script>{STORAGE_PRELUDE}</script></head>')
    audit = AUDIT_JS.replace('__AUDIT_MODE__', mode)
    html = html.replace('</body>', f'<script>{app}</script><script>{audit}</script></body>')
    return html


def run_viewport(cdp, viewport, mode="open", screenshot=True):
    cdp.call("Emulation.setDeviceMetricsOverride", {
        "width": viewport["width"], "height": viewport["height"], "deviceScaleFactor": 1,
        "mobile": viewport.get("mobile", True), "screenWidth": viewport["width"], "screenHeight": viewport["height"]
    })
    cdp.call("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
    cdp.call("Page.navigate", {"url": "about:blank"})
    deadline = time.time() + 5
    while time.time() < deadline:
        ready = cdp.call("Runtime.evaluate", {"expression": "document.readyState", "returnByValue": True}).get("result", {}).get("value")
        if ready == "complete":
            break
        time.sleep(0.02)
    frame = cdp.call("Page.getFrameTree")["frameTree"]["frame"]["id"]
    cdp.call("Page.setDocumentContent", {"frameId": frame, "html": build_inline_html(mode)})
    result = wait_for_audit(cdp)
    if screenshot:
        image = cdp.call("Page.captureScreenshot", {"format": "png", "fromSurface": True, "captureBeyondViewport": False})
        file = PREVIEW / f"version33-field-map-{slug(viewport['name'])}.png"
        file.write_bytes(base64.b64decode(image["data"]))
        result["screenshot"] = str(file.relative_to(ROOT)).replace(os.sep, "/")
    return result


def main():
    debug_port = free_port()
    profile = tempfile.mkdtemp(prefix="scorecard-chromium-")
    log_path = Path(profile) / "chromium.log"
    log_file = log_path.open("w")
    process = subprocess.Popen([
        "xvfb-run", "-a", "/usr/bin/chromium", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
        "--disable-background-networking", "--disable-sync", "--no-first-run", "--no-default-browser-check",
        "--remote-allow-origins=*", f"--remote-debugging-port={debug_port}", f"--user-data-dir={profile}", "about:blank"
    ], stdout=log_file, stderr=subprocess.STDOUT)
    cdp = None
    try:
        pages = wait_json(f"http://127.0.0.1:{debug_port}/json/list")
        page = next(item for item in pages if item.get("type") == "page")
        cdp = CDP(page["webSocketDebuggerUrl"])
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")

        results = []
        for viewport in VIEWPORTS:
            audit = run_viewport(cdp, viewport, "open", True)
            results.append({**viewport, **audit})
            print("PASS" if audit.get("passed") else "FAIL", viewport["name"], f"{viewport['width']}x{viewport['height']}")

        phone_flow = run_viewport(cdp, {"name":"iPhone standard flow","width":390,"height":844,"mobile":True}, "flow", False)
        tablet_flow = run_viewport(cdp, {"name":"iPad Pro 11 flow","width":834,"height":1194,"mobile":True}, "flow", False)
        passed = all(item.get("passed") for item in results) and phone_flow.get("passed") and tablet_flow.get("passed")
        report = {
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "browser": "Chromium 144 via Chrome DevTools Protocol",
            "scope": "Version 33 visual baseball-field position popup and save flow across representative iPhone and iPad portrait/landscape viewports",
            "passed": bool(passed),
            "viewports": results,
            "flowChecks": {"phone": phone_flow, "tablet": tablet_flow}
        }
        REPORT.write_text(json.dumps(report, indent=2))
        if not passed:
            raise SystemExit(1)
    finally:
        if cdp:
            try:
                cdp.call("Browser.close")
            except Exception:
                pass
            cdp.close()
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        log_file.close()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    main()
