const bcrypt = require('bcryptjs');
const { run, get } = require('../data/database');

async function resetAdmin() {
  console.log('--- Resetting Development Admin Account ---');
  const DEV_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'Admin@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, salt);

  const existingAdmin = await get('SELECT id, username, email FROM users WHERE username = ? OR id = 1', ['admin']);

  if (existingAdmin) {
    await run(
      `UPDATE users SET password_hash = ?, email = 'admin@mannummaramum.org', status = 'active', role = 'super_admin' WHERE id = ?`,
      [passwordHash, existingAdmin.id]
    );
    console.log(`✓ Admin account (ID: ${existingAdmin.id}, username: ${existingAdmin.username}) password successfully updated.`);
  } else {
    await run(
      `INSERT INTO users (username, email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?, 'active')`,
      ['admin', 'admin@mannummaramum.org', passwordHash, 'Mannum Maramum Administrator', 'super_admin']
    );
    console.log('✓ New Admin account created.');
  }

  // Also ensure editor account has known password
  const editorHash = await bcrypt.hash('Editor@123', salt);
  const existingEditor = await get('SELECT id FROM users WHERE username = ?', ['editor']);
  if (existingEditor) {
    await run(
      `UPDATE users SET password_hash = ?, status = 'active' WHERE id = ?`,
      [editorHash, existingEditor.id]
    );
    console.log('✓ Editor account password updated to: Editor@123');
  }

  console.log('----------------------------------------------------');
  console.log('🔑 Development Admin Credentials:');
  console.log('   Username : admin');
  console.log('   Email    : admin@mannummaramum.org');
  console.log(`   Password : ${DEV_PASSWORD}`);
  console.log('----------------------------------------------------');
}

if (require.main === module) {
  resetAdmin()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error resetting admin:', err);
      process.exit(1);
    });
}

module.exports = { resetAdmin };
