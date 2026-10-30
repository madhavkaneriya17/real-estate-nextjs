const fs = require('fs');
const code = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const target = 'const ce={visualId:"category-hero-visual"';
const idx = code.indexOf(target);
console.log(code.substring(idx + 3500, idx + 8000));
