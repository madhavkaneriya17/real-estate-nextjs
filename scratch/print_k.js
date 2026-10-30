const fs = require('fs');
const content = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const start = content.indexOf('let K=function(N){');
const end = content.indexOf('return}const m=window.matchMedia', start);
console.log(content.substring(start, end));

