const fs = require('fs');

const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf-8');

// Find all occurrences of :root or body or .category-page declaring variables
const blocks = css.match(/(?::root|body|\.category-page)[^{]*\{[^}]*\}/g) || [];
blocks.forEach(b => {
  if (b.includes('--category-section-pad') || b.includes('--grid-padding') || b.includes('--grid-gap')) {
    console.log(b + '\n');
  }
});
