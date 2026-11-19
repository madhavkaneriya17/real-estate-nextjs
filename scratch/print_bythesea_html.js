const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');
const idx = html.indexOf('category-hero-scroll-stage');
console.log(html.substring(idx - 50, idx + 800));
