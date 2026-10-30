const https = require('https');
const fs = require('fs');

async function main() {
  const res = await fetch('https://realevate.agency/raregems');
  const html = await res.text();
  fs.writeFileSync('scratch/raregems.html', html);
  console.log('Saved HTML, length:', html.length);

  // find any tags containing "Our Selection" or "selection"
  const lines = html.split('\n');
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('selection')) {
      console.log(`Line ${i}:`, line.trim());
    }
  });

  // find css files
  const cssMatches = html.match(/https:\/\/[^"']+\.css[^"']*/g) || [];
  console.log('CSS matches:', cssMatches);
}

main().catch(console.error);
