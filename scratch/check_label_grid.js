const fs = require('fs');
const css = fs.readFileSync('scratch/realevate_about_full.css', 'utf8');

const regex = /([^{}]+about-page__label[^{}]*)\{([^{}]+)\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
  console.log('LABEL RULE:', m[1].trim(), '=>', m[2].trim());
}

const regex2 = /([^{}]+about-intro__label[^{}]*)\{([^{}]+)\}/g;
while ((m = regex2.exec(css)) !== null) {
  console.log('INTRO LABEL RULE:', m[1].trim(), '=>', m[2].trim());
}

const regex3 = /([^{}]+about-intro__grid[^{}]*)\{([^{}]+)\}/g;
while ((m = regex3.exec(css)) !== null) {
  console.log('GRID RULE:', m[1].trim(), '=>', m[2].trim());
}
