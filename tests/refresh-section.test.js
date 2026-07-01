const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.match(app, /async function refreshScheduleAndClear\(\)[\s\S]*blankEntireGame\([\s\S]*await loadSchedule\(\)/,
  "Refresh Schedule must clear the entire current game before reloading the schedule");
assert.match(app, /blankEntireGame\([^;]+,false\)/,
  "Refresh Schedule must not invoke panel navigation or its scroll-to-top behavior");
assert.match(app, /restoreRefreshPosition\(refreshButton,previousScrollX,previousScrollY\)/,
  "Refresh Schedule must restore the exact viewport position after loading");
assert.match(app, /root\.style\.scrollBehavior="auto"[\s\S]*window\.scrollTo\(previousScrollX,previousScrollY\)/,
  "Refresh restoration must bypass the page smooth-scroll rule");
assert.match(app, /focus\(\{preventScroll:true\}\)/,
  "Refresh Schedule must restore keyboard focus without moving the viewport");
assert.match(app, /refreshGamesBtn"\)\.addEventListener\("click",refreshScheduleAndClear\)/,
  "Refresh button must use the clear-and-refresh handler");
assert.match(app, /Game information loaded[\s\S]*setPanel\("setup"\)/,
  "Selected-game import must remain on Section 1 Setup");
assert.doesNotMatch(app, /Game information loaded[\s\S]{0,400}setPanel\("lineups"\)/,
  "Selected-game import must not jump to the Lineups section");
assert.match(html, /Refresh Schedule clears the current game before reloading/,
  "Section 1 should explain the refresh behavior");
assert.match(html, /app\.js\?v=34-pa-sync-r6/,
  "Version 27 app JavaScript must be cache-busted");

console.log("refresh clearing and Section 1 retention tests passed");
