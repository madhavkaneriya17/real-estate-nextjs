const https = require('https');

https.get('https://realevate.agency/about', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    // Find sections in html
    const sectionTags = [...data.matchAll(/<(?:section|div)[^>]*class="([^"]*about[^"]*|[^"]*category[^"]*|[^"]*pillar[^"]*|[^"]*quote[^"]*)"[^>]*>/gi)].map(m => m[0]);
    console.log('HTML SECTIONS:');
    console.log(sectionTags.join('\n'));

    const cssHrefs = [...data.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
    for (const href of cssHrefs) {
      const url = href.startsWith('http') ? href : `https://realevate.agency/${href.replace(/^\//, '')}`;
      await new Promise(resolve => {
        https.get(url, (cRes) => {
          let cssData = '';
          cRes.on('data', c => cssData += c);
          cRes.on('end', () => {
            const rules = cssData.match(/[^{}]*(?:padding|margin)[^{]*\{[^}]*\}/g) || [];
            const aboutRules = rules.filter(r => /about|quote|pillar|process|philosophy|category-cta|video/i.test(r));
            console.log('\n--- RELEVANT CSS RULES IN ' + url + ' ---');
            console.log(aboutRules.slice(0, 30).join('\n'));
            resolve();
          });
        });
      });
    }
  });
});
