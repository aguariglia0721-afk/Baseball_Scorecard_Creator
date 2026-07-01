const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
assert.match(app, /applySavedSnapshot\(saved,label,\{startOnSetup:true\}\)/, "startup restore must force Setup");
assert.match(app, /if\(options\.startOnSetup===true\)setPanel\("setup"\)/, "restored launch must visibly activate Setup");
assert.match(app, /restorePanel:options\.startOnSetup!==true/, "saved panel must not override Setup during launch");
assert.match(html, /styles\.css\?v=34-pa-sync-r6[\s\S]*app\.js\?v=34-pa-sync-r6/, "maintenance assets must be cache-busted");
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, "installed app cache must refresh");
assert.match(app, /service-worker\.js\?v=34-pa-sync-r6/, "installed app must request the maintenance worker");
console.log("Version 33 setup-first launch tests passed");

assert.match(app, /locationSuffix=play\.outcome==="HR"\?"":path\.join\("-"\)/, "home-run notation must omit a fielding path");

assert.match(app, /current-line-score-wrap/, "the live line score must remain inside its horizontal scroller on phones");
