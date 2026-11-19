const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');
const idx = html.indexOf('hero-bottom');
console.log(html.substring(idx - 50, idx + 800));
