# Mannum Maramum Iyakkam — Official NGO Platform & Admin Panel

A production-ready, fully functional **Admin Panel and Backend Management System** built specifically for the **Mannum Maramum Iyakkam** environmental NGO website.

The system preserves the existing forest-green, cream, and white aesthetic, retains all 17 authentic field gallery images and bilingual (Tamil & English) content, and connects public community forms directly to a secure SQLite database.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize & Seed Database
This automatically creates the SQLite database, provisions the administrator accounts, and extracts all 17 existing gallery photos into `/uploads/gallery/` with their Tamil and English captions:
```bash
npm run seed
```

### 3. Start the Server
```bash
npm start
```
The server will start listening at:
- **Public NGO Website**: [http://localhost:5000/](http://localhost:5000/)
- **Admin Portal Login**: [http://localhost:5000/admin/login](http://localhost:5000/admin/login)
- **Admin Dashboard**: [http://localhost:5000/admin/](http://localhost:5000/admin/)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Admin Credentials

| Account Role | Username / Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` / `admin@mannummaramum.org` | `Admin@MannumMaramum2026` | Full platform control & staff management |
| **Content Editor** | `editor` / `editor@mannummaramum.org` | `Editor@MannumMaramum2026` | Projects, Events & Gallery content editing |

*(Passwords are salted and securely hashed using `bcryptjs` with 10 rounds; sessions are governed by JSON Web Tokens with 7-day expiration).*

---

## 📋 Comprehensive Feature Checklist

### 1. Admin Authentication & Security
- [x] Secure login page matching the forest green, cream, and white NGO design (`/admin/login`).
- [x] Username or Email authentication with salted bcrypt password comparison.
- [x] Show / Hide password visibility toggle.
- [x] Live client-side and server-side input validation.
- [x] JWT token-based session handling with unauthorized route protection.
- [x] Automatic session redirection (logged in users redirect to dashboard).
- [x] Secure logout clearing local session and logging activity.
- [x] Password change interface requiring verification of current credentials.

### 2. Admin Dashboard & Metrics
- [x] Real-time KPI summary cards:
  - **Palm Seeds Sown** (e.g. 50,000+ verified seeds).
  - **Trees Planted** (e.g. 5,000+ native saplings).
  - **Active Environmental Projects** (total & published counts).
  - **Events Hosted** (total & upcoming counts).
  - **Volunteers Registered** (total & pending review counts).
  - **Partnership Applications** (total & pending review counts).
  - **Donation Records** (total transactions & verified amounts in ₹).
- [x] Quick Action buttons: Add Project, New Event, Upload Photos.
- [x] Recently added projects table.
- [x] Pending community submissions queue for instant review.
- [x] Real-time administrative audit activity logs.

### 3. Project Management
- [x] Create, view, edit, and delete environmental restoration projects.
- [x] Publish and unpublish toggle button (changes reflect instantly on the public site).
- [x] Save projects as drafts.
- [x] Rich fields:
  - Title & Description in both English and Tamil (தமிழ்).
  - Location, Project Date, and Category (Plantation, Lake Renovation, Nursery, Soil Care, Water Saving, Eco Education).
  - Number of palm seeds planted and saplings planted.
  - Participating colleges (e.g. Bishop Heber College, JJ Polytechnic), youth groups, and NGOs.
  - Supporting government / district bodies (e.g. Forest Department, PWD).
  - Single and multi-photo upload for project covers and gallery.
  - Comma-separated key highlights.
- [x] Search, category filters, and status filters.
- [x] Deletion protected by modal confirmation dialog.

### 4. Events Management
- [x] Create, edit, and delete community eco drives and seasonal camps.
- [x] Fields: Event title (EN & TA), date, location, description (EN & TA), status (Upcoming, Completed, Cancelled), cover image, target and registered participants.
- [x] Publish or unpublish events toggle.

### 5. Gallery Management
- [x] **Zero Data Loss**: All 17 authentic field photos and bilingual captions from the website are preserved and seeded into the database.
- [x] Multi-file image uploader with live thumbnail preview.
- [x] Edit photo captions in both English and Tamil.
- [x] Categorization (Palm & Tree Plantation, Lake Renovation, Youth & College Volunteers, General).
- [x] Optional linking of gallery photos to specific projects or events.
- [x] Visibility toggle (publish or hide).
- [x] Delete with confirmation dialog.

### 6. Volunteer Coordination
- [x] Dedicated volunteer registration table with contact details, district, occupation, and skills.
- [x] Status management: `Pending`, `Approved`, `Active`, `Completed`, `Rejected`.
- [x] Assign volunteers to active projects or upcoming events.
- [x] Add coordinator internal notes.
- [x] One-click CSV report export.
- [x] Public volunteer registration modal integrated into the website.

### 7. Institutional Partnership Management
- [x] Connected directly to the public website's Environmental Partnership form (`#mmiPartnershipForm`).
- [x] Manage applications from Colleges, Corporate CSR wings, Government bodies, and Charities.
- [x] Detailed Evaluation Modal displaying:
  - Organization name, registration number, GST, PAN, website, and address.
  - Contact person, designation, mobile number, and email.
  - Proposed duration, focus areas (e.g. Lake Bund Restoration, Palm Plantation), and districts covered.
- [x] Update status: `Pending`, `Reviewed`, `Approved`, `Rejected`.
- [x] Add internal staff notes and review summaries.
- [x] One-click CSV export for official records.

### 8. Donation Tracking
- [x] Connected directly to the public website's Support Our Mission donation form (`#donorForm`).
- [x] Tracks donor name, email, phone, PAN number, amount in ₹, donation type, and date.
- [x] Generates unique transaction references (`MMI-XXXXXX-XXX`).
- [x] Status verification (`Verified`, `Successful`, `Pending`).
- [x] Strictly adheres to security: no payment card or CVV details are ever stored.
- [x] One-click CSV donation report export.

### 9. Impact Report Management
- [x] Dedicated admin interface to manage verified metrics:
  - Palm seeds planted
  - Trees planted
  - Projects completed
  - Events conducted
  - Locations reached
  - Volunteers participated
  - Active since year
- [x] Saves to database and automatically syncs with the public website's live counters.

### 10. Website Content Management
- [x] Bilingual copy editor for homepage sections (About Us mission, Hero headline, Office address, Contact numbers, Email).
- [x] Side-by-side English and Tamil (தமிழ்) editing with instant saving.

### 11. Admin Profile & Staff Accounts
- [x] View logged-in administrator profile.
- [x] Secure password change with confirmation check.
- [x] User and role management: Super Admins can create and delete staff accounts with `admin` or `editor` privileges.

---

## 🛠️ Technology Stack & Architecture

- **Backend Engine**: Node.js & Express.js
- **Database**: SQLite3 (`./data/mannum_maramum.db`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer` with MIME validation and secure file naming
- **Frontend Architecture**: Vanilla HTML5, CSS3, and JavaScript (No external framework overhead, blazing fast load times)
- **Aesthetic**: Forest green (`#0f2d1a`), deep emerald (`#1a4d2e`), vibrant lime (`#b7e23a`), and warm cream (`#fbf9f4`)

---

## ⚙️ Configuration & Production Integrations

| Feature | Current Working Status | Production Integration Steps |
| :--- | :--- | :--- |
| **Admin Authentication** | **100% Fully Functional** | Change `JWT_SECRET` in `.env` for production deployments. |
| **Database & CRUD** | **100% Fully Functional** | Stored in SQLite (`./data/mannum_maramum.db`). Can be backed up by copying the `.db` file. |
| **File & Image Uploads** | **100% Fully Functional** | Uploads saved to `./uploads/`. Can optionally be mounted to an S3 or Google Cloud Storage bucket. |
| **Form Submissions** | **100% Fully Functional** | Volunteer, partnership, and donation forms save directly to database. |
| **Outbound Email Alerts** | *Stubbed / Logged* | To send automatic confirmation emails to donors or volunteers, connect Nodemailer with your SMTP credentials in `.env`. |
| **Live Payment Gateway** | *Direct Bank / UPI Mode* | Currently records donor pledges and direct bank transfers. To accept credit cards, integrate Razorpay or Stripe webhook keys. |

---

## 🧪 Running the Automated Test Suite

To test all 15 core features automatically:
```bash
node scripts/test-system.js
```
Expected output:
```
--- Starting Mannum Maramum Automated Test Suite ---
[TEST 1] Health Check: Status 200 -> online
[TEST 2] Public Impact Stats: Status 200 -> Palm seeds: 50000
[TEST 3] Public Gallery: Status 200 -> Total items: 17
[TEST 4] Invalid Login: Status 401 -> Invalid credentials.
[TEST 5] Valid Admin Login: Status 200 -> User: Mannum Maramum Administrator
[TEST 6] Dashboard KPI Summary: Status 200
[TEST 7] Project Creation: Status 201
[TEST 8] Project Publish Toggle: Status 200
[TEST 9] Project Deletion: Status 200
[TEST 10] Public Volunteer Registration: Status 201
[TEST 11] Admin Volunteer Status Update: Status 200
[TEST 12] Public Partnership Submission: Status 201
[TEST 13] Public Donation Recording: Status 201
[TEST 14] Admin Impact Update: Status 200
[TEST 15] Bilingual Content Update: Status 200
========================================================
🎉 ALL 15 AUTOMATED TESTS PASSED WITH 100% SUCCESS!
========================================================
```
