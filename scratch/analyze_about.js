const fs = require('fs');

const html = fs.readFileSync('scratch/about.html', 'utf8');

console.log('--- ALL SECTION TAGS ---');
const sectionMatches = html.match(/<section[\s\S]*?<\/section>/gi) || [];
sectionMatches.forEach((s, i) => {
  const openingTag = s.match(/<section[^>]*>/i)?.[0];
  const h = s.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
  console.log(`\nSection #${i + 1}: ${openingTag}`);
  console.log('  Headings:', h.map(x => x.replace(/<[^>]+>/g, '').trim()));
  console.log('  Length:', s.length);
});

console.log('\n--- MAIN & HEADER & FOOTER ---');
const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0];
if (main) {
  console.log('Main tag found, length:', main.length);
}

// Find all unique classes
const classMatches = html.match(/class=\"([^\"]+)\"/g) || [];
const uniqueClasses = new Set();
classMatches.forEach(c => {
  c.replace('class="', '').replace('"', '').split(/\s+/).forEach(cls => uniqueClasses.add(cls));
});
console.log('\n--- ABOUT-RELATED CLASSES ---');
console.log([...uniqueClasses].filter(c => c.includes('about') || c.includes('pillar') || c.includes('invest') || c.includes('hero') || c.includes('why') || c.includes('stat')));
