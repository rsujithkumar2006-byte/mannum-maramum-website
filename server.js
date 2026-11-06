const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const { initSchema } = require('./data/database');
const { seed } = require('./scripts/seed');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const projectsRoutes = require('./routes/projects');
const eventsRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const volunteersRoutes = require('./routes/volunteers');
const partnershipsRoutes = require('./routes/partnerships');
const donationsRoutes = require('./routes/donations');
const impactRoutes = require('./routes/impact');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');
const vendorRoutes = require('./routes/vendors');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Uploads storage path (supports Render Persistent Disk via UPLOAD_DIR or local fallback)
const uploadsDirectory = process.env.UPLOAD_DIR 
  ? path.resolve(process.env.UPLOAD_DIR) 
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Static Assets
app.use('/uploads', express.static(uploadsDirectory));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Serve logo.png at root level if requested
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

// Vendor Registration Route - Serve Mannum Maramum Vendor Registration Page
app.get(['/vendor-registration', '/vendor-registration/', '/vendor-registration.html', '/faceat-vendor-registration.html'], (req, res) => {
  const customPage = path.join(__dirname, 'vendor-registration.html');
  if (fs.existsSync(customPage)) {
    res.sendFile(customPage);
  } else {
    res.sendFile(path.join(__dirname, 'faceat-vendor-registration.html'));
  }
});

// Nature Activities Section Route - Smooth jump to Nature Activities section
app.get(['/volunteer', '/volunteers', '/volunteer-registration', '/volunteer-registration/'], (req, res) => {
  res.redirect('/#volunteer');
});

app.get(['/nature-activities', '/nature-activities/'], (req, res) => {
  res.redirect('/#gogreen');
});

// Admin Route shortcuts
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/partnerships', partnershipsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vendors', vendorRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Mannum Maramum Iyakkam NGO Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Public Website root
app.get('/', (req, res) => {
  const indexHtml = path.join(__dirname, 'index.html');
  const referenceHtml = path.join(__dirname, 'Mannum Maramum - Reference Recreation.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else if (fs.existsSync(referenceHtml)) {
    res.sendFile(referenceHtml);
  } else {
    res.send('<h1>Mannum Maramum Iyakkam Website</h1><p><a href="/admin/login">Admin Login</a></p>');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start server
async function startServer() {
  try {
    await initSchema();
    // Auto-seed if database is fresh
    await seed();

    const server = app.listen(PORT, HOST, () => {
      console.log(`====================================================`);
      console.log(`🌿 MANNUM MARAMUM IYAKKAM NGO PLATFORM READY`);
      console.log(`🌐 Public Website : http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
      console.log(`🔒 Admin Portal   : http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/admin/login`);
      console.log(`⚙️  API Endpoints  : http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n====================================================`);
        console.error(`⚠️  PORT ${PORT} CONFLICT NOTICE:`);
        console.error(`👉 Port ${PORT} is already in use by an active server.`);
        console.error(`👉 The Mannum Maramum server is already running and accessible!`);
        console.error(`🌐 Website      : http://localhost:${PORT}/`);
        console.error(`🔒 Admin Portal : http://localhost:${PORT}/admin/login`);
        console.error(`💡 If you want to restart, kill the existing process:`);
        console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
        console.error(`====================================================\n`);
        process.exit(0);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
