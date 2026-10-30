const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');

// Find body class and inline styles
const bodyMatch = html.match(/<body[^>]*>/i);
console.log('BODY TAG:', bodyMatch ? bodyMatch[0] : 'not found');

// Find main classes
const classMatches = html.match(/class="([^"]+)"/g);
const uniqueClasses = new Set();
if (classMatches) {
  classMatches.forEach(c => {
    c.replace(/class="([^"]+)"/, '$1').split(/\s+/).forEach(cls => uniqueClasses.add(cls));
  });
}
console.log('SOME CLASSES:', Array.from(uniqueClasses).slice(0, 30));

// Check any inline styles or style tags
const styleTags = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
console.log('STYLE TAGS COUNT:', styleTags ? styleTags.length : 0);
if (styleTags) {
  styleTags.forEach((s, i) => console.log(`STYLE ${i}:`, s.slice(0, 200)));
}
