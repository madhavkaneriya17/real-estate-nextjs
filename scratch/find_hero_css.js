const fs = require('fs');
const css = fs.readFileSync('scratch/realevate-style.css', 'utf8');
const classes = ['category-hero-scroll-stage', 'category-hero', 'hero-visual', 'category-hero-cover'];
for (const cls of classes) {
  const re = new RegExp('\\.' + cls + '[^{]*\\{[^}]*\\}', 'g');
  const m = css.match(re);
  console.log('Class: .' + cls, m ? m.slice(0, 3) : 'not found');
}
