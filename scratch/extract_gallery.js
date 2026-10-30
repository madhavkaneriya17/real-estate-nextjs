const fs = require('fs');
const css = fs.readFileSync('scratch/realevate-style.css', 'utf8');

const regex = /(?:[^{}]*(?:category-gallery|category-outro|projects-slider)[^{}]*)\{([^}]+)\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
  if (m[1].includes('color') || m[1].includes('background')) {
    console.log('---');
    console.log(m[0].split('{')[0].trim());
    console.log(m[1].trim());
  }
}
