const fs = require('fs');
const css = fs.readFileSync('scratch/realevate-style.css', 'utf8');
const match = css.match(/\.category-hero [^{]*\{[^}]*\}/g) || [];
console.log('.category-hero child rules:');
match.slice(0, 20).forEach(m => console.log(m));
