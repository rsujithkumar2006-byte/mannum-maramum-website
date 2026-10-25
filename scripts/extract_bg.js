const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Mannum Maramum - Reference Recreation.html'), 'utf8');
const marker = 'class="bg" alt="" src="data:image/jpeg;base64,';
const startIdx = html.indexOf(marker);
if (startIdx !== -1) {
  const b64Start = startIdx + marker.length;
  const endIdx = html.indexOf('"', b64Start);
  const b64 = html.slice(b64Start, endIdx);
  fs.writeFileSync(path.join(__dirname, '..', 'scratch_hero_bg.jpg'), Buffer.from(b64, 'base64'));
  console.log('Saved hero bg image to scratch_hero_bg.jpg, size:', b64.length);
} else {
  console.log('Marker not found');
}
