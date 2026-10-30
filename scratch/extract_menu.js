const fs = require('fs');

async function run() {
  const res = await fetch('https://realevate.agency/bythesea');
  const html = await res.text();

  const scriptMatches = [...html.matchAll(/src=["']([^"']+\.js[^"']*)["']/g)].map(m => m[1]);
  console.log('Script links:', scriptMatches);

  for (const src of scriptMatches) {
    const fullUrl = src.startsWith('http') ? src : 'https://realevate.agency/' + src;
    try {
      const sRes = await fetch(fullUrl);
      const sText = await sRes.text();
      fs.writeFileSync('scratch/' + src.split('/').pop().split('?')[0], sText);
      console.log('Saved', src, 'length:', sText.length);

      // Search for nav-menu
      const idx = sText.indexOf('nav-menu');
      if (idx !== -1) {
        console.log(`Found nav-menu in ${src} at ${idx}:`);
        console.log(sText.slice(Math.max(0, idx - 200), Math.min(sText.length, idx + 800)));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

run().catch(console.error); 