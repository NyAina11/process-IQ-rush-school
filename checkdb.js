const mongoose = require('mongoose');

async function listUsers() {
    const uri = 'mongodb+srv://ProcessIQ:processIQ@processiq.e1iwrik.mongodb.net/?appName=ProcessIQ';
    await mongoose.connect(uri, { dbName: 'processiq' });
    
    console.log('Connected to processiq database.');
    
    const db = mongoose.connection.db;
    if (!db) {
        console.error('db is missing!');
        process.exit(1);
    }
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- Email: ${u.email}, Role: ${u.role}, Pass: ${u.password}`));
    
    await mongoose.disconnect();
}

listUsers().catch(console.error);
