const http = require('http');
const { get, all } = require('../data/database');

const baseUrl = 'http://localhost:5000';

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runValidation() {
  console.log('===============================================================');
  console.log('🌱 STARTING PROJECT LIFECYCLE & DATABASE INTEGRATION VALIDATION');
  console.log('===============================================================');

  // Step 0: Login as Admin
  console.log('\n[STEP 0] Authenticating Admin...');
  const loginRes = await request('/api/auth/login', 'POST', {
    usernameOrEmail: 'admin',
    password: 'Admin@123'
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  console.log('✓ Admin authenticated successfully.');

  // Count projects before test
  const initialProjects = await all('SELECT id, title_en, status FROM projects');
  console.log(`✓ Current baseline projects count in SQLite: ${initialProjects.length}`);

  // Step 1: Create a test project using clearly marked test data
  console.log('\n[STEP 1] Creating Test Project with clearly marked test data...');
  const testData = {
    title_en: '[TEST-VERIFICATION] Organic Community Palm Nursery Drive',
    title_ta: '[சோதனை] இயற்கை சமுதாய பனை நாற்றங்கால் இயக்கம்',
    category: 'Plantation',
    project_date: '2026-10-23',
    location: 'Trichy Test Field, Cauvery Basin',
    status: 'published',
    palm_seeds_planted: 1500,
    saplings_planted: 300,
    description_en: 'Verification project to validate live database publication to the public website.',
    description_ta: 'பொது வலைத்தள நேரலை தரவுத்தள ஒருங்கிணைப்பை சரிபார்க்க உருவாக்கப்பட்ட சோதனை திட்டம்.',
    participating_orgs: 'National College Eco Club',
    key_highlights: ['Test Highlight Alpha', 'Test Highlight Beta']
  };

  const createRes = await request('/api/projects', 'POST', testData, authHeaders);
  if (createRes.status !== 201 || !createRes.data.projectId) {
    throw new Error(`Project creation failed: ${JSON.stringify(createRes.data)}`);
  }
  const testProjectId = createRes.data.projectId;
  console.log(`✓ Test project created with ID: ${testProjectId} (status: published)`);

  // Step 2: Verify it appears on the public website after publishing
  console.log('\n[STEP 2] Verifying test project appears on Public Website...');
  // Public request has NO Authorization header!
  const publicRes = await request('/api/projects');
  if (publicRes.status !== 200 || !publicRes.data.success) {
    throw new Error(`Public fetch projects failed: ${JSON.stringify(publicRes.data)}`);
  }

  const publishedInPublic = publicRes.data.projects.find(p => p.id === testProjectId);
  if (!publishedInPublic) {
    throw new Error(`FAIL: Test project ID ${testProjectId} NOT found in public published projects!`);
  }
  console.log(`✓ Confirmed: Project "${publishedInPublic.title_en}" is LIVE on the public website.`);
  console.log(`  Details: Status="${publishedInPublic.status}", Location="${publishedInPublic.location}", Seeds=${publishedInPublic.palm_seeds_planted}`);

  // Step 3: Unpublish the test project
  console.log('\n[STEP 3] Unpublishing Test Project (setting status to draft)...');
  const unpubRes = await request(`/api/projects/${testProjectId}/publish`, 'PATCH', { status: 'draft' }, authHeaders);
  if (unpubRes.status !== 200) {
    throw new Error(`Unpublish failed: ${JSON.stringify(unpubRes.data)}`);
  }
  console.log(`✓ Unpublish request succeeded: ${unpubRes.data.message}`);

  // Verify database record STILL EXISTS in SQLite
  const dbRecord = await get('SELECT id, title_en, status FROM projects WHERE id = ?', [testProjectId]);
  if (!dbRecord) {
    throw new Error(`FAIL: Project record was accidentally deleted from SQLite!`);
  }
  if (dbRecord.status !== 'draft') {
    throw new Error(`FAIL: Database record status should be 'draft' but is '${dbRecord.status}'!`);
  }
  console.log(`✓ Confirmed in SQLite DB: Record ID ${dbRecord.id} exists with status='${dbRecord.status}' without deletion.`);

  // Verify it is REMOVED from the public website
  console.log('\n[STEP 4] Verifying Unpublished Project is REMOVED from Public Website...');
  const publicAfterUnpub = await request('/api/projects');
  const foundAfterUnpub = publicAfterUnpub.data.projects.find(p => p.id === testProjectId);
  if (foundAfterUnpub) {
    throw new Error(`FAIL: Unpublished test project is STILL visible to public visitors!`);
  }
  console.log(`✓ Confirmed: Unpublished project is NOT accessible to public visitors.`);

  // Verify attempting to pass ?status=draft as unauthenticated visitor is blocked
  const maliciousQuery = await request('/api/projects?status=draft');
  const leakedDrafts = maliciousQuery.data.projects.filter(p => p.status !== 'published');
  if (leakedDrafts.length > 0) {
    throw new Error(`FAIL: Unauthenticated visitor bypassed security with ?status=draft!`);
  }
  console.log(`✓ Confirmed: Public visitors cannot bypass filter with ?status=draft.`);

  // Step 5: Clean up - Remove ONLY the test project
  console.log('\n[STEP 5] Removing ONLY the test project from database...');
  const delRes = await request(`/api/projects/${testProjectId}`, 'DELETE', null, authHeaders);
  if (delRes.status !== 200) {
    throw new Error(`Delete failed: ${JSON.stringify(delRes.data)}`);
  }
  console.log(`✓ Test project ID ${testProjectId} removed cleanly.`);

  // Verify baseline integrity
  const finalProjects = await all('SELECT id, title_en, status FROM projects');
  if (finalProjects.length !== initialProjects.length) {
    throw new Error(`FAIL: Final projects count (${finalProjects.length}) does not match initial count (${initialProjects.length})!`);
  }
  console.log(`✓ Original projects preserved: ${finalProjects.length} projects intact.`);

  // Verify gallery integrity (all 17 authentic items preserved)
  const galleryItems = await all('SELECT id, is_published FROM gallery');
  if (galleryItems.length !== 17) {
    throw new Error(`FAIL: Expected exactly 17 gallery items, found ${galleryItems.length}!`);
  }
  console.log(`✓ All 17 Gallery items verified intact in SQLite.`);

  console.log('\n===============================================================');
  console.log('🎉 REQUIREMENT 4 PROJECT VALIDATION COMPLETED WITH 100% SUCCESS');
  console.log('===============================================================\n');
}

runValidation().catch(err => {
  console.error('Validation Error:', err);
  process.exit(1);
});
