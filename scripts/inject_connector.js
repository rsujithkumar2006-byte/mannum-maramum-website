const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
let txt = fs.readFileSync(filePath, 'utf8');


if (!txt.includes('website-connector.js')) {
  txt = txt.replace('</body>', '<script src="/public/website-connector.js"></script>\n</body>');
  fs.writeFileSync(filePath, txt, 'utf8');
  console.log('✓ Successfully injected website-connector.js into Mannum Maramum - Reference Recreation.html');
} else {
  console.log('website-connector.js already present in HTML.');
}
