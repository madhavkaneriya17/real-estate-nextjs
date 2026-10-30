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
  const listRaw = await httpGet('/json/list');
  const list = JSON.parse(listRaw);
  const target = list.find(t => t.type === 'page');
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
      const stage = document.querySelector('.category-hero-scroll-stage');
      return stage ? stage.outerHTML : 'NOT FOUND';
    })()`,
    returnByValue: true
  });

  console.log('HERO STAGE HTML:');
  console.log(res.result.value.substring(0, 3000));
  ws.close();
}
run();

