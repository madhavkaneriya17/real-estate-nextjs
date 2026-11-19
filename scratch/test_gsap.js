const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="stage" style="position:relative;width:499px;height:785px;"><div id="visual" style="position:absolute;top:44vh;left:50%;width:200px;height:200px;transform:translate(-50%, -50%);"></div></div></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.window.innerWidth = 499;
global.window.innerHeight = 785;
const gsap = require('gsap').gsap;

const visual = document.getElementById('visual');
console.log('Initial inline transform:', visual.style.transform);

const tl = gsap.timeline();
tl.fromTo(visual, {
  top: '345.4px',
  width: '190px',
  height: '190px'
}, {
  top: '392.5px',
  width: '100vw',
  height: '100vh',
  duration: 1
});

tl.progress(0.5);
console.log('At 0.5:');
console.log('top:', visual.style.top);
console.log('width:', visual.style.width);
console.log('height:', visual.style.height);
console.log('transform:', visual.style.transform);

tl.progress(1);
console.log('At 1.0:');
console.log('top:', visual.style.top);
console.log('width:', visual.style.width);
console.log('height:', visual.style.height);
console.log('transform:', visual.style.transform);
