const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');

// Find h1, h2, h3, h4, quotes
const titles = html.match(/<(?:h[1-6]|p|blockquote)[^>]*>([\s\S]*?)<\/(?:h[1-6]|p|blockquote)>/gi);
console.log('TITLES / TEXT SNIPPETS:');
if (titles) {
  titles.slice(0, 30).forEach(t => console.log(t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));
}
