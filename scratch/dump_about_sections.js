const fs = require('fs');
const html = fs.readFileSync('scratch/about.html', 'utf8');

// Find all sections
const sectionMatches = html.match(/<section[\s\S]*?<\/section>/gi) || [];
sectionMatches.forEach((s, i) => {
  console.log(`\n================= SECTION ${i + 1} =================`);
  console.log(s);
});

// Also check header and footer
console.log('\n================= HEADER =================');
console.log(html.match(/<header[\s\S]*?<\/header>/gi)?.[0] || 'no header tag');

console.log('\n================= FOOTER =================');
console.log(html.match(/<footer[\s\S]*?<\/footer>/gi)?.[0] || 'no footer tag');

console.log('\n================= NAV =================');
console.log(html.match(/<nav[\s\S]*?<\/nav>/gi)?.[0] || 'no nav tag');
