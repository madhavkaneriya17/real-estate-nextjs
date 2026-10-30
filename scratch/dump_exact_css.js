const https = require('https');
const fs = require('fs');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function main() {
  const html = await fetch('https://realevate.agency/about');
  const cssMatches = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
  console.log('CSS files:', cssMatches);

  let combinedCss = '';
  for (const href of cssMatches) {
    const url = href.startsWith('http') ? href : `https://realevate.agency/${href.replace(/^\//, '')}`;
    const css = await fetch(url);
    combinedCss += '\n/* FILE: ' + url + ' */\n' + css;
  }

  fs.writeFileSync('scratch/realevate_about_full.css', combinedCss);
  console.log('Saved scratch/realevate_about_full.css, length:', combinedCss.length);
}

main().catch(console.error);
