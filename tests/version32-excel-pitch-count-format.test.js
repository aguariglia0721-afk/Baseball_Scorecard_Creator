const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.match(app, /function excelCountCsvValue\(count\)\{return `="\$\{num\(count\?\.balls\)\}-\$\{num\(count\?\.strikes\)\}"`;\}/,
  'pitch count CSV values must be forced to Excel text');
assert.match(app, /excelCountCsvValue\(e\.countBefore\),excelCountCsvValue\(e\.countAfter\)/,
  'both count columns must use Excel-safe text values');
assert.match(app, /new Blob\(\["\\uFEFF"\+rows\.map/,
  'pitch log CSV must include a UTF-8 BOM for Excel');
assert.match(html, /app\.js\?v=34-pa-sync-r6/,
  'updated app JavaScript must be cache-busted');
assert.match(worker, /guariglia-scorecard-v34-pa-sync-r6/,
  'service worker cache must refresh for the Excel count fix');
assert.match(app, /service-worker\.js\?v=34-pa-sync-r6/,
  'installed apps must request the refreshed service worker');

function csvCell(value){const text=String(value??'');return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;}
function excelCountCsvValue(count){return `="${Number(count?.balls)||0}-${Number(count?.strikes)||0}"`;}
const encoded = csvCell(excelCountCsvValue({balls:1,strikes:2}));
assert.equal(encoded, '"=""1-2"""', 'Excel-safe CSV encoding must visibly evaluate to 1-2 rather than a date');

console.log('Version 32 Excel pitch count formatting tests passed');
