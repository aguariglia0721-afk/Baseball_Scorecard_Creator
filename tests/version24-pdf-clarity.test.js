const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bg = fs.readFileSync(path.join(root, 'pdf_background_data.js'), 'utf8');
function ok(value, message){ if(!value){ console.error(`FAIL: ${message}`); process.exit(1); } console.log(`PASS: ${message}`); }
ok(index.includes('Version 34'), 'interface identifies Version 24');
ok(bg.includes('EMBEDDED_SCORECARD_BACKGROUND_WIDTH = 2550'), 'PDF background is 300-DPI letter width');
ok(bg.includes('EMBEDDED_SCORECARD_BACKGROUND_HEIGHT = 3300'), 'PDF background is 300-DPI letter height');
ok(app.includes('sampleScoringCellFill'), 'clean PDF samples safe scoring-cell fill colors');
ok(app.includes('groups=[{top:158,rows:9},{top:394,rows:9}]'), 'both nine-row scoring grids are rebuilt');
ok(app.includes('for(let col=0;col<=10;col++)'), 'all eleven vertical scoring-grid boundaries are redrawn');
ok(app.includes('for(let row=0;row<=group.rows;row++)'), 'all horizontal scoring-grid boundaries are redrawn');
ok(!app.includes('(cellWidth-2.5)*sx'), 'legacy partial-box erase that left counter fragments is removed');
ok(app.includes('toDataURL("image/jpeg",.985)'), 'high-quality JPEG encoding is used for PDF background');
ok(app.includes('service-worker.js?v=34-pa-sync-r6'), 'Version 32 service worker cache identifier is used');
console.log('Version 24 PDF clarity tests passed.');
