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
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=499,785',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/serene-greens'
  ]);

  await new Promise(r => setTimeout(r, 2500));

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

    // Set viewport to 499x785 mobile
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 499,
      height: 785,
      deviceScaleFactor: 1,
      mobile: true
    });

    await new Promise(r => setTimeout(r, 1000));

    // Evaluate at scroll 0, scroll 200, scroll 400, scroll 700
    for (const scrollY of [0, 200, 400, 700]) {
      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          window.scrollTo(0, ${scrollY});
          const visual = document.querySelector('.about-visual-wrapper');
          const stage = document.querySelector('.hero-sticky-stage');
          const track = document.querySelector('.about-hero-track');
          const rect = visual ? visual.getBoundingClientRect() : null;
          const stageRect = stage ? stage.getBoundingClientRect() : null;
          const comp = visual ? window.getComputedStyle(visual) : null;
          return {
            scrollY: window.scrollY,
            rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom } : null,
            stageRect: stageRect ? { top: stageRect.top, left: stageRect.left, width: stageRect.width, height: stageRect.height, bottom: stageRect.bottom } : null,
            inlineTop: visual ? visual.style.top : null,
            inlineWidth: visual ? visual.style.width : null,
            inlineHeight: visual ? visual.style.height : null,
            inlineTransform: visual ? visual.style.transform : null,
            compTransform: comp ? comp.transform : null,
            compTop: comp ? comp.top : null,
            compHeight: comp ? comp.height : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Scroll ' + scrollY + ':', JSON.stringify(evalRes.result.value, null, 2));
    }

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    chrome.kill();
  }
}

run();
