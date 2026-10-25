const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

const setLangIdx = content.indexOf('function setLang(');
if (setLangIdx !== -1) {
  console.log('--- setLang Function ---');
  console.log(content.slice(setLangIdx, setLangIdx + 1200));
}
