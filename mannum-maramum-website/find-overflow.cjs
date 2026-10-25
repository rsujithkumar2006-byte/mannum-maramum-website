const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (/overflow/i.test(l)) {
    console.log(`L${idx+1}: ${l.trim().slice(0, 100)}`);
  }
});
