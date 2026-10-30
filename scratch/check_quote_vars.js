const fs = require('fs');
const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf8');

const vars = [
  '--display-font',
  '--sans-font',
  '--h2-size',
  '--h2-line-height',
  '--h2-letter-spacing',
  '--desktop-h2-size',
  '--desktop-h2-line-height',
  '--desktop-h2-letter-spacing',
  '--category-quote-max-width',
  '--desktop-category-quote-max-width',
  '--category-quote-image-size',
  '--desktop-category-quote-image-size',
  '--category-quote-gap',
  '--desktop-category-quote-gap',
  '--category-color',
  '--brand-navy'
];

for (const v of vars) {
  const regex = new RegExp(`${v}:\\s*([^;]+);`, 'g');
  let m;
  const vals = new Set();
  while ((m = regex.exec(css)) !== null) {
    vals.add(m[1].trim());
  }
  console.log(`${v} =>`, [...vals]);
}
