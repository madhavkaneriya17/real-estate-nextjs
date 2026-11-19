const fs = require("fs");
const src = fs.readFileSync("scratch/realevate-app.js", "utf8");
console.log(src.substring(159800, 164000));

