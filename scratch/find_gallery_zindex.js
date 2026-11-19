const fs = require('fs');
const css = fs.readFileSync('app/serene-greens/serene-greens.css', 'utf8');
const match = css.match(/\.category-gallery[^{]*\{[^}]*\}/g) || [];
console.log('category-gallery in serene-greens.css:');
match.forEach(m => console.log(m));
