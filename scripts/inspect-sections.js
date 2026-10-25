const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

const idMatches = [...content.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m => m[1]);
console.log('Section IDs:', idMatches);

const classMatches = [...content.matchAll(/<section[^>]*class="([^"]+)"/g)].map(m => m[1]);
console.log('Section classes:', classMatches);

// Check nav links
const navLinks = [...content.matchAll(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)]
  .filter(m => m[1].startsWith('#'))
  .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
console.log('Nav anchor links:', navLinks);
