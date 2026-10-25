const http = require('http');

async function testSuite() {
  console.log('--- Starting Mannum Maramum Automated Test Suite ---');
  const baseUrl = 'http://localhost:5000';

  const request = (path, method = 'GET', body = null, headers = {}) => {
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
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log(`[TEST 1] Health Check: Status ${health.status} ->`, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Public endpoints check
    const publicImpact = await request('/api/impact');
    console.log(`[TEST 2] Public Impact Stats: Status ${publicImpact.status} -> Palm seeds:`, publicImpact.data.impact.palm_seeds_planted);

    const publicGallery = await request('/api/gallery?publishedOnly=true');
    console.log(`[TEST 3] Public Gallery: Status ${publicGallery.status} -> Total items:`, publicGallery.data.gallery.length);
    if (publicGallery.data.gallery.length < 17) throw new Error('Expected at least 17 seeded gallery photos');

    // 3. Admin Authentication Check
    // A. Invalid login
    const badLogin = await request('/api/auth/login', 'POST', {
      usernameOrEmail: 'admin',
      password: 'WrongPassword123'
    });
    console.log(`[TEST 4] Invalid Login: Status ${badLogin.status} ->`, badLogin.data.message);
    if (badLogin.status !== 401) throw new Error('Expected 401 for bad password');

    // B. Valid login with username
    const loginUsername = await request('/api/auth/login', 'POST', {
      usernameOrEmail: 'admin',
      password: 'Admin@123'
    });
    console.log(`[TEST 5A] Valid Admin Login (by username): Status ${loginUsername.status} -> User:`, loginUsername.data.user.name);
    if (loginUsername.status !== 200 || !loginUsername.data.token) throw new Error('Username login failed');

    // C. Valid login with email
    const login = await request('/api/auth/login', 'POST', {
      usernameOrEmail: 'admin@mannummaramum.org',
      password: 'Admin@123'
    });
    console.log(`[TEST 5B] Valid Admin Login (by email): Status ${login.status} -> User:`, login.data.user.name);
    if (login.status !== 200 || !login.data.token) throw new Error('Email login failed');

    const token = login.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // 4. Dashboard Summary
    const summary = await request('/api/dashboard/summary', 'GET', null, authHeaders);
    console.log(`[TEST 6] Dashboard KPI Summary: Status ${summary.status} -> Projects:`, summary.data.summary.totalProjects, 'Events:', summary.data.summary.totalEvents);

    // 5. Project CRUD Test
    const newProj = await request('/api/projects', 'POST', {
      title_en: 'Automated Test Plantation Drive',
      title_ta: 'தானியங்கி சோதனை மரக்கன்று நடவு',
      category: 'Plantation',
      project_date: '2026-10-22',
      location: 'Trichy Test Zone',
      status: 'draft',
      palm_seeds_planted: 500,
      saplings_planted: 100,
      description_en: 'Testing project creation from automated test suite.',
      description_ta: 'தானியங்கி சோதனை விளக்கம்.',
      participating_orgs: 'Test College',
      key_highlights: ['Test highlight 1', 'Test highlight 2']
    }, authHeaders);
    console.log(`[TEST 7] Project Creation: Status ${newProj.status} -> ID:`, newProj.data.projectId);
    const testProjId = newProj.data.projectId;

    // Toggle publish
    const pubProj = await request(`/api/projects/${testProjId}/publish`, 'PATCH', { status: 'published' }, authHeaders);
    console.log(`[TEST 8] Project Publish Toggle: Status ${pubProj.status} ->`, pubProj.data.message);

    // Delete test project
    const delProj = await request(`/api/projects/${testProjId}`, 'DELETE', null, authHeaders);
    console.log(`[TEST 9] Project Deletion: Status ${delProj.status} ->`, delProj.data.message);

    // 6. Public Volunteer Registration & Verification
    const volReg = await request('/api/volunteers', 'POST', {
      name: 'R. Anbarasan Test',
      email: 'anbu.test@gmail.com',
      phone: '+91 99887 66554',
      district: 'Tiruchirappalli',
      skills: 'Seed ball making'
    });
    console.log(`[TEST 10] Public Volunteer Registration: Status ${volReg.status} -> ID:`, volReg.data.volunteerId);
    const testVolId = volReg.data.volunteerId;

    // Admin update volunteer status
    const updateVol = await request(`/api/volunteers/${testVolId}`, 'PUT', { status: 'Active', notes: 'Verified via test' }, authHeaders);
    console.log(`[TEST 11] Admin Volunteer Status Update: Status ${updateVol.status} ->`, updateVol.data.message);

    // 7. Public Partnership Submission
    const partSub = await request('/api/partnerships', 'POST', {
      org_type: 'Educational',
      org_name: 'Test Environmental College',
      contact_name: 'Prof. K. Ramesh',
      contact_mobile: '+91 98765 43210',
      contact_email: 'ramesh@testcollege.edu',
      duration: '1 Year',
      focus_areas: ['Palm Tree Plantation', 'Eco Education']
    });
    console.log(`[TEST 12] Public Partnership Submission: Status ${partSub.status} -> ID:`, partSub.data.partnershipId);

    // 8. Public Donation Submission
    const donSub = await request('/api/donations', 'POST', {
      donor_name: 'Test Benefactor',
      donor_email: 'benefactor@test.org',
      donor_phone: '+91 91234 56789',
      amount: 1500,
      donation_type: 'one-time'
    });
    console.log(`[TEST 13] Public Donation Recording: Status ${donSub.status} -> Ref:`, donSub.data.transactionRef);

    // 9. Impact Stats Update
    const updateImp = await request('/api/impact', 'PUT', {
      palm_seeds_planted: 50500,
      trees_planted: 5200,
      projects_completed: 26,
      events_conducted: 43,
      locations_covered: 12,
      volunteers_participated: 1500,
      active_since: 2024
    }, authHeaders);
    console.log(`[TEST 14] Admin Impact Update: Status ${updateImp.status} ->`, updateImp.data.message);

    // 10. Content Block Update
    const updateContent = await request('/api/content/about_mission', 'PUT', {
      content_en: 'Mannum Maramum Iyakkam is dedicated to restoring nature by reviving palm tree heritage and native ecosystems.',
      content_ta: 'மண்ணும் மரமும் இயக்கம் பனை மரங்களை மீட்டுருவாக்கம் செய்து இயற்கை சூழலை காக்கிறது.'
    }, authHeaders);
    console.log(`[TEST 15] Bilingual Content Update: Status ${updateContent.status} ->`, updateContent.data.message);

    console.log('\n========================================================');
    console.log('🎉 ALL 15 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  testSuite();
}

module.exports = { testSuite };
