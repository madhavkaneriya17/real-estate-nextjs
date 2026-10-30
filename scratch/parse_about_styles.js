const fs = require('fs');

const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf-8');

// Find all :root or body variables related to category, padding, spacing, layout-size-scale
const varMatches = css.match(/--[a-zA-Z0-9_-]+:[^;{}]+;/g) || [];
const spacingVars = varMatches.filter(v => /pad|gap|margin|scale|width|height|size/i.test(v));
console.log('SPACING VARIABLES:');
console.log([...new Set(spacingVars)].slice(0, 40).join('\n'));

// Find rules for about-page, about-intro, category-outro, category-quote, category-values, category-cta
const rules = css.split('}');
console.log('\n--- TARGET RULES ---');
rules.forEach(rule => {
  const trimmed = rule.trim();
  if (
    trimmed.includes('.about-intro') ||
    trimmed.includes('.about-page') ||
    trimmed.includes('.category-outro') ||
    trimmed.includes('.category-quote') ||
    trimmed.includes('.category-values') ||
    trimmed.includes('.category-cta') ||
    trimmed.includes('.about-video')
  ) {
    // Only print if contains layout properties
    if (/padding|margin|gap|height|width|display|align|justify|grid/i.test(trimmed)) {
      console.log(trimmed.replace(/\s+/g, ' ') + '}\n');
    }
  }
});
