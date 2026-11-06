const http = require('http');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:5000';

const request = (endpoint, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
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

async function runDonationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE DONATION SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(desc, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✓ [PASS ${total}] ${desc} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`✗ [FAIL ${total}] ${desc} ${details ? '(' + details + ')' : ''}`);
      throw new Error(`Assertion failed: ${desc}`);
    }
  }

  // --- PART 1: DOM & HTML Integrity Tests ---
  console.log('--- 1. Frontend DOM & Static Content Inspection ---');
  const indexPath = path.join(__dirname, '..', 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  // Unified heading & description
  assert('Heading "SUPPORT OUR MISSION" present', indexHtml.includes('SUPPORT OUR MISSION') && indexHtml.includes('data-i="dn_title"'));
  assert('Description present', indexHtml.includes('tree plantation, palm seed planting, lake restoration') && indexHtml.includes('data-i="dn_desc"'));

  // 5 Donor Types in HTML
  assert('Donor type individual present', indexHtml.includes("setDonationType('Individual Donation'"));
  assert('Donor type corporate present', indexHtml.includes("setDonationType('Corporate Donation'"));
  assert('Donor type institutional present', indexHtml.includes("setDonationType('Institutional Donation'"));
  assert('Donor type ngo_trust present', indexHtml.includes("setDonationType('NGO / Trust Donation'"));
  assert('Donor type community present', indexHtml.includes("setDonationType('Community Group Donation'"));

  // Preset Amounts in HTML
  assert('Preset ₹500 present', indexHtml.includes("setDonationAmount(500"));
  assert('Preset ₹1,000 present', indexHtml.includes("setDonationAmount(1000"));
  assert('Preset ₹2,500 present', indexHtml.includes("setDonationAmount(2500"));
  assert('Preset ₹5,000 present', indexHtml.includes("setDonationAmount(5000"));
  assert('Preset ₹10,000 present', indexHtml.includes("setDonationAmount(10000"));
  assert('Custom amount button present', indexHtml.includes("setCustomAmountMode("));

  // One-time frequency
  assert('One-time donation frequency badge present', indexHtml.includes('dn_freq_onetime') && indexHtml.includes('One-time Donation'));

  // Dynamic field mappings and preservation during language switcher
  assert('Dynamic field mappings DONATION_FIELD_CONFIG present', indexHtml.includes('const DONATION_FIELD_CONFIG = {'));
  assert('updateDynamicDonorFields function present', indexHtml.includes('function updateDynamicDonorFields('));
  assert('Contact Person field toggling present', indexHtml.includes('groupContact.style.display'));

  // Language dictionary completeness (English and Tamil)
  assert('English dn_title translation present', indexHtml.includes('dn_title: { en: "SUPPORT OUR MISSION"'));
  assert('Tamil dn_title translation present', indexHtml.includes('ta: "எங்கள் நோக்கத்திற்கு ஆதரவு தாருங்கள்"'));
  assert('Tamil translations for all 5 donor types', 
    indexHtml.includes('தனிநபர் நன்கொடை') &&
    indexHtml.includes('நிறுவன நன்கொடை') &&
    indexHtml.includes('அமைப்புக் கல்வி நிறுவன நன்கொடை') &&
    indexHtml.includes('தன்னார்வ அமைப்பு / அறக்கட்டளை நன்கொடை') &&
    indexHtml.includes('சமூகக் குழு நன்கொடை')
  );

  // Manual payment instructions and reference handling
  assert('Direct bank transfer details present', indexHtml.includes('State Bank of India') && indexHtml.includes('Official NGO A/c'));
  assert('Anti-duplicate submission handling in frontend', indexHtml.includes('submitBtn.disabled = true'));
  assert('Confirmation card with reference code display', indexHtml.includes('dnSuccessCard') && indexHtml.includes('successRefCode'));

  // Preservation of existing features
  assert('Partnership section preserved', indexHtml.includes('id="partnership"') && indexHtml.includes('mmi-partnership-section'));
  assert('Partnership duration dropdown 1-10 years preserved', indexHtml.includes('1 Year') && indexHtml.includes('10 Years'));
  assert('Volunteer registration section preserved', indexHtml.includes('id="volunteer"'));
  assert('Gallery section preserved', indexHtml.includes('id="gallery"'));

  console.log('\n--- 2. Backend API Endpoint Tests (POST /api/donations) ---');

  // Test 1: Individual Donation
  const resIndiv = await request('/api/donations', 'POST', {
    donor_name: 'Annamalai Karuppan',
    donor_email: 'annamalai@example.com',
    donor_phone: '9840112233',
    amount: 2500,
    donation_type: 'individual',
    city_district: 'Madurai',
    donor_pan: 'ABCDE1234F'
  });
  assert('Individual donation submission status 201', resIndiv.status === 201, `Status: ${resIndiv.status}`);
  assert('Individual donation returns valid reference code', resIndiv.data && resIndiv.data.transaction_ref && resIndiv.data.transaction_ref.startsWith('MMI-'), `Ref: ${resIndiv.data && resIndiv.data.transaction_ref}`);
  assert('Individual donation payment_status is pending/offline', resIndiv.data && (resIndiv.data.payment_status.includes('Offline') || resIndiv.data.payment_status === 'pending'));

  // Test 2: Corporate Donation
  const resCorp = await request('/api/donations', 'POST', {
    donor_name: 'Green Horizon Tech Ltd',
    contact_person: 'Rajesh V',
    donor_email: 'csr@greenhorizon.com',
    donor_phone: '9876543210',
    amount: 10000,
    donation_type: 'corporate',
    city_district: 'Chennai',
    donor_pan: 'AAACG1234M'
  });
  assert('Corporate donation submission status 201', resCorp.status === 201, `Status: ${resCorp.status}`);
  assert('Corporate donation returns reference', resCorp.data && resCorp.data.transaction_ref && resCorp.data.transaction_ref.startsWith('MMI-'));

  // Test 3: Institutional Donation
  const resInst = await request('/api/donations', 'POST', {
    donor_name: 'PSG College of Technology',
    contact_person: 'Dr. S. Sundaram',
    donor_email: 'principal@psgtech.edu',
    donor_phone: '9443210987',
    amount: 5000,
    donation_type: 'institutional',
    city_district: 'Coimbatore'
  });
  assert('Institutional donation submission status 201', resInst.status === 201, `Status: ${resInst.status}`);
  assert('Institutional donation returns reference', resInst.data && resInst.data.transaction_ref && resInst.data.transaction_ref.startsWith('MMI-'));

  // Test 4: NGO / Trust Donation
  const resNgo = await request('/api/donations', 'POST', {
    donor_name: 'Pasumai Bhoomi Trust',
    contact_person: 'K. Meenakshi',
    donor_email: 'trust@pasumaibhoomi.org',
    donor_phone: '9789012345',
    amount: 1000,
    donation_type: 'ngo_trust',
    city_district: 'Tiruchirappalli'
  });
  assert('NGO / Trust donation submission status 201', resNgo.status === 201, `Status: ${resNgo.status}`);

  // Test 5: Community Group Donation
  const resComm = await request('/api/donations', 'POST', {
    donor_name: 'Kaveri Delta Youth Federation',
    contact_person: 'P. Murugesan',
    donor_email: 'kaveri.delta.youth@gmail.com',
    donor_phone: '9123456780',
    amount: 500,
    donation_type: 'community',
    city_district: 'Thanjavur'
  });
  assert('Community Group donation submission status 201', resComm.status === 201, `Status: ${resComm.status}`);

  // Test 6: Custom Amount (₹15,000)
  const resCustomValid = await request('/api/donations', 'POST', {
    donor_name: 'Dr. Balasubramanian',
    donor_email: 'bala@gmail.com',
    donor_phone: '9841009988',
    amount: 15000,
    donation_type: 'individual',
    city_district: 'Tirunelveli'
  });
  assert('Custom valid amount (₹15,000) accepted', resCustomValid.status === 201, `Status: ${resCustomValid.status}`);

  // Test 7: Validation - Amount <= 0 rejected
  const resZero = await request('/api/donations', 'POST', {
    donor_name: 'Invalid Amount Test',
    donor_email: 'test@example.com',
    donor_phone: '9840112233',
    amount: 0,
    donation_type: 'individual'
  });
  assert('Amount 0 rejected with 400', resZero.status === 400, `Status: ${resZero.status}`);

  const resNegative = await request('/api/donations', 'POST', {
    donor_name: 'Negative Amount Test',
    donor_email: 'test@example.com',
    donor_phone: '9840112233',
    amount: -500,
    donation_type: 'individual'
  });
  assert('Negative amount rejected with 400', resNegative.status === 400, `Status: ${resNegative.status}`);

  // Test 8: Validation - Missing required name
  const resMissingName = await request('/api/donations', 'POST', {
    donor_email: 'test@example.com',
    donor_phone: '9840112233',
    amount: 500,
    donation_type: 'individual'
  });
  assert('Missing name rejected with 400', resMissingName.status === 400, `Status: ${resMissingName.status}`);

  // Test 9: Validation - Missing required phone
  const resMissingPhone = await request('/api/donations', 'POST', {
    donor_name: 'No Phone Donor',
    donor_email: 'test@example.com',
    amount: 500,
    donation_type: 'individual'
  });
  assert('Missing phone rejected with 400', resMissingPhone.status === 400, `Status: ${resMissingPhone.status}`);

  // Test 10: Validation - Invalid email format
  const resBadEmail = await request('/api/donations', 'POST', {
    donor_name: 'Bad Email Donor',
    donor_email: 'not-an-email',
    donor_phone: '9840112233',
    amount: 500,
    donation_type: 'individual'
  });
  assert('Invalid email format rejected with 400', resBadEmail.status === 400, `Status: ${resBadEmail.status}`);

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} OF ${total} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runDonationTests().catch(err => {
  console.error('\n❌ Test suite failure:', err);
  process.exit(1);
});
