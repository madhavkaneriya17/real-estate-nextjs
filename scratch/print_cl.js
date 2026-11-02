const fs = require('fs');
const content = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const idx = content.indexOf('function Cl()');
console.log(content.substring(idx, idx + 4500));

