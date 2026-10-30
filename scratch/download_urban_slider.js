const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '../public/assets/selection/urbanliving/slider');
fs.mkdirSync(targetDir, { recursive: true });

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error('Status ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  for (let i = 1; i <= 10; i++) {
    const name = 'urban-' + i + '_converted.avif';
    const url = 'https://realevate.agency/assets/selection/urbanliving/slider/' + name;
    const dest = path.join(targetDir, name);
    console.log('Downloading ' + name + '...');
    await download(url, dest);
  }
  console.log('All downloads complete!');
}

run();
