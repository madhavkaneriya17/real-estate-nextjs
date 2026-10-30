const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '../public/assets/selection/raregems');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed with status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

// Curated 4K images for Limited Edition (Iconic skyscrapers, futuristic branded residences, luxury interiors)
const images = [
  {
    name: 'limited-edition-hero-cover-4k.jpg',
    // Iconic ultra-modern luxury skyscraper rising above mist / sunset
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=2560&q=90'
  },
  {
    name: 'limited-edition-parallax-1-4k.jpg',
    // Dramatic sculptural architectural landmark
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=90'
  },
  {
    name: 'limited-edition-parallax-2-4k.jpg',
    // Ultra-luxury penthouse night skyline view
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2560&q=90'
  },
  {
    name: 'limited-edition-brand-4k.jpg',
    // Minimalist branded residence columns and sunlight
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=90'
  },
  {
    name: 'limited-edition-lifestyle-4k.jpg',
    // Haute luxury lifestyle interior and bespoke materials
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90'
  },
  {
    name: 'limited-edition-skyline-4k.jpg',
    // Iconic tower architectural destination
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=90'
  }
];

async function run() {
  for (const img of images) {
    const dest = path.join(targetDir, img.name);
    console.log('Downloading ' + img.name + '...');
    try {
      await downloadImage(img.url, dest);
      const st = fs.statSync(dest);
      console.log('Success ' + img.name + ' (' + (st.size / 1024).toFixed(0) + ' KB)');
    } catch (e) {
      console.error('Error downloading ' + img.name + ':', e.message);
    }
  }
  console.log('Done downloading 4K images!');
}

run();
