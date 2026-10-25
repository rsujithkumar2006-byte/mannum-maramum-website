const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/vendors - Public Vendor Registration submission
router.post('/', async (req, res) => {
  try {
    const {
      vendor_type,
      duration,
      amount,
      company_name,
      business_type,
      established_year,
      gst_no,
      pan_no,
      website,
      contact_name,
      designation,
      mobile,
      alt_mobile,
      email,
      address,
      district,
      state = 'Tamil Nadu',
      pincode,
      products_services,
      service_description,
      capacity,
      districts_covered,
      reg_doc_path,
      pan_doc_path,
      catalog_doc_path,
      payment_method = 'UPI / Direct Bank Transfer',
      transaction_ref,
      payment_date,
      payment_screenshot_path,
      declaration_accepted
    } = req.body;

    // Validation
    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, message: 'Company or Business Name is required.' });
    }
    if (!contact_name || !contact_name.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Person Name is required.' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Mobile Number is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Official Email Address is required.' });
    }
    if (!pan_no || !pan_no.trim()) {
      return res.status(400).json({ success: false, message: 'Business PAN Number is required.' });
    }
    if (!address || !address.trim() || !district || !district.trim() || !pincode || !pincode.trim()) {
      return res.status(400).json({ success: false, message: 'Complete Business Address, District, and Pincode are required.' });
    }
    if (!service_description || service_description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a detailed description of your products or services (at least 10 characters).' });
    }
    if (!transaction_ref || !transaction_ref.trim()) {
      return res.status(400).json({ success: false, message: 'Transaction Reference / UTR Number is required for verification.' });
    }

    // Generate unique reference number: MMI-VND-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const reference_no = `MMI-VND-${randomSuffix}`;

    const sql = `
      INSERT INTO vendors (
        reference_no, vendor_type, duration, amount, company_name, business_type,
        established_year, gst_no, pan_no, website, contact_name, designation,
        mobile, alt_mobile, email, address, district, state, pincode,
        products_services, service_description, capacity, districts_covered,
        reg_doc_path, pan_doc_path, catalog_doc_path,
        payment_method, transaction_ref, payment_date, payment_screenshot_path,
        declaration_accepted, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, 'Pending Verification'
      )
    `;

    const params = [
      reference_no,
      vendor_type || 'Nursery & Sapling Provider',
      duration || '1 Year',
      parseFloat(amount) || 5000,
      company_name.trim(),
      business_type || 'Proprietorship',
      established_year ? parseInt(established_year, 10) : null,
      gst_no ? gst_no.trim().toUpperCase() : null,
      pan_no.trim().toUpperCase(),
      website ? website.trim() : null,
      contact_name.trim(),
      designation ? designation.trim() : null,
      mobile.trim(),
      alt_mobile ? alt_mobile.trim() : null,
      email.trim().toLowerCase(),
      address.trim(),
      district.trim(),
      state.trim(),
      pincode.trim(),
      Array.isArray(products_services) ? JSON.stringify(products_services) : (products_services || '[]'),
      service_description.trim(),
      capacity ? capacity.trim() : null,
      Array.isArray(districts_covered) ? JSON.stringify(districts_covered) : (districts_covered || '[]'),
      reg_doc_path || null,
      pan_doc_path || null,
      catalog_doc_path || null,
      payment_method,
      transaction_ref.trim(),
      payment_date || new Date().toISOString().split('T')[0],
      payment_screenshot_path || null,
      declaration_accepted ? 1 : 1
    ];

    const result = await run(sql, params);

    // Audit log
    await run(
      'INSERT INTO activity_logs (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)',
      [
        'CREATE',
        'vendor_registration',
        result.id,
        JSON.stringify({ reference_no, company_name, contact_name, vendor_type })
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Vendor Registration successfully submitted to Mannum Maramum Iyakkam!',
      reference_no,
      vendor_id: result.id,
      vendor: {
        id: result.id,
        reference_no,
        company_name,
        vendor_type: vendor_type || 'Nursery & Sapling Provider',
        duration: duration || '1 Year',
        amount: parseFloat(amount) || 5000,
        contact_name,
        email,
        mobile,
        status: 'Pending Verification'
      }
    });
  } catch (error) {
    console.error('Error creating vendor registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record vendor registration. Please check inputs and try again.'
    });
  }
});

// GET /api/vendors - List vendor applications (Admin/Public read)
router.get('/', async (req, res) => {
  try {
    const { status, vendor_type, search } = req.query;
    let sql = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (vendor_type) {
      sql += ' AND vendor_type = ?';
      params.push(vendor_type);
    }
    if (search) {
      sql += ' AND (company_name LIKE ? OR contact_name LIKE ? OR reference_no LIKE ? OR email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = await all(sql, params);

    const parsed = rows.map(r => ({
      ...r,
      products_services: r.products_services ? JSON.parse(r.products_services) : [],
      districts_covered: r.districts_covered ? JSON.parse(r.districts_covered) : []
    }));

    return res.json({ success: true, count: parsed.length, vendors: parsed });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
