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
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRaw = await httpGet('/json/list');
    console.log('List raw:', listRaw);
    const list = JSON.parse(listRaw);
    const target = list.find(t => t.type === 'page') || list[0];
    const wsUrl = target.webSocketDebuggerUrl;
    console.log('Connected to WS:', wsUrl);
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve) => ws.onopen = resolve);

    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await sendCommand('Page.navigate', { url: 'https://realevate.agency/about' });

    console.log('Waiting for page to load and settle...');
    await new Promise(r => setTimeout(r, 6000));

    // Evaluate in page: dump all ScrollTriggers and hero details
    const evalScript = `(() => {
      const triggers = window.ScrollTrigger ? window.ScrollTrigger.getAll().map(st => ({
        id: st.vars.id,
        trigger: st.trigger ? (st.trigger.className || st.trigger.tagName) : null,
        start: st.start,
        end: st.end,
        progress: st.progress,
        vars: {
          start: st.vars.start,
          end: st.vars.end,
          scrub: st.vars.scrub
        }
      })) : [];

      const heroStage = document.querySelector('.category-hero-scroll-stage');
      const categoryHero = document.querySelector('.category-hero');
      const heroMedia = document.querySelector('.about-hero__media');
      const heroImg = document.querySelector('.about-hero__media img');
      const overlay = document.querySelector('.about-hero__scroll-overlay');
      const pageGrid = document.querySelector('.page-grid');

      return {
        triggers,
        heroStage: heroStage ? {
          offsetHeight: heroStage.offsetHeight,
          style: heroStage.style.cssText,
          computedHeight: getComputedStyle(heroStage).height
        } : null,
        categoryHero: categoryHero ? {
          offsetHeight: categoryHero.offsetHeight,
          style: categoryHero.style.cssText,
          computedHeight: getComputedStyle(categoryHero).height,
          position: getComputedStyle(categoryHero).position
        } : null,
        heroMedia: heroMedia ? {
          style: heroMedia.style.cssText,
          position: getComputedStyle(heroMedia).position,
          width: getComputedStyle(heroMedia).width,
          height: getComputedStyle(heroMedia).height
        } : null,
        heroImg: heroImg ? {
          style: heroImg.style.cssText,
          transform: getComputedStyle(heroImg).transform,
          width: getComputedStyle(heroImg).width,
          height: getComputedStyle(heroImg).height
        } : null,
        overlay: overlay ? {
          opacity: getComputedStyle(overlay).opacity
        } : null
      };
    })()`;

    const res0 = await sendCommand('Runtime.evaluate', {
      expression: evalScript,
      returnByValue: true
    });
    console.log('AT SCROLL = 0:');
    console.log(JSON.stringify(res0.result.value, null, 2));

    // Now test scrolling to 300, 600, 1000, 1500
    for (const scrollY of [300, 600, 1000, 1500]) {
      await sendCommand('Runtime.evaluate', {
        expression: `window.scrollTo(0, ${scrollY}); if (window.ScrollTrigger) window.ScrollTrigger.update();`
      });
      await new Promise(r => setTimeout(r, 600));

      const resScroll = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          const heroImg = document.querySelector('.about-hero__media img');
          const heroStage = document.querySelector('.category-hero-scroll-stage');
          const categoryHero = document.querySelector('.category-hero');
          const overlay = document.querySelector('.about-hero__scroll-overlay');
          return {
            scrollY: window.scrollY,
            imgStyleTransform: heroImg ? heroImg.style.transform : null,
            imgComputedTransform: heroImg ? getComputedStyle(heroImg).transform : null,
            overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
            stageStyleTransform: heroStage ? heroStage.style.transform : null,
            heroStyleTransform: categoryHero ? categoryHero.style.transform : null
          };
        })()`,
        returnByValue: true
      });
      console.log(`AT SCROLL = ${scrollY}:`, resScroll.result.value);
    }

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

run();
