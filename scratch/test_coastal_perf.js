const { spawn } = require('child_process');
const http = require('http');

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:9222${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const server = spawn('npx', ['next', 'start', '-p', '3009'], { shell: true });
  await new Promise(r => setTimeout(r, 2500));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3009/coastal-haven'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const listRaw = await httpGet('/json/list');
    const list = JSON.parse(listRaw);
    const target = list.find(t => t.type === 'page' && !t.url.startsWith('chrome')) || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    function sendCommand(method, params = {}) {
      return new Promise(resolve => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const res = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const slides = Array.from(document.querySelectorAll('.projects-slider-item img')).map(img => img.src);
        const unique = Array.from(new Set(slides));
        return {
          totalSliderImages: slides.length,
          uniqueImages: unique,
          sliderTrackClass: document.querySelector('.projects-slider-track').className
        };
      })()`,
      returnByValue: true
    });

    console.log('PERF TEST RESULT:');
    console.log(JSON.stringify(res.result.value, null, 2));

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
    server.kill();
  }
}

run();

