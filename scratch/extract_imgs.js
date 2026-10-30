const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');

const imgs = html.match(/src="([^"]+)"/g);
console.log('UNIQUE IMAGES:');
const unique = new Set(imgs ? imgs.map(i => i.replace(/src="([^"]+)"/, '$1')) : []);
Array.from(unique).forEach(src => console.log(src));
