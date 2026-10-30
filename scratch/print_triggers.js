const fs = require('fs');
const content = fs.readFileSync('C:/Users/user/.gemini/antigravity/brain/a361f7cd-618d-440e-86eb-c48bb5d71931/.system_generated/steps/611/output.txt', 'utf8');
const startIdx = content.indexOf('"triggers": [');
const endIdx = content.indexOf('"heroStage":');
console.log(content.substring(startIdx, endIdx));

