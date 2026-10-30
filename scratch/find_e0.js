const fs = require('fs');
const code = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const idx = code.indexOf('function E0()');
console.log(code.substring(idx, idx + 1500));

