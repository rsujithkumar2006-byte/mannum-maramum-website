const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

// Look for whatwedo section content
const whatIdx = content.indexOf('id="whatwedo"');
if (whatIdx !== -1) {
  console.log('--- WHAT WE DO SECTION (first 1000 chars) ---');
  console.log(content.slice(whatIdx, whatIdx + 1500));
}

// Look for gallery section
const galIdx = content.indexOf('id="gallery"');
if (galIdx !== -1) {
  console.log('--- GALLERY SECTION (first 500 chars) ---');
  console.log(content.slice(galIdx, galIdx + 500));
}

// Look for footer
const footIdx = content.lastIndexOf('<footer');
if (footIdx !== -1) {
  console.log('--- FOOTER (first 500 chars) ---');
  console.log(content.slice(footIdx, footIdx + 1000));
}
