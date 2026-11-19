const fs = require('fs');
const js = fs.readFileSync('scratch/realevate-app.js', 'utf8');

const idx = js.indexOf('be=') !== -1 ? js.indexOf('be=') : js.indexOf('be =');
console.log('be pos:', idx);
console.log(js.substring(idx - 100, idx + 200));

