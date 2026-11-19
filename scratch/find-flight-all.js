const fs = require("fs");
const src = fs.readFileSync("scratch/realevate-app.js", "utf8");
let pos = 0;
while (true) {
  const idx = src.indexOf("category-next-flight", pos);
  if (idx === -1) break;
  console.log(`Match at ${idx}:`);
  console.log(src.substring(Math.max(0, idx - 400), Math.min(src.length, idx + 400)));
  console.log("-------------------");
  pos = idx + 20;
}

