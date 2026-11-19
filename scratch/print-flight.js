const fs = require("fs");
const src = fs.readFileSync("scratch/realevate-app.js", "utf8");
const idx = src.indexOf(".category-next-flight");
if (idx !== -1) {
  console.log(src.substring(Math.max(0, idx - 1500), Math.min(src.length, idx + 2500)));
}

