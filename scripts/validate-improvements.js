const { all } = require('../data/database');

async function validateAll() {
  console.log('--- Validating Mannum Maramum Targeted Improvements ---');

  const rootRes = await fetch('http://localhost:5000/');
  console.log('1. GET / HTTP Status:', rootRes.status);
  const html = await rootRes.text();

  // 1. Check Header 'Since 2019'
  const hasBrandSince = html.includes('class="brand-since"') && html.includes('Since 2019');
  console.log('2. Header has "Since 2019" below organisation name:', hasBrandSince);

  // 2. Check Hero Stats Box shift
  const hasImpactShift = html.includes('left: -50px !important');
  console.log('3. Hero stats box shifted left (-50px on desktop):', hasImpactShift);

  // 3. Check Volunteer Count placeholder & icon & label
  const hasVolCard = html.includes('id="heroVolunteerCount"') && html.includes('👥') && html.includes('data-i="i_volunteers"');
  console.log('4. Hero card has volunteer count element with icon & label:', hasVolCard);

  // 4. Check other 3 stats intact
  const hasSeeds = html.includes('14L+') && html.includes('Palm Tree Seeds');
  const hasTrees = html.includes('42,500+') && html.includes('Trees Planted');
  const hasLocations = html.includes('9+') && html.includes('Locations Reached');
  console.log('5. Other 3 stats intact (14L+, 42,500+, 9+):', hasSeeds && hasTrees && hasLocations);

  // 5. Test Volunteer Count API
  const volRes = await fetch('http://localhost:5000/api/volunteers/count');
  const volData = await volRes.json();
  console.log('6. GET /api/volunteers/count response:', volData);

  // 6. Test Tamil translations in dictionary T
  const hasTaSince = html.includes('brand_since:{en:"Since 2019",ta:"2019 முதல்"}');
  const hasTaVol = html.includes('i_volunteers:{en:"Volunteers",ta:"தன்னார்வலர்கள்"}');
  console.log('7. Tamil translations present in T:', hasTaSince && hasTaVol);

  // 7. Check database record preservation
  const galRows = await all('SELECT COUNT(*) as count FROM gallery');
  const projRows = await all('SELECT COUNT(*) as count FROM projects');
  console.log('8. Preserved DB records - Gallery items:', galRows[0].count, 'Projects:', projRows[0].count);

  if (hasBrandSince && hasImpactShift && hasVolCard && hasSeeds && hasTrees && hasLocations && volData.success && hasTaSince && hasTaVol) {
    console.log('\n🌟 ALL 3 TARGETED IMPROVEMENTS FULLY VERIFIED AND OPERATIONAL!');
  } else {
    console.error('Validation checks failed!');
    process.exit(1);
  }
}

validateAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error during validation:', err);
    process.exit(1);
  });
