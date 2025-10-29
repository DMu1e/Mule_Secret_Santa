const mongoose = require('mongoose');
require('dotenv').config();

async function verifyEmailIndex() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secretsanta');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Get all indexes
        const indexes = await usersCollection.indexes();

        // Find email index
        const emailIndex = indexes.find(idx => idx.key && idx.key.email);

        if (emailIndex) {
            console.log('\n📋 Email Index Details:');
            console.log('   Name:', emailIndex.name);
            console.log('   Unique:', emailIndex.unique);
            console.log('   Sparse:', emailIndex.sparse);

            if (emailIndex.sparse && emailIndex.unique) {
                console.log('\n✅ Email index is properly configured!');
                console.log('   ✓ Unique constraint is enabled');
                console.log('   ✓ Sparse index allows multiple null values');
                console.log('\n🎉 You can now add multiple child users without email addresses!');
            } else {
                console.log('\n⚠️  Email index configuration issue:');
                if (!emailIndex.unique) console.log('   ✗ Unique constraint is missing');
                if (!emailIndex.sparse) console.log('   ✗ Sparse option is missing');
            }
        } else {
            console.log('\n⚠️  No email index found!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying email index:', error);
        process.exit(1);
    }
}

verifyEmailIndex();
