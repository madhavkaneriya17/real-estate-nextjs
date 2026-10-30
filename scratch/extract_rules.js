const fs = require('fs');
const css = fs.readFileSync('scratch/realevate-style.css', 'utf8');

const regex = /(?:[^{}]*(?:category-page|category-by-the-sea)[^{}]*)\{([^}]+)\}/g;
let m;
const results = [];
while ((m = regex.exec(css)) !== null) {
  results.push({ selector: m[0].split('{')[0].trim(), rules: m[1].trim() });
}

console.log('FOUND RULES:', results.length);
results.slice(0, 25).forEach(r => {
  if (r.rules.includes('color') || r.rules.includes('background') || r.rules.includes('font')) {
    console.log('---');
    console.log(r.selector);
    console.log(r.rules);
  }
});
