const fs = require('fs');
const content = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const key = 'scroll-expand';
let idx = content.indexOf(key);
while (idx !== -1) {
  console.log('INDEX:', idx);
  console.log(content.substring(idx - 100, idx + 1500));
  console.log('='.repeat(50));
  idx = content.indexOf(key, idx + 1);
  if (idx > 300000) break;
}

