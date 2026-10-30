async function searchWiki(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'AntigravityIDE/1.0 (contact@example.com)' } });
  const data = await res.json();
  if (!data.query || !data.query.pages) {
    console.log('No pages found for', query);
    return;
  }
  for (const page of Object.values(data.query.pages)) {
    const info = page.imageinfo && page.imageinfo[0];
    if (info && (info.mime === 'image/jpeg' || info.mime === 'image/png')) {
      console.log(page.title, info.width + 'x' + info.height, info.url);
    }
  }
}

async function main() {
  console.log('--- Bay of Kotor luxury ---');
  await searchWiki('Bay of Kotor luxury villa panoramic');
  console.log('--- Amalfi coast panoramic villa ---');
  await searchWiki('Amalfi coast luxury villa sea view');
  console.log('--- Mediterranean luxury villa sea ---');
  await searchWiki('Mediterranean luxury villa sea view');
}
main();
