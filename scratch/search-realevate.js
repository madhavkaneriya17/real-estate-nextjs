const fs = require("fs");
const src = fs.readFileSync("scratch/realevate-app.js", "utf8");
const matches = [...src.matchAll(/(.{0,80}(?:flight|next-category|category-next).{0,80})/gi)];
console.log(`Found ${matches.length} matches:`);
matches.slice(0, 15).forEach((m, i) => console.log(`[${i}] ${m[0].replace(/\n/g, " ")}`));

