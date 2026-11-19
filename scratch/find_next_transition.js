const fs = require('fs');
const src = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const searchStr = 'category-next-transition';
let pos = 0;
while (true) {
  const idx = src.indexOf(searchStr, pos);
  if (idx === -1) break;
  console.log('=== MATCH AT', idx, '===');
  console.log(src.substring(idx - 300, idx + 1000));
  pos = idx + searchStr.length;
}
