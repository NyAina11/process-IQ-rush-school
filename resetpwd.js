const mongoose = require('mongoose');
const crypto = require('crypto');

const PREFIX = 'scrypt';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${PREFIX}$${salt}$${hash}`;
}

async function resetPasswords() {
  const uri = 'mongodb+srv://ProcessIQ:processIQ@processiq.e1iwrik.mongodb.net/?appName=ProcessIQ';
  await mongoose.connect(uri, { dbName: 'processiq' });
  console.log('Connecté à MongoDB (processiq).');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  const resets = [
    { email: 'superadmin@processiq.fr', newPassword: 'superadmin' },
    { email: 'admission@processiq.fr',  newPassword: 'admission123' },
    { email: 'admission1@rush-school.fr', newPassword: 'Admission123!' },
    { email: 'admission2@rush-school.fr', newPassword: 'Admission456!' },
    { email: 'rh@rush-school.fr',       newPassword: 'rh123' },
    { email: 'commercial@rush-school.fr', newPassword: 'commercial123' },
  ];

  for (const { email, newPassword } of resets) {
    const hashed = hashPassword(newPassword);
    const result = await users.updateOne({ email }, { $set: { password: hashed } });
    if (result.matchedCount > 0) {
      console.log(`✅ Mot de passe réinitialisé : ${email} → "${newPassword}"`);
    } else {
      console.log(`⚠️  Utilisateur non trouvé :  ${email}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nTerminé.');
}

resetPasswords().catch(console.error);
