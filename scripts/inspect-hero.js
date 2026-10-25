const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

// Header brand
const brandIdx = content.indexOf('class="brand"');
if (brandIdx !== -1) {
  console.log('--- BRAND HEADER HTML ---');
  console.log(content.slice(brandIdx - 100, brandIdx + 500));
}

// Hero section & stats
const heroIdx = content.indexOf('class="hero"');
if (heroIdx !== -1) {
  console.log('--- HERO SECTION HTML ---');
  console.log(content.slice(heroIdx, heroIdx + 2000));
}
