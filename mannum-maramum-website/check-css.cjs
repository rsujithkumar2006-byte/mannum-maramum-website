const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const content = fs.readFileSync(file, 'utf8');
const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/i);
if (styleMatch) {
  const css = styleMatch[1];
  console.log('CSS length:', css.length);
  const lines = css.split('\n');
  console.log('CSS line count:', lines.length);

  lines.forEach((l, idx) => {
    if (/min-width|width\s*:\s*[0-9]{3,4}px|width\s*:\s*100vw|margin-left|margin-right|transform.*translate|vw/i.test(l)) {
      console.log('L' + (idx + 14) + ': ' + l.trim().slice(0, 120));
    }
  });
}
