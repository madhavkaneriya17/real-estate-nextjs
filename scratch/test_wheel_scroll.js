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
  const server = spawn('npx', ['next', 'start', '-p', '3008'], { shell: true });
  await new Promise(r => setTimeout(r, 2500));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3008/coastal-haven'
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

    // Set up console listener & scroll tracker
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        window.__events = [];
        
        // Track ScrollTrigger refreshes
        if (window.ScrollTrigger) {
          window.ScrollTrigger.addEventListener('refresh', () => {
            window.__events.push({ type: 'ScrollTrigger.refresh', y: window.scrollY });
          });
        }
        
        // Track wheel events
        window.addEventListener('wheel', (e) => {
          window.__events.push({ type: 'wheel', deltaY: e.deltaY, y: window.scrollY, defaultPrevented: e.defaultPrevented });
        }, { passive: false });
        
        // Track layout shifts if PerformanceObserver exists
        if (window.PerformanceObserver) {
          try {
            const po = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                window.__events.push({ type: 'layout-shift', value: entry.value, y: window.scrollY });
              }
            });
            po.observe({ type: 'layout-shift', buffered: true });
          } catch(e) {}
        }
      })()`
    });

    // Simulate smooth user scrolling with wheel events through the transition zone
    console.log('Sending wheel scroll events...');
    for (let i = 0; i < 30; i++) {
      await sendCommand('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 500,
        y: 400,
        deltaX: 0,
        deltaY: 100
      });
      await new Promise(r => setTimeout(r, 60));
    }

    const res = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        return {
          finalY: window.scrollY,
          events: window.__events,
          scrollerState: window.__lenis || (window.smoothScrollerInstance ? {
            current: window.smoothScrollerInstance.current,
            target: window.smoothScrollerInstance.target,
            isLocked: window.smoothScrollerInstance.isLocked
          } : null)
        };
      })()`,
      returnByValue: true
    });

    console.log('SCROLL TEST RESULT:');
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

