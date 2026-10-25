const fs = require('fs');
const content = fs.readFileSync('Mannum Maramum - Reference Recreation.html', 'utf8');

// Search for any mention of project in text (not attributes)
const matches = [...content.matchAll(/>([^<]*(?:project|initiative|event|பணி|திட்டம்)[^<]*)</gi)].map(m => m[1].trim()).filter(Boolean);
console.log('Text matches for project/initiative/event:', matches.slice(0, 30));
