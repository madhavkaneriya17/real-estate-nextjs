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
  const server = spawn('npx', ['next', 'start', '-p', '3007'], { shell: true });
  await new Promise(r => setTimeout(r, 2500));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3007/coastal-haven'
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

    // Scroll through steps around the transition (from scroll 600 to 1200)
    const logs = [];
    for (let y = 600; y <= 1200; y += 50) {
      const res = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          window.scrollTo(0, ${y});
          // or lenis/smooth-scroll
          const scroller = window.__lenis || window.smoothScrollerInstance;
          if (scroller && scroller.scrollTo) {
            scroller.scrollTo(${y}, { immediate: true });
          }
          
          const track = document.querySelector('.about-hero-track');
          const stage = document.querySelector('.hero-sticky-stage');
          const visual = document.querySelector('.about-visual-wrapper');
          const gallery = document.querySelector('.category-gallery');
          const slider = document.querySelector('.projects-slider');
          const sliderTrack = document.querySelector('.projects-slider-track');
          
          return {
            y: window.scrollY,
            stageTop: stage ? stage.getBoundingClientRect().top : null,
            visualTop: visual ? visual.getBoundingClientRect().top : null,
            visualHeight: visual ? visual.offsetHeight : null,
            galleryTop: gallery ? gallery.getBoundingClientRect().top : null,
            sliderTrackTransform: sliderTrack ? sliderTrack.style.transform : null
          };
        })()`,
        returnByValue: true
      });
      logs.push(res.result.value);
      await new Promise(r => setTimeout(r, 60));
    }

    console.log('TRANSITION SCROLL LOG:');
    console.log(JSON.stringify(logs, null, 2));

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
    server.kill();
  }
}

run();
