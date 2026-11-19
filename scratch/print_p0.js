const fs = require('fs');
const code = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const target = 'p0(';
let idx = 0;
while ((idx = code.indexOf(target, idx)) !== -1) {
  console.log('p0 found at', idx);
  console.log(code.substring(idx - 100, idx + 400));
  idx += target.length;
}
