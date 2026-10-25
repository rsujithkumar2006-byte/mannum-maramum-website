const { all, get } = require('./data/database');

async function check() {
  const q = await all(`
    SELECT id, name, email, phone, status, notes
    FROM volunteers
    WHERE status IN ('Approved', 'Active')
      AND LOWER(name) NOT LIKE '%test%'
      AND LOWER(email) NOT LIKE '%test%'
      AND (notes IS NULL OR LOWER(notes) NOT LIKE '%test%')
  `);
  console.log('Filtered valid approved/active volunteers:');
  console.log(q);

  const res = await get(`
    SELECT COUNT(DISTINCT LOWER(TRIM(email))) as count
    FROM volunteers
    WHERE status IN ('Approved', 'Active')
      AND LOWER(name) NOT LIKE '%test%'
      AND LOWER(email) NOT LIKE '%test%'
      AND (notes IS NULL OR LOWER(notes) NOT LIKE '%test%')
  `);
  console.log('Distinct verified volunteer count:', res.count);
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
