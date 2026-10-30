const fs = require('fs');
const html = fs.readFileSync('scratch/about.html', 'utf8');

const regex = /(?:src|href|data-[a-z0-9-]+)="([^"]+\.(?:mp4|webm|avif|jpg|jpeg|png|svg|webp)[^"]*)"/gi;
let m;
const found = new Set();
while ((m = regex.exec(html)) !== null) {
  found.add(m[1]);
}
console.log('Media found:');
found.forEach(f => console.log(f));

// search for video url in js
const js = fs.readFileSync('scratch/realevate-app.js', 'utf8');
const vidMatches = js.match(/https?:\/\/[^"']+\.(?:mp4|webm)/gi) || [];
console.log('\nVideo matches in js:', vidMatches);

// also search for video paths like assets/*.mp4
const vidLocal = js.match(/[a-zA-Z0-9_\-\/]+\.(?:mp4|webm)/gi) || [];
console.log('\nLocal video matches in js:', [...new Set(vidLocal)]);
