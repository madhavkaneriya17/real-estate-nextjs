const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');
const idx = html.indexOf('hero-visual');
console.log(html.substring(idx - 200, idx + 800));
