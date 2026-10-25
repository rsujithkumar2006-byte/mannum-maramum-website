const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('class="navlinks"')) {
    console.log(`Nav at line ${i + 1}:`);
    for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 35); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}
