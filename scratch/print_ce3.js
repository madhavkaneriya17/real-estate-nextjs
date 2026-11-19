const fs = require('fs');
const code = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const target = 'visualId:"category-hero-visual"';
const idx = code.indexOf(target);
console.log(code.substring(idx + 5000, idx + 7500));
