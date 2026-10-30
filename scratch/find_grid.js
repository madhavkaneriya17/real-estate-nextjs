const fs = require('fs');
const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf8');

function findCss(selector) {
  let pos = 0;
  while (true) {
    const idx = css.indexOf(selector, pos);
    if (idx === -1) break;
    const start = Math.max(0, css.lastIndexOf('}', idx) + 1);
    const end = css.indexOf('}', idx);
    console.log(`=== FOUND "${selector}" ===\n`, css.substring(start, end + 1).trim());
    pos = idx + selector.length;
    if (pos > 100000) break;
  }
}

findCss('page-grid');

