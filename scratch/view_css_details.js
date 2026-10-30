const fs = require('fs');
const css = fs.readFileSync('scratch/style.min.css', 'utf8');

function findRules(pattern) {
  const all = css.split('{');
  const results = [];
  all.forEach((chunk, i) => {
    if (chunk.includes(pattern)) {
      const sel = chunk.slice(chunk.lastIndexOf('}') + 1).trim();
      const body = all[i+1] ? all[i+1].split('}')[0] : '';
      results.push(`${sel} { ${body} }`);
    }
  });
  return results;
}

const terms = [
  'about-intro__grid',
  'about-intro__title',
  'about-hero__visual',
  'about-hero__video',
  'category-quote',
  'category-values',
  'about-page__pillar-index',
  'about-hero__play'
];

terms.forEach(t => {
  console.log(`\n================== ${t} ==================`);
  const r = findRules(t);
  r.slice(0, 4).forEach(rule => console.log(rule));
});
