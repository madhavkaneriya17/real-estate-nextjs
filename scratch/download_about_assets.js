const fs = require('fs');
const path = require('path');

const filesToDownload = [
  'video-thumb.avif',
  'marble-about.avif',
  'strategic-location-converted.avif',
  'added-value-converted.avif',
  'masterplan-development-converted.avif',
  'exceptional-management-converted.avif',
  'about-villa-bottom.avif',
  'selection/bythesea/bythesea-cover.avif',
  'short-realevate.mp4',
  'realevate-website-video.mp4'
];

async function download(file) {
  const dest = path.join('public/assets', file);
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`Already exists: ${file} (${fs.statSync(dest).size} bytes)`);
    return;
  }

  const urlsToTry = [
    `https://realevate.agency/assets/${file}`,
    `https://realevate.agency/${file}`
  ];

  for (const url of urlsToTry) {
    try {
      console.log(`Trying: ${url}`);
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        console.log(`Downloaded ${file} (${buf.length} bytes)`);
        return;
      }
    } catch (e) {
      console.error(`Error downloading ${url}:`, e.message);
    }
  }
  console.warn(`FAILED to download: ${file}`);
}

async function main() {
  for (const f of filesToDownload) {
    await download(f);
  }
}

main().catch(console.error);
