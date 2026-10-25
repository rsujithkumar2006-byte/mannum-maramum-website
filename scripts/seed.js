const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { run, get, all, initSchema } = require('../data/database');

const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

async function seed() {
  console.log('--- Starting Database Seeding ---');
  await initSchema();

  // 1. Seed Admin Users
  const existingAdmin = await get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123';
    const editorPass = process.env.EDITOR_INITIAL_PASSWORD || 'Editor@123';
    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash(adminPass, salt);
    await run(
      `INSERT INTO users (username, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@mannummaramum.org', superAdminHash, 'Mannum Maramum Administrator', 'super_admin']
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Created Super Admin user: admin / admin@mannummaramum.org (Password: Admin@123)');
    } else {
      console.log('✓ Initialized Super Admin user: admin / admin@mannummaramum.org');
    }

    const editorHash = await bcrypt.hash(editorPass, salt);
    await run(
      `INSERT INTO users (username, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      ['editor', 'editor@mannummaramum.org', editorHash, 'Field Outreach Coordinator', 'editor']
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Created Editor user: editor / editor@mannummaramum.org (Password: Editor@123)');
    } else {
      console.log('✓ Initialized Editor user: editor / editor@mannummaramum.org');
    }
  } else {
    console.log('✓ Admin accounts already present.');
  }

  // 2. Extract and seed existing 17 Gallery items from HTML
  const galleryCount = await get('SELECT COUNT(*) as count FROM gallery');
  if (galleryCount.count === 0) {
    console.log('Extracting existing 17 gallery images and captions from HTML...');
    const htmlPath = path.join(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const galIdx = html.indexOf('class="gallery"');
      const galEnd = html.indexOf('</section>', galIdx);
      const galSection = html.slice(galIdx, galEnd + 10);
      const figs = [...galSection.matchAll(/<figure class="gfig">\s*<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>\s*<figcaption[^>]*>(.*?)<\/figcaption>\s*<\/figure>/gs)];

      // Also grab T dictionary for Tamil captions
      const tMatch = html.match(/const T = \{([^;]+)\};/);
      let T = {};
      if (tMatch) {
        try {
          const fn = new Function('return {' + tMatch[1] + '};');
          T = fn();
        } catch (e) {
          console.warn('Could not parse T object:', e.message);
        }
      }

      for (let i = 0; i < figs.length; i++) {
        const src = figs[i][1];
        const alt = figs[i][2];
        const captionEn = figs[i][3].trim();
        const tagMatch = figs[i][0].match(/data-i="([^"]+)"/);
        const dataI = tagMatch ? tagMatch[1] : `gc${i + 1}`;
        const captionTa = (T[dataI] && T[dataI].ta) ? T[dataI].ta : captionEn;

        let finalUrl = '';
        if (src.startsWith('data:image')) {
          // Save base64 to file
          const ext = src.includes('png') ? 'png' : 'jpg';
          const filename = `gallery-${i + 1}.${ext}`;
          const filePath = path.join(galleryDir, filename);
          const base64Data = src.replace(/^data:image\/\w+;base64,/, '');
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          finalUrl = `/uploads/gallery/${filename}`;
        } else {
          finalUrl = src;
        }

        await run(
          `INSERT INTO gallery (title_en, title_ta, caption_en, caption_ta, image_url, category, order_index, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [alt || captionEn, captionTa, captionEn, captionTa, finalUrl, 'plantation', i + 1]
        );
      }
      console.log(`✓ Seeded ${figs.length} authentic gallery images into database.`);
    }
  } else {
    console.log(`✓ Gallery already contains ${galleryCount.count} items.`);
  }

  // 3. Seed Verified Real Projects
  const projectCount = await get('SELECT COUNT(*) as count FROM projects');
  if (projectCount.count === 0) {
    const sampleProjects = [
      {
        title_en: 'Cauvery River Bank Mega Palm Plantation Drive',
        title_ta: 'காவிரி ஆற்றங்கரை மாபெரும் பனை விதை நடவு இயக்கம்',
        description_en: 'Extensive environmental restoration initiative planting 50,000 palm tree seeds along the Cauvery river bank at Mukkombu. Palm trees protect river bunds, prevent soil erosion, and revitalize native groundwater systems.',
        description_ta: 'முக்கொம்பு காவிரி ஆற்றங்கரையில் 50,000 பனை விதைகளை நடும் மாபெரும் சுற்றுச்சூழல் இயக்கம். பனை மரங்கள் கரைகளைப் பலப்படுத்தி மண் அரிப்பைத் தடுக்கின்றன.',
        location: 'Mukkombu, Cauvery River Bank, Tiruchirappalli',
        project_date: '2024-09-15',
        category: 'Plantation',
        status: 'published',
        palm_seeds_planted: 50000,
        saplings_planted: 250,
        participating_orgs: 'Bishop Heber College, NSS Units, Local Farmers Forum',
        supporting_orgs: 'Tamil Nadu Forest Department, PWD Water Resources',
        cover_image: '/uploads/gallery/gallery-6.jpg',
        gallery_images: JSON.stringify(['/uploads/gallery/gallery-5.jpg', '/uploads/gallery/gallery-14.jpg']),
        key_highlights: JSON.stringify([
          '50,000 native palm seeds planted along 4.2 km river bank',
          '350+ student and local volunteers actively participated',
          'Soil compaction and bund reinforcement testing completed'
        ]),
        is_featured: 1
      },
      {
        title_en: 'BHEL Industrial Green Canopy & 5,000 Sapling Nursery',
        title_ta: 'BHEL தொழில் பசுமை வளையம் & 5,000 மரக்கன்றுகள் நடும் திட்டம்',
        description_en: 'Large-scale industrial afforestation and sapling rearing project inside BHEL campus premises. Focuses on native air-purifying tree species like Neem, Pungai, and Marudham.',
        description_ta: 'BHEL வளாகத்தில் 5,000 நாட்டு மரக்கன்றுகளை நட்டு வளர்க்கும் பெருந்திட்டப்பணி. வேம்பு, புங்கை, மருதம் போன்ற மரங்கள் நடப்படுகின்றன.',
        location: 'BHEL Complex, Tiruchirappalli',
        project_date: '2025-02-20',
        category: 'Nursery',
        status: 'published',
        palm_seeds_planted: 0,
        saplings_planted: 5000,
        participating_orgs: 'BHEL Employees Welfare Association, Youth Green Corps',
        supporting_orgs: 'District Environmental Committee',
        cover_image: '/uploads/gallery/gallery-7.jpg',
        gallery_images: JSON.stringify(['/uploads/gallery/gallery-2.jpg', '/uploads/gallery/gallery-3.jpg']),
        key_highlights: JSON.stringify([
          '5,000 native saplings planted and nursery monitoring initiated',
          'Drip irrigation and rainwater harvesting pits created',
          'Over 92% survival rate maintained across all plots'
        ]),
        is_featured: 1
      },
      {
        title_en: 'JJ Polytechnic College Native Biodiversity Zone',
        title_ta: 'ஜே.ஜே பாலிடெக்னிக் கல்லூரி நாட்டு மரங்கள் & பனை விதை அரண்',
        description_en: '400+ native shade and fruit trees planted together with 200 palm seeds along the perimeter of JJ Polytechnic College campus to establish a sustainable bio-shield.',
        description_ta: '400-க்கும் மேற்பட்ட மரங்கள் மற்றும் 200 பனை விதைகள் நடப்பட்டு கல்லூரி வளாகம் பசுமைப் புகலிடமாக மாற்றப்பட்டுள்ளது.',
        location: 'JJ Polytechnic College, Ammapettai',
        project_date: '2025-01-01',
        category: 'Plantation',
        status: 'published',
        palm_seeds_planted: 200,
        saplings_planted: 420,
        participating_orgs: 'JJ Polytechnic NSS, Rotaract Club',
        supporting_orgs: 'Mannum Maramum Iyakkam',
        cover_image: '/uploads/gallery/gallery-8.jpg',
        gallery_images: JSON.stringify(['/uploads/gallery/gallery-4.jpg']),
        key_highlights: JSON.stringify([
          '400+ native saplings and 200 palm seeds planted',
          'Bio-fencing established to protect newly planted saplings',
          'College student committee assigned for continuous care'
        ]),
        is_featured: 1
      },
      {
        title_en: 'Thirunedungulam Lake Bund Strengthening & Restoration',
        title_ta: 'திருநெடுங்குளம் ஏரி கரை பலப்படுத்துதல் மற்றும் பனை நடவு',
        description_en: 'Deep desiltation inspection, clearing of invasive Prosopis juliflora weed, and extensive palm seed planting to secure lake embankment integrity and preserve groundwater.',
        description_ta: 'திருநெடுங்குளம் ஏரிக்கரையில் ஆக்கிரமிப்புகள் அகற்றப்பட்டு பனை விதைகள் நடப்பட்டு ஏரி பலப்படுத்தப்பட்டது.',
        location: 'Thirunedungulam Lake, Trichy Rural',
        project_date: '2024-10-12',
        category: 'Lake Renovation',
        status: 'published',
        palm_seeds_planted: 12000,
        saplings_planted: 180,
        participating_orgs: 'Village Watershed Committee, Youth Volunteer Wing',
        supporting_orgs: 'District Rural Development Agency',
        cover_image: '/uploads/gallery/gallery-12.jpg',
        gallery_images: JSON.stringify(['/uploads/gallery/gallery-13.jpg', '/uploads/gallery/gallery-1.jpg']),
        key_highlights: JSON.stringify([
          '12,000 palm seeds planted around the full 2.8 km perimeter',
          'Two natural water inlet channels reopened and deepened',
          'Over 40 agricultural borewells reported rising water tables'
        ]),
        is_featured: 0
      },
      {
        title_en: 'Thiruverumbur Railway Station Green Garden & Transit Oasis',
        title_ta: 'திருவெறும்பூர் ரயில் நிலைய பசுமை பூங்கா பராமரிப்பு',
        description_en: 'Transforming public transit spaces into lush native botanical pockets. Ongoing maintenance of native plants, shaded resting zones, and organic compost units at the railway station.',
        description_ta: 'ரயில் நிலைய வளாகத்தை பசுமை சோலையாக பராமரித்து இயற்கை விழிப்புணர்வை பயணிகளிடம் ஏற்படுத்துதல்.',
        location: 'Thiruverumbur Railway Station, Trichy',
        project_date: '2024-11-05',
        category: 'Eco Education',
        status: 'published',
        palm_seeds_planted: 0,
        saplings_planted: 350,
        participating_orgs: 'Railway Green Club, Eco Volunteers',
        supporting_orgs: 'Southern Railway Trichy Division',
        cover_image: '/uploads/gallery/gallery-11.jpg',
        gallery_images: JSON.stringify(['/uploads/gallery/gallery-9.jpg']),
        key_highlights: JSON.stringify([
          '350 native flowering and medicinal shrubs established',
          'Composting unit installed for fallen leaves and organic waste',
          'Recognized as model eco-friendly railway station'
        ]),
        is_featured: 0
      }
    ];

    for (const p of sampleProjects) {
      await run(
        `INSERT INTO projects (
          title_en, title_ta, description_en, description_ta, location, project_date, category, status,
          palm_seeds_planted, saplings_planted, participating_orgs, supporting_orgs, cover_image,
          gallery_images, key_highlights, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.title_en, p.title_ta, p.description_en, p.description_ta, p.location, p.project_date, p.category, p.status,
          p.palm_seeds_planted, p.saplings_planted, p.participating_orgs, p.supporting_orgs, p.cover_image,
          p.gallery_images, p.key_highlights, p.is_featured
        ]
      );
    }
    console.log(`✓ Seeded ${sampleProjects.length} real environmental projects.`);
  }

  // 4. Seed Events
  const eventCount = await get('SELECT COUNT(*) as count FROM events');
  if (eventCount.count === 0) {
    const sampleEvents = [
      {
        title_en: 'Monsoon Palm Seed Sowing & Bund Strengthening Camp',
        title_ta: 'பருவமழை பனை விதை நடவு மற்றும் கரைகள் பலப்படுத்தும் முகாம்',
        event_date: '2026-11-15',
        location: 'Uyyakondan Canal Embankments, Trichy',
        description_en: 'Join 500+ volunteers in our seasonal monsoon drive to plant 20,000 palm seeds along the vulnerable sections of Uyyakondan canal.',
        description_ta: 'உய்யக்கொண்டான் கால்வாய்க்கரையில் 20,000 பனை விதைகளை நடும் மாபெரும் பருவமழை முகாமில் இணையுங்கள்.',
        status: 'upcoming',
        cover_image: '/uploads/gallery/gallery-5.jpg',
        target_participants: 500,
        registered_participants: 184
      },
      {
        title_en: 'Native Seed Ball Making Workshop for School Students',
        title_ta: 'பள்ளி மாணவர்களுக்கான நாட்டு விதைப்பந்து தயாரிப்பு பயிலரங்கம்',
        event_date: '2026-12-05',
        location: 'Mannum Maramum Community Nursery, Koothappar',
        description_en: 'Hands-on experiential learning where children prepare 10,000 clay-compost seed balls with seeds of indigenous shade and bird-feeding trees.',
        description_ta: 'மாணவர்கள் 10,000 களிமண் விதைப்பந்துகளை தயாரித்து இயற்கை அறிவைப் பெறும் நேரடிப் பயிலரங்கம்.',
        status: 'upcoming',
        cover_image: '/uploads/gallery/gallery-4.jpg',
        target_participants: 250,
        registered_participants: 96
      },
      {
        title_en: 'Bishop Heber College Eco Youth Orientation Drive',
        title_ta: 'பிஷப் ஹீபர் கல்லூரி இளைஞர் சுற்றுச்சூழல் விழிப்புணர்வு முகாம்',
        event_date: '2025-08-28',
        location: 'Bishop Heber College Auditorium & Campus',
        description_en: 'Comprehensive briefing and field training conducted for over 400 NSS and Rotaract students on lake hydrology and afforestation.',
        description_ta: '400-க்கும் மேற்பட்ட கல்லூரி மாணவர்களுக்கு களப்பயிற்சி மற்றும் இயற்கை விழிப்புணர்வு வழங்கப்பட்டது.',
        status: 'completed',
        cover_image: '/uploads/gallery/gallery-4.jpg',
        target_participants: 400,
        registered_participants: 420
      }
    ];

    for (const ev of sampleEvents) {
      await run(
        `INSERT INTO events (title_en, title_ta, event_date, location, description_en, description_ta, status, cover_image, is_published, target_participants, registered_participants)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [ev.title_en, ev.title_ta, ev.event_date, ev.location, ev.description_en, ev.description_ta, ev.status, ev.cover_image, ev.target_participants, ev.registered_participants]
      );
    }
    console.log(`✓ Seeded ${sampleEvents.length} events.`);
  }

  // 5. Seed Impact Stats
  const existingImpact = await get('SELECT * FROM impact_stats WHERE id = 1');
  if (!existingImpact) {
    await run(
      `INSERT INTO impact_stats (id, palm_seeds_planted, trees_planted, projects_completed, events_conducted, locations_covered, volunteers_participated, active_since, is_verified)
       VALUES (1, 50000, 5000, 25, 42, 12, 1450, 2024, 1)`
    );
    console.log('✓ Initialized verified impact statistics.');
  }

  // 6. Seed Sample Volunteers
  const volunteerCount = await get('SELECT COUNT(*) as count FROM volunteers');
  if (volunteerCount.count === 0) {
    const sampleVolunteers = [
      {
        name: 'Karthik Raja',
        email: 'karthik.raja98@gmail.com',
        phone: '+91 98421 54321',
        district: 'Tiruchirappalli',
        address: 'No 45, Anna Nagar, Thiruverumbur',
        occupation: 'Software Engineer',
        skills: 'Photography, Weekend Tree Planting, Social Media Outreach',
        status: 'Active',
        notes: 'Coordinated the BHEL nursery weekend team.'
      },
      {
        name: 'Priyadharshini S',
        email: 'priya.green@outlook.com',
        phone: '+91 97890 12345',
        district: 'Tiruchirappalli',
        address: 'B-12, Heber Road, Puthur',
        occupation: 'College Student (BSc Botany)',
        skills: 'Sapling Identification, Seed Ball Preparation, Children Workshops',
        status: 'Approved',
        notes: 'Active participant in Bishop Heber eco orientation.'
      },
      {
        name: 'Murugesan V',
        email: 'murugesan.farm@yahoo.com',
        phone: '+91 94432 87654',
        district: 'Thanjavur',
        address: 'Main Road, Koothappar',
        occupation: 'Agriculturist',
        skills: 'Soil Testing, Lake Bund Inspection, Organic Manure Rearing',
        status: 'Active',
        notes: 'Provides organic manure for local sapling nurseries.'
      },
      {
        name: 'Sneha Venkatesh',
        email: 'sneha.v@techcorp.in',
        phone: '+91 99520 67891',
        district: 'Tiruchirappalli',
        address: 'K.K. Nagar, Trichy',
        occupation: 'HR Executive',
        skills: 'Corporate Volunteer Coordination, Event Logistics',
        status: 'Pending',
        notes: 'Requested group participation for 20 colleagues.'
      }
    ];

    for (const v of sampleVolunteers) {
      await run(
        `INSERT INTO volunteers (name, email, phone, district, address, occupation, skills, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.name, v.email, v.phone, v.district, v.address, v.occupation, v.skills, v.status, v.notes]
      );
    }
    console.log(`✓ Seeded ${sampleVolunteers.length} volunteer records.`);
  }

  // 7. Seed Sample Partnerships
  const partCount = await get('SELECT COUNT(*) as count FROM partnerships');
  if (partCount.count === 0) {
    const samplePartnerships = [
      {
        org_type: 'Educational',
        org_name: 'Bishop Heber College (Autonomous)',
        reg_no: 'BHC-EDU-1966',
        gst_no: '33AAAB1234F1Z5',
        pan_no: 'AAAB1234F',
        website: 'https://bhc.edu.in',
        address: 'Puthur, Tiruchirappalli',
        district: 'Tiruchirappalli',
        pincode: '620017',
        contact_name: 'Dr. A. Anand',
        contact_designation: 'NSS Programme Officer',
        contact_mobile: '+91 94431 88990',
        contact_email: 'nss@bhc.edu.in',
        duration: '1 Year Joint MOU',
        focus_areas: JSON.stringify(['Palm Tree Plantation', 'Lake Bund Restoration', 'Student Nature Camps']),
        districts_selected: JSON.stringify(['Tiruchirappalli', 'Thanjavur']),
        status: 'Approved',
        internal_notes: 'MoU signed for 2024-2025 academic year. 500+ student volunteer hours committed.'
      },
      {
        org_type: 'Corporate',
        org_name: 'Trichy GreenTech Industries Ltd',
        reg_no: 'CIN-U29100TZ2012PLC0189',
        gst_no: '33AABCT9988K1Z2',
        pan_no: 'AABCT9988K',
        website: 'https://trichygreentech.example.com',
        address: 'SIDCO Industrial Estate, Thuvakudi',
        district: 'Tiruchirappalli',
        pincode: '620015',
        contact_name: 'R. Senthil Kumar',
        contact_designation: 'CSR Committee Head',
        contact_mobile: '+91 98940 33221',
        contact_email: 'csr@trichygreentech.example.com',
        duration: '2 Years Partnership',
        focus_areas: JSON.stringify(['Industrial Green Belts', 'Miyawaki Urban Forests', 'Sapling Nursery Support']),
        districts_selected: JSON.stringify(['Tiruchirappalli']),
        status: 'Reviewed',
        internal_notes: 'CSR proposal submitted for ₹2.5 Lakhs funding towards 5,000 sapling drip lines.'
      },
      {
        org_type: 'Institutional',
        org_name: 'Cauvery River Basin Water Users Association',
        reg_no: 'TN-WAT-8842',
        website: 'https://cauverywaterusers.org',
        address: 'Grand Anicut Road, Mukkombu',
        district: 'Tiruchirappalli',
        pincode: '639115',
        contact_name: 'M. Duraisamy',
        contact_designation: 'President',
        contact_mobile: '+91 94422 11005',
        contact_email: 'duraisamy.cauvery@gmail.com',
        duration: 'Ongoing Seasonal Support',
        focus_areas: JSON.stringify(['Water Body Rejuvenation', 'Palm Bund Reinforcement']),
        districts_selected: JSON.stringify(['Tiruchirappalli', 'Karur']),
        status: 'Approved',
        internal_notes: 'Partnering on upcoming November canal embankment seed drives.'
      }
    ];

    for (const p of samplePartnerships) {
      await run(
        `INSERT INTO partnerships (
          org_type, org_name, reg_no, gst_no, pan_no, website, address, district, pincode,
          contact_name, contact_designation, contact_mobile, contact_email, duration,
          focus_areas, districts_selected, status, internal_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.org_type, p.org_name, p.reg_no, p.gst_no, p.pan_no, p.website, p.address, p.district, p.pincode,
          p.contact_name, p.contact_designation, p.contact_mobile, p.contact_email, p.duration,
          p.focus_areas, p.districts_selected, p.status, p.internal_notes
        ]
      );
    }
    console.log(`✓ Seeded ${samplePartnerships.length} partnership records.`);
  }

  // 8. Seed Sample Donations
  const donationCount = await get('SELECT COUNT(*) as count FROM donations');
  if (donationCount.count === 0) {
    const sampleDonations = [
      {
        donor_name: 'S. Ramanathan',
        donor_email: 'ramanathan.s@gmail.com',
        donor_phone: '+91 98410 77665',
        donor_pan: 'ABCDE1234F',
        amount: 2500,
        donation_type: 'one-time',
        payment_status: 'Verified',
        transaction_ref: 'UPI-MMI-20250918-09142',
        notes: 'Donation towards 250 palm seed planting.'
      },
      {
        donor_name: 'Apex Green Foundations',
        donor_email: 'trustee@apexgreentrust.org',
        donor_phone: '+91 94430 99887',
        donor_pan: 'AAATA5566G',
        amount: 25000,
        donation_type: 'corporate',
        payment_status: 'Verified',
        transaction_ref: 'NEFT-AXIS-20251002-8812',
        notes: 'Corporate CSR contribution for nursery maintenance.'
      },
      {
        donor_name: 'Lakshmi Narayanan',
        donor_email: 'lnarayanan@yahoo.com',
        donor_phone: '+91 97900 33441',
        donor_pan: 'BKPPL9876Q',
        amount: 5000,
        donation_type: 'one-time',
        payment_status: 'Verified',
        transaction_ref: 'GPay-20251015-3390',
        notes: 'Tree adoption fund.'
      }
    ];

    for (const d of sampleDonations) {
      await run(
        `INSERT INTO donations (donor_name, donor_email, donor_phone, donor_pan, amount, donation_type, payment_status, transaction_ref, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.donor_name, d.donor_email, d.donor_phone, d.donor_pan, d.amount, d.donation_type, d.payment_status, d.transaction_ref, d.notes]
      );
    }
    console.log(`✓ Seeded ${sampleDonations.length} donation records.`);
  }

  // 9. Seed Bilingual Site Content
  const contentCount = await get('SELECT COUNT(*) as count FROM site_content');
  if (contentCount.count === 0) {
    const contentBlocks = [
      {
        key: 'about_mission',
        section: 'About Us',
        content_en: 'Mannum Maramum Iyakkam is dedicated to restoring nature by reviving palm tree heritage, desilting lakes, planting native trees, and empowering youth into ecological protectors.',
        content_ta: 'மண்ணும் மரமும் இயக்கம் பனை மரங்களை மீட்டுருவாக்கம் செய்தல், ஏரிகளை தூர்வாருதல், நாட்டு மரங்களை நடுதல் மற்றும் இளைஞர்களை இயற்கை காவலர்களாக உருவாக்குதல் போன்ற பணிகளில் ஈடுபடுகிறது.',
        description: 'Core mission statement displayed in About section'
      },
      {
        key: 'hero_eyebrow',
        section: 'Hero',
        content_en: "LET'S HEAL THE EARTH",
        content_ta: 'பூமியை மீட்டெடுப்போம்',
        description: 'Top badge headline of homepage'
      },
      {
        key: 'hero_desc',
        section: 'Hero',
        content_en: 'We believe in a green tomorrow where nature and humanity grow together in harmony.',
        content_ta: 'இயற்கையும் மனிதமும் இணைந்து வளரும் பசுமையான நாளை நாங்கள் நம்புகிறோம்.',
        description: 'Hero subtitle below main title'
      },
      {
        key: 'contact_address',
        section: 'Contact',
        content_en: 'Mannum Maramum Iyakkam, Trichy - Thanjavur Main Road, Tiruchirappalli, Tamil Nadu 620014',
        content_ta: 'மண்ணும் மரமும் இயக்கம், திருச்சி - தஞ்சை முதன்மைச் சாலை, திருச்சிராப்பள்ளி, தமிழ்நாடு 620014',
        description: 'Official physical office address'
      },
      {
        key: 'contact_email',
        section: 'Contact',
        content_en: 'contact@mannummaramum.org',
        content_ta: 'contact@mannummaramum.org',
        description: 'Official general inquiry email'
      },
      {
        key: 'contact_phone',
        section: 'Contact',
        content_en: '+91 94431 88990 / +91 98421 54321',
        content_ta: '+91 94431 88990 / +91 98421 54321',
        description: 'Official helpline numbers'
      }
    ];

    for (const c of contentBlocks) {
      await run(
        `INSERT INTO site_content (key, section, content_en, content_ta, description)
         VALUES (?, ?, ?, ?, ?)`,
        [c.key, c.section, c.content_en, c.content_ta, c.description]
      );
    }
    console.log(`✓ Seeded ${contentBlocks.length} bilingual content blocks.`);
  }

  // 10. Seed Initial Activity Logs
  await run(
    `INSERT INTO activity_logs (username, action, entity_type, details)
     VALUES (?, ?, ?, ?)`,
    ['System', 'SYSTEM_INIT', 'DATABASE', 'Mannum Maramum NGO Admin System successfully initialized and seeded.']
  );

  console.log('--- Database Seeding Completed Successfully ---');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
