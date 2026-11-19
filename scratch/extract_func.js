const fs = require('fs');
const src = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const start = 167000;
const end = 172000;
fs.writeFileSync('scratch/transition_code.js', src.substring(start, end));
console.log('Saved transition_code.js, length:', end - start);
