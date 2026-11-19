const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');
const matches = html.match(/class="[^"]*"/g) || [];
const heroMatches = matches.filter(m => m.includes('hero') || m.includes('stage') || m.includes('track') || m.includes('visual'));
console.log('bythesea hero classes:', heroMatches);
