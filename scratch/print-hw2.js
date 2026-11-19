const fs = require("fs");
const src = fs.readFileSync("scratch/realevate-app.js", "utf8");
console.log(src.substring(164000, 169000));

