const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const T = {')) {
    console.log(`T at line ${i + 1}:`);
    for (let j = i; j < Math.min(lines.length, i + 15); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}
