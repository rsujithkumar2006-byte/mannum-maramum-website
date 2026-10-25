const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'mannum_maramum.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper promises
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize schema
const initSchema = async () => {
  await run('PRAGMA foreign_keys = ON');

  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'editor'
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Projects table
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ta TEXT,
      description_en TEXT NOT NULL,
      description_ta TEXT,
      location TEXT NOT NULL,
      project_date TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Plantation', 'Soil Care', 'Water Saving', 'Lake Renovation', 'Nursery', 'Eco Education'
      status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
      palm_seeds_planted INTEGER DEFAULT 0,
      saplings_planted INTEGER DEFAULT 0,
      participating_orgs TEXT, -- Colleges, NGOs, Volunteers
      supporting_orgs TEXT,
      cover_image TEXT,
      gallery_images TEXT, -- JSON array of image URLs
      key_highlights TEXT, -- JSON array or bullet points
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ta TEXT,
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_ta TEXT,
      status TEXT DEFAULT 'upcoming', -- 'upcoming', 'completed', 'cancelled'
      cover_image TEXT,
      is_published INTEGER DEFAULT 1,
      target_participants INTEGER DEFAULT 0,
      registered_participants INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Gallery items table
  await run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT,
      title_ta TEXT,
      caption_en TEXT NOT NULL,
      caption_ta TEXT,
      image_url TEXT NOT NULL,
      project_id INTEGER,
      event_id INTEGER,
      category TEXT DEFAULT 'general',
      is_published INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
    )
  `);

  // Volunteers table
  await run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      alt_phone TEXT,
      district TEXT,
      address TEXT,
      occupation TEXT,
      skills TEXT,
      assigned_project_id INTEGER,
      assigned_event_id INTEGER,
      status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Active', 'Completed', 'Rejected'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_event_id) REFERENCES events(id) ON DELETE SET NULL
    )
  `);

  // Partnerships table
  await run(`
    CREATE TABLE IF NOT EXISTS partnerships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_type TEXT NOT NULL, -- 'Corporate', 'Institutional', 'NGO', 'Educational'
      org_name TEXT NOT NULL,
      reg_no TEXT,
      gst_no TEXT,
      pan_no TEXT,
      website TEXT,
      address TEXT,
      district TEXT,
      pincode TEXT,
      contact_name TEXT NOT NULL,
      contact_designation TEXT,
      contact_mobile TEXT NOT NULL,
      contact_alt_mobile TEXT,
      contact_email TEXT NOT NULL,
      duration TEXT,
      focus_areas TEXT, -- JSON array
      districts_selected TEXT, -- JSON array
      logo_path TEXT,
      documents TEXT, -- JSON array
      status TEXT DEFAULT 'Pending', -- 'Pending', 'Reviewed', 'Approved', 'Rejected'
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Donations table
  await run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_name TEXT NOT NULL,
      donor_email TEXT NOT NULL,
      donor_phone TEXT NOT NULL,
      donor_pan TEXT,
      amount REAL NOT NULL,
      donation_type TEXT DEFAULT 'one-time', -- 'one-time', 'corporate', 'monthly'
      payment_status TEXT DEFAULT 'Verified', -- 'Verified', 'Successful', 'Pending'
      transaction_ref TEXT,
      payment_method TEXT DEFAULT 'UPI / Direct Bank Transfer',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Impact statistics table
  await run(`
    CREATE TABLE IF NOT EXISTS impact_stats (
      id INTEGER PRIMARY KEY,
      palm_seeds_planted INTEGER DEFAULT 50000,
      trees_planted INTEGER DEFAULT 5000,
      projects_completed INTEGER DEFAULT 25,
      events_conducted INTEGER DEFAULT 40,
      locations_covered INTEGER DEFAULT 12,
      volunteers_participated INTEGER DEFAULT 1200,
      active_since INTEGER DEFAULT 2024,
      is_verified INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bilingual site content table
  await run(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      content_en TEXT NOT NULL,
      content_ta TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vendors table for Mannum Maramum Vendor Registration Portal
  await run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_no TEXT UNIQUE NOT NULL,
      vendor_type TEXT NOT NULL,
      duration TEXT NOT NULL,
      amount REAL DEFAULT 0,
      company_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      established_year INTEGER,
      gst_no TEXT,
      pan_no TEXT NOT NULL,
      website TEXT,
      contact_name TEXT NOT NULL,
      designation TEXT,
      mobile TEXT NOT NULL,
      alt_mobile TEXT,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT DEFAULT 'Tamil Nadu',
      pincode TEXT NOT NULL,
      products_services TEXT, -- JSON array
      service_description TEXT,
      capacity TEXT,
      districts_covered TEXT, -- JSON array
      reg_doc_path TEXT,
      pan_doc_path TEXT,
      catalog_doc_path TEXT,
      payment_method TEXT DEFAULT 'UPI / Direct Bank Transfer',
      transaction_ref TEXT,
      payment_date TEXT,
      payment_screenshot_path TEXT,
      declaration_accepted INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Pending Verification', -- 'Pending Verification', 'Verified', 'Approved', 'Rejected'
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin audit / activity logs
  await run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables verified / initialized successfully.');
};

module.exports = {
  db,
  run,
  get,
  all,
  initSchema
};
