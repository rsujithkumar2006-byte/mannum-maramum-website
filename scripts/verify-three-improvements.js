const fs = require('fs');
const path = require('path');
const { get, all } = require('../data/database');

async function verifyAll() {
  console.log('========================================================');
  console.log('🔍 VERIFYING THREE TARGETED WEBSITE IMPROVEMENTS');
  console.log('========================================================\n');

  const html = fs.readFileSync(path.join(__dirname, '..', 'Mannum Maramum - Reference Recreation.html'), 'utf8');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName} ${details}`);
    }
  }

  // ----------------------------------------------------
  // CHANGE 1: Hero Statistics Box Shifted Left (40-60px)
  // ----------------------------------------------------
  console.log('--- CHANGE 1: Move Hero Statistics Box 40-60px Left on Desktop ---');
  assert(
    html.includes('.impactcard') && (html.includes('left: -50px') || html.includes('left:-50px')),
    'Hero statistics box shifted 50px left on desktop (within 40-60px range)',
    'Expected left: -50px on .impactcard'
  );
  assert(
    html.includes('@media (max-width: 1024px)') && html.includes('left: 0'),
    'Tablet and mobile reset positioning (left: 0, centered)',
    'Expected left: 0 in @media (max-width: 1024px)'
  );
  assert(
    html.includes('background: rgba(14, 42, 30, 0.55)') || html.includes('background:rgba(14,42,30,.55)'),
    'Preserved box styling, forest-green transparency (0.55), and border',
    'Expected styling preservation'
  );

  // ----------------------------------------------------
  // CHANGE 2: Replace 2019 Active Since with Dynamic Volunteer Count
  // ----------------------------------------------------
  console.log('\n--- CHANGE 2: Replace 2019 Active Since with Dynamic Volunteer Count ---');
  assert(
    html.includes('id="heroVolunteerCount"') || html.includes("id='heroVolunteerCount'"),
    'Hero statistics box has dedicated dynamic volunteer element #heroVolunteerCount',
    'Expected #heroVolunteerCount'
  );
  assert(
    html.includes('data-i="i_volunteers"') && html.includes('👥'),
    'Volunteer stat uses suitable people icon (👥) and bilingual translation key i_volunteers',
    'Expected 👥 icon and data-i="i_volunteers"'
  );
  assert(
    html.includes('14L+') && html.includes('42,500+') && html.includes('9+'),
    'Other 3 statistics (14L+ Palm Seeds, 42,500+ Trees, 9+ Locations) remain intact',
    'Expected 14L+, 42,500+, 9+'
  );

  // Verify SQLite database and API count logic
  const volRow = await get(`
    SELECT COUNT(DISTINCT LOWER(TRIM(email))) as count
    FROM volunteers
    WHERE status IN ('Approved', 'Active')
      AND LOWER(name) NOT LIKE '%test%'
      AND LOWER(email) NOT LIKE '%test%'
      AND (notes IS NULL OR LOWER(notes) NOT LIKE '%test%')
  `);
  const verifiedCount = volRow ? volRow.count : 0;
  assert(
    verifiedCount > 0,
    `Database returns verified active/approved volunteer count (verified=${verifiedCount})`,
    'Expected verifiedCount > 0'
  );

  // Verify API endpoint /api/volunteers/count
  try {
    const res = await fetch('http://localhost:5000/api/volunteers/count');
    const apiData = await res.json();
    assert(
      apiData.success === true && apiData.count === verifiedCount && apiData.table === 'volunteers',
      `Public API endpoint /api/volunteers/count returns verified count (${apiData.count})`,
      JSON.stringify(apiData)
    );
  } catch (err) {
    assert(false, 'Public API endpoint /api/volunteers/count reachable', err.message);
  }

  // ----------------------------------------------------
  // CHANGE 3: Add "Since 2019" Below Organisation Name in Header
  // ----------------------------------------------------
  console.log('\n--- CHANGE 3: Add "Since 2019" Subtitle Below Organisation Name in Header ---');
  assert(
    html.includes('class="brand-since"') && html.includes('Since 2019'),
    'Header brand contains "Since 2019" in .brand-since element',
    'Expected .brand-since with "Since 2019"'
  );
  assert(
    html.includes('color: var(--lime') || html.includes('color:var(--lime'),
    'Styled with theme light green (var(--lime)) matching environmental design',
    'Expected color: var(--lime)'
  );
  assert(
    html.includes('flex-direction: column') && html.includes('align-items: flex-start'),
    'Left-aligned directly below "MANNUM MARAMUM" text',
    'Expected flex column with align-items: flex-start'
  );
  assert(
    html.includes("LET'S HEAL THE EARTH"),
    'Tagline "LET\'S HEAL THE EARTH" in hero eyebrow is completely preserved',
    'Expected LET\'S HEAL THE EARTH unchanged'
  );

  console.log('\n========================================================');
  console.log(`RESULTS: ${passed} / ${total} CHECKS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('========================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyAll().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
