const fs = require('fs');
const html = fs.readFileSync('scratch/about.html', 'utf8');
const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf8');

// 1. Quote section
const qMatch = html.match(/<div class="category-quote"[\s\S]*?<\/div>/i);
console.log('=== EXACT QUOTE HTML ===');
console.log(qMatch ? qMatch[0] : 'not found');

// 2. The process section
const pIndex = html.indexOf('(The process)');
console.log('\n=== EXACT PROCESS HTML ===');
if (pIndex !== -1) {
  const start = html.lastIndexOf('<div class="about-intro__grid', pIndex);
  const end = html.indexOf('</div>', pIndex) + 6;
  console.log(html.slice(start, end));
} else {
  console.log('not found');
}

// 3. Search CSS for category-quote and process rules
console.log('\n=== CSS FOR category-quote ===');
const qRules = [...css.matchAll(/([^{}]+category-quote[^{}]*)\{([^{}]+)\}/g)];
qRules.forEach(([, sel, body]) => console.log(sel.trim(), '=>', body.trim()));

console.log('\n=== CSS FOR about-intro__title ===');
const tRules = [...css.matchAll(/([^{}]+about-intro__title[^{}]*)\{([^{}]+)\}/g)];
tRules.forEach(([, sel, body]) => console.log(sel.trim(), '=>', body.trim()));
