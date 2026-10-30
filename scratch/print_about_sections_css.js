const fs = require('fs');

const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf-8');
const rules = css.split('}');

const selectors = [
  'about-intro',
  'about-video',
  'category-outro',
  'category-cta',
  'category-next',
  'category-parallax',
  'category-quote'
];

selectors.forEach(sel => {
  console.log('=== SELECTOR: ' + sel + ' ===');
  rules.forEach(r => {
    const trimmed = r.trim();
    const [selPart, stylePart] = trimmed.split('{');
    if (selPart && selPart.includes('.' + sel) && stylePart) {
      if (/padding|margin|gap|height/i.test(stylePart)) {
        console.log(trimmed.replace(/\s+/g, ' ') + '}');
      }
    }
  });
});
