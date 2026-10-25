const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

const navIdx = content.indexOf('<nav');
if (navIdx !== -1) {
  console.log('--- NAV ELEMENT ---');
  console.log(content.slice(navIdx, navIdx + 1500));
} else {
  const headerIdx = content.indexOf('<header');
  console.log('--- HEADER ELEMENT ---');
  console.log(content.slice(headerIdx, headerIdx + 1500));
}
