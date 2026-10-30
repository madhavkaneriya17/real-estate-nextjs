const fs = require('fs');
const html = fs.readFileSync('scratch/bythesea.html', 'utf8');

// Find all elements under page-stage or body
const stageMatch = html.match(/<div id="page-stage"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/i) || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (stageMatch) {
  // list direct children tags of stage or sections
  const sections = stageMatch[1].match(/<(?:section|div|header|footer)[^>]*class="[^"]*"[^>]*>/gi);
  console.log('SECTIONS/BLOCKS:');
  if (sections) {
    sections.slice(0, 40).forEach(s => console.log(s));
  }
}
