const mongoose = require('mongoose');
require('dotenv').config();

async function fixEmailIndex() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secretsanta');
        console.log('✅ Connected to MongoDB');

        console.log('🔍 Checking email index on users collection...');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Get all indexes
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Check if email index exists
        const emailIndex = indexes.find(idx => idx.key && idx.key.email);

        if (emailIndex) {
            console.log('\n📋 Found email index:', emailIndex.name);

            // Check if it's sparse
            if (emailIndex.sparse) {
                console.log('✅ Email index is already sparse. No action needed.');
            } else {
                console.log('⚠️  Email index is NOT sparse. Dropping and recreating...');

                // Drop the old index
                await usersCollection.dropIndex(emailIndex.name);
                console.log('✅ Dropped old email index');

                // Create new sparse index
                await usersCollection.createIndex(
                    { email: 1 },
                    { unique: true, sparse: true, name: 'email_1' }
                );
                console.log('✅ Created new sparse email index');
            }
        } else {
            console.log('⚠️  No email index found. Creating sparse index...');

            // Create sparse index
            await usersCollection.createIndex(
                { email: 1 },
                { unique: true, sparse: true, name: 'email_1' }
            );
            console.log('✅ Created sparse email index');
        }

        console.log('\n✅ Email index fix complete!');
        console.log('📝 You can now add multiple child users without email addresses.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing email index:', error);
        process.exit(1);
    }
}

// Run the fix
fixEmailIndex();
