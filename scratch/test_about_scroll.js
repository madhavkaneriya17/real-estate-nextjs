const { spawn } = require('child_process');
const http = require('http');

async function check() {
  console.log('Testing dev server or build...');
  // Launch next start on port 3005
  const server = spawn('npx', ['next', 'start', '-p', '3005'], { shell: true });
  
  await new Promise(r => setTimeout(r, 3000));

  // Check HTTP response
  http.get('http://127.0.0.1:3005/about', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response status:', res.statusCode);
      const hasStage = data.includes('category-hero-scroll-stage');
      const hasMedia = data.includes('about-hero__media');
      const hasOverlay = data.includes('about-hero__scroll-overlay');
      const hasGrid = data.includes('about-hero__content-grid');
      const hasScrollHint = data.includes('(Scroll)');
      console.log({ hasStage, hasMedia, hasOverlay, hasGrid, hasScrollHint });
      
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Error:', err);
    server.kill();
    process.exit(1);
  });
}

check();

