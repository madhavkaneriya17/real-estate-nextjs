const fs = require('fs');
const code = fs.readFileSync('scratch/realevate-app.js', 'utf8');

// find about-page
let pos = 0;
while (true) {
  const idx = code.indexOf('about-page', pos);
  if (idx === -1) break;
  console.log('--- FOUND at', idx);
  console.log(code.substring(Math.max(0, idx - 150), idx + 250));
  pos = idx + 10;
}

