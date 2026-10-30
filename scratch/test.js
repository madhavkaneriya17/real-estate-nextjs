async function test() {
  const r = await fetch('https://unsplash.com/s/photos/mediterranean-villa', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const t = await r.text();
  console.log('HTML length:', t.length);
  // Look for JSON or image tags
  const imgMatches = t.match(/src="([^"]+images\.unsplash\.com[^"]+)"/g) || [];
  console.log('img src matches:', imgMatches.length);
  imgMatches.slice(0, 5).forEach(m => console.log(m));

  const jsonMatches = t.match(/"raw":"([^"]+)"/g) || [];
  console.log('json raw matches:', jsonMatches.length);
  jsonMatches.slice(0, 5).forEach(m => console.log(m));
}
test();
