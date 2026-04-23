const mongoose = require('mongoose');

async function checkConnection() {
    const uri = 'mongodb+srv://ProcessIQ:processIQ@processiq.e1iwrik.mongodb.net/?appName=ProcessIQ';
    try {
        console.log('Tentative de connexion à MongoDB Atlas...');
        await mongoose.connect(uri, { dbName: 'processiq' });
        console.log('✅ Connecté avec succès !');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections trouvées :', collections.map(c => c.name).join(', '));
        
        const count = await db.collection('users').countDocuments();
        console.log(`Nombre d'utilisateurs en base : ${count}`);
        
        await mongoose.disconnect();
        console.log('Déconnecté.');
    } catch (err) {
        console.error('❌ Erreur de connexion :', err.message);
    }
}

checkConnection();
