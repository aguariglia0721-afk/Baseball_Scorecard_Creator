const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.match(app, /initializePersistentStartup\(\)/, "startup must attempt to restore the current game");
assert.match(app, /localStorage\.setItem\(AUTOSAVE_STORAGE_KEY/, "session changes must persist automatically");
assert.match(app, /AUTOSAVE_BACKUP_KEY/, "a previous recovery checkpoint must be retained");
assert.doesNotMatch(app, /initializeBlankStartup\(\)/, "startup must not erase the current game");
assert.match(app, /pagehide[\s\S]*persistAutosaveNow/, "leaving the page must flush autosave");
assert.match(app, /visibilitychange[\s\S]*persistAutosaveNow/, "backgrounding the app must flush autosave");
assert.match(app, /beforeunload[\s\S]*persistAutosaveNow/, "closing the browser must flush autosave");
assert.match(app, /Reset the entire game\?/, "reset confirmation must describe a complete reset");
assert.match(html, /Reset Entire Game/, "reset button must describe the complete reset");
assert.match(html, /app\.js\?v=34-pa-sync-r6/, "app JavaScript must be cache-busted");
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/, "service-worker cache must be bumped");

console.log("continuous startup recovery and reset tests passed");
