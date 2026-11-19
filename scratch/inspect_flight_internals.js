const fs = require('fs');
const js = fs.readFileSync('scratch/realevate-app.js', 'utf8');

['function Hw(', 'function Mw(', 'function zw('].forEach(fn => {
  const idx = js.indexOf(fn);
  console.log(`\n=== ${fn} ===`);
  if (idx !== -1) {
    console.log(js.substring(idx, idx + 800));
  } else {
    console.log('not found');
  }
});

