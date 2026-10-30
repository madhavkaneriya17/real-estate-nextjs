async function run() {
  const queries = ['mediterranean-villa', 'luxury-sea-view-villa', 'amalfi-coast-villa', 'luxury-infinity-pool-ocean'];
  const found = new Set();
  for (const q of queries) {
    try {
      const res = await fetch(`https://unsplash.com/s/photos/${q}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_-]+/g) || [];
      matches.forEach(m => found.add(m));
    } catch (e) {
      console.error('Error fetching', q, e.message);
    }
  }

  console.log('Total unique photo bases found:', found.size);
  Array.from(found).slice(0, 20).forEach(m => console.log(m));
}

run();
