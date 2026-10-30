const fs = require('fs');
const https = require('https');
const path = require('path');

const baseDir = path.join(__dirname, '../public/assets/selection/raregems');
const sliderDir = path.join(baseDir, 'slider');

fs.mkdirSync(baseDir, { recursive: true });
fs.mkdirSync(sliderDir, { recursive: true });

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return reject(new Error('Status ' + response.statusCode + ' for ' + url));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

const mainAssets = [
  'rare-gem-cover_converted.avif',
  'square-rare-gems.avif',
  'rare-gems-second-intro.avif',
  'rare-gems-third-intro_converted.avif',
  'rare-gem-stats-1_converted.avif',
  'rare-gem-stats-2_converted.avif',
  'rare-gem-stats-3_converted.avif'
];

async function run() {
  for (const name of mainAssets) {
    const url = 'https://realevate.agency/assets/selection/raregems/' + name;
    const dest = path.join(baseDir, name);
    try {
      console.log('Downloading ' + name + '...');
      await download(url, dest);
    } catch (e) {
      console.error(e.message);
    }
  }

  for (let i = 1; i <= 10; i++) {
    const name = `rare-${i}_converted.avif`;
    const url = `https://realevate.agency/assets/selection/raregems/slider/${name}`;
    const dest = path.join(sliderDir, name);
    try {
      console.log('Downloading slider ' + name + '...');
      await download(url, dest);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log('Finished downloading Rare Gems assets!');
}

run();
